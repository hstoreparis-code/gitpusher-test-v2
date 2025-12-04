import { useEffect, useState } from "react";
import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "Admin — AI Indexing Dashboard",
  description: "Tracks which AI systems (ChatGPT, Claude, Gemini, Qwen, Kimi, Ernie…) have indexed GitPusher.",
  robots: "noindex, nofollow",
};

export default function AdminAIIndexingDashboard() {
  const [indexing, setIndexing] = useState(null);

  useEffect(() => {
    fetch("/api/admin/ai-indexing")
      .then((r) => r.json())
      .then(setIndexing)
      .catch(() => setIndexing({ error: true }));
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
      background: ok ? "#0f0a" : "#f002",
      borderRadius: "8px",
      color: ok ? "lime" : "red",
      marginLeft: "8px"
    }}>
      {ok ? "Indexed" : "Not detected"}
    </span>
  );

  return (
    <main style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <AIMeta />
      <h1>AI Indexing Dashboard</h1>
      <p style={{ opacity: 0.7 }}>
        Tracking coverage across all major AI assistants, agents, crawlers and code generation engines.
      </p>

      <Box title="Global AI Indexing Score">
        <p>Score: {indexing?.score || 0} / 100</p>
      </Box>

      <Box title="LLM Coverage (Major AI)">
        <ul>
          <li>ChatGPT <Tag ok={indexing?.chatgpt} /></li>
          <li>Claude <Tag ok={indexing?.claude} /></li>
          <li>Google Gemini <Tag ok={indexing?.gemini} /></li>
          <li>Mistral <Tag ok={indexing?.mistral} /></li>
          <li>Perplexity <Tag ok={indexing?.perplexity} /></li>
        </ul>
      </Box>

      <Box title="Asia AI Ecosystem">
        <ul>
          <li>Qwen (Alibaba) <Tag ok={indexing?.qwen} /></li>
          <li>Kimi AI <Tag ok={indexing?.kimi} /></li>
          <li>Baidu ERNIE <Tag ok={indexing?.ernie} /></li>
          <li>iFlyTek Spark <Tag ok={indexing?.spark} /></li>
        </ul>
      </Box>

      <Box title="Developer Agents">
        <ul>
          <li>HuggingFace Agents <Tag ok={indexing?.huggingface} /></li>
          <li>Cursor AI <Tag ok={indexing?.cursor} /></li>
          <li>Replit Agent <Tag ok={indexing?.replit} /></li>
          <li>GitHub Copilot Workspace <Tag ok={indexing?.copilot} /></li>
        </ul>
      </Box>

      <Box title="Search AI / Meta Crawlers">
        <ul>
          <li>Bing Chat / Copilot <Tag ok={indexing?.bing} /></li>
          <li>DuckDuckGo AI <Tag ok={indexing?.ddg} /></li>
          <li>ArXiv / Papers with Code Bots <Tag ok={indexing?.arxiv} /></li>
        </ul>
      </Box>

      <Box title="AutoFix Recommendations">
        <p>{indexing?.autofix || "No issues detected."}</p>
      </Box>

    </main>
  );
}
