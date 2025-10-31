from flask import Blueprint, request, jsonify, send_file
from extensions import db
from models import Course, Skill, Enrollment, SkillEnrollment, Module, User, Certificate
from flask_jwt_extended import get_jwt_identity
from utils.decorators import role_required
from utils.certificate_generator import generate_certificate
import os

enroll_bp = Blueprint('enroll_bp', __name__, url_prefix='/enroll')

# Enroll in course (creates Enrollment); payment is handled separately (mpesa)
@enroll_bp.route('/course/<int:course_id>', methods=['POST'])
@role_required('student')
def enroll_course(course_id):
    user = get_jwt_identity()
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404

    exists = Enrollment.query.filter_by(student_id=user['id'], course_id=course_id).first()
    if exists:
        return jsonify({"message":"Already enrolled"}), 200

    enrollment = Enrollment(student_id=user['id'], course_id=course_id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({"message":"Enrolled (payment pending if required)", "enrollment_id": enrollment.id}), 201

# Enroll in skill (similar)
@enroll_bp.route('/skill/<int:skill_id>', methods=['POST'])
@role_required('student')
def enroll_skill(skill_id):
    user = get_jwt_identity()
    skill = Skill.query.get(skill_id)
    if not skill:
        return jsonify({"error": "Skill not found"}), 404

    exists = SkillEnrollment.query.filter_by(student_id=user['id'], skill_id=skill_id).first()
    if exists:
        return jsonify({"message":"Already enrolled"}), 200

    se = SkillEnrollment(student_id=user['id'], skill_id=skill_id)
    db.session.add(se)
    db.session.commit()
    return jsonify({"message":"Skill enrolled", "skill_enrollment_id": se.id}), 201

# Update progress when finishing a module (marks percentage). Module completion increments progress.
@enroll_bp.route('/course/<int:course_id>/module/<int:module_id>/complete', methods=['POST'])
@role_required('student')
def complete_module(course_id, module_id):
    user = get_jwt_identity()
    module = Module.query.get(module_id)
    if not module or module.course_id != course_id:
        return jsonify({"error":"Module not found for this course"}), 404

    enrollment = Enrollment.query.filter_by(student_id=user['id'], course_id=course_id).first()
    if not enrollment:
        return jsonify({"error":"Not enrolled"}), 403

    # calculate progress: (modules completed / total modules) * 100
    course_modules = Module.query.filter_by(course_id=course_id).all()
    total = len(course_modules)
    if total == 0:
        enrollment.progress = 100
    else:
        # naive approach: store completed module ids somewhere; for simplicity, increment by 1 per call
        # Better: create a Completion table; here we increment progress by 100/total and cap at 100
        increment = int(100 / total)
        enrollment.progress = min(100, enrollment.progress + increment)
    if enrollment.progress >= 100:
        enrollment.completed = True
        # generate certificate and persist
        student = User.query.get(user['id'])
        cert_path = generate_certificate(student.full_name, module.course.title if module.course else "Course", user['id'], course_id)
        cert = Certificate(student_id=user['id'], course_id=course_id, file_path=cert_path)
        db.session.add(cert)
    db.session.commit()
    return jsonify({"message":"Module completed", "progress": enrollment.progress}), 200

# Student can get their progress
@enroll_bp.route('/course/<int:course_id>/progress', methods=['GET'])
@role_required('student')
def get_progress(course_id):
    user = get_jwt_identity()
    enrollment = Enrollment.query.filter_by(student_id=user['id'], course_id=course_id).first()
    if not enrollment:
        return jsonify({"error":"Not enrolled"}), 404
    return jsonify({"progress": enrollment.progress, "completed": enrollment.completed}), 200

# Download certificate
@enroll_bp.route('/certificate/<int:cert_id>/download', methods=['GET'])
@role_required('student')
def download_certificate(cert_id):
    user = get_jwt_identity()
    cert = Certificate.query.get(cert_id)
    if not cert or cert.student_id != user['id']:
        return jsonify({"error":"Certificate not found or unauthorized"}), 404
    if not os.path.exists(cert.file_path):
        return jsonify({"error":"File missing"}), 404
    return send_file(cert.file_path, as_attachment=True)
