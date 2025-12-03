import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/admin-monitor.css";

const API = process.env.REACT_APP_BACKEND_URL;

export function AdminMonitorPage() {
  const navigate = useNavigate();
  const [waveData, setWaveData] = useState(Array(150).fill(50));
  const [likelihood, setLikelihood] = useState(0);
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    // Verify admin
    axios.get(`${API}/auth/admin-status`, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => navigate("/admin-login"));

    // SSE Stream
    const eventSource = new EventSource(`${API}/admin/ai-monitor/stream`);
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setWaveData(prev => [...prev.slice(-149), data.freq]);
      setLikelihood(data.likelihood);
    };

    return () => eventSource.close();
  }, [token, navigate]);

  const gaugeAngle = -90 + (likelihood * 1.8);
  const zoneColor = likelihood < 30 ? "#00ff99" : likelihood < 70 ? "#ffee00" : "#ff0033";

  return (
    <div className="admin-monitor-container" style={{
      minHeight: "100vh",
      background: "#0a0a0c",
      color: "#0ef",
      fontFamily: "monospace",
      padding: "30px",
      position: "relative"
    }}>
      <button
        onClick={() => navigate("/admin")}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "8px 16px",
          background: "#0ef",
          color: "#000",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        ← Dashboard
      </button>

      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>👁️ AI LIVE MONITOR</h1>
        <p style={{ color: "#0ef", fontSize: "14px" }}>Oscillations d&apos;activité IA + jauge de recommandation imminente</p>
      </div>

      {/* Oscillogramme */}
      <div style={{ marginBottom: "50px" }}>
        <svg width="100%" height="200" style={{ background: "#000", border: "2px solid #0ef" }}>
          <polyline
            points={waveData.map((val, i) => `${i * 6},${200 - val * 1.5}`).join(" ")}
            fill="none"
            stroke="#0ef"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Jauge Prédictive */}
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "18px" }}>
          Probabilité Recommandation IA
        </h2>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "auto" }}>
          {/* Arcs de zones */}
          <path d="M10 50 A40 40 0 0 1 50 10" stroke="#00ff99" strokeWidth="4" fill="none" />
          <path d="M50 10 A40 40 0 0 1 90 50" stroke="#ffee00" strokeWidth="4" fill="none" />
          <path d="M90 50 A40 40 0 0 1 50 90" stroke="#ff0033" strokeWidth="4" fill="none" />
          
          {/* Aiguille */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            stroke={zoneColor}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${gaugeAngle} 50 50)`}
            style={{ transition: "transform 0.3s ease-out" }}
          />
          
          {/* Point central */}
          <circle cx="50" cy="50" r="3" fill="#0ef" />
        </svg>

        <div style={{ 
          textAlign: "center", 
          marginTop: "20px",
          fontSize: "48px",
          fontWeight: "bold",
          color: zoneColor,
          textShadow: `0 0 20px ${zoneColor}`
        }}>
          {Math.round(likelihood)}%
        </div>

        <div style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", color: "#666" }}>
          <span style={{ color: "#00ff99" }}>■ 0-30% Baseline</span>
          {" | "}
          <span style={{ color: "#ffee00" }}>■ 30-70% Activité</span>
          {" | "}
          <span style={{ color: "#ff0033" }}>■ 70-100% Imminent</span>
        </div>
      </div>
    </div>
  );
}
