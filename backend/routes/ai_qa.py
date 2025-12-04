from fastapi import APIRouter

from ai.qa_analyzer import analyze_logs

router = APIRouter()


@router.get("/api/admin/ai-qa")
def ai_qa():
    try:
        with open("logs/gitpusher.log", "r", encoding="utf-8") as f:
            txt = f.read()
    except Exception:  # noqa: BLE001
        txt = ""

    result = analyze_logs(txt)
    return result
