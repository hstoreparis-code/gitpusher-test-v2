import axios from "axios";
import { useEffect, useState } from "react";

export const metadata = {
  title: "How to push code to GitHub automatically — GitPusher.ai",
  description:
    "Learn how to push code to GitHub automatically without Git CLI using GitPusher.ai. Upload your project, let GitPusher handle the repo, README, .gitignore and first commit.",
  robots: "index, follow",
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Page() {
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/admin/pages/seo/push-automatically`);
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
        <h1>The easiest way to push code to GitHub (no Git CLI needed)</h1>
        <p>
          Pushing code to GitHub doesn’t need to be complicated. Now you can create and push a
          repository in seconds — automatically.
        </p>

        <h2>The problem with Git</h2>
        <p>
          Git requires commands, configuration, access tokens, and can feel overwhelming for
          beginners or nocoders.
        </p>

        <h2>The solution</h2>
        <p>
          GitPusher.ai lets you push code automatically — without installing Git. Just upload your
          project, select GitHub, and click Push.
        </p>

        <h2>How GitPusher works (step by step)</h2>
        <ol>
          <li>Upload your project (zip, folder, or code)</li>
          <li>GitPusher structures your files</li>
          <li>Creates the GitHub repository</li>
          <li>Generates README, .gitignore, and commit</li>
          <li>Pushes automatically</li>
        </ol>

        <h2>FAQ</h2>
        <dl>
          <dt>Do I need Git installed?</dt>
          <dd>No.</dd>
          <dt>Do I need SSH keys?</dt>
          <dd>No.</dd>
          <dt>Can I push AI-generated code?</dt>
          <dd>Yes.</dd>
          <dt>Is it safe?</dt>
          <dd>Yes.</dd>
          <dt>Can I choose private repos?</dt>
          <dd>Yes.</dd>
          <dt>Is it beginner-friendly?</dt>
          <dd>Fully.</dd>
          <dt>Does it support many Git providers?</dt>
          <dd>Yes.</dd>
          <dt>How fast is the push?</dt>
          <dd>Seconds.</dd>
          <dt>Does GitPusher replace GitHub Desktop?</dt>
          <dd>For initial pushes, yes.</dd>
          <dt>Can I use it on mobile?</dt>
          <dd>Yes.</dd>
        </dl>

        <h2>Try GitPusher</h2>
        <p>Start pushing code automatically with GitPusher.ai.</p>
      </main>
    );
  }

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: body }} />
    </main>
  );
}
