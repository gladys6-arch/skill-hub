from flask import Blueprint, request, jsonify
from extensions import db
from models.course import Course, Module
from utils.decorators import role_required
from flask_jwt_extended import get_jwt_identity

course_bp = Blueprint('course_bp', __name__, url_prefix='/courses')

# ===================== CREATE COURSE ===================== #
@course_bp.route('/', methods=['POST'])
@role_required('teacher')
def create_course():
    data = request.get_json()
    teacher = get_jwt_identity()

    course = Course(
        title=data['title'],
        description=data['description'],
        price=data.get('price', 0.0),
        teacher_id=teacher['id']
    )

    db.session.add(course)
    db.session.commit()
    return jsonify({"message": "Course created successfully"}), 201

# ===================== ADD MODULE ===================== #
@course_bp.route('/<int:course_id>/add-module', methods=['POST'])
@role_required('teacher')
def add_module(course_id):
    data = request.get_json()
    module = Module(
        title=data['title'],
        content=data['content'],
        course_id=course_id
    )
    db.session.add(module)
    db.session.commit()
    return jsonify({"message": "Module added"}), 201

# ===================== VIEW COURSES ===================== #
@course_bp.route('/', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    data = [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "price": c.price
        } for c in courses
    ]
    return jsonify(data), 200
