"""Configuration settings for the application."""
import os

class Config:
    DEBUG = os.environ.get('DEBUG', False)
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    PORT = int(os.environ.get('PORT', 5000))
