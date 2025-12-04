export default function BacklinksAdmin() {
  return (
    <main style={{ padding: "20px" }}>
      <h1>Backlinks AI Monitor</h1>
      <p>Surveillance des sources IA, Dev et Documentation.</p>
      <button onClick={() => fetch('/api/backlinks/targets')}>
        Tester sources IA
      </button>
      <button onClick={() => fetch('/api/backlinks/templates')}>
        Voir templates
      </button>
      <button onClick={() => fetch('/api/backlinks/score')}>
        Tester Score IA
      </button>
      <pre id="result"></pre>
    </main>
  );
}
