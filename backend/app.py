from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt, migrate
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=["http://localhost:5173"], supports_credentials=True, allow_headers=['Content-Type', 'Authorization'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], expose_headers=['Authorization'])
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    from routes.auth_routes import auth_bp
    from routes.admin_routes import admin_bp
    from routes.teacher_routes import teacher_bp
    from routes.student_routes import student_bp
    from routes.student_module_progress import student_progress_bp
    from routes.payment_routes import payment_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(teacher_bp, url_prefix='/api/teacher')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(student_progress_bp, url_prefix='/api/student', name='student_progress')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')

    @app.route('/')
    def home():
        return jsonify({"message": "SkillSwap API is running", "status": "OK"})

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)

