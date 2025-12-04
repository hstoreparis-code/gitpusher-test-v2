import re
import json


def analyze_logs(text: str):
    score = 100
    issues = []

    if "rate limit" in text.lower():
        score -= 10
        issues.append("Rate limit triggered")

    if "error" in text.lower():
        score -= 20
        issues.append("General error detected")

    if "exception" in text.lower():
        score -= 20
        issues.append("Python exception detected")

    if "404" in text.lower():
        score -= 15
        issues.append("Missing route")

    if "assert" in text.lower():
        score -= 10
        issues.append("Failed assertion")

    if score < 0:
        score = 0

    verdict = "OK"
    if score < 90:
        verdict = "MINOR ISSUES"
    if score < 70:
        verdict = "WARNING"
    if score < 40:
        verdict = "CRITICAL"

    return {
        "ai_score": score,
        "verdict": verdict,
        "issues": issues,
    }
