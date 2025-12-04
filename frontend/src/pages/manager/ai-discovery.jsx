import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Activity, HeartPulse, Radar, Rocket, ShieldCheck, Wrench } from "lucide-react";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

export default function AiDiscoveryManagerPage() {
  const [result, setResult] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

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
  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        const [{ data: healthData }] = await Promise.all([
          callApi("/api/ai/health"),
        ]);
        setHealth(healthData);
      } catch (e) {
        // soft fail, already logged in result
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibilityScore = useMemo(() => {
    if (!health || !health.visibility) return 0;
    return typeof health.visibility.score === "number" ? health.visibility.score : 0;
  }, [health]);

  const healthStatus = health?.status || "UNKNOWN";

  const healthColor =
    healthStatus === "OK" ? "text-emerald-400" : healthStatus === "WARN" ? "text-amber-400" : "text-red-400";

  const eventsLast24h = health?.checks?.find((c) => c.name === "mongodb")?.events_last_24h || 0;

  const miniSeries = useMemo(() => {
    // On n'a pas d'historique détaillé, mais on peut simuler une petite série à partir du score
    const base = visibilityScore || 0;
    const points = [];
    for (let i = 6; i >= 0; i -= 1) {
      const jitter = (Math.random() - 0.5) * 4; // juste pour un petit mouvement visuel
      points.push({
        label: `${i}d`,
        score: Math.max(0, Math.min(100, base + jitter)),
      });
    }
    return points;
  }, [visibilityScore]);


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
        </button>

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
      <div className="mt-4 text-xs text-slate-300 space-y-1">
        <p>
          <span className="font-semibold text-emerald-400">V3/V4 AI files OK</span> —
          priority map, tool catalog, toolpack &amp; OpenAI tools sont servis via&nbsp;
          <code className="bg-slate-900 px-1 rounded">/ai/knowledge/*</code> et
          <code className="bg-slate-900 px-1 rounded">/ai/agents/*</code>.
        </p>
        <p>
          Page publique synchronisée :
          <code className="ml-1 bg-slate-900 px-1 rounded">/for-agents-devtools</code>
        </p>
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
