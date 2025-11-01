# Module progress tracking routes
# Import required modules
from flask import Blueprint, request, jsonify
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from models.course import (
    Course, Enrollment, Module, ModuleProgress, Quiz, Question, Answer,
    QuizAttempt, QuizResponse, StudentTimeTracking, ReadingSection,
    ReadingProgress, InteractiveElement, InteractiveCompletion,
    ModuleCompletionCriteria, ModuleTimeRequirement
)
import json
from datetime import datetime, timedelta

student_progress_bp = Blueprint('student_progress_bp', __name__)

def calculate_module_progress(student_id, module_id):
    """
    Calculate module progress with anti-cheating measures
    Returns a dictionary with progress details and validation flags
    """
    # Get module progress record
    progress = ModuleProgress.query.filter_by(
        student_id=student_id, module_id=module_id
    ).first()

    if not progress:
        return {
            'completed': False,
            'progress_percentage': 0,
            'anti_cheat_flags': [],
            'validation_errors': ['No progress record found']
        }

    # Get completion criteria for the module
    criteria = ModuleCompletionCriteria.query.filter_by(module_id=module_id).all()

    completed_criteria = []
    anti_cheat_flags = []
    validation_errors = []

    for criterion in criteria:
        if criterion.criteria_type == 'quiz':
            # Check quiz completion and score
            quiz = Quiz.query.filter_by(module_id=module_id).first()
            if quiz:
                attempt = QuizAttempt.query.filter_by(
                    student_id=student_id, quiz_id=quiz.id
                ).order_by(QuizAttempt.completed_at.desc()).first()

                if not attempt or not attempt.completed_at:
                    validation_errors.append('Quiz not completed')
                elif attempt.score < quiz.passing_score:
                    validation_errors.append(f'Quiz score {attempt.score}% below passing score {quiz.passing_score}%')
                    anti_cheat_flags.append('low_quiz_score')
                else:
                    completed_criteria.append('quiz')
            else:
                validation_errors.append('No quiz found for module')

        elif criterion.criteria_type == 'reading':
            # Check reading completion
            reading_sections = ReadingSection.query.filter_by(module_id=module_id).all()
            if reading_sections:
                total_sections = len(reading_sections)
                completed_sections = ReadingProgress.query.filter_by(
                    student_id=student_id
                ).filter(ReadingProgress.reading_section_id.in_([rs.id for rs in reading_sections])).count()

                if completed_sections < total_sections:
                    validation_errors.append(f'Reading incomplete: {completed_sections}/{total_sections} sections')
                else:
                    completed_criteria.append('reading')
            else:
                completed_criteria.append('reading')  # No reading sections required

        elif criterion.criteria_type == 'time':
            # Check time requirement
            time_req = ModuleTimeRequirement.query.filter_by(module_id=module_id).first()
            if time_req:
                time_tracking = StudentTimeTracking.query.filter_by(
                    student_id=student_id, module_id=module_id
                ).first()

                if not time_tracking or time_tracking.time_spent_seconds < (time_req.required_time_minutes * 60):
                    required_time = time_req.required_time_minutes * 60
                    actual_time = time_tracking.time_spent_seconds if time_tracking else 0
                    validation_errors.append(f'Insufficient time spent: {actual_time}s / {required_time}s required')
                    anti_cheat_flags.append('insufficient_time')
                else:
                    completed_criteria.append('time')
            else:
                completed_criteria.append('time')  # No time requirement

        elif criterion.criteria_type == 'interactive':
            # Check interactive elements completion
            interactive_elements = InteractiveElement.query.filter_by(module_id=module_id).all()
            if interactive_elements:
                total_elements = len(interactive_elements)
                completed_elements = InteractiveCompletion.query.filter_by(
                    student_id=student_id
                ).filter(InteractiveCompletion.interactive_element_id.in_([ie.id for ie in interactive_elements])).count()

                if completed_elements < total_elements:
                    validation_errors.append(f'Interactive elements incomplete: {completed_elements}/{total_elements}')
                else:
                    completed_criteria.append('interactive')
            else:
                completed_criteria.append('interactive')  # No interactive elements required

    # Calculate overall progress
    total_criteria = len(criteria)
    completed_count = len(completed_criteria)
    progress_percentage = int((completed_count / total_criteria) * 100) if total_criteria > 0 else 100

    # Anti-cheating checks
    if progress.completed and validation_errors:
        anti_cheat_flags.append('premature_completion')

    # Check for suspicious patterns (e.g., completed too quickly)
    if progress.completed_at and progress.completed_at - progress.completed_at.replace(hour=0, minute=0, second=0, microsecond=0) < timedelta(minutes=1):
        anti_cheat_flags.append('completed_too_quickly')

    # Update progress record with validation results
    progress.anti_cheat_flags = json.dumps(anti_cheat_flags) if anti_cheat_flags else None

    return {
        'completed': len(validation_errors) == 0 and progress.completed,
        'progress_percentage': progress_percentage,
        'completed_criteria': completed_criteria,
        'anti_cheat_flags': anti_cheat_flags,
        'validation_errors': validation_errors,
        'criteria_count': total_criteria
    }

