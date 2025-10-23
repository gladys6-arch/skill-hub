from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Payment
from utils.decorators import role_required

admin_bp = Blueprint('admin', __name__)

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