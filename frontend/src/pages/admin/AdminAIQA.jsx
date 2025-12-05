import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIMeta from "../../components/AIMeta";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

export default function AdminAIQA() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/ai-qa`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        setData(json || {});
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load /api/admin/ai-qa", e);
        setError("Impossible de charger l'analyse IA QA. Vérifie les logs backend ou le fichier logs/gitpusher.log.");
        setData({ ai_score: 0, verdict: "ERROR", issues: ["Backend IA QA non disponible"] });
      }
    }

    load();
  }, []);

  const isLoading = !data && !error;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 sm:p-8 space-y-6">
      <AIMeta />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)] border border-cyan-300/80"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">AI QA Analyzer</h1>
            <p className="text-sm text-slate-400 mt-1">
              Analyse automatique des logs GitPusher pour détecter les anomalies, risques et pistes d&apos;amélioration.
            </p>
          </div>
        </div>
        {data && (
          <div className="flex flex-wrap gap-2 items-center">
            <Badge className="text-xs px-3 py-1 rounded-full border bg-cyan-500/10 text-cyan-200 border-cyan-400/50">
              <span className="inline-flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>Score IA QA : {data.ai_score ?? 0}/100</span>
              </span>
            </Badge>
            <Badge
              className={`text-xs px-3 py-1 rounded-full border ${
                data.verdict === "OK"
                  ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/60"
                  : "bg-red-500/10 text-red-200 border-red-400/60"
              }`}
            >
              Verdict : {data.verdict || "N/A"}
            </Badge>
          </div>
        )}
      </header>

      {isLoading && (
        <p className="text-sm text-slate-300">Chargement de l&apos;analyse IA QA…</p>
      )}

      {!isLoading && (
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-900/70 border-slate-700/70 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
                Synthèse de l&apos;analyse IA QA
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-200 space-y-2">
              <p>
                Score global calculé par l&apos;analyseur IA à partir des logs d&apos;exécution GitPusher. Plus le score est haut,
                plus la plateforme est stable, observée et conforme.
              </p>
              {error && (
                <p className="text-xs text-red-400 mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-slate-700/70">
            <CardHeader>
              <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-300" />
                Issues détectées
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-200">
              <ul className="list-disc list-inside space-y-1 text-xs">
                {data?.issues && data.issues.length > 0 ? (
                  data.issues.map((i, idx) => <li key={idx}>{i}</li>)
                ) : (
                  <li>Aucune issue détectée.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
