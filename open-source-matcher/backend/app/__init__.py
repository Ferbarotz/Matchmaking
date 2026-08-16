from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
import os

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
bcrypt = Bcrypt()


def create_app(config_name=None):
    app = Flask(__name__)

    # Load config
    from app.config import config
    env = config_name or os.environ.get("FLASK_ENV", "development")
    app.config.from_object(config.get(env, config["default"]))

    # Init extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    origins = app.config["CORS_ORIGINS"].split(",")
    CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.github_routes import github_bp
    from app.routes.team_routes import team_bp
    from app.routes.user_routes import user_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(github_bp, url_prefix="/api")
    app.register_blueprint(team_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api/user")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "OpenSource Junior Matcher API running"}

    return app
