from extensions import db
from models import ModuleCompletion, Enrollment, Module

def complete_module(student_id, module_id):
    """
    Marks a module as completed by a student and updates the student's course progress.
    Prevents double-counting of modules.
    """

    # Check if module already completed
    completion = ModuleCompletion.query.filter_by(student_id=student_id, module_id=module_id).first()
    if completion and completion.completed:
        return {"message": "Module already completed."}, 400

    # Mark the module as completed
    if not completion:
        completion = ModuleCompletion(student_id=student_id, module_id=module_id, completed=True)
        db.session.add(completion)
    else:
        completion.completed = True

    # Find course related to this module
    module = Module.query.get(module_id)
    if not module:
        return {"message": "Module not found"}, 404

    course_id = module.course_id
    if not course_id:
        return {"message": "Module not linked to any course"}, 400

    # Calculate new progress percentage
    total_modules = Module.query.filter_by(course_id=course_id).count()
    completed_modules = (
        ModuleCompletion.query
        .join(Module)
        .filter(Module.course_id == course_id, ModuleCompletion.student_id == student_id, ModuleCompletion.completed == True)
        .count()
    )

    progress_percentage = (completed_modules / total_modules) * 100 if total_modules > 0 else 0

    # Update student's enrollment progress
    enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if enrollment:
        enrollment.progress = progress_percentage
        enrollment.completed = progress_percentage == 100
        db.session.commit()

        # If student completed the course — generate certificate
        if enrollment.completed:
            from utils.certificate_generator import generate_certificate
            file_path = generate_certificate(student_id, course_id)
            return {
                "message": "Course completed! Certificate generated successfully.",
                "progress": progress_percentage,
                "certificate_path": file_path
            }, 200


    db.session.commit()

    return {
        "message": "Module completed successfully.",
        "progress": progress_percentage,
        "completed_modules": completed_modules,
        "total_modules": total_modules
    }, 200
