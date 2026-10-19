"""
core/recommender.py
Adapted from SkillGapRec — accepts live job listings from Express (MongoDB)
instead of reading from a static JSON file.
"""

import os
import json
from typing import List, Dict
from core.guides import generate_role_based_guide
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_with_live_jobs(resume_text: str, job_listings: List[Dict]) -> List[Dict]:
    """
    Compare resume text against live job listings fetched from MongoDB by Express.

    job_listings format (from MongoDB aggregate):
    [{ "title": str, "company": str, "city": str, "tags": [str], "applyUrl": str, "salaryLpa": str }]

    Returns list of dicts sorted by match_percent descending:
    [{ "title", "company", "city", "salaryLpa", "applyUrl", "match_percent", "matched", "missing" }]
    """
    if not resume_text.strip() or not job_listings:
        return []

    # Try AI-powered semantic comparison first
    ai_results = _ai_compare(resume_text, job_listings)
    if ai_results:
        print("[Recommender] Using Gemini AI semantic comparison")
        best = ai_results[0].get("match_percent", 0) if ai_results else 0
        if best <= 10:
            return [{
                "title": "No Suitable Match",
                "company": "",
                "city": "",
                "salaryLpa": "",
                "applyUrl": "",
                "match_percent": 0,
                "matched": [],
                "missing": [],
                "message": "No suitable jobs found for your current skills. Try adding more relevant experience."
            }]
        return ai_results

    # Fallback to keyword matching
    print("[Recommender] Falling back to keyword matching")
    return _keyword_compare(resume_text, job_listings)


def _ai_compare(resume_text: str, job_listings: List[Dict]) -> List[Dict]:
    """Send resume + live job listings to Gemini for semantic matching."""
    try:
        if not os.getenv("GEMINI_API_KEY"):
            return []

        # Build clean job summary with description and filtered technical skills
        job_summary = []
        for j in job_listings:
            skills = [
                t for t in j.get("tags", [])
                if t.lower() not in ["software engineering", "it jobs", "information technology"]
            ]
            desc = (j.get("description", "") or "").strip()
            job_summary.append({
                "title": j.get("title", ""),
                "company": j.get("company", ""),
                "city": j.get("city", ""),
                "description": desc[:300],
                "skills": skills
            })

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        prompt = f"""
You are an expert technical recruiter evaluating an applicant's resume against live Indian tech job openings.

Applicant Resume:
{resume_text[:4000]}

Job Openings:
{json.dumps(job_summary, indent=2)}

Evaluation Criteria:
1. Candidate Seniority & Background:
   - Identify candidate's actual stage (e.g. college student, graduation year, fresher vs senior).
2. Realistic Scoring:
   - Senior / SDE III / Tech Lead / Manager roles: An undergraduate / fresher does NOT meet seniority requirements. Score realistically (20%-50%), and explicitly include "Senior Industry Experience", "System Architecture", "Team Leadership", etc. in missing_skills.
   - Intern / Entry-Level / Junior Developer roles: If candidate's actual stack (e.g. Python, React, Flask, ML, C++, DSA) aligns well, score 70%-95% (or 100% if they meet every single requirement).
   - Tech Stack Mismatches: If a role requires specialized tech (e.g. DPDK, Java Spring Boot, Go, Kubernetes, Cloud Infra), list them in missing_skills and deduct points.
   - Strict Consistency Rule: Every single point deducted below 100% MUST be reflected in `missing_skills` (e.g., if you deduct points because the role is full-time while candidate is a college student, add "1-2 Years Full-Time Experience" to `missing_skills`).
   - If `missing_skills` is empty, `match_percent` must be 100. If `match_percent` < 100, `missing_skills` must NOT be empty.
   - Use concrete technical skills (e.g. "Python", "React", "C++", "Machine Learning", "DPDK", "Kafka", "Docker") for matched_skills and missing_skills. Do NOT use generic labels like "IT Jobs" or "Software Engineering".

Return a JSON array of evaluations.
Return ONLY valid JSON:
[
  {{
    "title": "exact job title from listing",
    "company": "company name",
    "city": "city",
    "match_percent": <integer 0-100>,
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill3", "skill4"]
  }}
]
"""

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(temperature=0)
        )
        text = (response.text or "").strip()

        if not text:
            raise ValueError("Empty Gemini response")

        # Extract JSON array from response
        start = text.find("[")
        end = text.rfind("]") + 1
        if start == -1 or end <= start:
            raise ValueError("No JSON array in response")

        data = json.loads(text[start:end])

        # Build lookup for extra fields (applyUrl, salaryLpa) by title+company
        extras = {
            (j.get("title", "").lower(), j.get("company", "").lower()): j
            for j in job_listings
        }

        results = []
        for item in data:
            title = item.get("title", "")
            company = item.get("company", "")
            extra = extras.get((title.lower(), company.lower()), {})
            results.append({
                "title": title,
                "company": company,
                "city": item.get("city", extra.get("city", "")),
                "salaryLpa": extra.get("salaryLpa", ""),
                "applyUrl": extra.get("applyUrl", ""),
                "match_percent": round(float(item.get("match_percent", 0)), 1),
                "matched": item.get("matched_skills", []),
                "missing": item.get("missing_skills", []),
            })

        results.sort(key=lambda x: x["match_percent"], reverse=True)
        return results

    except Exception as e:
        print(f"[AI Compare Error] {e}")
        return []


def _keyword_compare(resume_text: str, job_listings: List[Dict]) -> List[Dict]:
    """Keyword intersection fallback when Gemini is unavailable."""
    resume_words = set(w.lower() for w in resume_text.split() if len(w) > 2)

    results = []
    for job in job_listings:
        raw_tags = job.get("tags", [])
        tags = [t for t in raw_tags if t.lower() not in ["software engineering", "it jobs", "information technology"]]
        if not tags:
            # extract words from title
            tags = [w for w in job.get("title", "").split() if len(w) > 2][:4]

        job_skills = set(s.lower() for s in tags)

        matched = sorted([s for s in tags if s.lower() in resume_words])
        missing = sorted([s for s in tags if s.lower() not in resume_words])
        pct = round((len(matched) / len(job_skills) * 100) if job_skills else 0, 1)

        results.append({
            "title": job.get("title", ""),
            "company": job.get("company", ""),
            "city": job.get("city", ""),
            "salaryLpa": job.get("salaryLpa", ""),
            "applyUrl": job.get("applyUrl", ""),
            "match_percent": pct,
            "matched": matched,
            "missing": missing,
        })

    results.sort(key=lambda x: x["match_percent"], reverse=True)
    return results[:15]
