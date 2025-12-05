import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AIMeta from "../components/AIMeta";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowLeft,
  Cpu,
  GaugeCircle,
  Globe2,
  Network,
  Server,
  Users,
} from "lucide-react";

export const metadata = {
  title: "GitPusher Admin — Mega Dashboard",
  description:
    "Unified admin dashboard for performance, AI indexing, push analytics & user intelligence.",
  robots: "noindex, nofollow",
};

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

function GraphBars({ values, color }) {
  if (!values || !values.length) {
    return <p className="text-xs text-slate-500">Pas encore de données disponibles.</p>;
  }

  const normalized = values.map((v) => {
    const n = typeof v === "number" ? v : 0;
    return Math.max(4, Math.min(100, n));
  });

  return (
    <div className="flex items-end gap-1 h-24">
      {normalized.map((h, i) => (
        <div
          key={i}
          style={{
            width: `${100 / normalized.length - 2}%`,
            height: `${h}%`,
            background: color,
            borderRadius: 4,
          }}
        />
      ))}
    </div>
  );
}

function Tag({ ok, labelOk = "OK", labelError = "ERROR" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        ok
          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40"
          : "bg-red-500/10 text-red-300 border border-red-400/40"
      }`}
    >
      {ok ? labelOk : labelError}
    </span>
  );
}

export default function AdminMegaDashboard() {
  const navigate = useNavigate();
  const [perf, setPerf] = useState(null);
  const [ai, setAI] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [features, setFeatures] = useState(null);
  const [featuresAutofixing, setFeaturesAutofixing] = useState(false);

  useEffect(() => {
    async function loadAll() {
      try {
        const [perfRes, aiRes, analyticsRes, featuresRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/performance`).catch(() => null),
          fetch(`${API_BASE}/api/admin/ai-indexing`).catch(() => null),
          fetch(`${API_BASE}/api/admin/analytics/pushes`).catch(() => null),
          fetch(`${API_BASE}/api/admin/features/health`).catch(() => null),
        ]);

        if (perfRes && perfRes.ok) {
          const data = await perfRes.json();
          setPerf(data || {});
        } else {
          setPerf({ error: true });
        }

        if (aiRes && aiRes.ok) {
          const data = await aiRes.json();
          setAI(data || {});
        } else {
          setAI({ error: true });
        }

        if (analyticsRes && analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data || {});
        } else {
          setAnalytics({ error: true });
        }

        if (featuresRes && featuresRes.ok) {
          const data = await featuresRes.json();
          setFeatures(data || {});
        } else {
          setFeatures({ error: true });
        }
      } catch {
        // Hard fail-safe: mark everything as error so UI stays lisible
        setPerf((prev) => prev || { error: true });
        setAI((prev) => prev || { error: true });
        setAnalytics((prev) => prev || { error: true });
      }
    }

    loadAll();
  }, []);

  const featuresOverall = features?.overall || null;
  const featuresHealth = features?.health || {};
  const hasFeaturesIssues = featuresOverall === "ISSUES";

  // API considérée "stable" tant qu'aucune erreur explicite n'est renvoyée
  const apiHealthy = perf && perf.error === false;
  const uptime = perf?.uptime || "N/A";
  const cpu = typeof perf?.cpu === "number" ? perf.cpu : null;
  const memory = typeof perf?.memory === "number" ? perf.memory : null;

  const aiScore = typeof ai?.score === "number" ? ai.score : 0;
  const autofixText = typeof ai?.autofix === "string" ? ai.autofix : "";
  // On considère qu'il y a un "problème" tant que le message ne contient pas explicitement OK
  const aiIssues = autofixText && !autofixText.toLowerCase().includes("ok");

  const totalPushes = useMemo(() => {
    if (!analytics) return 0;
    if (typeof analytics.total_pushes === "number") return analytics.total_pushes;
    if (Array.isArray(analytics.push_samples)) {
      return analytics.push_samples.reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0);
    }
    return 0;
  }, [analytics]);

 

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 sm:p-8 space-y-6">
      <AIMeta />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)] border border-cyan-300/80"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Admin Mega Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Vue unifiée des performances système, de la couverture d&apos;indexation IA et des analytics de
              push Git.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className="text-xs px-3 py-1 rounded-full border bg-cyan-500/10 text-cyan-200 border-cyan-400/50">
            <span className="inline-flex items-center gap-1">
              <GaugeCircle className="w-3 h-3" />
              <span>Vue synthèse temps réel (données réelles + fallback léger)</span>
            </span>
          </Badge>
        </div>
      </header>

      {/* Top summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              Système & API
            </CardTitle>
            <Server className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300">
            <p>
              Statut API : <Tag ok={!!apiHealthy} />
            </p>
            <p>Uptime : {uptime}</p>
            <p>CPU : {cpu != null ? `${cpu}%` : "N/A"}</p>
            <p>Mémoire : {memory != null ? `${memory}%` : "N/A"}</p>
            <div className="pt-2 border-t border-slate-800 mt-2 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-[11px] text-slate-400">Features health (Stripe, email, AI, DB…)</p>
                <p className="text-[11px]">
                  <span className="mr-1">AutoFix :</span>
                  <Tag ok={!hasFeaturesIssues} labelOk="OK" labelError="ISSUES" />
                </p>
              </div>
              <Button
                size="xs"
                className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/60 disabled:opacity-60"
                disabled={featuresAutofixing}
                onClick={async () => {
                  try {
                    setFeaturesAutofixing(true);
                    const res = await fetch(`${API_BASE}/api/admin/features/autofix`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      credentials: "include",
                    });
                    // On relit la santé des features après tentative d'autofix
                    const refreshed = await fetch(`${API_BASE}/api/admin/features/health`, {
                      credentials: "include",
                    });
                    if (refreshed.ok) {
                      const data = await refreshed.json();
                      setFeatures(data || {});
                    }
                    // Optionnel : journaliser en console pour debug admin
                    if (res && res.ok) {
                      // eslint-disable-next-line no-console
                      console.info("Features autofix applied");
                    }
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.warn("Features autofix failed", e);
                  } finally {
                    setFeaturesAutofixing(false);
                  }
                }}
              >
                {featuresAutofixing ? "Autofix…" : "Lancer l'autofix"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              AI Indexing
            </CardTitle>
            <Activity className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300">
            <p>
              Score global :
              <span className="ml-1 font-semibold text-emerald-300">{aiScore}</span>
              <span className="text-[10px] text-slate-500 ml-1">/ 100</span>
            </p>
            <p className="flex items-center justify-between gap-2">
              <span>
                AutoFix : <Tag ok={!aiIssues} labelOk="OK" labelError="À corriger" />
              </span>
              <Button
                size="xs"
                className="h-7 px-2 text-[10px] bg-violet-600 hover:bg-violet-500 border border-violet-400/60"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/ai/autofix", { method: "POST" });
                    // Après autofix, on recharge les données AI pour refléter la correction
                    const refreshed = await fetch(`${API_BASE}/api/admin/ai-indexing`);
                    if (refreshed.ok) {
                      const data = await refreshed.json();
                      setAI(data || {});
                    }
                  } catch (e) {
                    // On garde silencieux pour ne pas casser l'UI si l'autofix échoue
                    // eslint-disable-next-line no-console
                    console.warn("AI autofix failed", e);
                  }
                }}
              >
                Lancer l&apos;autofix
              </Button>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              Push Analytics
            </CardTitle>
            <Network className="w-4 h-4 text-pink-400" />
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            <p>
              Total pushes (échantillon) :
              <span className="ml-1 font-semibold text-pink-300">{totalPushes}</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Données issues de <code className="bg-slate-900 px-1 rounded">/api/admin/analytics/pushes</code>.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance + Push graphs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              Performance backend (latence / CPU / mémoire)
            </CardTitle>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-300">
            <div>
              <p className="mb-1 text-[11px] text-slate-400">Latence requêtes (ms)</p>
              <GraphBars
                values={Array.isArray(perf?.latency_samples) ? perf.latency_samples : []}
                color="linear-gradient(180deg,#58a6ff,#1f6feb)"
              />
            </div>
            <div>
              <p className="mb-1 text-[11px] text-slate-400">Charge CPU (%)</p>
              <GraphBars
                values={Array.isArray(perf?.cpu_samples) ? perf.cpu_samples : []}
                color="linear-gradient(180deg,#ffb340,#ff8c00)"
              />
            </div>
            <div>
              <p className="mb-1 text-[11px] text-slate-400">Utilisation mémoire (%)</p>
              <GraphBars
                values={Array.isArray(perf?.memory_samples) ? perf.memory_samples : []}
                color="linear-gradient(180deg,#40ffbf,#00c78c)"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              Pushes Git & activité utilisateur
            </CardTitle>
            <Users className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-300">
            <div>
              <p className="mb-1 text-[11px] text-slate-400">Volume de pushes (série)</p>
              <GraphBars
                values={Array.isArray(analytics?.push_samples) ? analytics.push_samples : []}
                color="linear-gradient(180deg,#e65cff,#a31aff)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <p className="text-slate-400 mb-1">Top providers</p>
                <ul className="space-y-1">
                  {analytics?.providers?.length ? (
                    analytics.providers.map((p, i) => (
                       
                      <li key={i} className="flex items-center justify-between">
                        <span className="truncate max-w-[120px]">{p.name}</span>
                        <span className="ml-2 text-slate-400">{p.count}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">Aucune donnée.</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Top pays</p>
                <ul className="space-y-1">
                  {analytics?.countries?.length ? (
                    analytics.countries.map((c, i) => (
                       
                      <li key={i} className="flex items-center justify-between">
                        <span className="truncate max-w-[120px]">{c.country}</span>
                        <span className="ml-2 text-slate-400">{c.count}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">Aucune donnée.</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI indexing details */}
      <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
            Détail IA & écosystème
          </CardTitle>
          <Globe2 className="w-4 h-4 text-cyan-400" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-xs text-slate-300">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 mb-1">LLMs principaux</p>
            <ul className="space-y-1">
              <li>
                ChatGPT <Tag ok={!!ai?.chatgpt} labelOk="Vu" labelError="Inconnu" />
              </li>
              <li>
                Claude <Tag ok={!!ai?.claude} labelOk="Vu" labelError="Inconnu" />
              </li>
              <li>
                Gemini <Tag ok={!!ai?.gemini} labelOk="Vu" labelError="Inconnu" />
              </li>
              <li>
                Mistral <Tag ok={!!ai?.mistral} labelOk="Vu" labelError="Inconnu" />
              </li>
              <li>
                Perplexity <Tag ok={!!ai?.perplexity} labelOk="Vu" labelError="Inconnu" />
              </li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 mb-1">Agents & écosystème Asie</p>
            <ul className="space-y-1">
              <li>
                Qwen <Tag ok={!!ai?.qwen} labelOk="Vu" labelError="Inconnu" />
              </li>
              <li>
                Kimi <Tag ok={!!ai?.kimi} labelOk="Vu" labelError="Inconnu" />
              </li>
              <li>
                ERNIE <Tag ok={!!ai?.ernie} labelOk="Vu" labelError="Inconnu" />
              </li>
              <li>
                Spark <Tag ok={!!ai?.spark} labelOk="Vu" labelError="Inconnu" />
              </li>
              <li>
                Cursor / Replit / Copilot <Tag ok={!!(ai?.cursor || ai?.replit || ai?.copilot)} labelOk="Touché" labelError="Inconnu" />
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
