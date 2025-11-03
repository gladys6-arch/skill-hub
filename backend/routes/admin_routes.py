from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from utils.decorators import role_required
from models import User
from models.payment import Payment
from models.course import Course, Skill, Enrollment, SkillEnrollment, Module, ModuleProgress

admin_bp = Blueprint('admin_bp', __name__)

# Dashboard
@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('admin')
def dashboard():
    total_teachers = User.query.filter_by(role='teacher').count()
    total_students = User.query.filter_by(role='student').count()
    
    # Calculate total revenue and admin earnings (30%)
    total_revenue = db.session.query(db.func.sum(Payment.amount)).scalar() or 0
    admin_earnings = db.session.query(db.func.sum(Payment.admin_share)).scalar() or 0
    
    return jsonify({
        'total_teachers': total_teachers,
        'total_students': total_students,
        'total_revenue': total_revenue,
        'admin_earnings': admin_earnings
    })

# Teacher Management
@admin_bp.route('/teachers', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_teachers():
    teachers = User.query.filter_by(role='teacher').all()
    return jsonify([{
        'id': t.id,
        'full_name': t.full_name,
        'email': t.email
    } for t in teachers])

@admin_bp.route('/register-teacher', methods=['POST'])
@jwt_required()
@role_required('admin')
def register_teacher():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    teacher = User(
        full_name=data['full_name'],
        email=data['email'],
        role='teacher'
    )
    teacher.set_password(data['password'])
    
    db.session.add(teacher)
    db.session.commit()
    return jsonify({'message': 'Teacher registered successfully'}), 201

@admin_bp.route('/teachers/<int:teacher_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_teacher(teacher_id):
    teacher = User.query.filter_by(id=teacher_id, role='teacher').first_or_404()
    data = request.get_json()
    
    teacher.full_name = data.get('full_name', teacher.full_name)
    teacher.email = data.get('email', teacher.email)
    
    db.session.commit()
    return jsonify({'message': 'Teacher updated successfully'})

@admin_bp.route('/teachers/<int:teacher_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_teacher(teacher_id):
    teacher = User.query.filter_by(id=teacher_id, role='teacher').first_or_404()
    db.session.delete(teacher)
    db.session.commit()
    return jsonify({'message': 'Teacher deleted successfully'})

# Student Management
@admin_bp.route('/students', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_students():
    students = User.query.filter_by(role='student').all()
    return jsonify([{
        'id': s.id,
        'full_name': s.full_name,
        'email': s.email
    } for s in students])

@admin_bp.route('/students/<int:student_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_student(student_id):
    student = User.query.filter_by(id=student_id, role='student').first_or_404()
    data = request.get_json()
    
    student.full_name = data.get('full_name', student.full_name)
    student.email = data.get('email', student.email)
    
    db.session.commit()
    return jsonify({'message': 'Student updated successfully'})

@admin_bp.route('/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_student(student_id):
    student = User.query.filter_by(id=student_id, role='student').first_or_404()
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted successfully'})

# Get detailed teacher info
@admin_bp.route('/teachers/<int:teacher_id>/details', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_teacher_details(teacher_id):
    teacher = User.query.filter_by(id=teacher_id, role='teacher').first_or_404()
    courses = Course.query.filter_by(teacher_id=teacher_id).all()
    skills = Skill.query.filter_by(teacher_id=teacher_id).all()
    
    # Calculate teacher earnings
    course_ids = [c.id for c in courses]
    skill_ids = [s.id for s in skills]
    teacher_payments = Payment.query.filter(
        (Payment.course_id.in_(course_ids)) |
        (Payment.skill_id.in_(skill_ids))
    ).all() if course_ids or skill_ids else []
    total_earnings = sum(p.teacher_share for p in teacher_payments)
    
    # Course details with enrollment stats
    course_details = []
    for course in courses:
        enrollments = Enrollment.query.filter_by(course_id=course.id).all()
        course_details.append({
            'id': course.id,
            'title': course.title,
            'price': course.price,
            'enrolled_students': len(enrollments),
            'completed_students': len([e for e in enrollments if e.completed])
        })
    
    # Skill details with enrollment stats
    skill_details = []
    for skill in skills:
        skill_enrollments = SkillEnrollment.query.filter_by(skill_id=skill.id).all()
        skill_details.append({
            'id': skill.id,
            'name': skill.name,
            'price': skill.price,
            'enrolled_students': len(skill_enrollments),
            'completed_students': len([e for e in skill_enrollments if e.completed])
        })
    
    return jsonify({
        'id': teacher.id,
        'full_name': teacher.full_name,
        'email': teacher.email,
        'total_earnings': total_earnings,
        'courses': course_details,
        'skills': skill_details
    })

# Get detailed student info
@admin_bp.route('/students/<int:student_id>/details', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_student_details(student_id):
    student = User.query.filter_by(id=student_id, role='student').first_or_404()
    
    # Course progress
    course_enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    course_progress = []
    for enrollment in course_enrollments:
        course = Course.query.get(enrollment.course_id)
        course_progress.append({
            'course_id': enrollment.course_id,
            'course_title': course.title if course else 'Unknown',
            'progress': enrollment.progress,
            'completed': enrollment.completed,
            'date_enrolled': enrollment.date_enrolled.strftime('%Y-%m-%d') if enrollment.date_enrolled else None
        })
    
    # Skill progress
    skill_enrollments = SkillEnrollment.query.filter_by(student_id=student_id).all()
    skill_progress = []
    for enrollment in skill_enrollments:
        skill = Skill.query.get(enrollment.skill_id)
        skill_progress.append({
            'skill_id': enrollment.skill_id,
            'skill_name': skill.name if skill else 'Unknown',
            'progress': enrollment.progress,
            'completed': enrollment.completed,
            'date_enrolled': enrollment.date_enrolled.strftime('%Y-%m-%d') if enrollment.date_enrolled else None
        })
    
    # Payment history
    payments = Payment.query.filter_by(student_id=student_id).all()
    payment_history = []
    for payment in payments:
        item_name = 'Unknown'
        if payment.course_id:
            course = Course.query.get(payment.course_id)
            item_name = course.title if course else 'Unknown Course'
        elif payment.skill_id:
            skill = Skill.query.get(payment.skill_id)
            item_name = skill.name if skill else 'Unknown Skill'
        
        payment_history.append({
            'amount': payment.amount,
            'payment_type': payment.payment_type,
            'item_name': item_name,
            'status': payment.status
        })
    
    completed_courses = [cp for cp in course_progress if cp['completed']]
    completed_skills = [sp for sp in skill_progress if sp['completed']]
    
    return jsonify({
        'id': student.id,
        'full_name': student.full_name,
        'email': student.email,
        'course_progress': course_progress,
        'skill_progress': skill_progress,
        'completed_courses': completed_courses,
        'completed_skills': completed_skills,
        'payment_history': payment_history,
        'total_spent': sum(p.amount for p in payments),
        'total_courses': len(course_enrollments),
        'total_skills': len(skill_enrollments),
        'completed_courses_count': len(completed_courses),
        'completed_skills_count': len(completed_skills)
    })

# All Users (combined endpoint)
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_users():
    users = User.query.filter(User.role.in_(['teacher', 'student'])).all()
    return jsonify([{
        'id': u.id,
        'full_name': u.full_name,
        'email': u.email,
        'role': u.role
    } for u in users])

# Delete any user (combined endpoint)
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        return jsonify({'message': 'Cannot delete admin user'}), 400
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'})

# Revenue (30% from skills/courses)
@admin_bp.route('/revenue', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_revenue():
    # Get all payments
    payments = Payment.query.all()
    total_revenue = sum(payment.admin_share for payment in payments)

    # Get teacher revenue breakdown
    teachers = User.query.filter_by(role='teacher').all()
    teacher_revenues = []

    for teacher in teachers:
        # Get teacher's courses and skills
        courses = Course.query.filter_by(teacher_id=teacher.id).all()
        skills = Skill.query.filter_by(teacher_id=teacher.id).all()

        course_ids = [c.id for c in courses]
        skill_ids = [s.id for s in skills]

        # Calculate teacher's total revenue
        teacher_revenue = 0
        if course_ids:
            course_payments = Payment.query.filter(Payment.course_id.in_(course_ids)).all()
            teacher_revenue += sum(p.teacher_share for p in course_payments)
        if skill_ids:
            skill_payments = Payment.query.filter(Payment.skill_id.in_(skill_ids)).all()
            teacher_revenue += sum(p.teacher_share for p in skill_payments)

        if teacher_revenue > 0 or courses or skills:
            teacher_revenues.append({
                'id': teacher.id,
                'full_name': teacher.full_name,
                'email': teacher.email,
                'total_revenue': teacher_revenue,
                'courses_count': len(courses),
                'skills_count': len(skills)
            })

    return jsonify({
        'total_revenue': total_revenue,
        'total_teachers': len(teachers),
        'total_payments': len(payments),
        'teacher_revenues': teacher_revenues
    })

# Student Progress Tracking (similar to teacher functionality)
@admin_bp.route('/student-progress', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_student_progress():
    # Get all students with their progress
    students = User.query.filter_by(role='student').all()
    student_progress_list = []

    for student in students:
        # Course progress
        course_enrollments = Enrollment.query.filter_by(student_id=student.id).all()
        course_progress = []
        for enrollment in course_enrollments:
            course = Course.query.get(enrollment.course_id)
            if course:
                # Calculate progress based on ModuleProgress
                total_modules = Module.query.filter_by(course_id=course.id).count()
                completed_modules = ModuleProgress.query.filter_by(
                    student_id=student.id,
                    completed=True
                ).join(Module).filter(Module.course_id == course.id).count()

                progress_percentage = int((completed_modules / total_modules) * 100) if total_modules > 0 else 0
                completed = progress_percentage >= 100

                course_progress.append({
                    'course_id': course.id,
                    'course_title': course.title,
                    'progress': progress_percentage,
                    'completed': completed,
                    'modules_completed': completed_modules,
                    'total_modules': total_modules,
                    'date_enrolled': enrollment.date_enrolled.strftime('%Y-%m-%d') if enrollment.date_enrolled else None
                })

        # Skill progress
        skill_enrollments = SkillEnrollment.query.filter_by(student_id=student.id).all()
        skill_progress = []
        for enrollment in skill_enrollments:
            skill = Skill.query.get(enrollment.skill_id)
            if skill:
                skill_progress.append({
                    'skill_id': skill.id,
                    'skill_name': skill.name,
                    'progress': enrollment.progress,
                    'completed': enrollment.completed,
                    'date_enrolled': enrollment.date_enrolled.strftime('%Y-%m-%d') if enrollment.date_enrolled else None
                })

        if course_progress or skill_progress:  # Only include students with enrollments
            student_progress_list.append({
                'student_id': student.id,
                'student_name': student.full_name,
                'student_email': student.email,
                'course_progress': course_progress,
                'skill_progress': skill_progress,
                'total_courses': len(course_progress),
                'total_skills': len(skill_progress),
                'completed_courses': len([cp for cp in course_progress if cp['completed']]),
                'completed_skills': len([sp for sp in skill_progress if sp['completed']])
            })

    return jsonify({
        'total_students': len(students),
        'students_with_progress': len(student_progress_list),
        'student_progress': student_progress_list
    })

# Get specific student's detailed progress
@admin_bp.route('/students/<int:student_id>/progress', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_student_progress_detail(student_id):
    student = User.query.filter_by(id=student_id, role='student').first_or_404()

    # Course progress with detailed module information
    course_enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    course_progress = []
    for enrollment in course_enrollments:
        course = Course.query.get(enrollment.course_id)
        if course:
            # Get module details
            modules = Module.query.filter_by(course_id=course.id).all()
            module_details = []
            for module in modules:
                progress = ModuleProgress.query.filter_by(
                    student_id=student_id,
                    module_id=module.id
                ).first()

                module_details.append({
                    'module_id': module.id,
                    'module_title': module.title,
                    'completed': progress.completed if progress else False,
                    'completed_at': progress.completed_at.strftime('%Y-%m-%d %H:%M') if progress and progress.completed_at else None
                })

            total_modules = len(modules)
            completed_modules = len([m for m in module_details if m['completed']])
            progress_percentage = int((completed_modules / total_modules) * 100) if total_modules > 0 else 0

            course_progress.append({
                'course_id': course.id,
                'course_title': course.title,
                'teacher_name': course.teacher.full_name if course.teacher else 'Unknown',
                'progress_percentage': progress_percentage,
                'completed': progress_percentage >= 100,
                'modules': module_details,
                'modules_completed': completed_modules,
                'total_modules': total_modules,
                'date_enrolled': enrollment.date_enrolled.strftime('%Y-%m-%d') if enrollment.date_enrolled else None
            })

    # Skill progress
    skill_enrollments = SkillEnrollment.query.filter_by(student_id=student_id).all()
    skill_progress = []
    for enrollment in skill_enrollments:
        skill = Skill.query.get(enrollment.skill_id)
        if skill:
            skill_progress.append({
                'skill_id': skill.id,
                'skill_name': skill.name,
                'teacher_name': skill.teacher.full_name if skill.teacher else 'Unknown',
                'progress': enrollment.progress,
                'completed': enrollment.completed,
                'date_enrolled': enrollment.date_enrolled.strftime('%Y-%m-%d') if enrollment.date_enrolled else None
            })

    return jsonify({
        'student': {
            'id': student.id,
            'name': student.full_name,
            'email': student.email
        },
        'course_progress': course_progress,
        'skill_progress': skill_progress,
        'summary': {
            'total_courses': len(course_progress),
            'completed_courses': len([cp for cp in course_progress if cp['completed']]),
            'total_skills': len(skill_progress),
            'completed_skills': len([sp for sp in skill_progress if sp['completed']]),
            'overall_completion_rate': calculate_overall_completion_rate(course_progress, skill_progress)
        }
    })

def calculate_overall_completion_rate(course_progress, skill_progress):
    """Calculate overall completion rate across all enrollments"""
    total_items = len(course_progress) + len(skill_progress)
    if total_items == 0:
        return 0

    completed_items = (
        len([cp for cp in course_progress if cp['completed']]) +
        len([sp for sp in skill_progress if sp['completed']])
    )

    return int((completed_items / total_items) * 100)