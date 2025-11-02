from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Module, Skill, Subscription
from models.course import Enrollment, SkillEnrollment, Quiz, Question, Answer, QuizAttempt
from extensions import db
from utils.decorators import role_required

# Import additional endpoint files to register their routes
# Note: These files need to be updated to import teacher_bp from this module
# For now, the endpoints are already included in this file

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
    request_obj.status = data.get('status') or data
    db.session.commit()
    return jsonify({"msg": "Request status updated"})

# Debug endpoint to check all requests
@teacher_bp.route('/debug/requests', methods=['GET'])
@jwt_required()
@role_required('teacher')
def debug_requests():
    from models.teacher_request import TeacherRequest
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    requests = TeacherRequest.query.filter_by(teacher_id=teacher_id).all()
    return jsonify([{
        'id': r.id,
        'student_id': r.student_id,
        'student_name': r.student.full_name,
        'message': r.message,
        'status': r.status,
        'date_created': r.date_created.strftime('%Y-%m-%d %H:%M:%S')
    } for r in requests])

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

    # Check if session already exists for this request
    existing_session = StudySession.query.filter_by(
        student_id=request_obj.student_id,
        teacher_id=request_obj.teacher_id
    ).filter(StudySession.subject.contains(request_obj.message[:50])).first()

    if existing_session:
        return jsonify({
            'message': 'Session already exists',
            'session_id': existing_session.id
        })

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

