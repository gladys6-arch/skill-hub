from flask import Blueprint, request, jsonify, render_template, send_file, Response
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from models.course import Course, Enrollment, SkillEnrollment, Skill, Module, ModuleProgress, Quiz, Question, Answer, QuizAttempt, QuizResponse
from models import User
from datetime import datetime
import html

student_bp = Blueprint('student_bp', __name__)

@student_bp.route('/my-requests', methods=['GET'])
@jwt_required()
@role_required('student')
def get_my_requests():
    from models.teacher_request import TeacherRequest
    identity = get_jwt_identity()
    student_id = identity if isinstance(identity, int) else identity.get('id')
    
    requests = TeacherRequest.query.filter_by(student_id=student_id).all()
    return jsonify([{
        'id': r.id,
        'teacher_name': r.teacher.full_name,
        'message': r.message,
        'status': r.status,
        'response_message': r.response_message,
        'date_created': r.date_created.strftime('%Y-%m-%d'),
        'date_responded': r.date_responded.strftime('%Y-%m-%d') if r.date_responded else None
    } for r in requests])

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

    # Calculate progress based on ModuleProgress instead of stored progress
    total_modules = Module.query.filter_by(course_id=course_id).count()
    completed_modules = ModuleProgress.query.filter_by(
        student_id=user_id,
        completed=True
    ).join(Module).filter(Module.course_id == course_id).count()

    progress_percentage = int((completed_modules / total_modules) * 100) if total_modules > 0 else 0
    completed = progress_percentage >= 100

    return jsonify({
        "course_id": course_id,
        "progress": progress_percentage,
        "completed": completed
    })




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
    from models.ratings import Rating
    from models.reviews import Review

    # Get regular courses with ratings
    courses = Course.query.all()
    course_list = []
    for course in courses:
        # Calculate average rating and review count
        ratings = Rating.query.filter_by(course_id=course.id).all()
        reviews = Review.query.filter_by(course_id=course.id).all()

        avg_rating = sum(r.score for r in ratings) / len(ratings) if ratings else 0
        review_count = len(reviews)

        course_list.append({
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'price': course.price,
            'teacher_name': course.teacher.full_name if course.teacher else None,
            'average_rating': round(avg_rating, 1) if avg_rating > 0 else 0,
            'rating_count': len(ratings),
            'review_count': review_count,
            'reviews': [{
                'student_name': review.student.full_name,
                'comment': review.comment,
                'rating': next((r.score for r in ratings if r.student_id == review.student_id), None),
                'created_at': review.date_created.strftime('%Y-%m-%d') if review.date_created else None
            } for review in reviews[:3]]  # Show only first 3 reviews
        })

    # Get skills as courses with ratings
    from models.course import Skill
    skills = Skill.query.all()
    skill_list = []
    for skill in skills:
        # Skills don't have ratings yet, but structure is ready
        skill_list.append({
            'id': f"skill_{skill.id}",
            'title': skill.name,
            'description': skill.description,
            'price': skill.price,
            'teacher_name': skill.teacher.full_name if skill.teacher else None,
            'average_rating': 0,
            'rating_count': 0,
            'review_count': 0,
            'reviews': []
        })

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
        # Calculate progress based on ModuleProgress
        total_modules = Module.query.filter_by(course_id=enrollment.course_id).count()
        completed_modules = ModuleProgress.query.filter_by(
            student_id=user_id,
            completed=True
        ).join(Module).filter(Module.course_id == enrollment.course_id).count()

        progress_percentage = int((completed_modules / total_modules) * 100) if total_modules > 0 else 0
        completed = progress_percentage >= 100

        status = "Start"
        if completed:
            status = "Completed - Certificate Available"
        elif progress_percentage > 0:
            status = "Continue Learning"

        progress_list.append({
            'id': enrollment.course.id,
            'title': enrollment.course.title,
            'type': 'course',
            'progress': progress_percentage,
            'status': status,
            'completed': completed
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

# Keep the old review endpoint for backward compatibility
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
    from models.reviews import Review
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()

    # Check if rating already exists
    existing_rating = Rating.query.filter_by(student_id=user_id, course_id=data['course_id']).first()

    if existing_rating:
        # Update existing rating
        existing_rating.score = data['score']
    else:
        # Create new rating
        existing_rating = Rating(
            student_id=user_id,
            course_id=data['course_id'],
            score=data['score']
        )
        db.session.add(existing_rating)

    # Handle review if provided
    if 'review' in data and data['review'].strip():
        existing_review = Review.query.filter_by(student_id=user_id, course_id=data['course_id']).first()
        if existing_review:
            existing_review.comment = data['review']
        else:
            review = Review(
                student_id=user_id,
                course_id=data['course_id'],
                comment=data['review']
            )
            db.session.add(review)

    db.session.commit()
    return jsonify({"msg": "Rating and review submitted successfully"}), 201

@student_bp.route('/rate', methods=['PUT'])
@jwt_required()
@role_required('student')
def update_rating():
    from models.ratings import Rating
    from models.reviews import Review
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    data = request.get_json()

    # Update rating
    rating = Rating.query.filter_by(student_id=user_id, course_id=data['course_id']).first()
    if rating:
        rating.score = data['score']
    else:
        rating = Rating(
            student_id=user_id,
            course_id=data['course_id'],
            score=data['score']
        )
        db.session.add(rating)

    # Update review if provided
    if 'review' in data and data['review'].strip():
        review = Review.query.filter_by(student_id=user_id, course_id=data['course_id']).first()
        if review:
            review.comment = data['review']
        else:
            review = Review(
                student_id=user_id,
                course_id=data['course_id'],
                comment=data['review']
            )
            db.session.add(review)

    db.session.commit()
    return jsonify({"msg": "Rating and review updated successfully"}), 200

@student_bp.route('/course/<int:course_id>/rating', methods=['GET'])
@jwt_required()
@role_required('student')
def get_course_rating(course_id):
    from models.ratings import Rating
    from models.reviews import Review
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    rating = Rating.query.filter_by(student_id=user_id, course_id=course_id).first()
    review = Review.query.filter_by(student_id=user_id, course_id=course_id).first()

    if rating:
        return jsonify({
            'score': rating.score,
            'review': review.comment if review else None,
            'created_at': rating.created_at.strftime('%Y-%m-%d %H:%M') if rating.created_at else None
        })
    else:
        return jsonify(None)

@student_bp.route('/certificate/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('student')
def get_certificate(course_id):
    from models.certificate import Certificate
    from utils.certificate_generator import save_certificate
    import os

    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    # Check if course is 100% completed (both modules and final quiz)
    from models.course import Quiz, QuizAttempt

    # Check if all modules are completed
    total_modules = Module.query.filter_by(course_id=course_id).count()
    completed_modules = ModuleProgress.query.filter_by(
        student_id=user_id,
        completed=True
    ).join(Module).filter(Module.course_id == course_id).count()

    modules_completed = total_modules > 0 and completed_modules == total_modules

    # Check if final quiz is passed (if exists)
    final_quiz = Quiz.query.filter_by(course_id=course_id, is_final_quiz=True).first()
    quiz_passed = True  # Default to true if no quiz exists

    if final_quiz:
        attempt = QuizAttempt.query.filter_by(
            student_id=user_id,
            quiz_id=final_quiz.id
        ).order_by(QuizAttempt.completed_at.desc()).first()

        if attempt and attempt.score is not None:
            quiz_passed = attempt.score >= final_quiz.passing_score
        else:
            quiz_passed = False  # Quiz exists but not attempted

    # Only allow certificate if both conditions are met
    if not (modules_completed and quiz_passed):
        return jsonify({
            "msg": "Certificate not available. Complete all modules and pass the final quiz first.",
            "modules_completed": modules_completed,
            "quiz_passed": quiz_passed
        }), 400

    course = Course.query.get(course_id)
    user = User.query.get(user_id)

    # Calculate completed modules count and total modules
    completed_modules_count = ModuleProgress.query.filter_by(
        student_id=user_id,
        completed=True
    ).join(Module).filter(Module.course_id == course_id).count()

    total_modules = Module.query.filter_by(course_id=course_id).count()

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

        # Generate the actual certificate file with enhanced content
        full_path = os.path.join(os.getcwd(), file_path)

        completed_modules_text = f"{completed_modules_count}/{total_modules} Modules"

        save_certificate(
            student_name=user.full_name,
            course_title=course.title,
            file_path=full_path,
            cert_type="course",
            student_username=user.email.split('@')[0],  # Use email prefix as username
            completed_modules=completed_modules_text
        )

    # Return file for download
    full_path = os.path.join(os.getcwd(), cert.file_path)
    if not os.path.exists(full_path):
        # Regenerate with enhanced content if file doesn't exist
        completed_modules_text = f"{completed_modules_count}/{total_modules} Modules"

        save_certificate(
            student_name=user.full_name,
            course_title=course.title,
            file_path=full_path,
            cert_type="course",
            student_username=user.email.split('@')[0],
            completed_modules=completed_modules_text
        )

    # Generate HTML certificate using template
    certificate_id = f"SS-{datetime.now().strftime('%Y%m%d')}-{hash(user.full_name + course.title) % 10000:04d}"
    completion_date = datetime.now().strftime('%B %d, %Y')

    # Determine final assessment status
    final_assessment = "PASSED"
    if final_quiz:
        attempt = QuizAttempt.query.filter_by(
            student_id=user_id,
            quiz_id=final_quiz.id
        ).order_by(QuizAttempt.completed_at.desc()).first()
        if attempt and attempt.score is not None:
            final_assessment = f"PASSED ({attempt.score}%)" if attempt.score >= final_quiz.passing_score else f"FAILED ({attempt.score}%)"
        else:
            final_assessment = "NOT ATTEMPTED"

    html_content = render_template('certificate.html',
        certificate_id=certificate_id,
        student_name=html.escape(user.full_name),
        username=html.escape(user.email.split('@')[0]),
        course_title=html.escape(course.title),
        course_type="Course",
        modules_completed=f"{completed_modules_count}/{total_modules} Modules",
        final_assessment=final_assessment,
        completion_date=completion_date
    )

    # Sanitize filename to remove special characters that might cause issues
    safe_filename = "".join(c for c in course.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
    filename = f"{safe_filename}_certificate.html"

    response = Response(
        html_content,
        mimetype='text/html; charset=utf-8',
        headers={
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
    )
    return response

@student_bp.route('/skill-certificate/<int:skill_id>', methods=['GET'])
@jwt_required()
@role_required('student')
def get_skill_certificate(skill_id):
    from models.certificate import Certificate
    from utils.certificate_generator import save_certificate
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
    from models.course import Quiz, QuizAttempt
    identity = get_jwt_identity()
    student_id = identity if isinstance(identity, int) else identity.get('id')

    enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({'message': 'Not enrolled'}), 403

    course = Course.query.get_or_404(course_id)
    modules = Module.query.filter_by(course_id=course_id).all()

    # Get module progress
    module_progress = {}
    for mp in ModuleProgress.query.filter_by(student_id=student_id).filter(
        ModuleProgress.module_id.in_([m.id for m in modules])
    ).all():
        module_progress[mp.module_id] = {
            'completed': mp.completed,
            'completed_at': mp.completed_at.isoformat() if mp.completed_at else None
        }

    # Calculate overall progress
    total_modules = len(modules)
    completed_modules = sum(1 for mp in module_progress.values() if mp['completed'])
    progress_percentage = int((completed_modules / total_modules) * 100) if total_modules > 0 else 0

    # Check final quiz status
    final_quiz = Quiz.query.filter_by(course_id=course_id, is_final_quiz=True).first()
    quiz_status = None
    if final_quiz:
        attempt = QuizAttempt.query.filter_by(
            student_id=student_id,
            quiz_id=final_quiz.id
        ).order_by(QuizAttempt.completed_at.desc()).first()

        if attempt and attempt.score is not None:
            quiz_status = {
                'attempted': True,
                'score': attempt.score,
                'passed': attempt.score >= final_quiz.passing_score,
                'passing_score': final_quiz.passing_score
            }
        else:
            quiz_status = {
                'attempted': False,
                'passing_score': final_quiz.passing_score
            }

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
            'content': m.content,
            'completed': module_progress.get(m.id, {}).get('completed', False),
            'completed_at': module_progress.get(m.id, {}).get('completed_at')
        } for m in modules],
        'progress': progress_percentage,
        'completed': progress_percentage >= 100,
        'final_quiz': quiz_status
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

@student_bp.route('/teachers', methods=['GET'])
@jwt_required()
@role_required('student')
def get_teachers():
    teachers = User.query.filter_by(role='teacher').all()
    return jsonify([{
        'id': t.id,
        'full_name': t.full_name,
        'email': t.email
    } for t in teachers])

@student_bp.route('/request-session', methods=['POST'])
@jwt_required()
@role_required('student')
def request_session():
    from models.teacher_request import TeacherRequest
    data = request.get_json()
    identity = get_jwt_identity()
    student_id = identity if isinstance(identity, int) else identity.get('id')

    # Create teacher request
    teacher_request = TeacherRequest(
        student_id=student_id,
        teacher_id=data['teacher_id'],
        message=f"Study Session Request: {data['subject']}\n\n{data.get('message', '')}",
        status='pending'
    )
    db.session.add(teacher_request)
    db.session.commit()

    return jsonify({'message': 'Session request sent successfully'}), 201

# Final Quiz Taking for Students
@student_bp.route('/courses/<int:course_id>/final-quiz', methods=['GET'])
@jwt_required()
@role_required('student')
def get_final_quiz(course_id):
    from models.course import Quiz, QuizAttempt
    identity = get_jwt_identity()
    student_id = identity if isinstance(identity, int) else identity.get('id')

    # Check if student is enrolled
    enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({'message': 'Not enrolled in this course'}), 403

    # Optional: Check module completion (commented out to allow quiz access)
    # total_modules = Module.query.filter_by(course_id=course_id).count()
    # completed_modules = ModuleProgress.query.filter_by(
    #     student_id=student_id,
    #     completed=True
    # ).join(Module).filter(Module.course_id == course_id).count()

    quiz = Quiz.query.filter_by(course_id=course_id, is_final_quiz=True).first()
    if not quiz:
        # Check if any quiz exists for this course
        any_quiz = Quiz.query.filter_by(course_id=course_id).first()
        if any_quiz:
            return jsonify({'message': f'Quiz exists but is not marked as final quiz. Quiz ID: {any_quiz.id}, is_final_quiz: {any_quiz.is_final_quiz}'}), 404
        else:
            return jsonify({'message': 'No quiz available for this course. Teacher needs to create a final quiz first.'}), 404

    # Check if already attempted
    existing_attempt = QuizAttempt.query.filter_by(
        student_id=student_id,
        quiz_id=quiz.id
    ).first()

    if existing_attempt and existing_attempt.completed_at:
        return jsonify({
            'message': 'Quiz already completed',
            'score': existing_attempt.score,
            'passed': existing_attempt.score >= quiz.passing_score if existing_attempt.score else False
        }), 400

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
                'answer_text': answer.answer_text
            } for answer in answers]
        })

    return jsonify({
        'quiz_id': quiz.id,
        'title': quiz.title,
        'passing_score': quiz.passing_score,
        'questions': questions_data,
        'time_limit': None  # Could add time limits later
    })

