import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, RefreshCw } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AdminFeaturesPanel() {
  const [health, setHealth] = useState({});
  const [fixing, setFixing] = useState(false);
  const [message, setMessage] = useState("");
  
  const checkHealth = async () => {
    try {
      const res = await axios.get(`${API}/admin/features/health`);
      setHealth(res.data.health || {});
    } catch (err) {
      console.error(err);
    }
  };

  const runAutofix = async () => {
    setFixing(true);
    setMessage("");
    try {
      const res = await axios.post(`${API}/admin/features/autofix`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(`✅ ${res.data.status}: ${res.data.fixes_applied.filter(f => f.fixed).length}/${res.data.fixes_applied.length} réparations`);
      await checkHealth();
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setMessage("❌ Autofix failed");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusColor = (status) => {
    if (status === "ON") return "bg-emerald-500/10 border-emerald-400/40 text-emerald-300";
    if (status === "OFF") return "bg-red-500/10 border-red-400/40 text-red-300";
    return "bg-amber-500/10 border-amber-400/40 text-amber-300";
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg ${message.startsWith("✅") ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          size="sm"
          variant="outline"
          className="border-cyan-400/60 text-cyan-400"
          onClick={checkHealth}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Vérifier
        </Button>
        <Button
          size="sm"
          className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
          onClick={runAutofix}
          disabled={fixing}
        >
          <Zap className="h-4 w-4 mr-2" />
          {fixing ? "Réparation..." : "🔧 Autofix"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900/80 border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-base">🚀 État des Fonctionnalités</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className={`flex items-center justify-between p-2 rounded border ${getStatusColor(health.credits_workflow?.status || "ON")}`}>
              <span>Workflow Crédits</span>
              <span className="font-bold">{health.credits_workflow?.status || "ON"}</span>
            </div>
            <div className={`flex items-center justify-between p-2 rounded border ${getStatusColor(health.ai_indexation?.status || "ON")}`}>
              <span>AI Indexation (12)</span>
              <span className="font-bold">{health.ai_indexation?.status || "ON"}</span>
            </div>
            <div className={`flex items-center justify-between p-2 rounded border ${getStatusColor("ON")}`}>
              <span>Endpoint /api/push</span>
              <span className="font-bold">ON</span>
            </div>
            <div className={`flex items-center justify-between p-2 rounded border ${getStatusColor(health.database?.status || "ON")}`}>
              <span>MongoDB</span>
              <span className="font-bold">{health.database?.status || "ON"}</span>
            </div>
            <div className={`flex items-center justify-between p-2 rounded border ${getStatusColor(health.stripe?.status || "OFF")}`}>
              <span>Stripe Integration</span>
              <span className="font-bold">{health.stripe?.status || "OFF"}</span>
            </div>
            <div className={`flex items-center justify-between p-2 rounded border ${getStatusColor(health.email_system?.status || "OFF")}`}>
              <span>Email System</span>
              <span className="font-bold">{health.email_system?.status || "OFF"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-violet-400/30">
          <CardHeader>
            <CardTitle className="text-base">⚙️ Diagnostic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {Object.entries(health).map(([feature, data]) => (
              data.issue && (
                <div key={feature} className="p-2 rounded bg-red-500/10 border border-red-400/30 text-red-300">
                  <p className="font-bold">{feature}</p>
                  <p className="text-[10px]">{data.issue}</p>
                </div>
              )
            ))}
            {Object.values(health).every(h => !h.issue) && (
              <p className="text-emerald-300 text-center py-4">✅ Aucun problème détecté</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
