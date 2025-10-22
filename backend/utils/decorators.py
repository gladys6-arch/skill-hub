from functools import wraps
<<<<<<< HEAD
from flask_jwt_extended import get_jwt_identity
from flask import jsonify

def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        def decorated(*args, **kwargs):
            user = get_jwt_identity()
            if user['role'] != role:
                return jsonify({"msg": "Unauthorized"}), 403
            return fn(*args, **kwargs)
        return decorated
    return wrapper
=======
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models.user import User

def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user or user.role != role:
                return jsonify({'message': 'Access denied'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
>>>>>>> origin/gladys/models