@student_bp.route('/quizzes/<int:quiz_id>/submit', methods=['POST'])
@jwt_required()
@role_required('student')
def submit_quiz_attempt(quiz_id):
    from models.course import Quiz, QuizAttempt, QuizResponse
    data = request.get_json()
    identity = get_jwt_identity()
    student_id = identity if isinstance(identity, int) else identity.get('id')

    quiz = Quiz.query.get_or_404(quiz_id)
    if quiz.is_final_quiz and quiz.course_id:
        # Verify student is enrolled
        enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=quiz.course_id).first()
        if not enrollment:
            return jsonify({'message': 'Not enrolled in this course'}), 403

    # Check if already attempted
    existing_attempt = QuizAttempt.query.filter_by(
        student_id=student_id,
        quiz_id=quiz_id
    ).first()

    if existing_attempt and existing_attempt.completed_at:
        return jsonify({'message': 'Quiz already completed'}), 400

    # Create or update attempt
    if not existing_attempt:
        existing_attempt = QuizAttempt(
            student_id=student_id,
            quiz_id=quiz_id,
            started_at=datetime.now()
        )
        db.session.add(existing_attempt)
        db.session.commit()

    # Calculate score
    total_questions = len(quiz.questions)
    correct_answers = 0
    responses_data = []

    for response_data in data.get('responses', []):
        question = Question.query.get(response_data['question_id'])
        if question:
            selected_answer = Answer.query.get(response_data['selected_answer_id']) if response_data.get('selected_answer_id') else None

            # Create response record
            response = QuizResponse(
                attempt_id=existing_attempt.id,
                question_id=question.id,
                selected_answer_id=selected_answer.id if selected_answer else None,
                response_text=response_data.get('response_text')
            )
            db.session.add(response)
            responses_data.append(response)

            # Check if answer is correct
            if selected_answer and selected_answer.is_correct:
                correct_answers += 1

    # Calculate percentage score
    score_percentage = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0

    # Update attempt
    existing_attempt.completed_at = datetime.now()
    existing_attempt.score = score_percentage
    db.session.commit()

    passed = score_percentage >= quiz.passing_score

    return jsonify({
        'message': 'Quiz submitted successfully',
        'score': score_percentage,
        'passed': passed,
        'total_questions': total_questions,
        'correct_answers': correct_answers,
        'passing_score': quiz.passing_score
    }), 200