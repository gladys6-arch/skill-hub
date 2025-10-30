from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Module,Skill
from extensions import db
from models.course import Course, Module
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required

teacher_bp = Blueprint('teacher_bp', __name__)

@teacher_bp.route('/teacher/add-skill', methods=['POST'])
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


@teacher_bp.route('/add-skill', methods=['POST'])
@jwt_required()
@role_required('teacher')
def add_skill():
    data = request.get_json()
    teacher_id = get_jwt_identity()
    
    # Check if skill already exists
    existing_skill = Skill.query.filter_by(name=data['name']).first()
    if existing_skill:
        return jsonify({'message': 'Skill already exists'}), 400
    
    skill = Skill(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        teacher_id=teacher_id
    )
    db.session.add(skill)
    db.session.commit()
    
    return jsonify({'message': 'Skill added successfully'}), 201


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
    course = Course(title=data['title'], description=data['description'], price=data['price'], teacher_id=user['id'])
    db.session.add(course)
    db.session.commit()
    return jsonify({"msg": "Course added successfully"})