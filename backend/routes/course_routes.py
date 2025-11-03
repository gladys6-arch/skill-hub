from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Course, User, Review

course_bp = Blueprint('course_bp', __name__)

# Teacher adds a course
@course_bp.route('/teacher/add-course', methods=['POST'])
@jwt_required()
def add_course():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user or user.role != 'teacher':
        return jsonify({'msg': 'Only teachers can add courses'}), 403

    data = request.get_json()
    new_course = Course(
        title=data['title'],
        description=data['description'],
        price=data['price'],
        teacher_id=user.id
    )
    db.session.add(new_course)
    db.session.commit()

    return jsonify({'msg': 'Course added successfully'}), 201


# Student views all available courses
@course_bp.route('/student/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    result = [
        {
            'id': c.id,
            'title': c.title,
            'description': c.description,
            'price': c.price,
            'teacher_name': c.teacher.full_name if c.teacher else 'Unknown'
        } for c in courses
    ]
    return jsonify(result), 200


# Student views one course by ID
@course_bp.route('/student/course/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'msg': 'Course not found'}), 404

    return jsonify({
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'price': course.price,
        'teacher_name': course.teacher.full_name if course.teacher else 'Unknown',
        'link': course.link
    }), 200


# Get reviews for a course
@course_bp.route('/courses/<int:course_id>/reviews', methods=['GET'])
def get_course_reviews(course_id):
    reviews = Review.query.filter_by(course_id=course_id).all()
    result = [{
        'rating': 5,  # Default rating since Review model doesn't have rating field
        'review': r.comment,
        'student_name': r.student.name
    } for r in reviews]
    return jsonify(result), 200


# Add review for a course
@course_bp.route('/courses/<int:course_id>/reviews', methods=['POST'])
@jwt_required()
def add_course_review(course_id):
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    data = request.get_json()
    new_review = Review(
        student_id=user.id,
        course_id=course_id,
        comment=data['review']
    )
    db.session.add(new_review)
    db.session.commit()
    
    return jsonify({
        'rating': data.get('rating', 5),
        'review': data['review'],
        'student_name': user.name
    }), 201