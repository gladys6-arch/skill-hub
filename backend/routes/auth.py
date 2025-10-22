from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User, Admin, Teacher, Student
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({'token': access_token, 'role': user.role})
    
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    role = data['role']
    if role == 'admin':
        user = Admin(email=data['email'], role=role)
    elif role == 'teacher':
        user = Teacher(email=data['email'], role=role, name=data['name'])
    else:
        user = Student(email=data['email'], role=role, name=data['name'])
    
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201