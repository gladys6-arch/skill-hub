from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Payment, Course, Skill
from utils.decorators import role_required

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/admin')

# Dashboard stats
@admin_bp.route('/dashboard', methods=['GET'])
@role_required('admin')
def stats():
    total_teachers = User.query.filter_by(role='teacher').count()
    total_students = User.query.filter_by(role='student').count()
    total_revenue = db.session.query(db.func.sum(Payment.amount)).scalar() or 0
    admin_earnings = db.session.query(db.func.sum(Payment.admin_share)).scalar() or 0
    return jsonify({
        "total_teachers": total_teachers,
        "total_students": total_students,
        "total_revenue": float(total_revenue),
        "admin_earnings": float(admin_earnings)
    }), 200

# Full CRUD on users (create already handled in auth/register; here we show update/delete/get)
@admin_bp.route('/user/<int:user_id>', methods=['GET'])
@role_required('admin')
def get_user(user_id):
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error":"User not found"}), 404
    return jsonify({"id": u.id, "full_name": u.full_name, "email":u.email, "role":u.role, "balance":u.balance}), 200

@admin_bp.route('/user/<int:user_id>', methods=['PUT'])
@role_required('admin')
def update_user(user_id):
    data = request.get_json()
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error":"User not found"}), 404
    u.full_name = data.get('full_name', u.full_name)
    u.email = data.get('email', u.email)
    u.role = data.get('role', u.role)
    db.session.commit()
    return jsonify({"message":"User updated"}), 200

@admin_bp.route('/user/<int:user_id>', methods=['DELETE'])
@role_required('admin')
def delete_user(user_id):
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error":"User not found"}), 404
    db.session.delete(u)
    db.session.commit()
    return jsonify({"message":"User deleted"}), 200
