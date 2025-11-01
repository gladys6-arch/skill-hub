from flask import Blueprint, request, jsonify
from extensions import db
from models import Skill, Course, Enrollment, User
from utils.decorators import role_required
from flask_jwt_extended import get_jwt_identity

teacher_bp = Blueprint('teacher_bp', __name__, url_prefix='/teacher')

@teacher_bp.route('/skills', methods=['POST'])
@role_required('teacher')
def create_skill():
    user = get_jwt_identity()
    data = request.get_json()
    s = Skill(name=data['name'], description=data.get('description',''), price=data.get('price',0.0), teacher_id=user['id'])
    db.session.add(s)
    db.session.commit()
    return jsonify({"message":"Skill created", "skill_id":s.id}), 201

@teacher_bp.route('/balance', methods=['GET'])
@role_required('teacher')
def my_balance():
    user = get_jwt_identity()
    teacher = User.query.get(user['id'])
    return jsonify({"balance": teacher.balance or 0}), 200

@teacher_bp.route('/students/progress', methods=['GET'])
@role_required('teacher')
def students_progress():
    user = get_jwt_identity()
    # find enrollments for courses taught by teacher
    enrollments = Enrollment.query.join(Course).filter(Course.teacher_id==user['id']).all()
    data = [{"student_id": e.student_id, "course_id": e.course_id, "progress": e.progress, "completed": e.completed} for e in enrollments]
    return jsonify(data), 200

# Teacher CRUD on own skills (example)
@teacher_bp.route('/skill/<int:skill_id>', methods=['PUT','DELETE'])
@role_required('teacher')
def modify_skill(skill_id):
    user = get_jwt_identity()
    s = Skill.query.get(skill_id)
    if not s or s.teacher_id != user['id']:
        return jsonify({"error":"Skill not found or unauthorized"}), 403
    if request.method == 'PUT':
        data = request.get_json()
        s.name = data.get('name', s.name)
        s.description = data.get('description', s.description)
        s.price = data.get('price', s.price)
        db.session.commit()
        return jsonify({"message":"Skill updated"}), 200
    else:
        db.session.delete(s)
        db.session.commit()
        return jsonify({"message":"Skill deleted"}), 200
