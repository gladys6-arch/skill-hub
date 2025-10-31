from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Module, Skill
from models.course import Enrollment, SkillEnrollment
from extensions import db
from utils.decorators import role_required

teacher_bp = Blueprint('teacher_bp', __name__)

@teacher_bp.route('/add-skill', methods=['POST'])
@jwt_required()
@role_required('teacher')
def add_skill():
    data = request.get_json()
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    # Check if skill already exists
    existing_skill = Skill.query.filter_by(name=data['name']).first()
    if existing_skill:
        return jsonify({'message': 'Skill already exists'}), 400
    
    skill = Skill(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        teacher_id=teacher_id
    )
    db.session.add(skill)
    db.session.commit()
    
    return jsonify({'message': 'Skill added successfully'}), 201


@teacher_bp.route('/courses', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_my_courses():
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    courses = Course.query.filter_by(teacher_id=teacher_id).all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'price': c.price
    } for c in courses])

@teacher_bp.route('/courses', methods=['POST'])
@jwt_required()
@role_required('teacher')
def create_course():
    data = request.get_json()
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    course = Course(title=data['title'], description=data['description'], price=data['price'], teacher_id=teacher_id)
    db.session.add(course)
    db.session.commit()
    return jsonify({"msg": "Course added successfully"})

@teacher_bp.route('/requests', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_teacher_requests():
    from models.teacher_request import TeacherRequest
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    requests = TeacherRequest.query.filter_by(teacher_id=teacher_id).all()
    return jsonify([{
        'id': r.id,
        'student_name': r.student.full_name,
        'message': r.message,
        'status': r.status,
        'date_created': r.date_created.strftime('%Y-%m-%d')
    } for r in requests])

@teacher_bp.route('/requests/<int:request_id>', methods=['PUT'])
@jwt_required()
@role_required('teacher')
def update_request_status(request_id):
    from models.teacher_request import TeacherRequest
    data = request.get_json()
    
    request_obj = TeacherRequest.query.get_or_404(request_id)
    request_obj.status = data['status']
    db.session.commit()
    return jsonify({"msg": "Request status updated"})

@teacher_bp.route('/skills', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_my_skills():
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    skills = Skill.query.filter_by(teacher_id=teacher_id).all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'description': s.description,
        'price': s.price
    } for s in skills])

@teacher_bp.route('/courses/<int:course_id>/modules', methods=['POST'])
@jwt_required()
@role_required('teacher')
def add_module(course_id):
    data = request.get_json()
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first()
    if not course:
        return jsonify({'message': 'Course not found or unauthorized'}), 404
    
    module = Module(
        title=data['title'],
        content=data['content'],
        course_id=course_id
    )
    db.session.add(module)
    db.session.commit()
    return jsonify({'message': 'Module added successfully'}), 201

