import os
import uuid
from pathlib import Path
from typing import Optional, Tuple, Dict
import shutil
import zipfile
import mimetypes

class StorageService:
    def __init__(self, base_path: str = "/tmp/gitpusher_uploads"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def generate_presigned_url(self, upload_id: str, filename: str) -> str:
        """Generate a mock presigned URL (filesystem-based)."""
        # In production, this would be S3 presigned URL
        # For MVP, we return a local endpoint
        return f"/api/v1/uploads/{upload_id}/direct"
    
    def get_upload_path(self, upload_id: str) -> Path:
        """Get the storage path for an upload."""
        return self.base_path / upload_id
    
    async def init_upload(self, filename: str, content_type: Optional[str] = None) -> Tuple[str, str]:
        """Initialize an upload and return upload_id and presigned URL."""
        upload_id = f"{uuid.uuid4().hex}"
        upload_path = self.get_upload_path(upload_id)
        upload_path.mkdir(parents=True, exist_ok=True)
        
        # Store metadata
        metadata = {
            "filename": filename,
            "content_type": content_type,
            "upload_id": upload_id
        }
        
        presigned_url = self.generate_presigned_url(upload_id, filename)
        return upload_id, presigned_url
    
    async def save_upload(self, upload_id: str, file_content: bytes, filename: str) -> Dict:
        """Save uploaded file to storage."""
        upload_path = self.get_upload_path(upload_id)
        file_path = upload_path / filename
        
        # Save file
        file_path.write_bytes(file_content)
        
        # Detect mime type
        mime_type, _ = mimetypes.guess_type(filename)
        if not mime_type:
            mime_type = "application/octet-stream"
        
        return {
            "upload_id": upload_id,
            "filename": filename,
            "path": str(file_path),
            "size": len(file_content),
            "mime_type": mime_type
        }
    
    async def extract_files(self, upload_id: str, filename: str) -> list:
        """Extract files from ZIP if applicable."""
        upload_path = self.get_upload_path(upload_id)
        file_path = upload_path / filename
        extracted_files = []
        
        # Check if it's a ZIP file
        if filename.endswith('.zip'):
            extract_dir = upload_path / "extracted"
            extract_dir.mkdir(exist_ok=True)
            
            try:
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
                
                # List all extracted files
                for root, dirs, files in os.walk(extract_dir):
                    for file in files:
                        rel_path = os.path.relpath(os.path.join(root, file), extract_dir)
                        extracted_files.append(rel_path)
            except Exception as e:
                print(f"Error extracting ZIP: {e}")
        else:
            # Single file
            extracted_files = [filename]
        
        return extracted_files
    
    async def cleanup_upload(self, upload_id: str):
        """Clean up upload directory."""
        upload_path = self.get_upload_path(upload_id)
        if upload_path.exists():
            shutil.rmtree(upload_path)
