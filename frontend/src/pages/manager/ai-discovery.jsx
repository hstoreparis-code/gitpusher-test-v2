import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

export default function AiDiscoveryManagerPage() {
  const [result, setResult] = useState(null);

  async function callApi(path, options) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...(options || {}),
        headers: {
          "Content-Type": "application/json",
          ...(options && options.headers),
        },
      });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }
      setResult({ ok: res.ok, status: res.status, data });
      return { res, data };
    } catch (e) {
      setResult({ ok: false, status: 0, data: { error: String(e) } });
      throw e;
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">AI Discovery Dashboard</h1>

      <div className="flex flex-wrap gap-3 mb-4">
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
          }}
        >
          Tester 80 Indexeurs IA
        </button>

        <button
          onClick={async () => {
            await callApi("/api/admin/ai-autofix", { method: "POST" });
          }}
          style={{
            padding: "8px 16px",
            background: "#0070f3",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Run Admin AutoFix
        </button>

        <button
          onClick={() => callApi("/api/ai/score")}
          style={{
            padding: "8px 16px",
            background: "#22c55e",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Tester AI Score
        <button
          onClick={async () => {
            const res = await fetch("/ai/score");
            const json = await res.json();
            alert("IA Visibility Score: " + json.score + "/100");
          }}
          style={{
            padding: "8px 16px",
            background: "#00c853",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "16px",
            marginRight: "8px",
          }}
        >
          Tester IA Visibility Score
        </button>

        <button
          onClick={async () => {
            const res = await fetch("/ai/agents/toolpack");
            if (res.ok) {
              alert("Toolpack agents accessible.");
            } else {
              alert("Erreur accès toolpack.");
            }
          }}
          style={{
            padding: "8px 16px",
            background: "#2962ff",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          Tester IA Agents (Toolpack)
        </button>

        </button>

        <button
          onClick={() => callApi("/api/ai/health")}
          style={{
            padding: "8px 16px",
            background: "#0ea5e9",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Tester AI Health
        </button>

        <button
          onClick={() => callApi("/api/ai/autofix", { method: "POST" })}
          style={{
            padding: "8px 16px",
            background: "#f97316",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Lancer AI AutoFix (public)
        </button>
      </div>

      <p className="text-sm text-slate-400">
        This dashboard ensures all AI indexers and knowledge files stay valid so that AI discovery of GitPusher.ai
        remains 100% operational.
      </p>

      <p>
        Cette section est optimisée pour 80 indexeurs IA potentiels, via
        <code className="ml-1 text-xs">/ai/indexers/ai-80-indexers.json</code>.
      </p>

      {result && (
        <pre className="mt-4 whitespace-pre-wrap break-all text-xs bg-slate-900/70 border border-slate-800 rounded p-3 overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
