Assistant examples - how to call GitPusher

Example 1 - Push a ZIP (ChatGPT function / tool usage):

Request payload:
{
  "source":"zip",
  "provider":"github",
  "repo_name":"my-ai-project",
  "content":"<BASE64_ZIP>"
}

Expected response (AI-friendly):
{
  "status":"success",
  "repo_url":"https://github.com/me/my-ai-project",
  "commit_id":"abc123",
  "provider":"github",
  "next_actions":["open_repo","trigger_build","share_repo"]
}

Example 2 - Push code files (agent calling):
{
  "source":"code",
  "provider":"all",
  "repo_name":"generated-app",
  "content":{
    "files":[{"path":"main.py","content":"print('hello')"}]
  }
}
