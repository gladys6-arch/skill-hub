from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Course, User

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
        link=data['link'],
        price=data['price'],
        teacher_name=user.name
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
            'teacher_name': c.teacher_name
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
        'teacher_name': course.teacher_name,
        'link': course.link
    }), 200