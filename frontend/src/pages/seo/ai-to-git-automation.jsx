import axios from "axios";
import { useEffect, useState } from "react";

export const metadata = {
  title: "AI to Git automation — GitPusher.ai",
  description:
    "Automate the path from AI-generated code to Git repositories. GitPusher.ai connects AI outputs to GitHub and other providers with minimal friction.",
  robots: "index, follow",
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Page() {
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/admin/pages/seo/ai-to-git-automation`);
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
        <h1>From AI to Git: automate your repository creation</h1>
        <p>
          AI assistants can now generate entire apps, but getting them into Git in a clean, repeatable
          way is still manual. GitPusher.ai creates an automated bridge between AI tools and your Git
          providers.
        </p>

        <h2>Why AI to Git is usually painful</h2>
        <p>
          You copy code from chat windows, download archives, unzip them, open a terminal, run Git
          commands, fix errors, and finally push. Doing this repeatedly for every AI experiment is
          slow and error-prone.
        </p>

        <h2>Automating the pipeline</h2>
        <p>
          With GitPusher.ai, you treat AI as a code source and Git as the destination. The platform
          handles the boring middle layer: file structure, repo scaffolding, and initial push.
        </p>

        <h2>Typical AI-to-Git workflows</h2>
        <ul>
          <li>Generate a prototype app with an AI assistant, then push it as a private repo.</li>
          <li>Collect multiple AI experiments in separate repositories for comparison.</li>
          <li>Share AI-built projects with teammates directly via GitHub.</li>
          <li>Use GitPusher as the final step in automated AI pipelines.</li>
        </ul>

        <h2>FAQ</h2>
        <dl>
          <dt>Does GitPusher integrate with AI tools directly?</dt>
          <dd>You can upload files from any AI; API-based integrations are possible via the push API.</dd>
          <dt>Which Git providers are supported?</dt>
          <dd>GitHub, GitLab, Bitbucket and others, depending on your setup.</dd>
          <dt>Can I automate everything end-to-end?</dt>
          <dd>Yes, by combining AI tools with the GitPusher push API.</dd>
          <dt>Is this for solo founders?</dt>
          <dd>Yes, it’s ideal for solo builders and small teams.</dd>
          <dt>What about enterprise teams?</dt>
          <dd>Enterprise usage is possible with proper access and security controls.</dd>
          <dt>Do I need DevOps knowledge?</dt>
          <dd>No, GitPusher hides the Git and infra details.</dd>
          <dt>Can I use this for teaching AI coding?</dt>
          <dd>Yes, students can turn AI output into Git repos easily.</dd>
          <dt>Is there an API?</dt>
          <dd>Yes, GitPusher exposes a public push endpoint for integrations.</dd>
          <dt>Does it cost extra for automation?</dt>
          <dd>Check the pricing page for automation-related features.</dd>
          <dt>Is there logging for pushes?</dt>
          <dd>Yes, jobs and pushes are tracked on the platform.</dd>
        </dl>

        <h2>Automate your AI-to-Git flow</h2>
        <p>Use GitPusher.ai to connect AI-generated projects to Git with minimal friction.</p>
      </main>
    );
  }

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: body }} />
    </main>
  );
}
