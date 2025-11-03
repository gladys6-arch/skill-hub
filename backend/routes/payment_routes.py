from flask import Blueprint, request, jsonify, current_app
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.payment import Payment
from models.course import Course, Skill, Enrollment, SkillEnrollment
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
    phone_number = data.get('phone_number')
    
    # Validate and format phone number
    if not phone_number:
        return jsonify({"msg": "Phone number required"}), 400
    
    # Remove spaces and format to 254XXXXXXXXX
    phone_number = phone_number.replace(' ', '').replace('+', '')
    if phone_number.startswith('0'):
        phone_number = '254' + phone_number[1:]
    elif not phone_number.startswith('254'):
        return jsonify({"msg": "Phone number must start with 254 or 0"}), 400
    
    print(f"Formatted phone number: {phone_number}")

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

        print(f"Payment created with CheckoutRequestID: {stk_response.get('CheckoutRequestID')}")
        
        # For sandbox testing with test number, auto-enroll after 10 seconds
        if phone_number == '254708374149':
            import threading
            import time
            
            app = current_app._get_current_object()
            
            def auto_enroll():
                with app.app_context():
                    time.sleep(10)  # Wait 10 seconds
                    payment.status = 'paid'
                    existing = Enrollment.query.filter_by(
                        student_id=user['id'],
                        course_id=course_id
                    ).first()
                    if not existing:
                        enrollment = Enrollment(
                            student_id=user['id'],
                            course_id=course_id
                        )
                        db.session.add(enrollment)
                    db.session.commit()
                    print(f"Auto-enrolled student {user['id']} in course {course_id}")
            
            threading.Thread(target=auto_enroll, daemon=True).start()
        
        msg = "STK Push initiated. Please check your phone to complete payment."
        if phone_number == '254708374149':
            msg += " (Test mode: Auto-enrollment in 10 seconds)"
        
        return jsonify({
            "msg": msg,
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
           
           # Auto-enroll student after successful payment
           if payment.payment_type == 'course' and payment.course_id:
               existing_enrollment = Enrollment.query.filter_by(
                   student_id=payment.student_id, 
                   course_id=payment.course_id
               ).first()
               if not existing_enrollment:
                   enrollment = Enrollment(
                       student_id=payment.student_id,
                       course_id=payment.course_id
                   )
                   db.session.add(enrollment)
           
           elif payment.payment_type == 'skill' and payment.skill_id:
               existing_enrollment = SkillEnrollment.query.filter_by(
                   student_id=payment.student_id,
                   skill_id=payment.skill_id
               ).first()
               if not existing_enrollment:
                   enrollment = SkillEnrollment(
                       student_id=payment.student_id,
                       skill_id=payment.skill_id
                   )
                   db.session.add(enrollment)
           
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

@payment_bp.route('/payment/status/<checkout_request_id>', methods=['GET'])
@jwt_required()
def check_payment_status(checkout_request_id):
    user = get_jwt_identity()
    payment = Payment.query.filter_by(
        checkout_request_id=checkout_request_id,
        student_id=user['id']
    ).first()
    
    if not payment:
        return jsonify({"status": "not_found"}), 404
    
    # If paid but not enrolled, enroll now
    if payment.status == 'paid':
        if payment.payment_type == 'course' and payment.course_id:
            enrollment = Enrollment.query.filter_by(
                student_id=payment.student_id,
                course_id=payment.course_id
            ).first()
            
            if not enrollment:
                enrollment = Enrollment(
                    student_id=payment.student_id,
                    course_id=payment.course_id
                )
                db.session.add(enrollment)
                db.session.commit()
        
        elif payment.payment_type == 'skill' and payment.skill_id:
            enrollment = SkillEnrollment.query.filter_by(
                student_id=payment.student_id,
                skill_id=payment.skill_id
            ).first()
            
            if not enrollment:
                enrollment = SkillEnrollment(
                    student_id=payment.student_id,
                    skill_id=payment.skill_id
                )
                db.session.add(enrollment)
                db.session.commit()
    
    return jsonify({"status": payment.status}), 200

@payment_bp.route('/payment/verify-and-enroll/<checkout_request_id>', methods=['POST'])
@jwt_required()
def verify_payment_and_enroll(checkout_request_id):
    user = get_jwt_identity()
    payment = Payment.query.filter_by(
        checkout_request_id=checkout_request_id,
        student_id=user['id']
    ).first()
    
    if not payment:
        return jsonify({"status": "not_found", "enrolled": False}), 404
    
    # Force enrollment for paid payments
    if payment.status == 'paid':
        enrollment_created = False
        
        if payment.payment_type == 'course' and payment.course_id:
            existing = Enrollment.query.filter_by(
                student_id=payment.student_id,
                course_id=payment.course_id
            ).first()
            
            if not existing:
                enrollment = Enrollment(
                    student_id=payment.student_id,
                    course_id=payment.course_id
                )
                db.session.add(enrollment)
                enrollment_created = True
        
        elif payment.payment_type == 'skill' and payment.skill_id:
            existing = SkillEnrollment.query.filter_by(
                student_id=payment.student_id,
                skill_id=payment.skill_id
            ).first()
            
            if not existing:
                enrollment = SkillEnrollment(
                    student_id=payment.student_id,
                    skill_id=payment.skill_id
                )
                db.session.add(enrollment)
                enrollment_created = True
        
        if enrollment_created:
            db.session.commit()
        
        return jsonify({
            "status": payment.status,
            "enrolled": True,
            "enrollment_created": enrollment_created
        }), 200
    
    return jsonify({"status": payment.status, "enrolled": False}), 200

@payment_bp.route('/payment/manual-enroll', methods=['POST'])
@jwt_required()
@role_required('student')
def manual_enroll():
    data = request.get_json()
    user = get_jwt_identity()
    course_id = data.get('course_id')
    
    if not course_id:
        return jsonify({"msg": "Course ID required"}), 400
    
    # Check if student has paid for this course
    payment = Payment.query.filter_by(
        student_id=user['id'],
        course_id=course_id,
        status='paid',
        payment_type='course'
    ).first()
    
    if not payment:
        return jsonify({"msg": "No valid payment found for this course"}), 400
    
    # Check if already enrolled
    existing = Enrollment.query.filter_by(
        student_id=user['id'],
        course_id=course_id
    ).first()
    
    if existing:
        return jsonify({"msg": "Already enrolled"}), 200
    
    # Create enrollment
    enrollment = Enrollment(
        student_id=user['id'],
        course_id=course_id
    )
    db.session.add(enrollment)
    db.session.commit()
    
    return jsonify({"msg": "Enrollment successful"}), 200