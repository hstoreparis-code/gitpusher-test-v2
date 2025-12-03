import axios from "axios";
import { useEffect, useState } from "react";

export const metadata = {
  title: "Push code to GitHub without Git — GitPusher.ai",
  description:
    "Push code to GitHub without installing Git or using the command line. GitPusher.ai lets you upload your project and push in a few clicks.",
  robots: "index, follow",
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Page() {
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/admin/pages/seo/push-without-git`);
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
        <h1>Push code to GitHub without installing Git</h1>
        <p>
          Many teams and creators want to use GitHub but don’t want to deal with Git commands,
          token setup, or SSH keys. GitPusher.ai removes that friction.
        </p>

        <h2>Why people avoid Git</h2>
        <p>
          The Git command line is powerful but intimidating. It requires learning commands, managing
          branches, configuring remotes, and resolving merge conflicts.
        </p>

        <h2>A no-Git alternative</h2>
        <p>
          With GitPusher.ai, you never touch the Git CLI. You upload your files, sign in with your
          Git provider, and GitPusher handles the push behind the scenes.
        </p>

        <h2>Who this is for</h2>
        <ul>
          <li>Nocoders who build projects with web builders or AI.</li>
          <li>Product teams who want a simple way to archive code in GitHub.</li>
          <li>Agencies sending deliverables to clients.</li>
          <li>Educators who want students to submit work via GitHub.</li>
        </ul>

        <h2>How it works in practice</h2>
        <ol>
          <li>Prepare your project folder.</li>
          <li>Upload it to GitPusher.ai.</li>
          <li>Choose your Git provider (GitHub, GitLab, Bitbucket, etc.).</li>
          <li>Confirm the repo name and visibility.</li>
          <li>GitPusher pushes the initial commit for you.</li>
        </ol>

        <h2>FAQ</h2>
        <dl>
          <dt>Do I ever see Git commands?</dt>
          <dd>No, everything is abstracted away.</dd>
          <dt>Can developers still use Git later?</dt>
          <dd>Yes, once the repo is created, they can clone and use Git normally.</dd>
          <dt>Is this good for prototypes?</dt>
          <dd>Perfect, especially for quick experiments.</dd>
          <dt>Do I keep ownership of the repo?</dt>
          <dd>Yes, the repo lives under your Git account.</dd>
          <dt>Does it support organizations?</dt>
          <dd>Yes, you can target org-owned repositories when allowed.</dd>
          <dt>What file types are supported?</dt>
          <dd>Any typical project files and folders.</dd>
          <dt>Can I use this from a Chromebook?</dt>
          <dd>Yes, it runs fully in the browser.</dd>
          <dt>Is there a free trial?</dt>
          <dd>Check the pricing page for current offers.</dd>
          <dt>Does this work for designers?</dt>
          <dd>Yes, you can push design exports or static sites.</dd>
          <dt>Can I push more than once?</dt>
          <dd>You can create new repos as needed for each project.</dd>
        </dl>

        <h2>Push without Git today</h2>
        <p>Use GitPusher.ai to send your projects to GitHub without installing or learning Git.</p>
      </main>
    );
  }

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: body }} />
    </main>
  );
}
