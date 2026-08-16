from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Team, TeamMembership, Issue, PullRequestTracking

team_bp = Blueprint("teams", __name__)

MAX_TEAM_SIZE = 3


@team_bp.route("/teams", methods=["POST"])
@jwt_required()
def create_team():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get("issue_id"):
        return jsonify({"error": "issue_id is required"}), 400

    issue = db.session.get(Issue, data["issue_id"])
    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    # Check if user is already in a team for this issue
    existing = (
        db.session.query(TeamMembership)
        .join(Team)
        .filter(Team.issue_id == issue.id, TeamMembership.user_id == user_id)
        .first()
    )
    if existing:
        return jsonify({"error": "You already have a team for this issue"}), 409

    team_name = data.get("name") or f"Team for #{issue.github_issue_id}"
    team = Team(name=team_name, issue_id=issue.id, status="Forming")
    db.session.add(team)
    db.session.flush()

    membership = TeamMembership(
        team_id=team.id,
        user_id=user_id,
        role_in_team=data.get("role_in_team", "Member"),
    )
    db.session.add(membership)

    # Update issue status
    issue.status = "In Team"
    db.session.commit()

    return jsonify({"message": "Team created", "team": team.to_dict(include_members=True)}), 201


@team_bp.route("/teams/<int:team_id>/join", methods=["POST"])
@jwt_required()
def join_team(team_id):
    user_id = int(get_jwt_identity())
    team = db.session.get(Team, team_id)
    if not team:
        return jsonify({"error": "Team not found"}), 404

    if team.member_count() >= MAX_TEAM_SIZE:
        return jsonify({"error": f"Team is full (max {MAX_TEAM_SIZE} members)"}), 409

    # Check already a member
    existing = TeamMembership.query.filter_by(team_id=team_id, user_id=user_id).first()
    if existing:
        return jsonify({"error": "You are already a member of this team"}), 409

    data = request.get_json() or {}
    membership = TeamMembership(
        team_id=team_id,
        user_id=user_id,
        role_in_team=data.get("role_in_team", "Member"),
    )
    db.session.add(membership)

    # Auto-update status if team just got full
    if team.member_count() + 1 >= MAX_TEAM_SIZE:
        team.status = "In Progress"

    db.session.commit()
    return jsonify({"message": "Joined team successfully", "team": team.to_dict(include_members=True)}), 200


@team_bp.route("/teams", methods=["GET"])
def list_teams():
    status = request.args.get("status")
    query = Team.query
    if status:
        query = query.filter_by(status=status)
    teams = query.order_by(Team.created_at.desc()).all()
    return jsonify({"teams": [t.to_dict() for t in teams], "total": len(teams)}), 200


@team_bp.route("/teams/<int:team_id>", methods=["GET"])
def get_team(team_id):
    team = db.session.get(Team, team_id)
    if not team:
        return jsonify({"error": "Team not found"}), 404
    return jsonify(team.to_dict(include_members=True)), 200


@team_bp.route("/teams/<int:team_id>/status", methods=["PATCH"])
@jwt_required()
def update_team_status(team_id):
    user_id = int(get_jwt_identity())
    team = db.session.get(Team, team_id)
    if not team:
        return jsonify({"error": "Team not found"}), 404

    # Only members can update
    membership = TeamMembership.query.filter_by(team_id=team_id, user_id=user_id).first()
    if not membership:
        return jsonify({"error": "You are not a member of this team"}), 403

    data = request.get_json() or {}
    valid_statuses = ["Forming", "In Progress", "PR Submitted", "Merged"]

    if "status" in data:
        if data["status"] not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {valid_statuses}"}), 400
        team.status = data["status"]

        # If merged, also update issue
        if data["status"] == "Merged" and team.issue:
            team.issue.status = "Solved"

    # Register PR URL
    if "pr_url" in data:
        existing_pr = PullRequestTracking.query.filter_by(team_id=team_id, pr_url=data["pr_url"]).first()
        if not existing_pr:
            pr = PullRequestTracking(
                team_id=team_id,
                pr_url=data["pr_url"],
                status=data.get("pr_status", "Open"),
            )
            db.session.add(pr)

    db.session.commit()
    return jsonify({"message": "Team updated", "team": team.to_dict(include_members=True)}), 200


@team_bp.route("/teams/my", methods=["GET"])
@jwt_required()
def my_teams():
    user_id = int(get_jwt_identity())
    memberships = TeamMembership.query.filter_by(user_id=user_id).all()
    teams = [m.team.to_dict(include_members=True) for m in memberships]
    return jsonify({"teams": teams}), 200
