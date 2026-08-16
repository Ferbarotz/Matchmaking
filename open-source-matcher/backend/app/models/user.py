from app import db
from datetime import datetime

# Association table for User <-> Skill (many-to-many)
user_skills = db.Table(
    "user_skills",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column("skill_id", db.Integer, db.ForeignKey("skills.id"), primary_key=True),
)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    github_username = db.Column(db.String(100), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    role = db.Column(db.String(50), nullable=True)  # Frontend / Backend / Fullstack
    experience_level = db.Column(db.String(50), nullable=True)  # junior / mid / student
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    skills = db.relationship("Skill", secondary=user_skills, backref="users", lazy="dynamic")
    memberships = db.relationship("TeamMembership", backref="user", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "github_username": self.github_username,
            "avatar_url": self.avatar_url,
            "role": self.role,
            "experience_level": self.experience_level,
            "bio": self.bio,
            "skills": [s.to_dict() for s in self.skills],
            "created_at": self.created_at.isoformat(),
        }


class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name}
