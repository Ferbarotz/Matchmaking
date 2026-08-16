from app import db
from datetime import datetime
import json


class Issue(db.Model):
    __tablename__ = "issues"

    id = db.Column(db.Integer, primary_key=True)
    github_issue_id = db.Column(db.Integer, unique=True, nullable=False)
    repo_name = db.Column(db.String(200), nullable=False)
    repo_url = db.Column(db.String(500), nullable=False)
    issue_title = db.Column(db.String(500), nullable=False)
    issue_url = db.Column(db.String(500), nullable=False)
    language = db.Column(db.String(100), nullable=True)
    labels = db.Column(db.Text, nullable=True)  # stored as JSON string
    difficulty_level = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), default="Open")  # Open, In Team, Solved
    body = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    teams = db.relationship("Team", backref="issue", lazy="dynamic")

    def get_labels(self):
        try:
            return json.loads(self.labels) if self.labels else []
        except Exception:
            return []

    def to_dict(self):
        return {
            "id": self.id,
            "github_issue_id": self.github_issue_id,
            "repo_name": self.repo_name,
            "repo_url": self.repo_url,
            "issue_title": self.issue_title,
            "issue_url": self.issue_url,
            "language": self.language,
            "labels": self.get_labels(),
            "difficulty_level": self.difficulty_level,
            "status": self.status,
            "body": self.body,
            "created_at": self.created_at.isoformat(),
        }


class Team(db.Model):
    __tablename__ = "teams"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    issue_id = db.Column(db.Integer, db.ForeignKey("issues.id"), nullable=False)
    status = db.Column(db.String(50), default="Forming")  # Forming, In Progress, PR Submitted, Merged
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    memberships = db.relationship("TeamMembership", backref="team", lazy="dynamic", cascade="all, delete-orphan")
    pr_trackings = db.relationship("PullRequestTracking", backref="team", lazy="dynamic", cascade="all, delete-orphan")

    def member_count(self):
        return self.memberships.count()

    def to_dict(self, include_members=False):
        data = {
            "id": self.id,
            "name": self.name,
            "issue_id": self.issue_id,
            "issue": self.issue.to_dict() if self.issue else None,
            "status": self.status,
            "member_count": self.member_count(),
            "created_at": self.created_at.isoformat(),
        }
        if include_members:
            data["members"] = [m.to_dict() for m in self.memberships]
            data["pull_requests"] = [pr.to_dict() for pr in self.pr_trackings]
        return data


class TeamMembership(db.Model):
    __tablename__ = "team_memberships"

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    role_in_team = db.Column(db.String(100), nullable=True)

    __table_args__ = (db.UniqueConstraint("team_id", "user_id", name="unique_team_member"),)

    def to_dict(self):
        return {
            "id": self.id,
            "team_id": self.team_id,
            "user_id": self.user_id,
            "user": self.user.to_dict() if self.user else None,
            "joined_at": self.joined_at.isoformat(),
            "role_in_team": self.role_in_team,
        }


class PullRequestTracking(db.Model):
    __tablename__ = "pull_request_trackings"

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    pr_url = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(50), default="Open")  # Open, Closed, Merged
    merged_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "team_id": self.team_id,
            "pr_url": self.pr_url,
            "status": self.status,
            "merged_at": self.merged_at.isoformat() if self.merged_at else None,
            "created_at": self.created_at.isoformat(),
        }
