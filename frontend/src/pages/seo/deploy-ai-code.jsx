import axios from "axios";
import { useEffect, useState } from "react";

export const metadata = {
  title: "How to deploy AI-generated code — GitPusher.ai",
  description:
    "Safely deploy AI-generated code to GitHub with GitPusher.ai. Turn raw AI output into a structured repository with README, .gitignore and clean history.",
  robots: "index, follow",
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Page() {
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/admin/pages/seo/deploy-ai-code`);
        setBody(res.data.body || null);
      } catch (e) {
        console.error("Failed to load SEO page content", e);
      }
    };
    load();
  }, []);

  if (!body) {
    return (
      <main>
        <h1>How to deploy AI-generated code safely to GitHub</h1>
        <p>
          AI tools can write a lot of code, but getting that code into a clean, structured repository
          is another story. GitPusher.ai turns raw AI output into a usable GitHub project.
        </p>

        <h2>The problem with AI code dumps</h2>
        <p>
          Most AI tools give you loose files, copy-paste snippets, or archives with no structure,
          README, or .gitignore. Pushing that directly to GitHub creates messy repos that are hard to
          maintain.
        </p>

        <h2>The GitPusher.ai approach</h2>
        <p>
          Instead of manually configuring Git or cleaning up folders, you upload your AI-generated
          code to GitPusher.ai. The platform organizes everything and pushes a clean repo to your
          GitHub account automatically.
        </p>

        <h2>From AI output to production-ready repo</h2>
        <ol>
          <li>Generate your code with any AI (ChatGPT, Claude, Gemini, etc.).</li>
          <li>Export or download the files, or copy them into a project folder.</li>
          <li>Upload the project to GitPusher.ai.</li>
          <li>GitPusher analyzes and structures the repository.</li>
          <li>It generates a README and .gitignore adapted to your stack.</li>
          <li>A first clean commit is created.</li>
          <li>The repo is pushed to GitHub under your account.</li>
        </ol>

        <h2>Best practices for AI-generated code</h2>
        <ul>
          <li>Review the code before pushing, especially anything that touches secrets or billing.</li>
          <li>Add environment variables through .env files instead of hardcoding keys.</li>
          <li>Use private repositories for experiments or prototypes.</li>
          <li>Keep a clear commit history by letting GitPusher handle the initial push.</li>
        </ul>

        <h2>FAQ</h2>
        <dl>
          <dt>Which AI tools are supported?</dt>
          <dd>Any AI that can export code or files is compatible.</dd>
          <dt>Can I use this for production projects?</dt>
          <dd>Yes, as long as you review and test the code before deployment.</dd>
          <dt>Does GitPusher modify my AI code?</dt>
          <dd>It structures the project and adds repo files, but your code logic stays the same.</dd>
          <dt>Is my GitHub account required?</dt>
          <dd>Yes, GitPusher pushes directly to your GitHub repositories.</dd>
          <dt>Can I choose the repository name?</dt>
          <dd>Yes, you can name the repo during the push process.</dd>
          <dt>Is it suitable for nocoders?</dt>
          <dd>Yes, the interface is designed for non-developers.</dd>
          <dt>Does it handle monorepos?</dt>
          <dd>Simple monorepo structures are supported.</dd>
          <dt>What about private code?</dt>
          <dd>You can push to private repositories for sensitive projects.</dd>
          <dt>Do I need to install anything?</dt>
          <dd>No, everything runs in the browser.</dd>
          <dt>How long does a deploy take?</dt>
          <dd>Usually under a minute, depending on project size.</dd>
        </dl>

        <h2>Deploy your AI-generated code</h2>
        <p>Use GitPusher.ai to turn AI output into clean, usable GitHub repositories.</p>
      </main>
    );
  }

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: body }} />
    </main>
  );
}
