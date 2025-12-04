import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "GitPusher.ai — For No-Code Builders in India",
  description:
    "Make it easy for Indian founders and no-code builders to publish projects to GitHub. Simple uploads, clean repos, no Git CLI.",
  robots: "index, follow",
};

export default function ForNocodeBuildersINPage() {
  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <AIMeta />
      <header>
        <h1>GitPusher.ai — For No-Code Builders in India</h1>
        <p>
          Whether you build with Webflow, Bubble, Framer, or AI tools, GitPusher.ai helps you publish
          to GitHub in seconds – with no Git commands and no complex setup.
        </p>
      </header>

      <section>
        <h2>1. Built for Indian founders, agencies and students</h2>
        <ul>
          <li>Perfect for solo founders building MVPs for the Indian market.</li>
          <li>Agencies can deliver GitHub repos to clients quickly.</li>
          <li>Students can submit projects via GitHub without learning Git first.</li>
          <li>Works well with Indian cloud providers and global platforms.</li>
        </ul>
      </section>

      <section>
        <h2>2. Typical workflows in India</h2>
        <ul>
          <li>No-code MVP → GitHub → deployment on Render, Railway, etc.</li>
          <li>AI-generated projects → push to private repo for review.</li>
          <li>Freelance projects → clean Git repos for clients worldwide.</li>
        </ul>
      </section>

      <section>
        <h2>3. How it works</h2>
        <ol>
          <li>Export or package your no-code project (ZIP or folder).</li>
          <li>Upload it to GitPusher.ai.</li>
          <li>Select GitHub (or another provider).</li>
          <li>GitPusher creates the repo and pushes your files.</li>
        </ol>
      </section>

      <section>
        <h2>4. Simple example (fetch)</h2>
        <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: "12px", borderRadius: "8px" }}>
{`await fetch("https://gitpusher.ai/api/v1/push", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "github",
    source: "zip",
    repo_name: "india-nocode-project",
    visibility: "private",
    content: "<BASE64_ZIP>"
  })
});`}
        </pre>
      </section>

      <footer style={{ marginTop: "32px", fontSize: "0.9rem", opacity: 0.8 }}>
        <p>
          GitPusher.ai — a friendly Git layer for India’s no-code and AI builder community.
        </p>
      </footer>
    </main>
  );
}
