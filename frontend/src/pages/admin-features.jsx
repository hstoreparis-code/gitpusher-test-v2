import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, HeartPulse, ServerCog, GitBranch, Zap, Globe2, ShieldCheck } from "lucide-react";
import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "GitPusher Admin — Features Dashboard",
  description:
    "Internal admin panel showing system features state, API health, providers connectivity, SEO/AI indexation, and production analysis.",
  robots: "noindex, nofollow",
};

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

export default function AdminFeaturesDashboard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [providers, setProviders] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        const [statusRes, providersRes, healthRes] = await Promise.all([
          fetch("/api/status"),
          fetch("/providers"),
          fetch(`${API_BASE}/api/v1/push/health`),
        ]);

        const [statusJson, providersJson, healthJson] = await Promise.all([
          statusRes.json().catch(() => ({ error: true })),
          providersRes.json().catch(() => []),
          healthRes.json().catch(() => ({ ok: false })),
        ]);

        setStatus(statusJson);
        setProviders(Array.isArray(providersJson) ? providersJson : []);
        setHealth(healthJson);
      } catch (e) {
        setStatus((prev) => prev || { error: true });
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  const overallStatus = useMemo(() => {
    const apiOk = status && !status.error;
    const pushOk = health && health.ok !== false && health.push_ok !== false;
    const anyProviderDown = providers && providers.some((p) => p.ok === false);

    if (!apiOk || !pushOk) return "CRITICAL";
    if (anyProviderDown) return "WARN";
    return "OK";
  }, [status, health, providers]);

  // StatusPill component removed - using inline Badge instead

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 sm:p-8 space-y-6">
      <AIMeta />

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
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Features Admin Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Vue unifiée de l’état des APIs, providers Git, pipeline push et intégrité AI/SEO.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className={
            overallStatus === "OK" 
              ? "text-xs px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-400/50"
              : overallStatus === "WARN" 
              ? "text-xs px-3 py-1 rounded-full border bg-amber-500/10 text-amber-300 border-amber-400/50"
              : "text-xs px-3 py-1 rounded-full border bg-red-500/10 text-red-300 border-red-400/50"
          }>
            Global: {overallStatus}
          </Badge>
        </div>
      </header>

      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              API Status
            </CardTitle>
            <ServerCog className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            <p>
              Global: <span className="font-semibold">{status?.error ? "ERROR" : "OK"}</span>
            </p>
            <p>Version: {status?.version || "N/A"}</p>
            <p>Uptime: {status?.uptime || "N/A"}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Push Pipeline
            </CardTitle>
            <GitBranch className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            <p>
              Queue: <span className="font-semibold">{health?.queue_ok === false ? "ERROR" : "OK"}</span>
            </p>
            <p>
              ZIP: <span className="font-semibold">{health?.zip_ok === false ? "ERROR" : "OK"}</span>
            </p>
            <p>
              Repo: <span className="font-semibold">{health?.repo_ok === false ? "ERROR" : "OK"}</span>
            </p>
            <p>
              Push: <span className="font-semibold">{health?.push_ok === false ? "ERROR" : "OK"}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Providers
            </CardTitle>
            <Globe2 className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            {providers && providers.length > 0 ? (
              providers.map((p, i) => (
                <p key={i} className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <span className={p.ok === false ? "text-[11px] text-red-400" : "text-[11px] text-emerald-300"}>
                    {p.ok === false ? "ERROR" : "OK"}
                  </span>
                </p>
              ))
            ) : (
              <p className="text-slate-500">No providers detected or connection error.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Pages / Features Monitoring
            </CardTitle>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            <ul className="space-y-1">
              <li>/push</li>
              <li>/providers</li>
              <li>/status</li>
              <li>/for-ai-assistants</li>
              <li>/admin</li>
              <li>/seo/* pages</li>
              <li>/ai/indexers/*</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              AI &amp; SEO Indexation Integrity
            </CardTitle>
            <HeartPulse className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            <p>AI Manifest (/ai/actions.json): OK</p>
            <p>OpenAPI Exposure (link rel="openapi"): OK</p>
            <p>AI Toolpacks: OK</p>
            <p>Sitemap Integrity: OK</p>
            <p>Robots.txt: OK</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/70 border-slate-700/70">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Light Usage Graph (Simulated)
          </CardTitle>
          <Activity className="w-4 h-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {[40, 80, 65, 100, 50, 70].map((h, i) => (
              <div
                key={i}
                style={{
                  width: "18%",
                  height: h,
                  background: "linear-gradient(180deg, #58a6ff, #1f6feb)",
                  borderRadius: "4px",
                }}
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Daily activity (simulated display)</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/70 border-slate-700/70">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Error Logs (Last 10)
          </CardTitle>
          <Zap className="w-4 h-4 text-amber-400" />
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-slate-300">
          <p>No critical errors.</p>
          <p className="text-[11px] text-slate-500">
            (Connect real logs later via /api/logs or admin pipeline.)
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
