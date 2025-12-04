import { useEffect, useState } from "react";
import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "Admin — Performance Dashboard",
  description: "Latency, CPU, memory, uptime and backend performance metrics.",
  robots: "noindex, nofollow",
};

export default function AdminPerformanceDashboard() {
  const [perf, setPerf] = useState(null);

  useEffect(() => {
    fetch("/api/admin/performance")
      .then((r) => r.json())
      .then(setPerf)
      .catch(() => setPerf({ error: true }));
  }, []);

  const Box = ({ title, children }) => (
    <div style={{
      padding: "18px",
      marginBottom: "18px",
      borderRadius: "10px",
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
      borderRadius: "8px",
      background: ok ? "#0f0a" : "#f002",
      color: ok ? "lime" : "red",
      marginLeft: "8px"
    }}>
      {ok ? "OK" : "ERROR"}
    </span>
  );

  const MiniBar = ({ values, color }) => (
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
    <main style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <AIMeta />
      <h1>Performance Dashboard</h1>
      <p style={{ opacity: 0.7 }}>Backend metrics, latency, uptime & system resources.</p>

      <Box title="Backend Health">
        {perf ? (
          <>
            <p>API Health: <Tag ok={!perf.error} /></p>
            <p>Uptime: {perf.uptime || "N/A"}</p>
            <p>CPU Load: {perf.cpu || "N/A"}%</p>
            <p>Memory Usage: {perf.memory || "N/A"}%</p>
            <p>Job Queue Size: {perf.queue_size || 0}</p>
          </>
        ) : (
          <p>Loading…</p>
        )}
      </Box>

      <Box title="Latency">
        {perf && perf.latency_samples ? (
          <>
            <MiniBar values={perf.latency_samples} color="linear-gradient(180deg,#58a6ff,#1f6feb)" />
            <p style={{ opacity: 0.7 }}>Requests latency (ms)</p>
          </>
        ) : <p>No latency data.</p>}
      </Box>

      <Box title="CPU Load (Graph)">
        {perf && perf.cpu_samples ? (
          <>
            <MiniBar values={perf.cpu_samples} color="linear-gradient(180deg,#ffb340,#ff8c00)" />
            <p style={{ opacity: 0.7 }}>CPU usage samples</p>
          </>
        ) : <p>No CPU data.</p>}
      </Box>

      <Box title="Memory Usage (Graph)">
        {perf && perf.memory_samples ? (
          <>
            <MiniBar values={perf.memory_samples} color="linear-gradient(180deg,#40ffbf,#00c78c)" />
            <p style={{ opacity: 0.7 }}>Memory usage over time</p>
          </>
        ) : <p>No memory samples.</p>}
      </Box>

    </main>
  );
}
