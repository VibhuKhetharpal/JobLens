"""
core/guides.py
AI-generated learning guides via Gemini, with local JSON caching.
Ported from SkillGapRec — cache stored in server/python/data/guide_cache.json
"""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

os.environ["GRPC_VERBOSITY"] = "ERROR"
os.environ["GRPC_LOG_SEVERITY_THRESHOLD"] = "ERROR"

load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

CACHE_PATH = os.path.join(os.path.dirname(__file__), "../data/guide_cache.json")

# Static fallback guides used when Gemini is unavailable
learning_guides = {
    "Python": "Advance your Python by building small automation or data projects.",
    "JavaScript": "Learn JS fundamentals from MDN and build DOM projects.",
    "React": "Start with React official docs and build a To-Do app.",
    "TypeScript": "Read the TypeScript handbook and refactor a JS script.",
    "SQL": "Practice SELECT, JOIN, and subqueries on LeetCode or W3Schools.",
    "Tableau": "Take Tableau beginner tutorials on YouTube.",
    "Statistics": "Learn core concepts from Khan Academy.",
    "Machine Learning": "Follow a beginner ML playlist or course.",
    "Docker": "Do Docker's official Get-Started tutorial.",
    "AWS": "Try AWS Cloud Practitioner free course.",
    "Django": "Follow Django's official tutorial and deploy a mini app.",
    "HTML": "Learn HTML5 structure and semantics from W3Schools.",
    "CSS": "Practice Flexbox and Grid with freeCodeCamp.",
    "Excel": "Master formulas and pivot tables with Microsoft Learn.",
    "Git": "Learn basic Git commands using GitHub Guides.",
    "PostgreSQL": "Install PostgreSQL and practice with sample databases.",
    "Node.js": "Build a REST API using Express.js and Node.js.",
    "MongoDB": "Learn NoSQL concepts and practice with MongoDB Atlas.",
    "Kubernetes": "Learn container orchestration with Kubernetes basics.",
    "CI/CD": "Set up GitHub Actions or Jenkins pipeline.",
    "Linux": "Practice Linux commands and system administration.",
    "Monitoring": "Learn tools like Prometheus and Grafana for system monitoring.",
    "Java": "Practice Java fundamentals and OOP patterns on HackerRank.",
    "Spring Boot": "Follow the official Spring Boot guides and build a REST API.",
    "Kafka": "Start with Confluent's Kafka quickstart tutorial.",
    "Redis": "Learn Redis data structures from redis.io/learn.",
    "GraphQL": "Build a GraphQL API with Apollo Server docs.",
    "Flutter": "Follow flutter.dev's first app tutorial.",
    "Dart": "Learn Dart fundamentals from dart.dev.",
    "Go": "Work through A Tour of Go at go.dev/tour.",
    "Rust": "Read The Rust Programming Language book at doc.rust-lang.org.",
}


def get_guide(skill):
    return learning_guides.get(skill, f"Learn {skill} from its official docs and build a small project using it.")


def _load_cache():
    if not os.path.exists(CACHE_PATH):
        return {}
    try:
        with open(CACHE_PATH, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}


def _save_cache(cache):
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, "w") as f:
        json.dump(cache, f, indent=2)


def _cache_key(skill, job_title=""):
    return f"{skill.lower()}||{job_title.lower().strip()}"


def generate_role_based_guide(job_title, matched_skills, missing_skills):
    if not missing_skills:
        return ["No missing skills — you already meet all requirements for this role!"]

    cache = _load_cache()
    cached_results = {}
    skills_to_generate = []

    for skill in missing_skills:
        key = _cache_key(skill, job_title)
        if key in cache:
            print(f"[Cache] Hit: {skill} ({job_title})")
            cached_results[skill] = cache[key]
        else:
            skills_to_generate.append(skill)

    if not skills_to_generate:
        return [cached_results[skill] for skill in missing_skills]

    if not os.getenv("GEMINI_API_KEY"):
        for skill in skills_to_generate:
            guide = get_guide(skill)
            cached_results[skill] = guide
            cache[_cache_key(skill, job_title)] = guide
        _save_cache(cache)
        return [cached_results[skill] for skill in missing_skills]

    prompt = f"""
You are an AI career mentor helping an Indian tech professional.
The candidate wants to work as a {job_title}.
They already know: {', '.join(matched_skills) if matched_skills else 'general programming basics'}.
They need to learn: {', '.join(skills_to_generate)}.

For each missing skill give 2-3 short actionable steps with specific free resources.
Format your response exactly like this:

SKILL: <skill name>
<guide text>

SKILL: <skill name>
<guide text>

No other text outside this format.
"""

    try:
        model = genai.GenerativeModel(model_name="models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = (response.text or "").strip()

        if not text:
            raise ValueError("Empty response from Gemini")

        blocks = text.split("SKILL:")
        parsed = {}
        for block in blocks:
            block = block.strip()
            if not block:
                continue
            lines = block.splitlines()
            skill_name = lines[0].strip()
            guide_text = "\n".join(lines[1:]).strip()
            if skill_name and guide_text:
                parsed[skill_name.lower()] = guide_text

        for skill in skills_to_generate:
            guide = parsed.get(skill.lower(), get_guide(skill))
            cached_results[skill] = guide
            cache[_cache_key(skill, job_title)] = guide

        _save_cache(cache)
        print(f"[Cache] Saved {len(skills_to_generate)} new guides")

    except Exception as e:
        print(f"[Gemini API error] {e}")
        for skill in skills_to_generate:
            guide = get_guide(skill)
            cached_results[skill] = guide
            cache[_cache_key(skill, job_title)] = guide
        _save_cache(cache)

    return [cached_results[skill] for skill in missing_skills]
