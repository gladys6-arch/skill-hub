from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Payment
from utils.decorators import role_required
from extensions import db  # Added this if not already present, since db is used

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/', methods=['GET'])
def admin_info():
    return jsonify({
        'message': 'SkillHub Admin API',
        'endpoints': {
            'dashboard': 'GET /api/admin/dashboard',
            'users': 'GET /api/admin/users',
            'courses': 'GET /api/admin/courses'
        },
        'status': 'active'
    })

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('admin')
def dashboard():
    total_users = User.query.count()
    total_courses = Course.query.count()
    total_revenue = db.session.query(db.func.sum(Payment.amount)).scalar() or 0
    
    return jsonify({
        'total_users': total_users,
        'total_courses': total_courses,
        'total_revenue': total_revenue
    })

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'full_name': u.full_name,
        'email': u.email,
        'role': u.role
    } for u in users])
