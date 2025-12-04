import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/admin-monitor.css";

const API = process.env.REACT_APP_BACKEND_URL;

export function AdminMonitorPage() {
  const navigate = useNavigate();
  const [waveData, setWaveData] = useState(Array(150).fill(50));
  const [likelihood, setLikelihood] = useState(0);

  useEffect(() => {
    // Verify admin via session cookie
    axios.get(`${API}/auth/admin-status`).catch(() => navigate("/admin-login"));

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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a0a0c 0%, #0f0f12 100%)",
      color: "#0ef",
      fontFamily: "monospace",
      padding: "20px",
      overflow: "hidden"
    }}>
      <button
        onClick={() => navigate("/admin")}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          background: "#0ef",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          zIndex: 1000
        }}
      >
        ← Dashboard
      </button>

      <div style={{ textAlign: "center", marginBottom: "30px", maxWidth: "1200px", margin: "0 auto 30px" }}>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", marginBottom: "10px", textShadow: "0 0 20px #0ef" }}>
          👁️ AI LIVE MONITOR
        </h1>
        <p style={{ color: "#0ef", fontSize: "clamp(12px, 2.5vw, 16px)", opacity: 0.8 }}>
          Oscillations d&apos;activité IA + Jauge prédictive
        </p>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", marginBottom: "40px" }}>
        <svg
          width="100%"
          height="200"
          viewBox="0 0 900 200"
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            background: "#000", 
            border: "2px solid #0ef", 
            borderRadius: "8px",
            boxShadow: "0 0 20px rgba(0,240,255,0.3)"
          }}
        >
          <polyline
            points={waveData.map((val, i) => `${i * 6},${200 - val * 1.5}`).join(" ")}
            fill="none"
            stroke="#0ef"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 4px #0ef)" }}
          />
        </svg>
      </div>

      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ 
          textAlign: "center", 
          marginBottom: "30px", 
          fontSize: "clamp(16px, 3vw, 20px)",
          color: "#0ef"
        }}>
          Probabilité Recommandation IA
        </h2>
        
        <svg
          viewBox="0 0 100 100"
          style={{ 
            display: "block", 
            margin: "0 auto", 
            maxWidth: "100%",
            width: "clamp(200px, 50vw, 350px)",
            height: "auto"
          }}
        >
          <path d="M10 50 A40 40 0 0 1 50 10" stroke="#00ff99" strokeWidth="6" fill="none" opacity="0.7" />
          <path d="M50 10 A40 40 0 0 1 90 50" stroke="#ffee00" strokeWidth="6" fill="none" opacity="0.7" />
          <path d="M90 50 A40 40 0 0 1 50 90" stroke="#ff0033" strokeWidth="6" fill="none" opacity="0.7" />
          
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            stroke={zoneColor}
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${gaugeAngle} 50 50)`}
            style={{ 
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 8px ${zoneColor})`
            }}
          />
          
          <circle cx="50" cy="50" r="4" fill="#0ef" style={{ filter: "drop-shadow(0 0 6px #0ef)" }} />
        </svg>

        <div style={{ 
          textAlign: "center", 
          marginTop: "30px",
          fontSize: "clamp(36px, 10vw, 56px)",
          fontWeight: "bold",
          color: zoneColor,
          textShadow: `0 0 30px ${zoneColor}, 0 0 50px ${zoneColor}`
        }}>
          {Math.round(likelihood)}%
        </div>

        <div style={{ 
          textAlign: "center", 
          marginTop: "20px", 
          fontSize: "clamp(10px, 2vw, 13px)", 
          color: "#666",
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          flexWrap: "wrap"
        }}>
          <span style={{ color: "#00ff99" }}>■ 0-30% Baseline</span>
          <span style={{ color: "#ffee00" }}>■ 30-70% Activité</span>
          <span style={{ color: "#ff0033" }}>■ 70-100% Imminent</span>
        </div>
      </div>
    </div>
  );
}