@teacher_bp.route('/courses/<int:course_id>/modules', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_course_modules(course_id):
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first()
    if not course:
        return jsonify({'message': 'Course not found or unauthorized'}), 404
    
    modules = Module.query.filter_by(course_id=course_id).all()
    return jsonify([{
        'id': m.id,
        'title': m.title,
        'content': m.content
    } for m in modules])

@teacher_bp.route('/modules/<int:module_id>', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_module(module_id):
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    module = Module.query.get_or_404(module_id)
    if module.course.teacher_id != teacher_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    return jsonify({
        'id': module.id,
        'title': module.title,
        'content': module.content,
        'course_id': module.course_id
    })

@teacher_bp.route('/modules/<int:module_id>', methods=['PUT'])
@jwt_required()
@role_required('teacher')
def update_module(module_id):
    data = request.get_json()
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    module = Module.query.get_or_404(module_id)
    if module.course.teacher_id != teacher_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    module.title = data.get('title', module.title)
    module.content = data.get('content', module.content)
    db.session.commit()
    return jsonify({'message': 'Module updated successfully'})

@teacher_bp.route('/courses/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_course(course_id):
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first()
    if not course:
        return jsonify({'message': 'Course not found or unauthorized'}), 404
    
    return jsonify({
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'price': course.price
    })

@teacher_bp.route('/courses/<int:course_id>', methods=['PUT'])
@jwt_required()
@role_required('teacher')
def update_course(course_id):
    data = request.get_json()
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first()
    if not course:
        return jsonify({'message': 'Course not found or unauthorized'}), 404
    
    course.title = data.get('title', course.title)
    course.description = data.get('description', course.description)
    course.price = data.get('price', course.price)
    db.session.commit()
    return jsonify({'message': 'Course updated successfully'})

@teacher_bp.route('/skills/<int:skill_id>', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_skill(skill_id):
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    skill = Skill.query.filter_by(id=skill_id, teacher_id=teacher_id).first()
    if not skill:
        return jsonify({'message': 'Skill not found or unauthorized'}), 404
    
    return jsonify({
        'id': skill.id,
        'name': skill.name,
        'description': skill.description,
        'price': skill.price
    })

@teacher_bp.route('/skills/<int:skill_id>', methods=['PUT'])
@jwt_required()
@role_required('teacher')
def update_skill(skill_id):
    data = request.get_json()
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    skill = Skill.query.filter_by(id=skill_id, teacher_id=teacher_id).first()
    if not skill:
        return jsonify({'message': 'Skill not found or unauthorized'}), 404
    
    skill.name = data.get('name', skill.name)
    skill.description = data.get('description', skill.description)
    skill.price = data.get('price', skill.price)
    db.session.commit()
    return jsonify({'message': 'Skill updated successfully'})

@teacher_bp.route('/requests/<int:request_id>/accept', methods=['POST'])
@jwt_required()
@role_required('teacher')
def accept_request_and_create_session(request_id):
    from models.teacher_request import TeacherRequest
    from models.chat import StudySession
    
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    request_obj = TeacherRequest.query.get_or_404(request_id)
    if request_obj.teacher_id != teacher_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    request_obj.status = 'accepted'
    
    session = StudySession(
        student_id=request_obj.student_id,
        teacher_id=request_obj.teacher_id,
        subject=request_obj.message[:100]
    )
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'message': 'Request accepted and study session created',
        'session_id': session.id
    })

@teacher_bp.route('/student/<int:student_id>/progress', methods=['GET'])
@jwt_required()
@role_required('teacher')
def view_student_progress(student_id):
    from models.course import Enrollment, SkillEnrollment
    
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    skill_enrollments = SkillEnrollment.query.filter_by(student_id=student_id).all()
    
    progress_data = []
    
    for enrollment in enrollments:
        progress_data.append({
            'type': 'course',
            'title': enrollment.course.title,
            'progress': enrollment.progress,
            'completed': enrollment.completed
        })
    
    for enrollment in skill_enrollments:
        progress_data.append({
            'type': 'skill',
            'title': enrollment.skill.name,
            'progress': enrollment.progress,
            'completed': enrollment.completed
        })
    
    return jsonify(progress_data)

@teacher_bp.route('/sessions', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_study_sessions():
    from models.chat import StudySession
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')
    
    sessions = StudySession.query.filter_by(teacher_id=teacher_id).all()
    return jsonify([{
        'id': s.id,
        'student_id': s.student_id,
        'student_name': s.student.full_name,
        'subject': s.subject,
        'status': s.status,
        'created_at': s.created_at.strftime('%Y-%m-%d %H:%M')
    } for s in sessions])

@teacher_bp.route('/chat/<int:session_id>', methods=['GET'])
@jwt_required()
def get_chat_messages(session_id):
    from models.chat import ChatMessage
    messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp).all()
    return jsonify([{
        'id': m.id,
        'sender_name': m.sender.full_name,
        'message': m.message,
        'timestamp': m.timestamp.strftime('%H:%M')
    } for m in messages])

@teacher_bp.route('/chat/<int:session_id>/send', methods=['POST'])
@jwt_required()
def send_message(session_id):
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