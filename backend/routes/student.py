from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import Student
from models.course import Course
from models.enrollment import Enrollment
from extensions import db

student_bp = Blueprint('student', __name__)

@student_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    student = Student.query.get(user_id)
    
    if not student:
        return jsonify({'message': 'Access denied'}), 403
    
    enrollments = Enrollment.query.filter_by(student_id=student.id).all()
    return jsonify([{
        'course_id': e.course_id,
        'progress': e.progress,
        'completed': e.completed
    } for e in enrollments])

@student_bp.route('/courses', methods=['GET'])
@jwt_required()
def available_courses():
    courses = Course.query.all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'price': c.price
    } for c in courses])

@student_bp.route('/enroll/<int:course_id>', methods=['POST'])
@jwt_required()
def enroll(course_id):
    user_id = get_jwt_identity()
    student = Student.query.get(user_id)
    
    if not student:
        return jsonify({'message': 'Access denied'}), 403
    
    enrollment = Enrollment(student_id=student.id, course_id=course_id)
    db.session.add(enrollment)
    db.session.commit()
    
    return jsonify({'message': 'Enrolled successfully'}), 201

@student_bp.route('/progress/<int:course_id>', methods=['PUT'])
@jwt_required()
def update_progress(course_id):
    user_id = get_jwt_identity()
    student = Student.query.get(user_id)
    
    if not student:
        return jsonify({'message': 'Access denied'}), 403
    
    data = request.get_json()
    enrollment = Enrollment.query.filter_by(
        student_id=student.id, 
        course_id=course_id
    ).first()
    
    if enrollment:
        enrollment.progress = data['progress']
        if data['progress'] >= 100:
            enrollment.completed = True
        db.session.commit()
    
    return jsonify({'message': 'Progress updated'})