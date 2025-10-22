from flask import Blueprint, request, jsonify
from extensions import db
from flask_jwt_extended import jwt_required
from utils.decorators import role_required
from models.user import User
from models.payment import Payment

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/admin/teachers', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_teachers():
    teachers = User.query.filter_by(role='teacher').all()
    data = [{"id": t.id, "name": t.full_name, "email": t.email} for t in teachers]
    return jsonify(data)


@admin_bp.route('/admin/students', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_students():
    students = User.query.filter_by(role='student').all()
    data = [{"id": s.id, "name": s.full_name, "email": s.email} for s in students]
    return jsonify(data)


@admin_bp.route('/admin/register-teacher', methods=['POST'])
@jwt_required()
@role_required('admin')
def register_teacher():
    from models.user import User
    data = request.get_json()
    teacher = User(full_name=data['full_name'], email=data['email'], role='teacher')
    teacher.set_password(data['password'])
    db.session.add(teacher)
    db.session.commit()
    return jsonify({"msg": "Teacher registered successfully"}), 201


@admin_bp.route('/admin/revenue', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_revenue():
    total_admin_revenue = db.session.query(db.func.sum(Payment.admin_share)).scalar() or 0
    return jsonify({"total_admin_revenue": total_admin_revenue})