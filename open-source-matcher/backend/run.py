from dotenv import load_dotenv
load_dotenv()

from app import create_app, db
from app.models import User, Skill, Issue, Team, TeamMembership, PullRequestTracking

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        "db": db,
        "User": User,
        "Skill": Skill,
        "Issue": Issue,
        "Team": Team,
        "TeamMembership": TeamMembership,
        "PullRequestTracking": PullRequestTracking,
    }

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
