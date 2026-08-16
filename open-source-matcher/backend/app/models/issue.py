import json
from ..extensions import db


class Issue(db.Model):
    __tablename__ = "issues"

    id = db.Column(db.Integer, primary_key=True)
    github_issue_id = db.Column(db.Integer, unique=True, nullable=False, index=True)
    repo_name = db.Column(db.String(256), nullable=False)
    repo_url = db.Column(db.String(512), nullable=False)
    issue_title = db.Column(db.String(512), nullable=False)
    issue_url = db.Column(db.String(512), nullable=False)
    language = db.Column(db.String(64), nullable=True)
    _labels = db.Column("labels", db.Text, nullable=True, default="[]")
    difficulty_level = db.Column(db.String(32), nullable=True, default="Beginner")
    status = db.Column(
        db.String(32), nullable=False, default="Open"
    )  # Open, In Team, Solved

    # Relationships
    teams = db.relationship("Team", back_populates="issue", lazy="dynamic")

    @property
    def labels(self):
        return json.loads(self._labels or "[]")

    @labels.setter
    def labels(self, value):
        self._labels = json.dumps(value or [])

    def to_dict(self):
        return {
            "id": self.id,
            "github_issue_id": self.github_issue_id,
            "repo_name": self.repo_name,
            "repo_url": self.repo_url,
            "issue_title": self.issue_title,
            "issue_url": self.issue_url,
            "language": self.language,
            "labels": self.labels,
            "difficulty_level": self.difficulty_level,
            "status": self.status,
            "teams_count": self.teams.count(),
        }
