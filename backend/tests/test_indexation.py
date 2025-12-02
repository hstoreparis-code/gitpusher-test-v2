"""Fast indexation tests for AI agents compatibility"""
import pytest
import yaml
import json
from pathlib import Path


def test_openapi_parsable():
    """Verify openapi.yaml is valid"""
    openapi_path = Path("/app/backend/api/openapi.yaml")
    assert openapi_path.exists(), "openapi.yaml missing"
    
    content = openapi_path.read_text()
    data = yaml.safe_load(content)
    
    assert data.get("openapi"), "openapi version missing"
    assert data.get("info"), "info section missing"
    assert data.get("paths"), "paths missing"
    print("✅ OpenAPI parsable")


def test_ai_actions_present():
    """Verify ai-actions.json exists and valid"""
    actions_path = Path("/app/frontend/public/.well-known/ai-actions.json")
    assert actions_path.exists(), "ai-actions.json missing"
    
    content = actions_path.read_text()
    data = json.loads(content)
    
    assert "actions" in data or "openapi_url" in data, "Invalid ai-actions structure"
    print("✅ AI actions present")


def test_ai_plugin_present():
    """Verify ai-plugin.json for OpenAI"""
    plugin_path = Path("/app/frontend/public/.well-known/ai-plugin.json")
    assert plugin_path.exists(), "ai-plugin.json missing"
    
    content = plugin_path.read_text()
    data = json.loads(content)
    
    assert data.get("schema_version"), "schema_version missing"
    assert data.get("name_for_model"), "name_for_model missing"
    assert data.get("api"), "api section missing"
    print("✅ AI plugin present")


def test_robots_txt():
    """Verify robots.txt allows indexing"""
    robots_path = Path("/app/frontend/public/robots.txt")
    assert robots_path.exists(), "robots.txt missing"
    
    content = robots_path.read_text()
    assert "Allow: /" in content or "Disallow:" not in content, "Robots blocks indexing"
    assert "Sitemap:" in content, "Sitemap URL missing"
    print("✅ Robots.txt OK")


def test_sitemap_xml():
    """Verify sitemap.xml exists"""
    sitemap_path = Path("/app/frontend/public/sitemap.xml")
    assert sitemap_path.exists(), "sitemap.xml missing"
    
    content = sitemap_path.read_text()
    assert "<urlset" in content, "Invalid sitemap format"
    assert "<loc>" in content, "No URLs in sitemap"
    print("✅ Sitemap.xml OK")


def test_metadata_file():
    """Verify ai-actions-metadata.json"""
    meta_path = Path("/app/frontend/public/ai-actions-metadata.json")
    assert meta_path.exists(), "ai-actions-metadata.json missing"
    
    content = meta_path.read_text()
    data = json.loads(content)
    
    assert "x-indexers" in data, "x-indexers missing"
    assert len(data["x-indexers"]) >= 10, "Not enough indexers listed"
    print("✅ Metadata file OK")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
