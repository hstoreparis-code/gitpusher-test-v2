import smtplib
from email.mime.text import MIMEText
import os

import requests

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
ALERT_EMAIL = os.getenv("ADMIN_ALERT_EMAIL", "")
SECURITY_WEBHOOK_URL = os.getenv("SECURITY_WEBHOOK_URL", "")


def send_alert(subject, body):
    if not SMTP_HOST or not ALERT_EMAIL:
        return
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = ALERT_EMAIL

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.starttls()


def send_security_webhook(payload: dict):
    if not SECURITY_WEBHOOK_URL:
        return
    try:
        requests.post(SECURITY_WEBHOOK_URL, json=payload, timeout=3)
    except Exception:
        pass

        if SMTP_USER:
            s.login(SMTP_USER, SMTP_PASS)
        s.sendmail(SMTP_USER, [ALERT_EMAIL], msg.as_string())
