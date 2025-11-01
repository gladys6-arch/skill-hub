from flask import Blueprint
from .admin_routes import admin_bp
from .auth_routes import auth_bp
from .student_routes import student_bp
from .teacher_routes import teacher_bp
from .teacher_routes_extended import teacher_ext_bp
from .course_routes import course_bp
from .payment_routes import payment_bp
from .student_module_progress import progress_bp

def register_routes(app):
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(student_bp, url_prefix="/student")
    app.register_blueprint(teacher_bp, url_prefix="/teacher")
    app.register_blueprint(teacher_ext_bp, url_prefix="/teacher/extra")
    app.register_blueprint(course_bp, url_prefix="/courses")
    app.register_blueprint(payment_bp, url_prefix="/payments")
    app.register_blueprint(progress_bp, url_prefix="/progress")
