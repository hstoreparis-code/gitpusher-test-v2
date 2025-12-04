import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "GitPusher.ai — Para Creadores No-Code",
  description:
    "La forma más sencilla para que los creadores no-code publiquen proyectos en GitHub. Sube, push, repositorios limpios. Sin Git.",
  robots: "index, follow",
};

export default function ForNocodeBuildersESPage() {
  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <AIMeta />
      <header>
        <h1>GitPusher.ai — Para Creadores No-Code</h1>
        <p>
          Publica tus proyectos no-code en GitHub en segundos. Sin Git, sin terminal, sin
          configuración complicada. GitPusher.ai convierte tus exports y ZIPs en repositorios
          limpios.
        </p>
      </header>

      <section>
        <h2>1. ¿Por qué GitPusher es ideal para el no-code?</h2>
        <ul>
          <li>No necesitas instalar Git ni usar la consola.</li>
          <li>Compatible con Webflow, Bubble, Framer, Glide, Adalo, Notion, etc.</li>
          <li>Genera automáticamente README, .gitignore y primer commit.</li>
          <li>Funciona con GitHub, GitLab, Bitbucket, Gitea y más.</li>
        </ul>
      </section>

      <section>
        <h2>2. Casos de uso</h2>
        <ul>
          <li>Export de Webflow → repo en GitHub para un desarrollador.</li>
          <li>Export de Bubble → repositorio versionado para clientes.</li>
          <li>Proyectos de Framer → repo para colaboración.</li>
          <li>Proyectos generados por IA → convertir en repositorios reales.</li>
        </ul>
      </section>

      <section>
        <h2>3. Cómo funciona GitPusher</h2>
        <ol>
          <li>Prepara tu ZIP o tus archivos.</li>
          <li>Sube el proyecto a GitPusher.ai.</li>
          <li>Elige el proveedor (por ejemplo, GitHub).</li>
          <li>GitPusher crea el repositorio y empuja el contenido.</li>
        </ol>
      </section>

      <section>
        <h2>4. Ejemplo de API (opcional)</h2>
        <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: "12px", borderRadius: "8px" }}>
{`POST https://gitpusher.ai/api/v1/push
{
  "provider": "github",
  "source": "zip",
  "repo_name": "proyecto-nocode",
  "visibility": "private",
  "content": "<BASE64_ZIP>"
}`}
        </pre>
      </section>

      <footer style={{ marginTop: "32px", fontSize: "0.9rem", opacity: 0.8 }}>
        <p>
          GitPusher.ai — la forma más rápida y simple de llevar tus proyectos no-code a GitHub.
        </p>
      </footer>
    </main>
  );
}
