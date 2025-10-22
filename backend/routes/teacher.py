from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import Teacher
from models.course import Course, Module
from extensions import db

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    teacher = Teacher.query.get(user_id)
    
    if not teacher:
        return jsonify({'message': 'Access denied'}), 403
    
    courses = Course.query.filter_by(teacher_id=teacher.id).all()
    return jsonify([{'id': c.id, 'title': c.title, 'price': c.price} for c in courses])

@teacher_bp.route('/add-skill', methods=['POST'])
@jwt_required()
def add_skill():
    user_id = get_jwt_identity()
    teacher = Teacher.query.get(user_id)
    
    if not teacher:
        return jsonify({'message': 'Access denied'}), 403
    
    data = request.get_json()
    course = Course(
        title=data['title'],
        description=data['description'],
        price=data['price'],
        teacher_id=teacher.id
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify({'message': 'Course created successfully'}), 201

@teacher_bp.route('/modules/<int:course_id>', methods=['POST'])
@jwt_required()
def add_module(course_id):
    user_id = get_jwt_identity()
    teacher = Teacher.query.get(user_id)
    
    if not teacher:
        return jsonify({'message': 'Access denied'}), 403
    
    data = request.get_json()
    module = Module(
        title=data['title'],
        content=data['content'],
        course_id=course_id,
        order=data['order']
    )
    
    db.session.add(module)
    db.session.commit()
    
    return jsonify({'message': 'Module added successfully'}), 201