@student_progress_bp.route('/course-progress/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('student')
def get_course_progress(course_id):
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404

    # Calculate progress automatically from ModuleProgress with validation
    modules = Module.query.filter_by(course_id=course_id).all()
    total_modules = len(modules)
    validated_completed_modules = 0

    for module in modules:
        validation_result = calculate_module_progress(user_id, module.id)
        if validation_result['completed']:
            validated_completed_modules += 1

    # Each module contributes equally to overall progress
    module_contribution = 100 / total_modules if total_modules > 0 else 0
    progress_percentage = int(validated_completed_modules * module_contribution)
    current_module = validated_completed_modules + 1 if validated_completed_modules < total_modules else total_modules

    return jsonify({
        "course_id": course_id,
        "current_module": current_module,
        "total_modules": total_modules,
        "progress_text": f"{current_module}/{total_modules}",
        "overall_progress": progress_percentage,
        "completed": progress_percentage >= 100,
        "validated_completed_modules": validated_completed_modules
    })

@student_progress_bp.route('/modules/<int:module_id>/progress', methods=['POST'])
@jwt_required()
@role_required('student')
def mark_module_progress(module_id):
    from models.course import ModuleProgress
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    data = request.get_json()
    completed = data.get('completed', False)

    # Check if student is enrolled in the course containing this module
    module = Module.query.filter_by(id=module_id).first()
    if not module:
        return jsonify({"msg": "Module not found"}), 404

    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=module.course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled in this course"}), 403

    # Get or create progress record
    progress_record = ModuleProgress.query.filter_by(
        student_id=user_id,
        module_id=module_id
    ).first()

    if not progress_record:
        progress_record = ModuleProgress(
            student_id=user_id,
            module_id=module_id,
            completed=completed,
            completed_at=db.func.now() if completed else None
        )
        db.session.add(progress_record)
    else:
        progress_record.completed = completed
        if completed and not progress_record.completed_at:
            progress_record.completed_at = db.func.now()
        elif not completed:
            progress_record.completed_at = None

    db.session.commit()

    # Use new validation logic to check if completion is valid
    validation_result = calculate_module_progress(user_id, module_id)

    # If trying to mark as completed but validation fails, prevent it
    if completed and not validation_result['completed']:
        progress_record.completed = False
        progress_record.completed_at = None
        db.session.commit()

        return jsonify({
            "msg": "Module completion blocked due to validation errors",
            "completed": False,
            "validation_errors": validation_result['validation_errors'],
            "anti_cheat_flags": validation_result['anti_cheat_flags']
        }), 400

    return jsonify({
        "msg": "Module progress updated",
        "completed": progress_record.completed,
        "completed_at": progress_record.completed_at.isoformat() if progress_record.completed_at else None,
        "validation_result": validation_result
    })

@student_progress_bp.route('/courses/<int:course_id>/modules', methods=['GET'])
@jwt_required()
@role_required('student')
def get_course_modules_student(course_id):
    from models.course import ModuleProgress
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    # Check if enrolled
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404

    modules = Module.query.filter_by(course_id=course_id).all()
    total_modules = len(modules)

    # Get progress for each module with validation
    module_details = []
    validated_completed_count = 0

    for i, m in enumerate(modules):
        validation_result = calculate_module_progress(user_id, m.id)
        is_validated_complete = validation_result['completed']

        if is_validated_complete:
            validated_completed_count += 1

        module_details.append({
            'id': m.id,
            'title': m.title,
            'content': m.content,
            'is_current': (i + 1) == (validated_completed_count + 1),
            'is_completed': is_validated_complete,
            'progress_percentage': validation_result['progress_percentage'],
            'validation_errors': validation_result['validation_errors'],
            'anti_cheat_flags': validation_result['anti_cheat_flags']
        })

    current_module = validated_completed_count + 1 if validated_completed_count < total_modules else total_modules

    return jsonify({
        "modules": module_details,
        "progress_text": f"{current_module}/{total_modules}",
        "validated_completed_count": validated_completed_count
    })

# Quiz Management Endpoints
@student_progress_bp.route('/modules/<int:module_id>/quiz', methods=['GET'])
@jwt_required()
@role_required('student')
def get_module_quiz(module_id):
    """Get quiz for a module (students can view quiz details)"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    # Check enrollment
    module = Module.query.filter_by(id=module_id).first()
    if not module:
        return jsonify({"msg": "Module not found"}), 404

    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=module.course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled in this course"}), 403

    quiz = Quiz.query.filter_by(module_id=module_id).first()
    if not quiz:
        return jsonify({"msg": "No quiz available for this module"}), 404

    # Get questions with answers (but hide correct answers for students)
    questions = []
    for question in quiz.questions:
        answers = [{"id": a.id, "answer_text": a.answer_text} for a in question.answers]
        questions.append({
            "id": question.id,
            "question_text": question.question_text,
            "question_type": question.question_type,
            "answers": answers
        })

    return jsonify({
        "quiz": {
            "id": quiz.id,
            "title": quiz.title,
            "passing_score": quiz.passing_score,
            "questions": questions
        }
    })

# Quiz Attempt Endpoints
@student_progress_bp.route('/quizzes/<int:quiz_id>/start', methods=['POST'])
@jwt_required()
@role_required('student')
def start_quiz_attempt(quiz_id):
    """Start a quiz attempt"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    quiz = Quiz.query.filter_by(id=quiz_id).first()
    if not quiz:
        return jsonify({"msg": "Quiz not found"}), 404

    # Check enrollment
    module = Module.query.filter_by(id=quiz.module_id).first()
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=module.course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled in this course"}), 403

    # Check if there's an incomplete attempt
    existing_attempt = QuizAttempt.query.filter_by(
        student_id=user_id, quiz_id=quiz_id, completed_at=None
    ).first()

    if existing_attempt:
        return jsonify({"msg": "Quiz attempt already in progress", "attempt_id": existing_attempt.id}), 409

    # Create new attempt
    attempt = QuizAttempt(student_id=user_id, quiz_id=quiz_id)
    db.session.add(attempt)
    db.session.commit()

    return jsonify({
        "msg": "Quiz attempt started",
        "attempt_id": attempt.id,
        "started_at": attempt.started_at.isoformat()
    })

@student_progress_bp.route('/quiz-attempts/<int:attempt_id>/submit', methods=['POST'])
@jwt_required()
@role_required('student')
def submit_quiz_attempt(attempt_id):
    """Submit answers for a quiz attempt"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    attempt = QuizAttempt.query.filter_by(id=attempt_id, student_id=user_id).first()
    if not attempt:
        return jsonify({"msg": "Quiz attempt not found"}), 404

    if attempt.completed_at:
        return jsonify({"msg": "Quiz attempt already completed"}), 409

    data = request.get_json()
    responses = data.get('responses', [])

    # Save responses
    for response_data in responses:
        question_id = response_data.get('question_id')
        selected_answer_id = response_data.get('selected_answer_id')
        response_text = response_data.get('response_text')

        response = QuizResponse(
            attempt_id=attempt_id,
            question_id=question_id,
            selected_answer_id=selected_answer_id,
            response_text=response_text
        )
        db.session.add(response)

    # Calculate score
    total_questions = len(attempt.quiz.questions)
    correct_answers = 0

    for response in attempt.responses:
        if response.selected_answer and response.selected_answer.is_correct:
            correct_answers += 1

    score = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0

    # Complete attempt
    attempt.completed_at = db.func.now()
    attempt.score = score
    db.session.commit()

    # Update module progress if quiz is part of completion criteria
    progress = ModuleProgress.query.filter_by(
        student_id=user_id, module_id=attempt.quiz.module_id
    ).first()

    if progress:
        progress.quiz_completed = True
        db.session.commit()

    return jsonify({
        "msg": "Quiz submitted successfully",
        "score": score,
        "correct_answers": correct_answers,
        "total_questions": total_questions,
        "passed": score >= attempt.quiz.passing_score
    })

@student_progress_bp.route('/quiz-attempts/<int:attempt_id>/results', methods=['GET'])
@jwt_required()
@role_required('student')
def get_quiz_results(attempt_id):
    """Get results for a completed quiz attempt"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    attempt = QuizAttempt.query.filter_by(id=attempt_id, student_id=user_id).first()
    if not attempt:
        return jsonify({"msg": "Quiz attempt not found"}), 404

    if not attempt.completed_at:
        return jsonify({"msg": "Quiz attempt not completed"}), 409

    # Get detailed results
    results = []
    for response in attempt.responses:
        question = response.question
        selected_answer = response.selected_answer
        correct_answer = next((a for a in question.answers if a.is_correct), None)

        results.append({
            "question_id": question.id,
            "question_text": question.question_text,
            "selected_answer": selected_answer.answer_text if selected_answer else response.response_text,
            "correct_answer": correct_answer.answer_text if correct_answer else None,
            "is_correct": selected_answer.is_correct if selected_answer else False
        })

    return jsonify({
        "attempt_id": attempt.id,
        "quiz_title": attempt.quiz.title,
        "score": attempt.score,
        "completed_at": attempt.completed_at.isoformat(),
        "results": results
    })

# Time Tracking Endpoints
@student_progress_bp.route('/modules/<int:module_id>/time/start', methods=['POST'])
@jwt_required()
@role_required('student')
def start_time_tracking(module_id):
    """Start or update time tracking for a module"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    # Check enrollment
    module = Module.query.filter_by(id=module_id).first()
    if not module:
        return jsonify({"msg": "Module not found"}), 404

    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=module.course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled in this course"}), 403

    # Get or create time tracking record
    time_tracking = StudentTimeTracking.query.filter_by(
        student_id=user_id, module_id=module_id
    ).first()

    if not time_tracking:
        time_tracking = StudentTimeTracking(student_id=user_id, module_id=module_id)
        db.session.add(time_tracking)

    time_tracking.last_accessed = db.func.now()
    db.session.commit()

    return jsonify({
        "msg": "Time tracking started",
        "time_spent_seconds": time_tracking.time_spent_seconds,
        "last_accessed": time_tracking.last_accessed.isoformat()
    })

@student_progress_bp.route('/modules/<int:module_id>/time/update', methods=['POST'])
@jwt_required()
@role_required('student')
def update_time_tracking(module_id):
    """Update time spent on a module"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    data = request.get_json()
    additional_seconds = data.get('additional_seconds', 0)

    if additional_seconds <= 0:
        return jsonify({"msg": "Invalid time increment"}), 400

    # Get time tracking record
    time_tracking = StudentTimeTracking.query.filter_by(
        student_id=user_id, module_id=module_id
    ).first()

    if not time_tracking:
        return jsonify({"msg": "Time tracking not started"}), 404

    time_tracking.time_spent_seconds += additional_seconds
    time_tracking.last_accessed = db.func.now()
    db.session.commit()

    # Check if time requirement is met and update progress
    time_req = ModuleTimeRequirement.query.filter_by(module_id=module_id).first()
    if time_req and time_tracking.time_spent_seconds >= (time_req.required_time_minutes * 60):
        progress = ModuleProgress.query.filter_by(student_id=user_id, module_id=module_id).first()
        if progress:
            progress.time_verified = True
            db.session.commit()

    return jsonify({
        "msg": "Time tracking updated",
        "time_spent_seconds": time_tracking.time_spent_seconds,
        "time_requirement_met": time_req and time_tracking.time_spent_seconds >= (time_req.required_time_minutes * 60)
    })

@student_progress_bp.route('/modules/<int:module_id>/time', methods=['GET'])
@jwt_required()
@role_required('student')
def get_time_tracking(module_id):
    """Get time tracking information for a module"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    time_tracking = StudentTimeTracking.query.filter_by(
        student_id=user_id, module_id=module_id
    ).first()

    time_req = ModuleTimeRequirement.query.filter_by(module_id=module_id).first()

    if time_tracking:
        return jsonify({
            "time_spent_seconds": time_tracking.time_spent_seconds,
            "last_accessed": time_tracking.last_accessed.isoformat(),
            "required_time_minutes": time_req.required_time_minutes if time_req else None,
            "requirement_met": time_req and time_tracking.time_spent_seconds >= (time_req.required_time_minutes * 60)
        })
    else:
        return jsonify({
            "time_spent_seconds": 0,
            "required_time_minutes": time_req.required_time_minutes if time_req else None,
            "requirement_met": False
        })

# Reading Progress Endpoints
@student_progress_bp.route('/modules/<int:module_id>/reading-sections', methods=['GET'])
@jwt_required()
@role_required('student')
def get_reading_sections(module_id):
    """Get reading sections for a module"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    # Check enrollment
    module = Module.query.filter_by(id=module_id).first()
    if not module:
        return jsonify({"msg": "Module not found"}), 404

    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=module.course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled in this course"}), 403

    sections = ReadingSection.query.filter_by(module_id=module_id).all()

    # Get progress for each section
    section_progress = {}
    for sp in ReadingProgress.query.filter_by(student_id=user_id).filter(
        ReadingProgress.reading_section_id.in_([s.id for s in sections])
    ).all():
        section_progress[sp.reading_section_id] = sp.completed

    return jsonify({
        "sections": [{
            "id": s.id,
            "title": s.title,
            "content": s.content,
            "completed": section_progress.get(s.id, False)
        } for s in sections]
    })

@student_progress_bp.route('/reading-sections/<int:section_id>/complete', methods=['POST'])
@jwt_required()
@role_required('student')
def mark_reading_section_complete(section_id):
    """Mark a reading section as completed"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    section = ReadingSection.query.filter_by(id=section_id).first()
    if not section:
        return jsonify({"msg": "Reading section not found"}), 404

    # Check enrollment
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=section.module.course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled in this course"}), 403

    # Get or create progress record
    progress = ReadingProgress.query.filter_by(
        student_id=user_id, reading_section_id=section_id
    ).first()

    if not progress:
        progress = ReadingProgress(student_id=user_id, reading_section_id=section_id)
        db.session.add(progress)

    progress.completed = True
    progress.completed_at = db.func.now()
    db.session.commit()

    # Update module progress if all sections are completed
    all_sections = ReadingSection.query.filter_by(module_id=section.module_id).all()
    completed_sections = ReadingProgress.query.filter_by(student_id=user_id).filter(
        ReadingProgress.reading_section_id.in_([s.id for s in all_sections])
    ).filter_by(completed=True).count()

    if completed_sections == len(all_sections):
        module_progress = ModuleProgress.query.filter_by(
            student_id=user_id, module_id=section.module_id
        ).first()
        if module_progress:
            module_progress.reading_completed = True
            db.session.commit()

    return jsonify({
        "msg": "Reading section marked as completed",
        "completed_at": progress.completed_at.isoformat()
    })

# Interactive Elements Endpoints
@student_progress_bp.route('/modules/<int:module_id>/interactive-elements', methods=['GET'])
@jwt_required()
@role_required('student')
def get_interactive_elements(module_id):
    """Get interactive elements for a module"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    # Check enrollment
    module = Module.query.filter_by(id=module_id).first()
    if not module:
        return jsonify({"msg": "Module not found"}), 404

    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=module.course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled in this course"}), 403

    elements = InteractiveElement.query.filter_by(module_id=module_id).all()

    # Get completion status for each element
    element_completions = {}
    for comp in InteractiveCompletion.query.filter_by(student_id=user_id).filter(
        InteractiveCompletion.interactive_element_id.in_([e.id for e in elements])
    ).all():
        element_completions[comp.interactive_element_id] = comp.completed

    return jsonify({
        "elements": [{
            "id": e.id,
            "element_type": e.element_type,
            "content": e.content,
            "completed": element_completions.get(e.id, False)
        } for e in elements]
    })

@student_progress_bp.route('/interactive-elements/<int:element_id>/complete', methods=['POST'])
@jwt_required()
@role_required('student')
def mark_interactive_element_complete(element_id):
    """Mark an interactive element as completed"""
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')

    element = InteractiveElement.query.filter_by(id=element_id).first()
    if not element:
        return jsonify({"msg": "Interactive element not found"}), 404

    # Check enrollment
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=element.module.course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled in this course"}), 403

    # Get or create completion record
    completion = InteractiveCompletion.query.filter_by(
        student_id=user_id, interactive_element_id=element_id
    ).first()

    if not completion:
        completion = InteractiveCompletion(student_id=user_id, interactive_element_id=element_id)
        db.session.add(completion)

    completion.completed = True
    completion.completed_at = db.func.now()
    db.session.commit()

    # Update module progress if all elements are completed
    all_elements = InteractiveElement.query.filter_by(module_id=element.module_id).all()
    completed_elements = InteractiveCompletion.query.filter_by(student_id=user_id).filter(
        InteractiveCompletion.interactive_element_id.in_([e.id for e in all_elements])
    ).filter_by(completed=True).count()

    if completed_elements == len(all_elements):
        module_progress = ModuleProgress.query.filter_by(
            student_id=user_id, module_id=element.module_id
        ).first()
        if module_progress:
            module_progress.interactive_completed = True
            db.session.commit()

    return jsonify({
        "msg": "Interactive element marked as completed",
        "completed_at": completion.completed_at.isoformat()
    })