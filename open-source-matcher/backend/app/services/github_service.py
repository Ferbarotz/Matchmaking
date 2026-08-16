import os
import requests
from flask import current_app


GITHUB_API_BASE = "https://api.github.com"

BEGINNER_LABELS = ["good first issue", "help wanted", "beginner friendly", "good-first-issue", "beginner"]


def get_headers():
    token = current_app.config.get("GITHUB_TOKEN", "")
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def search_issues(language=None, label=None, query=None, page=1, per_page=20):
    """
    Search GitHub issues with beginner-friendly labels.
    """
    label_filter = label if label else "good first issue"
    q_parts = [f'label:"{label_filter}"', "state:open", "type:issue"]

    if language:
        q_parts.append(f"language:{language}")
    if query:
        q_parts.append(query)

    q = " ".join(q_parts)

    params = {
        "q": q,
        "sort": "updated",
        "order": "desc",
        "per_page": per_page,
        "page": page,
    }

    try:
        resp = requests.get(
            f"{GITHUB_API_BASE}/search/issues",
            headers=get_headers(),
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "total_count": data.get("total_count", 0),
            "items": [_parse_issue(item) for item in data.get("items", [])],
            "page": page,
            "per_page": per_page,
        }
    except requests.exceptions.RequestException as e:
        return {"error": str(e), "items": [], "total_count": 0}


def _parse_issue(item):
    repo_url = item.get("repository_url", "")
    repo_name = "/".join(repo_url.split("/")[-2:]) if repo_url else ""
    labels = [lbl["name"] for lbl in item.get("labels", [])]

    # Determine difficulty
    difficulty = "beginner"
    label_lower = [l.lower() for l in labels]
    if "intermediate" in label_lower or "help wanted" in label_lower:
        difficulty = "intermediate"

    return {
        "github_issue_id": item.get("number"),
        "repo_name": repo_name,
        "repo_url": repo_url.replace("api.github.com/repos", "github.com"),
        "issue_title": item.get("title", ""),
        "issue_url": item.get("html_url", ""),
        "language": None,  # not in issue search results directly
        "labels": labels,
        "difficulty_level": difficulty,
        "body": (item.get("body") or "")[:500],
        "comments": item.get("comments", 0),
        "created_at": item.get("created_at", ""),
        "updated_at": item.get("updated_at", ""),
    }
