from flask import Blueprint, request, jsonify
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from models.course import Course, Enrollment, SkillEnrollment, Skill, Module
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
    from utils.certificate_generator import save_certificate
    from flask import send_file
    import os
    
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not enrollment or not enrollment.completed:
        return jsonify({"msg": "Course not completed"}), 400
    
    course = Course.query.get(course_id)
    user = User.query.get(user_id)
    
    cert = Certificate.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not cert:
        file_path = f"certificates/cert_{user_id}_{course_id}.pdf"
        cert = Certificate(
            student_id=user_id,
            course_id=course_id,
            file_path=file_path
        )
        db.session.add(cert)
        db.session.commit()
        
        # Generate the actual certificate file
        full_path = os.path.join(os.getcwd(), file_path)
        save_certificate(user.full_name, course.title, full_path, "course")
    
    # Return file for download
    full_path = os.path.join(os.getcwd(), cert.file_path)
    if not os.path.exists(full_path):
        save_certificate(user.full_name, course.title, full_path, "course")
    
    return send_file(full_path, as_attachment=True, download_name=f"{course.title}_certificate.pdf")

@student_bp.route('/skill-certificate/<int:skill_id>', methods=['GET'])
@jwt_required()
@role_required('student')
def get_skill_certificate(skill_id):
    from models.certificate import Certificate
    from utils.certificate_generator import save_certificate
    from flask import send_file
    import os
    
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    
    enrollment = SkillEnrollment.query.filter_by(student_id=user_id, skill_id=skill_id).first()
    if not enrollment or not enrollment.completed:
        return jsonify({"msg": "Skill not completed"}), 400
    
    skill = Skill.query.get(skill_id)
    user = User.query.get(user_id)
    
    cert = Certificate.query.filter_by(student_id=user_id, skill_id=skill_id).first()
    if not cert:
        file_path = f"certificates/skill_cert_{user_id}_{skill_id}.pdf"
        cert = Certificate(
            student_id=user_id,
            skill_id=skill_id,
            file_path=file_path
        )
        db.session.add(cert)
        db.session.commit()
        
        # Generate the actual certificate file
        full_path = os.path.join(os.getcwd(), file_path)
        save_certificate(user.full_name, skill.name, full_path, "skill")
    
    # Return file for download
    full_path = os.path.join(os.getcwd(), cert.file_path)
    if not os.path.exists(full_path):
        save_certificate(user.full_name, skill.name, full_path, "skill")
    
    return send_file(full_path, as_attachment=True, download_name=f"{skill.name}_certificate.pdf")

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

@student_bp.route('/enrolled-course/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('student')
def get_enrolled_course_content(course_id):
    identity = get_jwt_identity()
    student_id = identity if isinstance(identity, int) else identity.get('id')
    
    enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({'message': 'Not enrolled'}), 403
    
    course = Course.query.get_or_404(course_id)
    modules = Module.query.filter_by(course_id=course_id).all()
    
    return jsonify({
        'course': {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'teacher_name': course.teacher.full_name
        },
        'modules': [{
            'id': m.id,
            'title': m.title,
            'content': m.content
        } for m in modules],
        'progress': enrollment.progress,
        'completed': enrollment.completed
    })

@student_bp.route('/sessions', methods=['GET'])
@jwt_required()
@role_required('student')
def get_student_sessions():
    from models.chat import StudySession
    identity = get_jwt_identity()
    student_id = identity if isinstance(identity, int) else identity.get('id')
    
    sessions = StudySession.query.filter_by(student_id=student_id).all()
    return jsonify([{
        'id': s.id,
        'teacher_name': s.teacher.full_name,
        'subject': s.subject,
        'status': s.status,
        'created_at': s.created_at.strftime('%Y-%m-%d %H:%M')
    } for s in sessions])

@student_bp.route('/chat/<int:session_id>', methods=['GET'])
@jwt_required()
def get_student_chat_messages(session_id):
    from models.chat import ChatMessage
    messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp).all()
    return jsonify([{
        'id': m.id,
        'sender_name': m.sender.full_name,
        'message': m.message,
        'timestamp': m.timestamp.strftime('%H:%M')
    } for m in messages])

@student_bp.route('/chat/<int:session_id>/send', methods=['POST'])
@jwt_required()
def send_student_message(session_id):
    from models.chat import ChatMessage
    identity = get_jwt_identity()
    sender_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()
    
    message = ChatMessage(
        session_id=session_id,
        sender_id=sender_id,
        message=data['message']
    )
    db.session.add(message)
    db.session.commit()
    return jsonify({'message': 'Message sent'})