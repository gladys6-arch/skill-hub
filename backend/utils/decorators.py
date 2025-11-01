from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models import User

def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            identity = get_jwt_identity()
            user_id = identity if isinstance(identity, int) else identity.get('id')
            user = User.query.filter_by(id=user_id).first()

            if not user or user.role != role:
                return jsonify({'message': 'Access denied'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator