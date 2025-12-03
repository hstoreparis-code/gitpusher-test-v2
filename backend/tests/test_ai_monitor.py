import pytest
from ai_monitor.middleware import detect_ai_source

def test_detect_chatgpt():
    assert detect_ai_source("Mozilla/5.0 ChatGPT-User") == "ChatGPT"

def test_detect_claude():
    assert detect_ai_source("Claude-Web/1.0") == "Claude"

def test_detect_gemini():
    assert detect_ai_source("Google-Extended") == "Gemini"

def test_detect_none():
    assert detect_ai_source("Mozilla/5.0 Chrome") is None

def test_detect_perplexity():
    assert detect_ai_source("PerplexityBot") == "Perplexity"
