import React, { useEffect, useState } from "react";

export default function AdminAIQA() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/ai-qa")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ ai_score: 0, verdict: "ERROR", issues: ["Unable to fetch AI QA data"] }));
  }, []);

  if (!data) return <main style={{ padding: 20 }}><p>Loading…</p></main>;

  return (
    <main style={{ padding: 20 }}>
      <h1>AI QA Analysis</h1>

      <h2>Score IA : {data.ai_score}/100</h2>
      <h3>Verdict : {data.verdict}</h3>

      <h3>Issues:</h3>
      <ul>
        {data.issues && data.issues.length > 0 ? (
          data.issues.map((i, idx) => <li key={idx}>{i}</li>)
        ) : (
          <li>Aucune issue détectée.</li>
        )}
      </ul>
    </main>
  );
}
