from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Module
from extensions import db
from utils.decorators import role_required

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/', methods=['GET'])
def teacher_info():
    return jsonify({
        'message': 'SkillHub Teacher API',
        'endpoints': {
            'dashboard': 'GET /api/teacher/dashboard',
            'courses': 'GET /api/teacher/courses',
            'create_course': 'POST /api/teacher/courses'
        },
        'status': 'active'
    })

@teacher_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('teacher')
def dashboard():
    teacher_id = get_jwt_identity()
    courses = Course.query.filter_by(teacher_id=teacher_id).all()
    
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'price': c.price
    } for c in courses])

@teacher_bp.route('/courses', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_my_courses():
    teacher_id = get_jwt_identity()
    courses = Course.query.filter_by(teacher_id=teacher_id).all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'price': c.price
    } for c in courses])

@teacher_bp.route('/courses', methods=['POST'])
@jwt_required()
@role_required('teacher')
def create_course():
    data = request.get_json()
    teacher_id = get_jwt_identity()
    
    course = Course(
        title=data['title'],
        description=data['description'],
        price=data['price'],
        teacher_id=teacher_id
    )
    
    db.session.add(course)
    db.session.commit()
    return jsonify({'message': 'Course created successfully'}), 201

@teacher_bp.route('/courses/<int:course_id>', methods=['PUT'])
@jwt_required()
@role_required('teacher')
def update_course(course_id):
    teacher_id = get_jwt_identity()
    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first_or_404()
    
    data = request.get_json()
    course.title = data.get('title', course.title)
    course.description = data.get('description', course.description)
    course.price = data.get('price', course.price)
    
    db.session.commit()
    return jsonify({'message': 'Course updated successfully'})

@teacher_bp.route('/courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
@role_required('teacher')
def delete_course(course_id):
    teacher_id = get_jwt_identity()
    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first_or_404()
    
    db.session.delete(course)
    db.session.commit()
    return jsonify({'message': 'Course deleted successfully'})