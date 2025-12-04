import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "GitPusher.ai — Para Criadores No-Code",
  description:
    "A maneira mais fácil para criadores no-code publicarem projetos no GitHub. Upload, push e repositórios limpos, sem usar Git.",
  robots: "index, follow",
};

export default function ForNocodeBuildersPTPage() {
  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <AIMeta />
      <header>
        <h1>GitPusher.ai — Para Criadores No-Code</h1>
        <p>
          Publique seus projetos no-code no GitHub em segundos. Sem Git, sem terminal, sem dor de
          cabeça. O GitPusher.ai transforma seus exports e ZIPs em repositórios organizados.
        </p>
      </header>

      <section>
        <h2>1. Por que usar GitPusher com no-code?</h2>
        <ul>
          <li>Não é necessário instalar Git ou GitHub Desktop.</li>
          <li>Compatível com Webflow, Bubble, Framer, Notion, Glide, Adalo e outros.</li>
          <li>Cria README, .gitignore e o primeiro commit automaticamente.</li>
          <li>Funciona com GitHub, GitLab, Bitbucket, Gitea e mais.</li>
        </ul>
      </section>

      <section>
        <h2>2. Casos de uso no Brasil</h2>
        <ul>
          <li>Projetos Webflow ou Bubble usados em agências.</li>
          <li>Entregas para clientes com código versionado.</li>
          <li>Protótipos gerados por IA para startups brasileiras.</li>
        </ul>
      </section>

      <section>
        <h2>3. Como funciona na prática</h2>
        <ol>
          <li>Exporte seu projeto no-code como ZIP.</li>
          <li>Envie para o GitPusher.ai.</li>
          <li>Escolha o provedor Git.</li>
          <li>O repositório é criado automaticamente.</li>
        </ol>
      </section>

      <footer style={{ marginTop: "32px", fontSize: "0.9rem", opacity: 0.8 }}>
        <p>GitPusher.ai — controle de versão para criadores no-code no Brasil e no mundo.</p>
      </footer>
    </main>
  );
}
