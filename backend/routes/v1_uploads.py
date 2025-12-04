from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import Optional
from models.schemas import (
    UploadInitRequest, UploadInitResponse, UploadStatus,
    UploadCompleteRequest
)
from services.storage_service import StorageService
from datetime import datetime, timezone
import uuid
import os
import io
import zipfile


def _validate_upload_size(content_bytes: bytes):
    max_bytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content_bytes) > max_bytes:
        raise HTTPException(status_code=413, detail="Uploaded file too large")


def _safe_extract_zip(zip_bytes: bytes, target_dir: str):
    zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
    for member in zf.infolist():
        member_path = os.path.normpath(member.filename)
        if member_path.startswith("..") or os.path.isabs(member_path):
            raise HTTPException(status_code=400, detail="Unsafe path in ZIP")
    zf.extractall(target_dir)



from security_config import MAX_UPLOAD_SIZE_MB, ALLOWED_UPLOAD_EXTENSIONS

router = APIRouter(prefix="/uploads", tags=["uploads"])
storage = StorageService()


@router.post("/init", response_model=UploadInitResponse)
async def init_upload(payload: UploadInitRequest, db=None, user_id: str = None):
    """
    Initialize upload and get presigned URL.
    """
    upload_id, presigned_url = await storage.init_upload(payload.filename, payload.contentType)
    
    # Store upload metadata in DB
    await db.uploads_v1.insert_one({
        "_id": upload_id,
        "user_id": user_id,
        "filename": payload.filename,
        "content_type": payload.contentType,
        "status": "initialized",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return UploadInitResponse(
        uploadId=upload_id,
        presignedUrl=presigned_url,
        expiresIn=3600
    )


@router.post("", response_model=UploadStatus)
async def upload_direct(file: UploadFile = File(...), db=None, user_id: str = None):
    """Direct upload endpoint (fallback) with basic security checks.

    - Enforce max size based on MAX_UPLOAD_SIZE_MB
    - Only accept ZIP archives explicitly and validate internal paths
    """
    upload_id = uuid.uuid4().hex

    # Read file content
    content = await file.read()
    _validate_upload_size(content)

    filename = file.filename or "upload.zip"
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only .zip uploads are allowed")

    # Save to storage
    result = await storage.save_upload(upload_id, content, filename)

    # Secure extraction of ZIP content (if storage layer expects pre-extracted files,
    # this can be adapted later; for now we keep the logic explicit here)
    temp_dir = f"/tmp/gitpusher_upload_{upload_id}"
    os.makedirs(temp_dir, exist_ok=True)
    _safe_extract_zip(content, temp_dir)

    # Existing extraction hook (if any)
    extracted_files = await storage.extract_files(upload_id, filename)

    # Store in DB
    await db.uploads_v1.insert_one({
        "_id": upload_id,
        "user_id": user_id,
        "filename": filename,
        "content_type": file.content_type,
        "status": "processed",
        "size": result["size"],
        "mime_type": result["mime_type"],
        "extracted_files": extracted_files,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return UploadStatus(
        uploadId=upload_id,
        status="processed",
        extractedFiles=extracted_files,
        size=result["size"],
    )


@router.get("/{upload_id}", response_model=UploadStatus)
async def get_upload_status(upload_id: str, db=None):
    """
    Get upload status.
    """
    upload = await db.uploads_v1.find_one({"_id": upload_id}, {"_id": 0})
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    return UploadStatus(
        uploadId=upload_id,
        status=upload.get("status", "unknown"),
        extractedFiles=upload.get("extracted_files", []),
        size=upload.get("size", 0)
    )


@router.post("/complete")
async def complete_upload(payload: UploadCompleteRequest, db=None, user_id: str = None):
    """
    Signal upload completion and create analysis job.
    """
    upload = await db.uploads_v1.find_one({"_id": payload.uploadId, "user_id": user_id})
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Mark as completed
    await db.uploads_v1.update_one(
        {"_id": payload.uploadId},
        {"$set": {"status": "processed"}}
    )
    
    # Create a job (placeholder)
    job_id = str(uuid.uuid4())
    await db.jobs_v1.insert_one({
        "_id": job_id,
        "user_id": user_id,
        "upload_id": payload.uploadId,
        "status": "queued",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"jobId": job_id}
