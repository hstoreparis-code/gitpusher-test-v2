from fastapi import APIRouter
from fastapi.responses import FileResponse
import os

router = APIRouter()

BASE_PUBLIC = os.path.join("frontend", "public", "ai")


@router.get("/ai/knowledge/priority-map")
async def get_priority_map():
    path = os.path.join(BASE_PUBLIC, "knowledge", "priority-map.json")
    return FileResponse(path)


@router.get("/ai/knowledge/tool-catalog")
async def get_tool_catalog():
    path = os.path.join(BASE_PUBLIC, "knowledge", "tool-catalog.json")
    return FileResponse(path)


@router.get("/ai/agents/toolpack")
async def get_toolpack():
    path = os.path.join(BASE_PUBLIC, "agents", "toolpack.json")
    return FileResponse(path)


@router.get("/ai/agents/openai-tools")
async def get_openai_tools():
    path = os.path.join(BASE_PUBLIC, "agents", "openai-tools.json")
    return FileResponse(path)
