from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Module
from extensions import db
from utils.decorators import role_required

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('teacher')
def dashboard():
    teacher_id = get_jwt_identity()
    courses = Course.query.filter_by(teacher_id=teacher_id).all()
    
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'price': c.price
    } for c in courses])

@teacher_bp.route('/add-course', methods=['POST'])
@jwt_required()
@role_required('teacher')
def add_course():
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

@teacher_bp.route('/add-module', methods=['POST'])
@jwt_required()
@role_required('teacher')
def add_module():
    data = request.get_json()
    
    module = Module(
        title=data['title'],
        content=data['content'],
        course_id=data['course_id']
    )
    
    db.session.add(module)
    db.session.commit()
    
    return jsonify({'message': 'Module added successfully'}), 201