from flask import Blueprint, request, jsonify
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from models.course import Course, Enrollment, SkillEnrollment, Skill
from models import User

student_bp = Blueprint('student_bp', __name__)

@student_bp.route('/enroll', methods=['POST'])
@jwt_required()
@role_required('student')
def enroll_course():
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()
    course_id = data.get('course_id')

    if not course_id:
        return jsonify({"msg": "Course ID required"}), 400

    already = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if already:
        return jsonify({"msg": "Already enrolled"}), 400

    enrollment = Enrollment(student_id=user_id, course_id=course_id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({"msg": "Enrolled successfully"}), 201


@student_bp.route('/progress/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('student')
def view_progress(course_id):
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404

    return jsonify({
        "course_id": course_id,
        "progress": enrollment.progress,
        "completed": enrollment.completed
    })


@student_bp.route('/update-progress', methods=['PUT'])
@jwt_required()
@role_required('student')
def update_progress():
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()
    course_id = data.get('course_id')
    progress = data.get('progress', 0)

    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404

    enrollment.progress = progress
    if progress >= 100:
        enrollment.completed = True

    db.session.commit()
    return jsonify({"msg": "Progress updated"})


@student_bp.route('/profile', methods=['GET'])
@jwt_required()
@role_required('student')
def get_profile():
    identity = get_jwt_identity()
    student_id = identity if isinstance(identity, int) else identity.get('id')
    user = User.query.get_or_404(student_id)
    return jsonify({
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email
    })


@student_bp.route('/courses', methods=['GET'])
def get_courses():
    # Get regular courses
    courses = Course.query.all()
    course_list = [{
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'price': course.price,
        'teacher_name': course.teacher.full_name if course.teacher else None
    } for course in courses]
    
    # Get skills as courses
    from models.course import Skill
    skills = Skill.query.all()
    skill_list = [{
        'id': f"skill_{skill.id}",
        'title': skill.name,
        'description': skill.description,
        'price': skill.price,
        'teacher_name': skill.teacher.full_name if skill.teacher else None
    } for skill in skills]
    
    return jsonify(course_list + skill_list)


@student_bp.route('/course/<int:course_id>', methods=['GET'])
def get_course_details(course_id):
    course = Course.query.get_or_404(course_id)
    return jsonify({
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'price': course.price,
        'teacher_name': course.teacher.full_name if course.teacher else None
    })


@student_bp.route('/my-progress', methods=['GET'])
@jwt_required()
@role_required('student')
def get_my_progress():
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    
    progress_list = []
    
    # Get course enrollments
    course_enrollments = Enrollment.query.filter_by(student_id=user_id).all()
    for enrollment in course_enrollments:
        status = "Start"
        if enrollment.completed:
            status = "Completed - Certificate Available"
        elif enrollment.progress > 0:
            status = "Continue Learning"
            
        progress_list.append({
            'id': enrollment.course.id,
            'title': enrollment.course.title,
            'type': 'course',
            'progress': enrollment.progress,
            'status': status,
            'completed': enrollment.completed
        })
    
    # Get skill enrollments
    skill_enrollments = SkillEnrollment.query.filter_by(student_id=user_id).all()
    for enrollment in skill_enrollments:
        status = "Start"
        if enrollment.completed:
            status = "Completed - Certificate Available"
        elif enrollment.progress > 0:
            status = "Continue Learning"
            
        progress_list.append({
            'id': f"skill_{enrollment.skill.id}",
            'title': enrollment.skill.name,
            'type': 'skill',
            'progress': enrollment.progress,
            'status': status,
            'completed': enrollment.completed
        })
    
    return jsonify(progress_list)


@student_bp.route('/update-my-progress', methods=['PUT'])
@jwt_required()
@role_required('student')
def update_my_progress():
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()
    
    item_id = data.get('id')
    progress = data.get('progress', 0)
    
    if str(item_id).startswith('skill_'):
        skill_id = int(item_id.replace('skill_', ''))
        enrollment = SkillEnrollment.query.filter_by(student_id=user_id, skill_id=skill_id).first()
    else:
        enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=item_id).first()
    
    if not enrollment:
        return jsonify({"msg": "Enrollment not found"}), 404
    
    enrollment.progress = progress
    if progress >= 100:
        enrollment.completed = True
    
    db.session.commit()
    return jsonify({"msg": "Progress updated successfully"})


@student_bp.route('/enroll-skill', methods=['POST'])
@jwt_required()
@role_required('student')
def enroll_skill():
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()
    skill_id = data.get('skill_id')

    if not skill_id:
        return jsonify({"msg": "Skill ID required"}), 400

    # Check if skill exists
    skill = Skill.query.get(skill_id)
    if not skill:
        return jsonify({"msg": "Skill not found"}), 404

    # Check if already enrolled
    already = SkillEnrollment.query.filter_by(student_id=user_id, skill_id=skill_id).first()
    if already:
        return jsonify({"msg": "Already enrolled in this skill"}), 400

    enrollment = SkillEnrollment(student_id=user_id, skill_id=skill_id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({"msg": "Enrolled in skill successfully"}), 201

@student_bp.route('/review', methods=['POST'])
@jwt_required()
@role_required('student')
def add_review():
    from models.reviews import Review
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()
    
    review = Review(
        student_id=user_id,
        course_id=data['course_id'],
        comment=data['comment']
    )
    db.session.add(review)
    db.session.commit()
    return jsonify({"msg": "Review added successfully"}), 201

@student_bp.route('/rate', methods=['POST'])
@jwt_required()
@role_required('student')
def add_rating():
    from models.ratings import Rating
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()
    
    rating = Rating(
        student_id=user_id,
        course_id=data['course_id'],
        score=data['score']
    )
    db.session.add(rating)
    db.session.commit()
    return jsonify({"msg": "Rating added successfully"}), 201

@student_bp.route('/certificate/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('student')
def get_certificate(course_id):
    from models.certificate import Certificate
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not enrollment or not enrollment.completed:
        return jsonify({"msg": "Course not completed"}), 400
    
    cert = Certificate.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not cert:
        cert = Certificate(
            student_id=user_id,
            course_id=course_id,
            file_path=f"certificates/cert_{user_id}_{course_id}.pdf"
        )
        db.session.add(cert)
        db.session.commit()
    
    return jsonify({
        "certificate_id": cert.id,
        "file_path": cert.file_path,
        "msg": "Certificate generated"
    })

@student_bp.route('/request-teacher', methods=['POST'])
@jwt_required()
@role_required('student')
def request_teacher():
    from models.teacher_request import TeacherRequest
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()
    
    request_obj = TeacherRequest(
        student_id=user_id,
        teacher_id=data['teacher_id'],
        message=data['message']
    )
    db.session.add(request_obj)
    db.session.commit()
    return jsonify({"msg": "Teacher request sent successfully"}), 201

@student_bp.route('/start-course/<int:course_id>', methods=['POST'])
@jwt_required()
@role_required('student')
def start_course(course_id):
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404
    
    if enrollment.progress == 0:
        enrollment.progress = 1
        db.session.commit()
    
    return jsonify({"msg": "Course started", "progress": enrollment.progress})

@student_bp.route('/start-skill/<int:skill_id>', methods=['POST'])
@jwt_required()
@role_required('student')
def start_skill(skill_id):
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    
    enrollment = SkillEnrollment.query.filter_by(student_id=user_id, skill_id=skill_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404
    
    if enrollment.progress == 0:
        enrollment.progress = 1
        db.session.commit()
    
    return jsonify({"msg": "Skill started", "progress": enrollment.progress})