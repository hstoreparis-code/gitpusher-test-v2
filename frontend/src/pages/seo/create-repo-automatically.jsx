import axios from "axios";
import { useEffect, useState } from "react";

export const metadata = {
  title: "The best way to create a repo automatically — GitPusher.ai",
  description:
    "Automatically create Git repositories from your projects. GitPusher.ai structures files, adds README and .gitignore, and pushes the first commit for you.",
  robots: "index, follow",
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Page() {
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/admin/pages/seo/create-repo-automatically`);
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
        <h1>Create Git repositories automatically from any project</h1>
        <p>
          Whether your project comes from AI, a nocode tool, or a local folder, GitPusher.ai can turn
          it into a clean Git repository in a few clicks.
        </p>

        <h2>Manual repo creation is slow</h2>
        <p>
          Creating a new repository typically means opening GitHub, naming the repo, cloning it,
          copying files, committing, and pushing. Doing this often wastes time and breaks focus.
        </p>

        <h2>Automated repo creation</h2>
        <p>
          GitPusher.ai removes the repetitive steps. You start from your project files, and the
          platform takes care of creating and populating the repository automatically.
        </p>

        <h2>Ideal use cases</h2>
        <ul>
          <li>Founders creating many small experiments.</li>
          <li>Agencies managing deliverables for multiple clients.</li>
          <li>Educators generating starter repos for students.</li>
          <li>Teams archiving internal tools or scripts.</li>
        </ul>

        <h2>FAQ</h2>
        <dl>
          <dt>Can I control the repo name?</dt>
          <dd>Yes, you can choose how each repository is named.</dd>
          <dt>Does GitPusher add a README?</dt>
          <dd>Yes, a basic README is generated based on your project.</dd>
          <dt>Is .gitignore included?</dt>
          <dd>Yes, common patterns are added automatically.</dd>
          <dt>Where is the repo hosted?</dt>
          <dd>On your Git provider account, such as GitHub.</dd>
          <dt>Can I make repos private?</dt>
          <dd>Yes, privacy is configurable per repository.</dd>
          <dt>Is this useful for hackathons?</dt>
          <dd>Yes, teams can spin up repos quickly for each idea.</dd>
          <dt>Does it support multiple pushes?</dt>
          <dd>It focuses on the initial repo creation and first commit.</dd>
          <dt>Do I need command-line skills?</dt>
          <dd>No, everything is done through the web interface.</dd>
          <dt>Can I delete repos later?</dt>
          <dd>Yes, through your Git provider as usual.</dd>
          <dt>Is there any lock-in?</dt>
          <dd>No, repos are standard Git repositories.</dd>
        </dl>

        <h2>Create your next repo automatically</h2>
        <p>Use GitPusher.ai to turn projects into repositories without manual Git work.</p>
      </main>
    );
  }

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: body }} />
    </main>
  );
}
