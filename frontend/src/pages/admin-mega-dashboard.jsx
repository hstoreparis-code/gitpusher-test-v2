import { useEffect, useState } from "react";
import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "GitPusher Admin — Mega Dashboard",
  description: "Unified admin dashboard for performance, AI indexing, push analytics & user intelligence.",
  robots: "noindex, nofollow",
};

export default function AdminMegaDashboard() {
  const [perf, setPerf] = useState(null);
  const [ai, setAI] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch("/api/admin/performance")
      .then((r) => r.json())
      .then(setPerf)
      .catch(() => setPerf({ error: true }));

    fetch("/api/admin/ai-indexing")
      .then((r) => r.json())
      .then(setAI)
      .catch(() => setAI({ error: true }));

    fetch("/api/admin/analytics/pushes")
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => setAnalytics({ error: true }));
  }, []);

  const Box = ({ title, children }) => (
    <div style={{
      padding: "20px",
      marginBottom: "24px",
      borderRadius: "12px",
      background: "#0d1117",
      border: "1px solid #222",
      color: "white"
    }}>
      <h2>{title}</h2>
      {children}
    </div>
  );

  const Tag = ({ ok }) => (
    <span style={{
      padding: "3px 8px",
      background: ok ? "#0f0a" : "#f002",
      borderRadius: "8px",
      color: ok ? "lime" : "red",
      marginLeft: "8px"
    }}>
      {ok ? "OK" : "ERROR"}
    </span>
  );

  const Graph = ({ values, color }) => (
    <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "110px" }}>
      {values.map((h, i) => (
        <div key={i} style={{
          width: `${100 / values.length - 2}%`,
          height: h,
          background: color,
          borderRadius: "4px"
        }}></div>
      ))}
    </div>
  );

  return (
    <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <AIMeta />
      <h1>GitPusher — Admin Mega Dashboard</h1>
      <p style={{ opacity: 0.7 }}>
        Unified monitoring of system performance, AI indexing coverage, push analytics & user intelligence.
      </p>

      {/* ====================================================== */}
      {/* 1️⃣ PERFORMANCE DASHBOARD */}
      {/* ====================================================== */}
      <Box title="1 — System Performance">
        {perf ? (
          <>
            <p>API Health: <Tag ok={!perf.error} /></p>
            <p>Uptime: {perf.uptime || "N/A"}</p>
            <p>CPU Load: {perf.cpu || 0}%</p>
            <p>Memory Usage: {perf.memory || 0}%</p>
            <p>Job Queue: {perf.queue_size || 0}</p>

            <h3>Latency (ms)</h3>
            {perf.latency_samples && (
              <Graph
                values={perf.latency_samples}
                color="linear-gradient(180deg,#58a6ff,#1f6feb)"
              />
            )}

            <h3>CPU Graph</h3>
            {perf.cpu_samples && (
              <Graph
                values={perf.cpu_samples}
                color="linear-gradient(180deg,#ffb340,#ff8c00)"
              />
            )}

            <h3>Memory Graph</h3>
            {perf.memory_samples && (
              <Graph
                values={perf.memory_samples}
                color="linear-gradient(180deg,#40ffbf,#00c78c)"
              />
            )}
          </>
        ) : (
          <p>Loading performance data…</p>
        )}
      </Box>

      {/* ====================================================== */}
      {/* 2️⃣ AI INDEXING DASHBOARD */}
      {/* ====================================================== */}
      <Box title="2 — AI Indexing Coverage (Ultra Detailed)">
        {ai ? (
          <>
            <p>Global AI Index Score: {ai.score || 0} / 100</p>

            <h3>Major LLMs</h3>
            <ul>
              <li>ChatGPT <Tag ok={ai.chatgpt} /></li>
              <li>Claude <Tag ok={ai.claude} /></li>
              <li>Gemini <Tag ok={ai.gemini} /></li>
              <li>Mistral <Tag ok={ai.mistral} /></li>
              <li>Perplexity <Tag ok={ai.perplexity} /></li>
            </ul>

            <h3>Asia AI Ecosystem</h3>
            <ul>
              <li>Qwen <Tag ok={ai.qwen} /></li>
              <li>Kimi <Tag ok={ai.kimi} /></li>
              <li>ERNIE <Tag ok={ai.ernie} /></li>
              <li>Spark <Tag ok={ai.spark} /></li>
            </ul>

            <h3>Developer Agents</h3>
            <ul>
              <li>Cursor <Tag ok={ai.cursor} /></li>
              <li>Replit Agent <Tag ok={ai.replit} /></li>
              <li>GitHub Copilot Workspace <Tag ok={ai.copilot} /></li>
              <li>HuggingFace Agents <Tag ok={ai.huggingface} /></li>
            </ul>

            <h3>Search AI & Crawlers</h3>
            <ul>
              <li>Bing Chat <Tag ok={ai.bing} /></li>
              <li>DuckDuckGo AI <Tag ok={ai.ddg} /></li>
              <li>ArXiv Bots <Tag ok={ai.arxiv} /></li>
            </ul>

            <h3>AutoFix Recommendation</h3>
            <p>{ai.autofix || "No issues detected."}</p>
          </>
        ) : (
          <p>Loading AI indexing data…</p>
        )}
      </Box>

      {/* ====================================================== */}
      {/* 3️⃣ PUSH ANALYTICS + USER INTELLIGENCE */}
      {/* ====================================================== */}
      <Box title="3 — Push Analytics & User Intelligence">
        {analytics ? (
          <>
            <h3>Pushes Over Time</h3>
            {analytics.push_samples && (
              <Graph
                values={analytics.push_samples}
                color="linear-gradient(180deg,#e65cff,#a31aff)"
              />
            )}

            <h3>Top Providers</h3>
            <ul>
              {analytics.providers?.map((p, i) => (
                <li key={i}>{p.name} — {p.count} pushes</li>
              ))}
            </ul>

            <h3>Top Countries</h3>
            <ul>
              {analytics.countries?.map((c, i) => (
                <li key={i}>{c.country} — {c.count}</li>
              ))}
            </ul>

            <h3>Top Users</h3>
            <ul>
              {analytics.users?.map((u, i) => (
                <li key={i}>{u.email} — {u.pushes} pushes</li>
              ))}
            </ul>

            <h3>Conversion & Churn Estimates</h3>
            <p>Conversion rate: {analytics.conversion || "N/A"}%</p>
            <p>Churn probability: {analytics.churn || "N/A"}%</p>
          </>
        ) : (
          <p>Loading analytics…</p>
        )}
      </Box>

    </main>
  );
}
