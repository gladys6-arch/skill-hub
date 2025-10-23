from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Enrollment
from extensions import db
from utils.decorators import role_required

student_bp = Blueprint('student', __name__)

@student_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('student')
def dashboard():
    student_id = get_jwt_identity()
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    
    return jsonify([{
        'course_id': e.course_id,
        'progress': e.progress,
        'completed': e.completed
    } for e in enrollments])

@student_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_courses():
    courses = Course.query.all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'price': c.price
    } for c in courses])

@student_bp.route('/enroll', methods=['POST'])
@jwt_required()
@role_required('student')
def enroll():
    data = request.get_json()
    student_id = get_jwt_identity()
    
    enrollment = Enrollment(
        student_id=student_id,
        course_id=data['course_id']
    )
    
    db.session.add(enrollment)
    db.session.commit()
    
    return jsonify({'message': 'Enrolled successfully'}), 201