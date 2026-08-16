from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Skill

user_bp = Blueprint("user", __name__)


@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    updatable = ["github_username", "avatar_url", "role", "experience_level", "bio"]
    for field in updatable:
        if field in data:
            setattr(user, field, data[field])

    # Update skills
    if "skills" in data:
        skill_names = data["skills"]  # list of skill name strings
        new_skills = []
        for name in skill_names:
            skill = Skill.query.filter_by(name=name).first()
            if not skill:
                skill = Skill(name=name)
                db.session.add(skill)
            new_skills.append(skill)
        user.skills = new_skills

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200


@user_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    from app.models import TeamMembership, PullRequestTracking, Team
    memberships = TeamMembership.query.filter_by(user_id=user_id).all()
    team_ids = [m.team_id for m in memberships]

    merged_prs = 0
    open_prs = 0
    for tid in team_ids:
        prs = PullRequestTracking.query.filter_by(team_id=tid).all()
        for pr in prs:
            if pr.status == "Merged":
                merged_prs += 1
            elif pr.status == "Open":
                open_prs += 1

    return jsonify({
        "total_teams": len(team_ids),
        "merged_prs": merged_prs,
        "open_prs": open_prs,
        "skills_count": user.skills.count(),
    }), 200
