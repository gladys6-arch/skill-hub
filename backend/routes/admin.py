from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, Admin
from models.course import Course
from models.payment import Transaction

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    admin = Admin.query.get(user_id)
    
    if not admin:
        return jsonify({'message': 'Access denied'}), 403
    
    total_users = User.query.count()
    total_courses = Course.query.count()
    total_revenue = sum(t.amount for t in Transaction.query.filter_by(status='completed').all())
    
    return jsonify({
        'total_users': total_users,
        'total_courses': total_courses,
        'total_revenue': total_revenue
    })

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def manage_users():
    user_id = get_jwt_identity()
    admin = Admin.query.get(user_id)
    
    if not admin:
        return jsonify({'message': 'Access denied'}), 403
    
    users = User.query.all()
    return jsonify([{'id': u.id, 'email': u.email, 'role': u.role} for u in users])