@teacher_bp.route('/requests/<int:request_id>/sessions', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_request_sessions(request_id):
    from models.teacher_request import TeacherRequest
    from models.chat import StudySession

    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    request_obj = TeacherRequest.query.get_or_404(request_id)
    if request_obj.teacher_id != teacher_id:
        return jsonify({'message': 'Unauthorized'}), 403

    sessions = StudySession.query.filter_by(
        student_id=request_obj.student_id,
        teacher_id=request_obj.teacher_id
    ).filter(StudySession.subject.contains(request_obj.message[:50])).all()

    return jsonify([{
        'id': s.id,
        'subject': s.subject,
        'status': s.status,
        'created_at': s.created_at.strftime('%Y-%m-%d %H:%M')
    } for s in sessions])

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

@teacher_bp.route('/students-progress', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_students_progress():
    from models.course import Enrollment, SkillEnrollment
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    progress_data = []

    # Get course enrollments
    course_enrollments = db.session.query(Enrollment, Course, User).join(
        Course, Enrollment.course_id == Course.id
    ).join(
        User, Enrollment.student_id == User.id
    ).filter(Course.teacher_id == teacher_id).all()

    for enrollment, course, student in course_enrollments:
        progress_data.append({
            'student_name': student.full_name,
            'student_email': student.email,
            'item_type': 'course',
            'item_name': course.title,
            'progress': enrollment.progress,
            'completed': enrollment.completed,
            'date_enrolled': enrollment.date_enrolled.strftime('%Y-%m-%d') if enrollment.date_enrolled else None
        })

    # Get skill enrollments
    skill_enrollments = db.session.query(SkillEnrollment, Skill, User).join(
        Skill, SkillEnrollment.skill_id == Skill.id
    ).join(
        User, SkillEnrollment.student_id == User.id
    ).filter(Skill.teacher_id == teacher_id).all()

    for enrollment, skill, student in skill_enrollments:
        progress_data.append({
            'student_name': student.full_name,
            'student_email': student.email,
            'item_type': 'skill',
            'item_name': skill.name,
            'progress': enrollment.progress,
            'completed': enrollment.completed,
            'date_enrolled': enrollment.date_enrolled.strftime('%Y-%m-%d') if enrollment.date_enrolled else None
        })

    return jsonify(progress_data)

@teacher_bp.route('/courses/<int:course_id>/students', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_course_students(course_id):
    from models.course import Enrollment
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first()
    if not course:
        return jsonify({'message': 'Course not found or unauthorized'}), 404

    enrollments = db.session.query(Enrollment, User).join(
        User, Enrollment.student_id == User.id
    ).filter(Enrollment.course_id == course_id).all()

    students_data = []
    for enrollment, student in enrollments:
        students_data.append({
            'student_id': student.id,
            'student_name': student.full_name,
            'student_email': student.email,
            'progress': enrollment.progress,
            'completed': enrollment.completed,
            'date_enrolled': enrollment.date_enrolled.strftime('%Y-%m-%d') if enrollment.date_enrolled else None
        })

    return jsonify({
        'course_title': course.title,
        'students': students_data
    })

@teacher_bp.route('/balance', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_teacher_balance():
    from models.payment import Payment
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    courses = Course.query.filter_by(teacher_id=teacher_id).all()
    skills = Skill.query.filter_by(teacher_id=teacher_id).all()

    course_ids = [c.id for c in courses]
    skill_ids = [s.id for s in skills]

    total_earnings = 0
    payment_history = []

    # Course payments
    if course_ids:
        course_payments = Payment.query.filter(Payment.course_id.in_(course_ids)).all()
        for payment in course_payments:
            total_earnings += payment.teacher_share
            payment_history.append({
                'item_name': payment.course.title,
                'item_type': 'course',
                'amount': payment.teacher_share,
                'student_name': payment.student.full_name
            })

    # Skill payments
    if skill_ids:
        skill_payments = Payment.query.filter(Payment.skill_id.in_(skill_ids)).all()
        for payment in skill_payments:
            total_earnings += payment.teacher_share
            payment_history.append({
                'item_name': payment.skill.name,
                'item_type': 'skill',
                'amount': payment.teacher_share,
                'student_name': payment.student.full_name
            })

    return jsonify({
        'total_balance': total_earnings,
        'payment_history': payment_history,
        'total_courses': len(courses),
        'total_skills': len(skills)
    })

@teacher_bp.route('/subscription', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_teacher_subscription():
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    subscription = Subscription.query.filter_by(teacher_id=teacher_id).first()
    if not subscription:
        return jsonify({'message': 'No subscription found'}), 404

    return jsonify({
        'id': subscription.id,
        'plan_type': subscription.plan_type,
        'status': subscription.status,
        'renewal_date': subscription.renewal_date.strftime('%Y-%m-%d') if subscription.renewal_date else None,
        'created_at': subscription.created_at.strftime('%Y-%m-%d') if subscription.created_at else None
    })

# Get teacher's quizzes
@teacher_bp.route('/quizzes', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_teacher_quizzes():
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    # Get quizzes from courses the teacher owns
    quizzes = Quiz.query.join(Course).filter(Course.teacher_id == teacher_id).all()

    quiz_data = []
    for quiz in quizzes:
        questions_count = Question.query.filter_by(quiz_id=quiz.id).count()
        attempts_count = QuizAttempt.query.filter_by(quiz_id=quiz.id).count()

        quiz_data.append({
            'id': quiz.id,
            'title': quiz.title,
            'course_title': quiz.course.title if quiz.course else 'N/A',
            'course_id': quiz.course_id,
            'is_final_quiz': quiz.is_final_quiz,
            'passing_score': quiz.passing_score,
            'questions_count': questions_count,
            'attempts_count': attempts_count,
            'created_at': quiz.created_at.strftime('%Y-%m-%d') if quiz.created_at else None
        })

    response = jsonify({
        'quizzes': quiz_data,
        'total_quizzes': len(quiz_data)
    })

    # Add CORS headers explicitly for this endpoint
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'

    return response

# Final Quiz Management for Teachers
@teacher_bp.route('/courses/<int:course_id>/final-quiz', methods=['POST'])
@jwt_required()
@role_required('teacher')
def create_final_quiz(course_id):
    data = request.get_json()
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first()
    if not course:
        return jsonify({'message': 'Course not found or unauthorized'}), 404

    # Check if final quiz already exists
    existing_quiz = Quiz.query.filter_by(course_id=course_id, is_final_quiz=True).first()
    if existing_quiz:
        return jsonify({'message': 'Final quiz already exists for this course'}), 400

    quiz = Quiz(
        title=data['title'],
        course_id=course_id,
        passing_score=data.get('passing_score', 70),
        is_final_quiz=True
    )
    db.session.add(quiz)
    db.session.commit()

    response = jsonify({
        'message': 'Final quiz created successfully',
        'quiz_id': quiz.id
    })

    # Add CORS headers explicitly for this endpoint
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'

    return response, 201

@teacher_bp.route('/courses/<int:course_id>/final-quiz', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_final_quiz(course_id):
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first()
    if not course:
        return jsonify({'message': 'Course not found or unauthorized'}), 404

    quiz = Quiz.query.filter_by(course_id=course_id, is_final_quiz=True).first()
    if not quiz:
        return jsonify({'message': 'No final quiz found for this course'}), 404

    questions = Question.query.filter_by(quiz_id=quiz.id).all()
    questions_data = []
    for question in questions:
        answers = Answer.query.filter_by(question_id=question.id).all()
        questions_data.append({
            'id': question.id,
            'question_text': question.question_text,
            'question_type': question.question_type,
            'answers': [{
                'id': answer.id,
                'answer_text': answer.answer_text,
                'is_correct': answer.is_correct
            } for answer in answers]
        })

    response = jsonify({
        'quiz_id': quiz.id,
        'title': quiz.title,
        'passing_score': quiz.passing_score,
        'questions': questions_data
    })

    # Add CORS headers explicitly for this endpoint
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'

    return response

@teacher_bp.route('/quizzes/<int:quiz_id>/questions', methods=['POST'])
@jwt_required()
@role_required('teacher')
def add_quiz_question(quiz_id):
    data = request.get_json()
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    quiz = Quiz.query.get_or_404(quiz_id)
    if quiz.module and quiz.module.course.teacher_id != teacher_id:
        return jsonify({'message': 'Unauthorized'}), 403
    if quiz.course and quiz.course.teacher_id != teacher_id:
        return jsonify({'message': 'Unauthorized'}), 403

    question = Question(
        quiz_id=quiz_id,
        question_text=data['question_text'],
        question_type=data['question_type']
    )
    db.session.add(question)
    db.session.commit()

    # Add answers
    for answer_data in data['answers']:
        answer = Answer(
            question_id=question.id,
            answer_text=answer_data['answer_text'],
            is_correct=answer_data.get('is_correct', False)
        )
        db.session.add(answer)
    db.session.commit()

    response = jsonify({'message': 'Question added successfully'})

    # Add CORS headers explicitly for this endpoint
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'

    return response, 201

@teacher_bp.route('/courses/<int:course_id>/final-quiz/results', methods=['GET'])
@jwt_required()
@role_required('teacher')
def get_final_quiz_results(course_id):
    identity = get_jwt_identity()
    teacher_id = identity if isinstance(identity, int) else identity.get('id')

    course = Course.query.filter_by(id=course_id, teacher_id=teacher_id).first()
    if not course:
        return jsonify({'message': 'Course not found or unauthorized'}), 404

    quiz = Quiz.query.filter_by(course_id=course_id, is_final_quiz=True).first()
    if not quiz:
        return jsonify({'message': 'No final quiz found for this course'}), 404

    attempts = QuizAttempt.query.filter_by(quiz_id=quiz.id).all()
    results = []

    for attempt in attempts:
        total_questions = len(quiz.questions)
        correct_answers = 0

        for response in attempt.responses:
            selected_answer = Answer.query.get(response.selected_answer_id)
            if selected_answer and selected_answer.is_correct:
                correct_answers += 1

        score_percentage = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0
        passed = score_percentage >= quiz.passing_score

        results.append({
            'student_name': attempt.student.full_name,
            'student_email': attempt.student.email,
            'score': score_percentage,
            'passed': passed,
            'attempted_at': attempt.completed_at.strftime('%Y-%m-%d %H:%M') if attempt.completed_at else None,
            'total_questions': total_questions,
            'correct_answers': correct_answers
        })

    return jsonify({
        'course_title': course.title,
        'quiz_title': quiz.title,
        'passing_score': quiz.passing_score,
        'results': results
    })