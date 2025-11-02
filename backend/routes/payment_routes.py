from flask import Blueprint, request, jsonify
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.payment import Payment
from models.course import Course, Skill
from models.user import User
from utils.decorators import role_required
from utils.mpesa_utils import stk_push
import json

payment_bp = Blueprint('payment_bp', __name__)

@payment_bp.route('/payment/pay', methods=['POST'])
@jwt_required()
@role_required('student')
def make_payment():
    data = request.get_json()
    user = get_jwt_identity()
    course_id = data.get('course_id')
    phone_number = data.get('phone_number')  # Add phone number field in frontend

    course = Course.query.get(course_id)
    if not course:
        return jsonify({"msg": "Course not found"}), 404

    student = User.query.get(user['id'])
    if not student:
        return jsonify({"msg": "Student not found"}), 404

    admin_cut = round(course.price * 0.30, 2)
    teacher_cut = round(course.price * 0.70, 2)

    # Create payment record with pending status
    payment = Payment(
        student_id=user['id'],
        course_id=course_id,
        amount=course.price,
        teacher_share=teacher_cut,
        admin_share=admin_cut,
        status='pending',
        payment_type='course'
    )
    db.session.add(payment)
    db.session.commit()

    # Initiate M-Pesa STK Push
    try:
        stk_response = stk_push(
            phone_number=phone_number,
            amount=int(course.price),
            account_reference=f"Course-{course_id}",
            transaction_desc=f"Payment for {course.title}"
        )

        # Update payment with M-Pesa transaction IDs
        payment.checkout_request_id = stk_response.get('CheckoutRequestID')
        payment.merchant_request_id = stk_response.get('MerchantRequestID')
        db.session.commit()

        return jsonify({
            "msg": "STK Push initiated. Please check your phone to complete payment.",
            "checkout_request_id": stk_response.get('CheckoutRequestID'),
            "merchant_request_id": stk_response.get('MerchantRequestID'),
            "amount": course.price,
            "admin_share": admin_cut,
            "teacher_share": teacher_cut
        }), 200

    except Exception as e:
        payment.status = 'failed'
        db.session.commit()
        return jsonify({"msg": f"Payment initiation failed: {str(e)}"}), 500

@payment_bp.route('/payment/callback', methods=['POST'])
def mpesa_callback():
   """Handle M-Pesa payment callback"""
   data = request.get_json()

   # Log the callback data for debugging
   print("M-Pesa Callback Data:", json.dumps(data, indent=2))

   if data.get('Body', {}).get('stkCallback', {}).get('ResultCode') == 0:
       # Payment successful
       callback_data = data['Body']['stkCallback']
       merchant_request_id = callback_data['MerchantRequestID']
       checkout_request_id = callback_data['CheckoutRequestID']

       # Find the payment record by checkout_request_id
       payment = Payment.query.filter_by(checkout_request_id=checkout_request_id).first()
       if payment:
           payment.status = 'paid'
           db.session.commit()

       return jsonify({"ResultCode": 0, "ResultDesc": "Success"}), 200
   else:
       # Payment failed
       return jsonify({"ResultCode": 1, "ResultDesc": "Failed"}), 200

@payment_bp.route('/payment/pay-skill', methods=['POST'])
@jwt_required()
@role_required('student')
def pay_for_skill():
    data = request.get_json()
    user = get_jwt_identity()
    skill_id = data.get('skill_id')
    phone_number = data.get('phone_number')  # Add phone number field in frontend

    skill = Skill.query.get(skill_id)
    if not skill:
        return jsonify({"msg": "Skill not found"}), 404

    student = User.query.get(user['id'])
    if not student:
        return jsonify({"msg": "Student not found"}), 404

    admin_cut = round(skill.price * 0.30, 2)
    teacher_cut = round(skill.price * 0.70, 2)

    # Create payment record with pending status
    payment = Payment(
        student_id=user['id'],
        skill_id=skill_id,
        amount=skill.price,
        teacher_share=teacher_cut,
        admin_share=admin_cut,
        status='pending',
        payment_type='skill'
    )
    db.session.add(payment)
    db.session.commit()

    # Initiate M-Pesa STK Push
    try:
        stk_response = stk_push(
            phone_number=phone_number,
            amount=int(skill.price),
            account_reference=f"Skill-{skill_id}",
            transaction_desc=f"Payment for {skill.title}"
        )

        # Update payment with M-Pesa transaction IDs
        payment.checkout_request_id = stk_response.get('CheckoutRequestID')
        payment.merchant_request_id = stk_response.get('MerchantRequestID')
        db.session.commit()

        return jsonify({
            "msg": "STK Push initiated. Please check your phone to complete payment.",
            "checkout_request_id": stk_response.get('CheckoutRequestID'),
            "merchant_request_id": stk_response.get('MerchantRequestID'),
            "amount": skill.price,
            "admin_share": admin_cut,
            "teacher_share": teacher_cut
        }), 200

    except Exception as e:
        payment.status = 'failed'
        db.session.commit()
        return jsonify({"msg": f"Payment initiation failed: {str(e)}"}), 500