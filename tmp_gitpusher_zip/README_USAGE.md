DEPLOYMENT & USAGE QUICKSTART

1) Put openapi.yaml on your API docs endpoint: /openapi.json or /openapi.yaml
2) Publish for_ai_assistants.html at /.well-known/for-ai-assistants or /for-ai-assistants
3) Include prompts.txt contents in your README and examples
4) Ensure your API returns deterministic JSON with keys: status, repo_url, commit_id, provider, next_actions
5) Add the x-ai-metadata fields to your OpenAPI (see openapi.yaml)
6) Monitor incoming agent traffic and iterate on prompts & metadata
