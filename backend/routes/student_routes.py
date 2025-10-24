student.py                                                                                                                                                                                                                                                         from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Enrollment, Review
from extensions import db
from utils.decorators import role_required

student_bp = Blueprint('student', __name__)

# Profile CRUD
@student_bp.route('/profile', methods=['GET'])
@jwt_required()
@role_required('student')
def get_profile():
    student_id = get_jwt_identity()
    user = User.query.get_or_404(student_id)
    return jsonify({
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email
    })

@student_bp.route('/profile', methods=['PUT'])
@jwt_required()
@role_required('student')
def update_profile():
    student_id = get_jwt_identity()
    user = User.query.get_or_404(student_id)
    
    data = request.get_json()
    user.full_name = data.get('full_name', user.full_name)
    user.email = data.get('email', user.email)
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'})

# Enrollments CRUD
@student_bp.route('/enrollments', methods=['GET'])
@jwt_required()
@role_required('student')
def get_enrollments():
    student_id = get_jwt_identity()
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    return jsonify([{
        'id': e.id,
        'course_id': e.course_id,
        'progress': e.progress,
        'completed': e.completed
    } for e in enrollments])

@student_bp.route('/enrollments/<int:enrollment_id>', methods=['PUT'])
@jwt_required()
@role_required('student')
def update_progress(enrollment_id):
    student_id = get_jwt_identity()
    enrollment = Enrollment.query.filter_by(
        id=enrollment_id, 
        student_id=student_id
    ).first_or_404()
    
    data = request.get_json()
    enrollment.progress = data.get('progress', enrollment.progress)
    if enrollment.progress >= 100:
        enrollment.completed = True
    
    db.session.commit()
    return jsonify({'message': 'Progress updated successfully'})

# Reviews CRUD
@student_bp.route('/reviews', methods=['POST'])
@jwt_required()
@role_required('student')
def create_review():
    student_id = get_jwt_identity()
    data = request.get_json()
    
    review = Review(
        student_id=student_id,
        course_id=data['course_id'],
        comment=data['comment']
    )
    
    db.session.add(review)
    db.session.commit()
    return jsonify({'message': 'Review created successfully'}), 201

@student_bp.route('/reviews/<int:review_id>', methods=['PUT'])
@jwt_required()
@role_required('student')
def update_review(review_id):
    student_id = get_jwt_identity()
    review = Review.query.filter_by(
        id=review_id, 
        student_id=student_id
    ).first_or_404()
    
    data = request.get_json()
    review.comment = data.get('comment', review.comment)
    
    db.session.commit()
    return jsonify({'message': 'Review updated successfully'})

@student_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
@role_required('student')
def delete_review(review_id):
    student_id = get_jwt_identity()
    review = Review.query.filter_by(
        id=review_id, 
        student_id=student_id
    ).first_or_404()
    
    db.session.delete(review)
    db.session.commit()
    return jsonify({'message': 'Review deleted successfully'})