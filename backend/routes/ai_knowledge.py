from fastapi import APIRouter
from fastapi.responses import FileResponse
import os
from pathlib import Path

router = APIRouter()


@router.get("/ai/knowledge/{file_name}")
async def serve_ai_knowledge(file_name: str):
    base = Path(__file__).resolve().parents[2] / "frontend" / "public" / "ai" / "knowledge"
    path = base / file_name
    return FileResponse(str(path))
