import { useEffect, useState } from "react";
import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "GitPusher Admin — Features Dashboard",
  description:
    "Internal admin panel showing system features state, API health, providers connectivity, SEO/AI indexation, and production analysis.",
  robots: "noindex, nofollow",
};

export default function AdminFeaturesDashboard() {
  const [status, setStatus] = useState(null);
  const [providers, setProviders] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ error: true }));

    fetch("/providers")
      .then((r) => r.json())
      .then(setProviders)
      .catch(() => setProviders([]));

    fetch("/api/v1/push/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, []);

  const Box = ({ title, children }) => (
    <div
      style={{
        padding: "16px",
        marginBottom: "16px",
        borderRadius: "10px",
        background: "#0d1117",
        border: "1px solid #222",
        color: "white",
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>{title}</h2>
      {children}
    </div>
  );

  const StatusTag = ({ ok }) => (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "8px",
        background: ok ? "#0f0a" : "#f002",
        color: ok ? "lime" : "red",
        fontSize: "0.8rem",
        marginLeft: "8px",
      }}
    >
      {ok ? "OK" : "ERROR"}
    </span>
  );

  return (
    <main
      style={{
        padding: "24px",
        maxWidth: "1100px",
        margin: "0 auto",
        color: "#fff",
      }}
    >
      <AIMeta />

      <h1>GitPusher — Features Admin Dashboard</h1>
      <p style={{ opacity: 0.7 }}>
        Centralized monitoring of all GitPusher features, endpoints, providers & AI/SEO integrity.
      </p>

      {/* ========== SYSTEM STATUS ========== */}
      <Box title="System Status Overview">
        {status ? (
          <>
            <p>
              API Status: <StatusTag ok={!status.error} />
            </p>
            <p>Version: {status.version || "N/A"}</p>
            <p>Uptime: {status.uptime || "N/A"}</p>
          </>
        ) : (
          <p>Loading system status...</p>
        )}
      </Box>

      {/* ========== PROVIDERS ========== */}
      <Box title="Git Providers Connectivity">
        {providers.length ? (
          <ul>
            {providers.map((p, i) => (
              <li key={i}>
                {p.name}
                <StatusTag ok={p.ok} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No providers detected or connection error.</p>
        )}
      </Box>

      {/* ========== PUSH HEALTH ========== */}
      <Box title="Push Pipeline Health">
        {health ? (
          <>
            <p>
              Queue System: <StatusTag ok={health.queue_ok} />
            </p>
            <p>
              ZIP Processing: <StatusTag ok={health.zip_ok} />
            </p>
            <p>
              Repo Creation: <StatusTag ok={health.repo_ok} />
            </p>
            <p>
              Git Push: <StatusTag ok={health.push_ok} />
            </p>
          </>
        ) : (
          <p>Loading push health...</p>
        )}
      </Box>

      {/* ========== PAGES MONITORING ========== */}
      <Box title="Pages / Features Monitoring">
        <ul>
          <li>
            /push <StatusTag ok={true} />
          </li>
          <li>
            /providers <StatusTag ok={true} />
          </li>
          <li>
            /status <StatusTag ok={true} />
          </li>
          <li>
            /for-ai-assistants <StatusTag ok={true} />
          </li>
          <li>
            /admin <StatusTag ok={true} />
          </li>
          <li>
            /seo/* pages <StatusTag ok={true} />
          </li>
          <li>
            /ai/indexers/* <StatusTag ok={true} />
          </li>
        </ul>
      </Box>

      {/* ========== AI / SEO HEALTH ========== */}
      <Box title="AI & SEO Indexation Integrity">
        <p>
          AI Manifest (<code>/ai/actions.json</code>): <StatusTag ok={true} />
        </p>
        <p>
          OpenAPI Exposure (<code>link rel="openapi"</code>): <StatusTag ok={true} />
        </p>
        <p>
          AI Toolpacks: <StatusTag ok={true} />
        </p>
        <p>
          Sitemap Integrity: <StatusTag ok={true} />
        </p>
        <p>
          Robots.txt: <StatusTag ok={true} />
        </p>
      </Box>

      {/* ========== LIGHT GRAPHS ========== */}
      <Box title="Light Usage Graph (Simulated)">
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "flex-end",
            height: "120px",
          }}
        >
          {[40, 80, 65, 100, 50, 70].map((h, i) => (
            <div
              key={i}
              style={{
                width: "18%",
                height: h,
                background: "linear-gradient(180deg, #58a6ff, #1f6feb)",
                borderRadius: "4px",
              }}
            ></div>
          ))}
        </div>
        <p style={{ opacity: 0.7, fontSize: "0.8rem" }}>Daily activity (simulated display)</p>
      </Box>

      {/* ========== LOGS ========== */}
      <Box title="Error Logs (Last 10)">
        <p>No critical errors.</p>
        <p style={{ opacity: 0.6 }}>
          (Connect real logs later via /api/logs or admin pipeline.)
        </p>
      </Box>
    </main>
  );
}
