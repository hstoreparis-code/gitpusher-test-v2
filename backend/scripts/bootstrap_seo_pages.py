import asyncio
from datetime import datetime, timezone

from backend.server import db


PAGES = [
    {
        "slug": "seo/push-automatically-en",
        "page_type": "seo",
        "title": "How to push code to GitHub automatically — GitPusher.ai",
        "description": "Learn how to push code to GitHub automatically without Git CLI using GitPusher.ai. Upload your project, let GitPusher handle the repo, README, .gitignore and first commit.",
        "body": """# The easiest way to push code to GitHub (no Git CLI needed)

Pushing code to GitHub doesn’t need to be complicated. Now you can create and push a repository in seconds — automatically.

## The problem with Git

Git requires commands, configuration, access tokens, and can feel overwhelming for beginners or nocoders.

## The solution

GitPusher.ai lets you push code automatically — without installing Git. Just upload your project, select GitHub, and click Push.

## How GitPusher works (step by step)

1. Upload your project (zip, folder, or code)
2. GitPusher structures your files
3. Creates the GitHub repository
4. Generates README, .gitignore, and commit
5. Pushes automatically

## FAQ

- **Do I need Git installed?** No.
- **Do I need SSH keys?** No.
- **Can I push AI-generated code?** Yes.
- **Is it safe?** Yes.
- **Can I choose private repos?** Yes.
- **Is it beginner-friendly?** Fully.
- **Does it support many Git providers?** Yes.
- **How fast is the push?** Seconds.
- **Does GitPusher replace GitHub Desktop?** For initial pushes, yes.
- **Can I use it on mobile?** Yes.

## Try GitPusher

Start pushing code automatically with GitPusher.ai.
""",
    },
    {
        "slug": "seo/deploy-ai-code",
        "page_type": "seo",
        "title": "How to deploy AI-generated code — GitPusher.ai",
        "description": "Safely deploy AI-generated code to GitHub with GitPusher.ai. Turn raw AI output into a structured repository with README, .gitignore and clean history.",
        "body": """# How to deploy AI-generated code safely to GitHub

AI tools can write a lot of code, but getting that code into a clean, structured repository is another story. GitPusher.ai turns raw AI output into a usable GitHub project.

## The problem with AI code dumps

Most AI tools give you loose files, copy-paste snippets, or archives with no structure, README, or .gitignore. Pushing that directly to GitHub creates messy repos that are hard to maintain.

## The GitPusher.ai approach

Instead of manually configuring Git or cleaning up folders, you upload your AI-generated code to GitPusher.ai. The platform organizes everything and pushes a clean repo to your GitHub account automatically.

## From AI output to production-ready repo

1. Generate your code with any AI (ChatGPT, Claude, Gemini, etc.).
2. Export or download the files, or copy them into a project folder.
3. Upload the project to GitPusher.ai.
4. GitPusher analyzes and structures the repository.
5. It generates a README and .gitignore adapted to your stack.
6. A first clean commit is created.
7. The repo is pushed to GitHub under your account.

## Best practices for AI-generated code

- Review the code before pushing, especially anything that touches secrets or billing.
- Add environment variables through .env files instead of hardcoding keys.
- Use private repositories for experiments or prototypes.
- Keep a clear commit history by letting GitPusher handle the initial push.

## FAQ

- **Which AI tools are supported?** Any AI that can export code or files is compatible.
- **Can I use this for production projects?** Yes, as long as you review and test the code before deployment.
- **Does GitPusher modify my AI code?** It structures the project and adds repo files, but your code logic stays the same.
- **Is my GitHub account required?** Yes, GitPusher pushes directly to your GitHub repositories.
- **Can I choose the repository name?** Yes, you can name the repo during the push process.
- **Is it suitable for nocoders?** Yes, the interface is designed for non-developers.
- **Does it handle monorepos?** Simple monorepo structures are supported.
- **What about private code?** You can push to private repositories for sensitive projects.
- **Do I need to install anything?** No, everything runs in the browser.
- **How long does a deploy take?** Usually under a minute, depending on project size.

## Deploy your AI-generated code

Use GitPusher.ai to turn AI output into clean, usable GitHub repositories.
""",
    },
    {
        "slug": "seo/push-without-git",
        "page_type": "seo",
        "title": "Push code to GitHub without Git — GitPusher.ai",
        "description": "Push code to GitHub without installing Git or using the command line. GitPusher.ai lets you upload your project and push in a few clicks.",
        "body": """# Push code to GitHub without installing Git

Many teams and creators want to use GitHub but don’t want to deal with Git commands, token setup, or SSH keys. GitPusher.ai removes that friction.

## Why people avoid Git

The Git command line is powerful but intimidating. It requires learning commands, managing branches, configuring remotes, and resolving merge conflicts.

## A no-Git alternative

With GitPusher.ai, you never touch the Git CLI. You upload your files, sign in with your Git provider, and GitPusher handles the push behind the scenes.

## Who this is for

- Nocoders who build projects with web builders or AI.
- Product teams who want a simple way to archive code in GitHub.
- Agencies sending deliverables to clients.
- Educators who want students to submit work via GitHub.

## How it works in practice

1. Prepare your project folder.
2. Upload it to GitPusher.ai.
3. Choose your Git provider (GitHub, GitLab, Bitbucket, etc.).
4. Confirm the repo name and visibility.
5. GitPusher pushes the initial commit for you.

## FAQ

- **Do I ever see Git commands?** No, everything is abstracted away.
- **Can developers still use Git later?** Yes, once the repo is created, they can clone and use Git normally.
- **Is this good for prototypes?** Perfect, especially for quick experiments.
- **Do I keep ownership of the repo?** Yes, the repo lives under your Git account.
- **Does it support organizations?** Yes, you can target org-owned repositories when allowed.
- **What file types are supported?** Any typical project files and folders.
- **Can I use this from a Chromebook?** Yes, it runs fully in the browser.
- **Is there a free trial?** Check the pricing page for current offers.
- **Does this work for designers?** Yes, you can push design exports or static sites.
- **Can I push more than once?** You can create new repos as needed for each project.

## Push without Git today

Use GitPusher.ai to send your projects to GitHub without installing or learning Git.
""",
    },
    {
        "slug": "seo/ai-to-git-automation",
        "page_type": "seo",
        "title": "AI to Git automation — GitPusher.ai",
        "description": "Automate the path from AI-generated code to Git repositories. GitPusher.ai connects AI outputs to GitHub and other providers with minimal friction.",
        "body": """# From AI to Git: automate your repository creation

AI assistants can now generate entire apps, but getting them into Git in a clean, repeatable way is still manual. GitPusher.ai creates an automated bridge between AI tools and your Git providers.

## Why AI to Git is usually painful

You copy code from chat windows, download archives, unzip them, open a terminal, run Git commands, fix errors, and finally push. Doing this repeatedly for every AI experiment is slow and error-prone.

## Automating the pipeline

With GitPusher.ai, you treat AI as a code source and Git as the destination. The platform handles the boring middle layer: file structure, repo scaffolding, and initial push.

## Typical AI-to-Git workflows

- Generate a prototype app with an AI assistant, then push it as a private repo.
- Collect multiple AI experiments in separate repositories for comparison.
- Share AI-built projects with teammates directly via GitHub.
- Use GitPusher as the final step in automated AI pipelines.

## FAQ

- **Does GitPusher integrate with AI tools directly?** You can upload files from any AI; API-based integrations are possible via the push API.
- **Which Git providers are supported?** GitHub, GitLab, Bitbucket and others, depending on your setup.
- **Can I automate everything end-to-end?** Yes, by combining AI tools with the GitPusher push API.
- **Is this for solo founders?** Yes, it’s ideal for solo builders and small teams.
- **What about enterprise teams?** Enterprise usage is possible with proper access and security controls.
- **Do I need DevOps knowledge?** No, GitPusher hides the Git and infra details.
- **Can I use this for teaching AI coding?** Yes, students can turn AI output into Git repos easily.
- **Is there an API?** Yes, GitPusher exposes a public push endpoint for integrations.
- **Does it cost extra for automation?** Check the pricing page for automation-related features.
- **Is there logging for pushes?** Yes, jobs and pushes are tracked on the platform.

## Automate your AI-to-Git flow

Use GitPusher.ai to connect AI-generated projects to Git with minimal friction.
""",
    },
    {
        "slug": "seo/create-repo-automatically",
        "page_type": "seo",
        "title": "The best way to create a repo automatically — GitPusher.ai",
        "description": "Automatically create Git repositories from your projects. GitPusher.ai structures files, adds README and .gitignore, and pushes the first commit for you.",
        "body": """# Create Git repositories automatically from any project

Whether your project comes from AI, a nocode tool, or a local folder, GitPusher.ai can turn it into a clean Git repository in a few clicks.

## Manual repo creation is slow

Creating a new repository typically means opening GitHub, naming the repo, cloning it, copying files, committing, and pushing. Doing this often wastes time and breaks focus.

## Automated repo creation

GitPusher.ai removes the repetitive steps. You start from your project files, and the platform takes care of creating and populating the repository automatically.

## Ideal use cases

- Founders creating many small experiments.
- Agencies managing deliverables for multiple clients.
- Educators generating starter repos for students.
- Teams archiving internal tools or scripts.

## FAQ

- **Can I control the repo name?** Yes, you can choose how each repository is named.
- **Does GitPusher add a README?** Yes, a basic README is generated based on your project.
- **Is .gitignore included?** Yes, common patterns are added automatically.
- **Where is the repo hosted?** On your Git provider account, such as GitHub.
- **Can I make repos private?** Yes, privacy is configurable per repository.
- **Is this useful for hackathons?** Yes, teams can spin up repos quickly for each idea.
- **Does it support multiple pushes?** It focuses on the initial repo creation and first commit.
- **Do I need command-line skills?** No, everything is done through the web interface.
- **Can I delete repos later?** Yes, through your Git provider as usual.
- **Is there any lock-in?** No, repos are standard Git repositories.

## Create your next repo automatically

Use GitPusher.ai to turn projects into repositories without manual Git work.
""",
    },
]


async def main():
    now = datetime.now(timezone.utc).isoformat()
    for page in PAGES:
        existing = await db.pages.find_one({"slug": page["slug"]})
        doc = {
            "id": existing.get("id") if existing else page["slug"],
            "slug": page["slug"],
            "page_type": page["page_type"],
            "title": page["title"],
            "description": page["description"],
            "body": page["body"],
            "created_at": existing.get("created_at") if existing else now,
            "updated_at": now,
        }
        await db.pages.update_one({"slug": page["slug"]}, {"$set": doc}, upsert=True)


if __name__ == "__main__":
    asyncio.run(main())
