# Add these endpoints to the end of teacher_routes.py

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