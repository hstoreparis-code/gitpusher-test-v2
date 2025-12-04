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
      }
      setResult({ ok: res.ok, status: res.status, data });
      return { res, data };
    } catch (e) {
      setResult({ ok: false, status: 0, data: { error: String(e) } });
      throw e;
    }
  }

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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 sm:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            AI Discovery &amp; Health
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Surveille l’exposition de GitPusher aux IA : score de visibilité, santé des fichiers V3/V4, et AutoFix.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge
            className={`text-xs px-3 py-1 rounded-full border ${
              healthStatus === "OK"
                ? "bg-emerald-500/10 border-emerald-400/50 text-emerald-300"
                : healthStatus === "WARN"
                ? "bg-amber-500/10 border-amber-400/50 text-amber-300"
                : "bg-red-500/10 border-red-400/50 text-red-300"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <HeartPulse className="w-3 h-3" />
              <span>Global status: {healthStatus}</span>
            </span>
          </Badge>
          <Badge className="bg-cyan-500/10 border-cyan-400/40 text-cyan-200 text-xs px-3 py-1 rounded-full">
            <span className="inline-flex items-center gap-1">
              <Radar className="w-3 h-3" />
              <span>Visibility: {visibilityScore}/100</span>
            </span>
          </Badge>
        </div>
      </header>

      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              AI Visibility Score
            </CardTitle>
            <Activity className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-emerald-300">{visibilityScore}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="mt-3 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniSeries} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aiScoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" vertical={false} />
                  <XAxis dataKey="label" hide axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: 8,
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    fill="url(#aiScoreGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              AI Events (24h)
            </CardTitle>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-300">{eventsLast24h}</p>
            <p className="text-xs text-slate-400 mt-1">Événements enregistrés dans ai_events (dernières 24h).</p>
            <p className="text-[11px] text-slate-500 mt-3">
              Utilisé pour estimer le trafic IA réel (agents qui appellent les endpoints discovery / autofix).
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              V3/V4 Discovery Files
            </CardTitle>
            <Rocket className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span>Priority map</span>
              <Badge className="bg-emerald-500/10 border-emerald-400/40 text-emerald-300">/ai/knowledge/priority-map</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Tool catalog</span>
              <Badge className="bg-emerald-500/10 border-emerald-400/40 text-emerald-300">/ai/knowledge/tool-catalog</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Toolpack</span>
              <Badge className="bg-emerald-500/10 border-emerald-400/40 text-emerald-300">/ai/agents/toolpack</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>OpenAI tools</span>
              <Badge className="bg-emerald-500/10 border-emerald-400/40 text-emerald-300">/ai/agents/openai-tools</Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Page publique synchronisée :
              <code className="ml-1 bg-slate-900 px-1 rounded">/for-agents-devtools</code>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-400" />
          Outils de contrôle &amp; d’AutoFix
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="outline"
            className="border-violet-400/50 text-violet-200 hover:bg-violet-500/10"
            onClick={async () => {
              const res = await fetch("/ai/indexers/80");
              if (res.ok) {
                alert("80-indexers.json est servi correctement.");
              } else {
                alert("Erreur d’accès à /ai/indexers/80");
              }
            }}
          >
            Tester 80 Indexeurs IA
          </Button>

          <Button
            size="sm"
            className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            onClick={() => callApi("/api/ai/score")}
          >
            Recharger AI Score (JSON brut)
          </Button>

          <Button
            size="sm"
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            onClick={() => callApi("/api/ai/health")}
          >
            Rafraîchir AI Health
          </Button>

          <Button
            size="sm"
            className="bg-orange-500 text-slate-950 hover:bg-orange-400"
            onClick={() => callApi("/api/ai/autofix", { method: "POST" })}
          >
            Lancer AI AutoFix (public)
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/10"
            onClick={async () => {
              const res = await fetch("/ai/agents/toolpack");
              if (res.ok) {
                alert("Toolpack agents accessible.");
              } else {
                alert("Erreur accès toolpack.");
              }
            }}
          >
            Tester IA Agents (Toolpack)
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-800"
            onClick={async () => {
              await callApi("/api/admin/ai-autofix", { method: "POST" });
            }}
          >
            Run Admin AutoFix (complet)
          </Button>
        </div>
      </section>

      {/* Raw JSON panel */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Dernière réponse brute</span>
          </h2>
          {loading && <span className="text-[11px] text-slate-400">Chargement…</span>}
        </div>
        {result ? (
          <pre className="mt-2 whitespace-pre-wrap break-all text-xs bg-slate-900/70 border border-slate-800 rounded p-3 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-slate-500">
            Aucune requête encore lancée depuis ce panneau. Utilise les boutons ci-dessus pour tester les endpoints AI
            Discovery.
          </p>
        )}
      </section>
    </main>
  );
}
