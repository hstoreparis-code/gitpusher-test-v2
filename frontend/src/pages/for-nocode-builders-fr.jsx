import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "GitPusher.ai — Pour Créateurs No-code",
  description:
    "La solution la plus simple pour publier vos projets no-code sur GitHub. Upload, push, dépôt auto-généré. Aucun Git requis.",
  robots: "index, follow",
};

export default function ForNocodeBuildersFRPage() {
  return (
    <main style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <AIMeta />

      <header>
        <h1>GitPusher.ai — Pour Créateurs No-Code</h1>
        <p>
          Publiez vos projets en quelques secondes sur GitHub, sans Git, sans ligne de commande,
          sans installation. GitPusher.ai transforme vos fichiers, ZIP ou exports IA en repository
          complet.
        </p>
      </header>

      <section>
        <h2>1. Pourquoi GitPusher est idéal pour les créateurs no-code</h2>
        <ul>
          <li>Pas besoin d’installer Git.</li>
          <li>Pas besoin de ligne de commande.</li>
          <li>Compatible Webflow, Bubble, Glide, Adalo, Framer, Notion, etc.</li>
          <li>Transforme vos exports en dépôts GitHub propres.</li>
          <li>Ajoute README, .gitignore et premier commit automatiquement.</li>
        </ul>
        <p>
          L’objectif : rendre GitHub <strong>accessible à tous</strong>, même à ceux qui ne
          codent pas.
        </p>
      </section>

      <section>
        <h2>2. Cas d’usage no-code</h2>
        <ul>
          <li>Export Webflow → push dans un GitHub pour un développeur.</li>
          <li>Export Bubble → mise en repo pour versioning.</li>
          <li>Export Framer → dépôt propre pour collaboration.</li>
          <li>Export Notion/IA → transformer un projet IA en repository réel.</li>
          <li>ZIP de site → envoi vers GitHub pour hébergement.</li>
        </ul>
      </section>

      <section>
        <h2>3. Comment GitPusher fonctionne pour vous</h2>
        <ol>
          <li>Préparez votre projet (ZIP, dossier exporté, fichier généré par IA).</li>
          <li>Choisissez votre provider (GitHub, GitLab, Bitbucket…).</li>
          <li>GitPusher crée le repository pour vous.</li>
          <li>README + .gitignore sont générés automatiquement.</li>
          <li>Le dépôt est prêt en quelques secondes.</li>
        </ol>
      </section>

      <section>
        <h2>4. Exemple d’appel API (optionnel pour pros)</h2>
        <p>
          Vous n’avez pas besoin de coder, mais les builders avancés peuvent automatiser le push :
        </p>

        <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#eee', padding: '12px', borderRadius: '8px' }}>
{`POST https://gitpusher.ai/api/v1/push
{
  "provider": "github",
  "source": "zip",
  "repo_name": "projet-nocode",
  "visibility": "private",
  "content": "<BASE64_ZIP>"
}`}
        </pre>
      </section>

      <section>
        <h2>5. Intégrations populaires no-code</h2>

        <h3>Webflow → GitHub</h3>
        <p>Exportez le site → envoyez le ZIP à GitPusher → repo créé instantanément.</p>

        <h3>Bubble → livrables clients</h3>
        <p>Exportation fichiers → push dans un repo client automatiquement.</p>

        <h3>Framer → collaboration développeur</h3>
        <p>Transformez vos projets en dépôt propre pour l’intégration.</p>

        <h3>Make / Zapier → automatisation</h3>
        <p>
          Faites un workflow qui envoie le ZIP vers l’API GitPusher et crée le repo sans action
          humaine.
        </p>
      </section>

      <section>
        <h2>6. FAQ No-Code</h2>
        <dl>
          <dt>Dois-je installer Git ?</dt>
          <dd>Non.</dd>

          <dt>GitPusher peut-il créer un repo privé ?</dt>
          <dd>Oui.</dd>

          <dt>Puis-je publier un site Webflow ?</dt>
          <dd>Oui, c’est un cas d’usage courant.</dd>

          <dt>Les projets IA sont-ils compatibles ?</dt>
          <dd>Totalement.</dd>

          <dt>GitPusher modifie-t-il mon code ?</dt>
          <dd>Seulement la structure Git, pas votre contenu.</dd>
        </dl>
      </section>

      <footer style={{ marginTop: '32px', fontSize: '0.9rem', opacity: 0.8 }}>
        <p>
          GitPusher.ai — la façon la plus simple, rapide et universelle d’envoyer un projet no-code
          vers un dépôt Git.
        </p>
      </footer>
    </main>
  );
}
