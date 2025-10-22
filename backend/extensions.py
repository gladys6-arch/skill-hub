from flask_sqlalchemy import SQLAlchemy
<<<<<<< HEAD
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
=======
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()
>>>>>>> origin/gladys/models
