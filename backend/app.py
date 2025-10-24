from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt
from config import Config
from datetime import datetime

def create_app():
    app = Flask(__name__)  
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.teacher import teacher_bp
    from routes.student import student_bp
    from routes.payment import payment_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(teacher_bp, url_prefix='/api/teacher')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')

    @app.route('/')
    def home():
        return jsonify({
            'message': 'Welcome to SkillHub API',
            'version': '1.0.0',
            'status': 'running',
            'api_endpoints': {
                'auth': '/api/auth/',
                'admin': '/api/admin/',
                'teacher': '/api/teacher/',
                'student': '/api/student/',
                'payment': '/api/payment/'
            },
            'documentation': {
                'register': 'POST /api/auth/register',
                'login': 'POST /api/auth/login',
                'admin_dashboard': 'GET /api/admin/dashboard',
                'teacher_courses': 'GET /api/teacher/courses',
                'student_profile': 'GET /api/student/profile'
            }
        })

    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        })

    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)
