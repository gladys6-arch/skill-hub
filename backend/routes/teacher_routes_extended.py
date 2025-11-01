# Additional teacher endpoints - add these to teacher_routes.py

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