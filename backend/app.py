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

if __name__ == "__main__":
    app.run(debug=True)