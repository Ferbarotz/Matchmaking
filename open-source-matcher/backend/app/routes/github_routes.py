from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.github_service import search_issues
from app.models import Issue
from app import db
import json

github_bp = Blueprint("github", __name__)


@github_bp.route("/github/issues", methods=["GET"])
def get_github_issues():
    language = request.args.get("language")
    label = request.args.get("label")
    query = request.args.get("q")
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 20)), 50)

    result = search_issues(language=language, label=label, query=query, page=page, per_page=per_page)
    return jsonify(result), 200


@github_bp.route("/issues/import", methods=["POST"])
@jwt_required()
def import_issue():
    data = request.get_json()
    if not data or not data.get("github_issue_id"):
        return jsonify({"error": "github_issue_id is required"}), 400

    # Check if already imported
    existing = Issue.query.filter_by(github_issue_id=data["github_issue_id"]).first()
    if existing:
        return jsonify({"message": "Issue already imported", "issue": existing.to_dict()}), 200

    issue = Issue(
        github_issue_id=data["github_issue_id"],
        repo_name=data.get("repo_name", ""),
        repo_url=data.get("repo_url", ""),
        issue_title=data.get("issue_title", ""),
        issue_url=data.get("issue_url", ""),
        language=data.get("language"),
        labels=json.dumps(data.get("labels", [])),
        difficulty_level=data.get("difficulty_level", "beginner"),
        body=data.get("body", ""),
        status="Open",
    )
    db.session.add(issue)
    db.session.commit()

    return jsonify({"message": "Issue imported successfully", "issue": issue.to_dict()}), 201


@github_bp.route("/issues", methods=["GET"])
def get_local_issues():
    status = request.args.get("status")
    language = request.args.get("language")

    query = Issue.query
    if status:
        query = query.filter_by(status=status)
    if language:
        query = query.filter(Issue.language.ilike(f"%{language}%"))

    issues = query.order_by(Issue.created_at.desc()).all()
    return jsonify({"issues": [i.to_dict() for i in issues], "total": len(issues)}), 200
