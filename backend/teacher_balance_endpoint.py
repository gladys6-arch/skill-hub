# Add this endpoint to teacher_routes.py

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