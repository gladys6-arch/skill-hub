from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity
from extensions import db
from models import Payment, Skill, Course, User
from utils.decorators import role_required
from utils.mpesa import initiate_stk_push, send_b2c_payment

payment_bp = Blueprint('payment_bp', __name__, url_prefix='/payments')

# Student starts payment (STK push)
@payment_bp.route('/pay', methods=['POST'])
@role_required('student')
def pay_for_item():
    user = get_jwt_identity()
    data = request.get_json()
    phone = data.get('phone_number')
    amount = float(data.get('amount'))
    skill_id = data.get('skill_id')
    course_id = data.get('course_id')

    # validate item
    if skill_id:
        item = Skill.query.get(skill_id)
        if not item:
            return jsonify({"error":"Skill not found"}), 404
        teacher_id = item.teacher_id
        account_ref = f"SKILL-{skill_id}"
    elif course_id:
        item = Course.query.get(course_id)
        if not item:
            return jsonify({"error":"Course not found"}), 404
        teacher_id = item.teacher_id
        account_ref = f"COURSE-{course_id}"
    else:
        return jsonify({"error":"No item specified"}), 400

    # initiate STK Push
    resp = initiate_stk_push(phone_number=phone, amount=amount, account_reference=account_ref, description="SkillHub Purchase")

    teacher_share = round(amount * 0.7, 2)
    admin_share = round(amount * 0.3, 2)

    payment = Payment(student_id=user['id'], course_id=course_id, skill_id=skill_id,
                      amount=amount, teacher_share=teacher_share, admin_share=admin_share,
                      status='pending', payment_type='mpesa')
    db.session.add(payment)
    db.session.commit()
    return jsonify({"message":"STK push initiated", "response": resp, "payment_id": payment.id}), 200

# M-Pesa callback endpoint (public)
@payment_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    # This expects Daraja STK push format. You must adjust parsing depending on payload.
    try:
        stk = data["Body"]["stkCallback"]
        result_code = stk.get("ResultCode")
    except Exception:
        return jsonify({"ResultCode": 1, "ResultDesc":"Invalid payload"}), 400

    if result_code == 0:
        # parse callback metadata items - this varies by Daraja
        items = stk.get("CallbackMetadata", {}).get("Item", [])
        # find amount and mpesaReceiptNumber etc.
        amount = None
        receipt = None
        phone = None
        for it in items:
            name = it.get("Name") or it.get("name")
            if name and name.lower() in ("amount","transactionamount"):
                amount = it.get("Value")
            if name and name.lower() in ("mpesareceiptnumber","stkreceipt"):
                receipt = it.get("Value")
            if name and name.lower() in ("phonenumber","msisdn"):
                phone = it.get("Value")

        # locate pending payment: naive approach: match latest pending by amount & phone (improve by merchantRequestID)
        payment = Payment.query.filter_by(status='pending', amount=amount).order_by(Payment.id.desc()).first()
        if payment:
            payment.status = 'paid'
            db.session.commit()
            # Optionally: update teacher balance
            teacher = User.query.get(payment.course.teacher_id if payment.course_id else payment.skill.teacher_id)
            if teacher:
                teacher.balance = (teacher.balance or 0) + payment.teacher_share
                db.session.commit()
        return jsonify({"ResultCode": 0, "ResultDesc": "Success"}), 200
    else:
        return jsonify({"ResultCode": 1, "ResultDesc": "Payment failed"}), 200

# Admin: payout teacher (trigger B2C) for teacher balance
@payment_bp.route('/payout/teacher/<int:teacher_id>', methods=['POST'])
@role_required('admin')
def payout_teacher(teacher_id):
    data = request.get_json()
    amount = float(data.get('amount'))
    phone = data.get('phone_number')
    # In production, call Daraja B2C here. We'll mark as paid and reduce teacher balance.
    teacher = User.query.get(teacher_id)
    if not teacher:
        return jsonify({"error":"Teacher not found"}), 404
    if (teacher.balance or 0) < amount:
        return jsonify({"error":"Insufficient balance"}), 400

    # Placeholder: call send_b2c_payment (raise NotImplementedError by default)
    try:
        send_b2c_payment(phone_number=phone, amount=amount)
    except NotImplementedError:
        # Fallback: just debit balance and record a Payment with type 'payout'
        teacher.balance -= amount
        db.session.commit()
        return jsonify({"message":"Payout simulated: teacher balance debited"}), 200

    # if send_b2c_payment succeeds, debit teacher and record payout
    teacher.balance -= amount
    db.session.commit()
    return jsonify({"message":"Payout initiated"}), 200

# View payments (admin / teacher / student)
@payment_bp.route('/', methods=['GET'])
@role_required('admin','teacher','student')
def list_payments():
    user = get_jwt_identity()
    if user['role'] == 'admin':
        payments = Payment.query.all()
    elif user['role'] == 'teacher':
        # payments related to teacher via skill/course teacher_id
        payments = Payment.query.filter((Payment.skill.has(teacher_id=user['id'])) | (Payment.course.has(teacher_id=user['id']))).all()
    else:
        payments = Payment.query.filter_by(student_id=user['id']).all()

    out = []
    for p in payments:
        out.append({
            "id": p.id,
            "student_id": p.student_id,
            "amount": p.amount,
            "teacher_share": p.teacher_share,
            "admin_share": p.admin_share,
            "status": p.status,
            "payment_type": p.payment_type,
            "date": p.date_created
        })
    return jsonify(out), 200
