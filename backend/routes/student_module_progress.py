# Add this to student_routes.py for module progress tracking

@student_bp.route('/course-progress/<int:course_id>', methods=['GET'])
@jwt_required()
@role_required('student')
def get_course_progress(course_id):
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404
    
    total_modules = Module.query.filter_by(course_id=course_id).count()
    current_module = max(1, int(enrollment.progress / 100 * total_modules)) if total_modules > 0 else 1
    
    return jsonify({
        "course_id": course_id,
        "current_module": current_module,
        "total_modules": total_modules,
        "progress_text": f"{current_module}/{total_modules}",
        "overall_progress": enrollment.progress,
        "completed": enrollment.completed
    })

@student_bp.route('/courses/<int:course_id>/modules', methods=['GET'])
@jwt_required()
@role_required('student')
def get_course_modules_student(course_id):
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get('id')
    
    # Check if enrolled
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"msg": "Not enrolled"}), 404
    
    modules = Module.query.filter_by(course_id=course_id).all()
    total_modules = len(modules)
    current_module = max(1, int(enrollment.progress / 100 * total_modules)) if total_modules > 0 else 1
    
    return jsonify({
        "modules": [{
            'id': m.id,
            'title': m.title,
            'content': m.content,
            'is_current': (i + 1) == current_module,
            'is_completed': (i + 1) < current_module
        } for i, m in enumerate(modules)],
        "progress_text": f"{current_module}/{total_modules}"
    })