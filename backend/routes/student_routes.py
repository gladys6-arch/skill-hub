from flask import Blueprint, request, jsonify
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from models.course import Course, Enrollment

student_bp = Blueprint('student_bp', __name__)

@student_bp.route('/student/enroll', methods=['POST'])
@jwt_required()
@role_required('student')
def enroll_course():
    user = get_jwt_identity()
    data = request.get_json()
    course_id = data.get('course_id')

    if not course_id:
        return jsonify({"msg": "Course ID required"}), 400

    already = Enrollment.query.filter_by(student_id=user['id'], course_id=course_id).first()
    if already:
        return jsonify({"msg": "Already enrolled"}), 400

    enrollment = Enrollment(student_id=user['id'], course_id=course_id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({"msg": "Enrolled successfully"}), 201


@student_bp.route('/student/progress/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('student')
def view_progress(course_id):
    user = get_jwt_identity()
    enrollment = Enrollment.query.filter_by(student_id=user['id'], course_id=course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404

    return jsonify({
        "course_id": course_id,
        "progress": enrollment.progress,
        "completed": enrollment.completed
    })


@student_bp.route('/student/update-progress', methods=['PUT'])
@jwt_required()
@role_required('student')
def update_progress():
    user = get_jwt_identity()
    data = request.get_json()
    course_id = data.get('course_id')
    progress = data.get('progress', 0)

    enrollment = Enrollment.query.filter_by(student_id=user['id'], course_id=course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404

    enrollment.progress = progress
    if progress >= 100:
        enrollment.completed = True

    db.session.commit()
    return jsonify({"msg": "Progress updated"})