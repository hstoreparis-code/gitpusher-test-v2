import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "GitPusher.ai — Für No-Code-Creators",
  description:
    "Die einfachste Möglichkeit für No-Code-Creators, Projekte auf GitHub zu veröffentlichen. Upload, Push, saubere Repositories. Kein Git notwendig.",
  robots: "index, follow",
};

export default function ForNocodeBuildersDEPage() {
  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <AIMeta />
      <header>
        <h1>GitPusher.ai — Für No-Code-Creators</h1>
        <p>
          Veröffentliche deine No-Code-Projekte in wenigen Sekunden auf GitHub – ohne Git, ohne
          Terminal, ohne Setup. GitPusher.ai wandelt Exporte und ZIP-Dateien in saubere Repositories
          um.
        </p>
      </header>

      <section>
        <h2>1. Vorteile für No-Code-Creators</h2>
        <ul>
          <li>Kein Git-Client oder Kommandozeile erforderlich.</li>
          <li>Kompatibel mit Webflow, Bubble, Framer, Notion usw.</li>
          <li>Automatisches README, .gitignore und erster Commit.</li>
          <li>Unterstützt GitHub, GitLab, Bitbucket, Gitea und mehr.</li>
        </ul>
      </section>

      <section>
        <h2>2. Typische Anwendungsfälle</h2>
        <ul>
          <li>Webflow-Export → GitHub für Entwickler.</li>
          <li>Kundenprojekte als versionierte Repositories.</li>
          <li>Prototypen aus KI-Tools als Git-Repo speichern.</li>
        </ul>
      </section>

      <section>
        <h2>3. Funktionsweise</h2>
        <ol>
          <li>Projekt exportieren (ZIP oder Ordner).</li>
          <li>Bei GitPusher.ai hochladen.</li>
          <li>Git-Provider auswählen.</li>
          <li>Repository wird automatisch erstellt.</li>
        </ol>
      </section>

      <footer style={{ marginTop: "32px", fontSize: "0.9rem", opacity: 0.8 }}>
        <p>GitPusher.ai — die GitHub-Abkürzung für No-Code-Creators im DACH-Raum.</p>
      </footer>
    </main>
  );
}
