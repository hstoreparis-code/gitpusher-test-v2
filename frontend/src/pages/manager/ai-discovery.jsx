import React from "react";

export default function AiDiscoveryManagerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <h1 className="text-2xl font-semibold mb-4">AI Discovery Dashboard</h1>

      <button
        onClick={async () => {
          const res = await fetch("/ai/indexers/80");
          if (res.ok) {
            alert("80-indexers.json est servi correctement.");
          } else {
            alert("Erreur d’accès à /ai/indexers/80");
          }
        }}
        style={{
          padding: "8px 16px",
          background: "#6200ea",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "16px",
          marginRight: "8px",
        }}
      >
        Tester 80 Indexeurs IA
      </button>

      <button
        onClick={async () => {
          await fetch("/admin/ai-autofix", { method: "POST" });
          window.location.reload();
        }}
        style={{
          padding: "8px 16px",
          background: "#0070f3",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Run AutoFix
      </button>

      <p className="text-sm text-slate-400">
        This dashboard ensures all AI indexers and knowledge files stay valid so that AI discovery of GitPusher.ai
        remains 100% operational.
      </p>

      <p>
        Cette section est optimisée pour 80 indexeurs IA potentiels, via
        <code className="ml-1 text-xs">/ai/indexers/ai-80-indexers.json</code>.
      </p>
    </main>
  );
}
