from flask import Blueprint, request, jsonify
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.payment import Payment
from models.course import Course, Skill
from utils.decorators import role_required

payment_bp = Blueprint('payment_bp', __name__)

@payment_bp.route('/payment/pay', methods=['POST'])
@jwt_required()
@role_required('student')
def make_payment():
    data = request.get_json()
    user = get_jwt_identity()
    course_id = data.get('course_id')
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"msg": "Course not found"}), 404

    admin_cut = round(course.price * 0.30, 2)
    teacher_cut = round(course.price * 0.70, 2)

    payment = Payment(
        student_id=user['id'],
        course_id=course_id,
        amount=course.price,
        teacher_share=teacher_cut,
        admin_share=admin_cut,
        status='paid',
        payment_type='course'
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify({
        "msg": "Payment successful",
        "amount": course.price,
        "admin_share": admin_cut,
        "teacher_share": teacher_cut
    }), 201

@payment_bp.route('/payment/pay-skill', methods=['POST'])
@jwt_required()
@role_required('student')
def pay_for_skill():
    data = request.get_json()
    user = get_jwt_identity()
    skill_id = data.get('skill_id')
    skill = Skill.query.get(skill_id)

    if not skill:
        return jsonify({"msg": "Skill not found"}), 404

    admin_cut = round(skill.price * 0.30, 2)
    teacher_cut = round(skill.price * 0.70, 2)

    payment = Payment(
        student_id=user['id'],
        skill_id=skill_id,
        amount=skill.price,
        teacher_share=teacher_cut,
        admin_share=admin_cut,
        status='paid',
        payment_type='skill'
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify({
        "msg": "Skill payment successful",
        "amount": skill.price,
        "admin_share": admin_cut,
        "teacher_share": teacher_cut
    }), 201