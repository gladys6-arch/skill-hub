from flask import Blueprint, request, jsonify
from extensions import db
from models.course import Course, Module
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required

teacher_bp = Blueprint('teacher_bp', __name__)

@teacher_bp.route('/teacher/add-skill', methods=['POST'])
@jwt_required()
@role_required('teacher')
def add_skill():
    user = get_jwt_identity()
    data = request.get_json()
    course = Course(title=data['title'], description=data['description'], price=data['price'], teacher_id=user['id'])
    db.session.add(course)
    db.session.commit()
    return jsonify({"msg": "Course added successfully"})