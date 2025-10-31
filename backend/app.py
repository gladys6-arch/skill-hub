from flask import Flask
from extensions import db, jwt, cors
from config import Config
from flask_migrate import Migrate
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    Migrate(app, db)

    # import blueprints
    from routes.auth_routes import auth_bp
    from routes.admin_routes import admin_bp
    from routes.teacher_routes import teacher_bp
    from routes.teacher_routes_extended import teacher_ext_bp  # if using
    from routes.enrollment_and_progress import enroll_bp
    from routes.payment_routes import payment_bp
    from routes.chat_routes import chat_bp
    from routes.review_routes import review_bp

    # register
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(teacher_ext_bp)
    app.register_blueprint(enroll_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(review_bp)

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)
