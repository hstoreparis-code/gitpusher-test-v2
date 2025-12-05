import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, Globe2, Radar, Rocket } from "lucide-react";
import AIMeta from "../components/AIMeta";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

export const metadata = {
  title: "Admin — AI Indexing Dashboard",
  description:
    "Tracks which AI systems (ChatGPT, Claude, Gemini, Qwen, Kimi, Ernie…) have indexed GitPusher.",
  robots: "noindex, nofollow",
};

function Box({ title, children }) {
  return (
    <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-slate-300 space-y-1">{children}</CardContent>
    </Card>
  );
}

function Tag({ ok }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        ok
          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40"
          : "bg-red-500/10 text-red-300 border border-red-400/40"
      }`}
    >
      {ok ? "Indexed" : "Not detected"}
    </span>
  );
}

export default function AdminAIIndexingDashboard() {
  const navigate = useNavigate();
  const [indexing, setIndexing] = useState(null);

  useEffect(() => {
    async function loadIndexing() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/ai-indexing`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to load admin AI indexing");
        }
        const data = await res.json();
        setIndexing(data || {});
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load /api/admin/ai-indexing", e);
        setIndexing({ error: true });
      }
    }

    loadIndexing();
  }, []);

  const isLoading = indexing === null;
  const hasError = indexing?.error;
  const score = typeof indexing?.score === "number" ? indexing.score : 0;
  const autofix = indexing?.autofix || (hasError ? "Erreur lors du chargement des données d'indexation IA." : "Analyse en cours…");
  const updatedAt = indexing?.updated_at || null;
  const rawSources = Array.isArray(indexing?.raw_sources) ? indexing.raw_sources : [];

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
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">AI Indexing Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Suivi de la couverture de GitPusher auprès des assistants, agents et crawlers IA.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className="text-xs px-3 py-1 rounded-full border bg-cyan-500/10 text-cyan-200 border-cyan-400/50">
            <span className="inline-flex items-center gap-1">
              <Radar className="w-3 h-3" />
              <span>Score visibilité : {score}/100</span>
            </span>
          </Badge>
        </div>
      </header>

      {/* Top summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              AI Visibility Score
            </CardTitle>
            <Activity className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="text-xs text-slate-300 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-emerald-300">{score}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Basé sur les fichiers V3/V4 et le trafic IA réel analysé par <code className="bg-slate-900 px-1 rounded">/api/ai/health</code>.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              Status des majors IA
            </CardTitle>
            <Globe2 className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="text-xs text-slate-300 space-y-1">
            <p className="text-[11px] text-slate-400 mb-1">Couverture principale :</p>
            <ul className="space-y-0.5">
              <li>
                ChatGPT / OpenAI <Tag ok={!!indexing?.chatgpt} />
              </li>
              <li>
                Claude <Tag ok={!!indexing?.claude} />
              </li>
              <li>
                Google Gemini <Tag ok={!!indexing?.gemini} />
              </li>
              <li>
                Mistral <Tag ok={!!indexing?.mistral} />
              </li>
              <li>
                Perplexity <Tag ok={!!indexing?.perplexity} />
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              AutoFix & Recommandations
            </CardTitle>
            <Rocket className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent className="text-xs text-slate-300 space-y-2">
            <p>{autofix}</p>
            <p className="text-[11px] text-slate-500">
              Message généré dynamiquement en fonction des providers IA détectés dans les logs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed coverage */}
      <div className="grid gap-4 md:grid-cols-2">
        <Box title="LLM Coverage (Major AI)">
          <ul className="space-y-1">
            <li>
              ChatGPT / OpenAI <Tag ok={!!indexing?.chatgpt} />
            </li>
            <li>
              Claude <Tag ok={!!indexing?.claude} />
            </li>
            <li>
              Google Gemini <Tag ok={!!indexing?.gemini} />
            </li>
            <li>
              Mistral <Tag ok={!!indexing?.mistral} />
            </li>
            <li>
              Perplexity <Tag ok={!!indexing?.perplexity} />
            </li>
          </ul>
        </Box>

        <Box title="Asia AI Ecosystem">
          <ul className="space-y-1">
            <li>
              Qwen (Alibaba) <Tag ok={!!indexing?.qwen} />
            </li>
            <li>
              Kimi AI <Tag ok={!!indexing?.kimi} />
            </li>
            <li>
              Baidu ERNIE <Tag ok={!!indexing?.ernie} />
            </li>
            <li>
              iFlyTek Spark <Tag ok={!!indexing?.spark} />
            </li>
          </ul>
        </Box>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Box title="Developer Agents">
          <ul className="space-y-1">
            <li>
              HuggingFace Agents <Tag ok={!!indexing?.huggingface} />
            </li>
            <li>
              Cursor AI <Tag ok={!!indexing?.cursor} />
            </li>
            <li>
              Replit Agent <Tag ok={!!indexing?.replit} />
            </li>
            <li>
              GitHub Copilot Workspace <Tag ok={!!indexing?.copilot} />
            </li>
          </ul>
        </Box>

        <Box title="Search AI / Meta Crawlers">
          <ul className="space-y-1">
            <li>
              Bing Chat / Copilot <Tag ok={!!indexing?.bing} />
            </li>
            <li>
              DuckDuckGo AI <Tag ok={!!indexing?.ddg} />
            </li>
            <li>
              ArXiv / Papers with Code Bots <Tag ok={!!indexing?.arxiv} />
            </li>
          </ul>
        </Box>
      </div>
    </main>
  );
}
