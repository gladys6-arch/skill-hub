from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint('auth_bp', __name__, url_prefix="/auth")

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user = User(full_name=data['full_name'], email=data['email'], role=data['role'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401
    token = create_access_token(identity={"id": user.id, "role": user.role}, expires_delta=timedelta(hours=6))
    return jsonify({"token": token, "role": user.role})