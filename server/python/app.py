"""
server/python/app.py
Flask JSON microservice for SkillGapRec logic, running on port 5001.
Express proxies to this after fetching live jobs from MongoDB.
"""

import sys
import os

# Make core importable from this directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
from flask import Flask, request, jsonify
from core.parser import extract_text_from_bytes
from core.recommender import analyze_with_live_jobs
from core.guides import generate_role_based_guide

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "skillgaprec"})


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Accept multipart/form-data:
      - resume: PDF/image file
      - jobs: JSON string of live job listings from MongoDB

    Returns JSON: { matches: [...] }
    """
    if "resume" not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400

    file = request.files["resume"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    allowed = {".pdf", ".png", ".jpg", ".jpeg"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        return jsonify({"error": f"Unsupported file type: {ext}"}), 400

    # Parse jobs JSON from form field
    jobs_raw = request.form.get("jobs", "[]")
    try:
        job_listings = json.loads(jobs_raw)
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid jobs JSON"}), 400

    if not job_listings:
        return jsonify({"error": "No job listings provided"}), 400

    # Extract resume text from uploaded bytes
    try:
        resume_text = extract_text_from_bytes(file.read(), file.filename)
    except Exception as e:
        return jsonify({"error": f"Could not parse resume: {str(e)}"}), 422

    if not resume_text.strip():
        return jsonify({"error": "Could not extract text from the uploaded file"}), 422

    # Run analysis
    try:
        results = analyze_with_live_jobs(resume_text, job_listings)
    except Exception as e:
        print(f"[Analyze error] {e}")
        return jsonify({"error": "Analysis failed"}), 500

    if not results:
        return jsonify({"error": "No matches found"}), 404

    return jsonify({"matches": results})


@app.route("/roadmap", methods=["POST"])
def roadmap():
    """
    Accept JSON body: { jobTitle, matched, missing }
    Returns JSON: { guides: [{ skill, guide }] }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    job_title = data.get("jobTitle", "")
    matched = data.get("matched", [])
    missing = data.get("missing", [])

    if not missing:
        return jsonify({"guides": []})

    try:
        guide_texts = generate_role_based_guide(job_title, matched, missing)
        guides = [
            {"skill": skill, "guide": guide}
            for skill, guide in zip(missing, guide_texts)
        ]
        return jsonify({"guides": guides})
    except Exception as e:
        print(f"[Roadmap error] {e}")
        return jsonify({"error": "Guide generation failed"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", os.environ.get("FLASK_PORT", 5001)))
    print(f"[SkillGapRec] Flask microservice starting on port {port}")
    app.run(debug=False, host="0.0.0.0", port=port)
