import os

SITEMAP_PATH = "frontend/public/sitemap.xml"

REQUIRED_LINES = [
  "<url><loc>https://gitpusher.ai/</loc></url>",
  "<url><loc>https://gitpusher.ai/for-ai-assistants</loc></url>",
  "<url><loc>https://gitpusher.ai/providers</loc></url>",
]


def run_sitemap_autofix():
    if not os.path.exists(SITEMAP_PATH):
        return False

    with open(SITEMAP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    changed = False

    for line in REQUIRED_LINES:
        if line not in content:
            content = content.replace("</urlset>", f"  {line}\n</urlset>")
            changed = True

    if changed:
        with open(SITEMAP_PATH, "w", encoding="utf-8") as f:
            f.write(content)

    return changed
