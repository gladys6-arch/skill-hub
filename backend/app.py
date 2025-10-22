from flask import Flask

from config import Config
from extensions import db, migrate, jwt, cors
from routes import register_blueprints  
from models import *  
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    register_blueprints(app)

    return app

app = create_app()


from extensions import db, jwt
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
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
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all
    app.run(debug=True)
