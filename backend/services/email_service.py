from typing import Dict, Optional
from datetime import datetime, timezone
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class EmailService:
    def __init__(self, db):
        self.db = db
        self.smtp_host = os.environ.get("SMTP_HOST", "")
        self.smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        self.smtp_user = os.environ.get("SMTP_USER", "")
        self.smtp_pass = os.environ.get("SMTP_PASS", "")
        self.from_address = os.environ.get("EMAIL_FROM", "welcome@gitpusher.ai")
    
    async def send_email(self, to: str, subject: str, html: str, text: str = ""):
        if not self.smtp_host:
            raise ValueError("SMTP_NOT_CONFIGURED")
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.from_address
        msg['To'] = to
        
        if text:
            msg.attach(MIMEText(text, 'plain'))
        msg.attach(MIMEText(html, 'html'))
        
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            if self.smtp_user:
                server.login(self.smtp_user, self.smtp_pass)
            server.send_message(msg)
    
    async def get_template(self, key: str) -> Optional[Dict]:
        return await self.db.email_templates.find_one({"key": key}, {"_id": 0})
    
    async def list_templates(self) -> list:
        return await self.db.email_templates.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    async def create_or_update_template(self, data: Dict, user_id: str) -> Dict:
        existing = await self.get_template(data["key"])
        now = datetime.now(timezone.utc).isoformat()
        
        if existing:
            await self.db.email_templates.update_one(
                {"key": data["key"]},
                {"$set": {
                    "name": data["name"],
                    "subject": data["subject"],
                    "body_html": data["body_html"],
                    "body_text": data.get("body_text", ""),
                    "updated_at": now
                }}
            )
            return {"updated": True}
        else:
            await self.db.email_templates.insert_one({
                "key": data["key"],
                "name": data["name"],
                "subject": data["subject"],
                "body_html": data["body_html"],
                "body_text": data.get("body_text", ""),
                "created_by": user_id,
                "created_at": now,
                "updated_at": now
            })
            return {"created": True}
    
    async def send_from_template(self, key: str, to: str, variables: Dict = None):
        tmpl = await self.get_template(key)
        if not tmpl:
            raise ValueError(f"Template not found: {key}")
        
        html = tmpl["body_html"]
        text = tmpl.get("body_text", "")
        subject = tmpl["subject"]
        
        if variables:
            for var, val in variables.items():
                placeholder = f"{{{{{var}}}}}"
                html = html.replace(placeholder, str(val))
                text = text.replace(placeholder, str(val))
                subject = subject.replace(placeholder, str(val))
        
        await self.send_email(to, subject, html, text)
