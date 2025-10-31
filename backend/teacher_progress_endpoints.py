# Add these endpoints to teacher_routes.py

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