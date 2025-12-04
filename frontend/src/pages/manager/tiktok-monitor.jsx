import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowLeft, Globe2, Play, TrendingUp } from "lucide-react";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

export default function TiktokSeoMonitorManagerPage() {
  const navigate = useNavigate();
  const [seo, setSeo] = useState(null);
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchSeo() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/tiktok/seo-monitor`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      setSeo(data);
      setRaw({ ok: res.ok, status: res.status, data });
    } catch (e) {
      setError(String(e));
      setRaw({ ok: false, status: 0, data: { error: String(e) } });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSeo();
  }, []);

  const summary = seo?.summary || {};
  const views = summary.total_views_28d || 0;
  const clicks = summary.total_clicks_28d || 0;
  const avgWatch = summary.avg_watch_time_s || 0;
  const engagement = summary.avg_engagement_rate || 0;
  const connected = seo?.tiktok_connected === true;

  const timeseries = useMemo(() => {
    if (seo?.timeseries && seo.timeseries.length > 0) {
      return seo.timeseries;
    }
    return [];
  }, [seo]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 sm:p-8 space-y-6">
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
              Til Tok SEO Monitor
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Vue d’ensemble SEO/TikTok prête pour une future connexion à l’API TikTok (vues, clics, engagement…).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge
            className={`text-xs px-3 py-1 rounded-full border ${
              connected
                ? "bg-emerald-500/10 border-emerald-400/50 text-emerald-300"
                : "bg-amber-500/10 border-amber-400/50 text-amber-300"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Globe2 className="w-3 h-3" />
              <span>{connected ? "TikTok: connecté" : "TikTok: non connecté"}</span>
            </span>
          </Badge>
        </div>
      </header>

      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Vues (28 jours)
            </CardTitle>
            <Play className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-300">{views}</p>
            <p className="text-xs text-slate-400 mt-1">Somme des vues vidéos TikTok (placeholder).</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Clics (28 jours)
            </CardTitle>
            <Activity className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-300">{clicks}</p>
            <p className="text-xs text-slate-400 mt-1">Nombre total de clics sortants mesurés.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Watch time moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-300">{avgWatch.toFixed(1)}s</p>
            <p className="text-xs text-slate-400 mt-1">Temps de visionnage moyen estimé.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Taux d’engagement
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-violet-300">{engagement.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">Likes, commentaires, partages / vues.</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeseries chart */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Évolution des vues (28 jours)
        </h2>
        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardContent className="pt-4 h-56">
            {timeseries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeseries} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tiktokViewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
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
                    dataKey="views"
                    stroke="#ec4899"
                    fill="url(#tiktokViewsGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">
                Aucune donnée TikTok disponible pour le moment. L’intégration API pourra alimenter ce graphe.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Raw JSON + erreurs */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Dernière réponse brute /api/tiktok/seo-monitor</h2>
          {loading && <span className="text-[11px] text-slate-400">Chargement…</span>}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {raw ? (
          <pre className="mt-2 whitespace-pre-wrap break-all text-xs bg-slate-900/70 border border-slate-800 rounded p-3 overflow-x-auto">
            {JSON.stringify(raw, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-slate-500">
            Aucune requête encore lancée. Les données se chargeront automatiquement à l’ouverture de cette page.
          </p>
        )}
      </section>
    </main>
  );
}
