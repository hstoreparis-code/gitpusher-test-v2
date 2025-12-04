import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Activity, Zap, Clock, Eye, Play } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function AdminAutofixPanel() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoMode, setAutoMode] = useState(false);
  const generateMockIncidents = () => {
    const now = new Date();
    return [
      {
        id: "inc_001",
        alert_name: "High CPU Usage - Frontend",
        severity: "warning",
        status: "resolved",
        description: "CPU usage exceeded 85% on frontend pod",
        suggested_actions: ["Restart frontend pod", "Scale to 2 replicas"],
        executed_actions: ["Restarted frontend pod"],
        created_at: new Date(now - 3600000).toISOString(),
        resolved_at: new Date(now - 3000000).toISOString()
      },
      {
        id: "inc_002",
        alert_name: "Database Connection Pool Exhausted",
        severity: "critical",
        status: "pending_approval",
        description: "MongoDB connection pool reached maximum capacity",
        suggested_actions: ["Increase connection pool size", "Restart backend service"],
        executed_actions: [],
        created_at: new Date(now - 1800000).toISOString(),
        resolved_at: null
      },
      {
        id: "inc_003",
        alert_name: "Memory Leak - Backend",
        severity: "warning",
        status: "investigating",
        description: "Backend memory usage growing steadily over 24h",
        suggested_actions: ["Analyze heap dump", "Restart backend pod", "Review recent deployments"],
        executed_actions: [],
        created_at: new Date(now - 7200000).toISOString(),
        resolved_at: null
      }
    ];
  };



  const loadIncidents = async () => {
    try {
      const res = await axios.get(`${API}/admin/autofix/incidents`);
      setIncidents(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load incidents", err);
      // Fallback demo data if backend is unavailable
      setIncidents(generateMockIncidents());
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chargement initial + refresh périodique
    const run = () => {
      loadIncidents();
    };
    run();
    const interval = setInterval(run, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleApprove = async (incidentId) => {
    try {
      await axios.post(
        `${API}/admin/autofix/incidents/${incidentId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadIncidents();
    } catch (err) {
      alert("Erreur lors de l'approbation");
    }
  };

  const handleReject = async (incidentId) => {
    try {
      await axios.post(
        `${API}/admin/autofix/incidents/${incidentId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadIncidents();
    } catch (err) {
      alert("Erreur lors du rejet");
    }
  };

  const toggleAutoMode = async () => {
    try {
      await axios.patch(
        `${API}/admin/autofix/settings`,
        { auto_mode: !autoMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAutoMode(!autoMode);
    } catch (err) {
      console.error("Failed to toggle auto mode");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-300 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'pending_approval': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'investigating': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
      case 'failed': return 'bg-red-500/10 text-red-300 border-red-500/20';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Autofix & Monitoring
            </h1>
            <p className="text-sm text-slate-400 mt-1">Auto-remédiation intelligente avec IA</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto Mode Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-700 rounded-full">
              <span className="text-xs text-slate-400">Mode Auto</span>
              <button
                onClick={toggleAutoMode}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoMode ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  autoMode ? 'translate-x-[26px]' : 'translate-x-0.5'
                }`} />
              </button>
              <span className={`text-xs font-medium ${autoMode ? 'text-emerald-400' : 'text-slate-500'}`}>
                {autoMode ? 'Activé' : 'Désactivé'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-700 text-xs"
              onClick={async () => {
                try {
                  await axios.post(
                    `${API}/admin/autofix/incidents`,
                    {
                      alert_name: "Test AutoFix Incident",
                      severity: "warning",
                      description: "Incident de test généré depuis le dashboard admin",
                      alert_payload: { source: "admin-ui", type: "test" }
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  loadIncidents();
                } catch (err) {
                  console.error("Erreur lors de la création de l'incident de test", err);
                  alert("Impossible de créer l'incident de test Autofix.");
                }
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              Incident de test
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-700 text-xs"
              onClick={() => navigate("/admin")}
            >
              ← Retour
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Résolus</p>
                  <p className="text-3xl font-bold text-emerald-300">
                    {incidents.filter(i => i.status === 'resolved').length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">En Attente</p>
                  <p className="text-3xl font-bold text-amber-300">
                    {incidents.filter(i => i.status === 'pending_approval').length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-amber-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Investigation</p>
                  <p className="text-3xl font-bold text-cyan-300">
                    {incidents.filter(i => i.status === 'investigating').length}
                  </p>
                </div>
                <Activity className="w-10 h-10 text-cyan-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Critiques</p>
                  <p className="text-3xl font-bold text-red-300">
                    {incidents.filter(i => i.severity === 'critical').length}
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-400/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Liste des incidents */}
            <Card className="lg:col-span-1 bg-slate-900/80 border-slate-800 overflow-hidden">
              <CardHeader className="border-b border-slate-800">
                <CardTitle className="text-base text-slate-100">Incidents ({incidents.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto h-[600px]">
                  {incidents.map((incident, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedIncident(incident)}
                      className={`w-full p-4 border-b border-slate-800/60 text-left hover:bg-slate-800/50 transition-colors ${
                        selectedIncident?.id === incident.id ? 'bg-slate-800/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${getSeverityColor(incident.severity)}`}>
                              {incident.severity}
                            </span>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(incident.status)}`}>
                              {incident.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-200 mb-1">{incident.alert_name}</p>
                          <p className="text-xs text-slate-400 line-clamp-2">{incident.description}</p>
                          <p className="text-[10px] text-slate-500 mt-2">
                            {new Date(incident.created_at).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Détails de l'incident */}
            <Card className="lg:col-span-2 bg-slate-900/80 border-slate-800 overflow-hidden">
              {selectedIncident ? (
                <>
                  <CardHeader className="border-b border-slate-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base text-slate-100">{selectedIncident.alert_name}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">{selectedIncident.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedIncident.severity)}`}>
                          {selectedIncident.severity}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Status */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        Statut
                      </h3>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(selectedIncident.status)}`}>
                        {selectedIncident.status === 'resolved' ? '✓ Résolu' :
                         selectedIncident.status === 'pending_approval' ? '⏳ En attente d’ approbation' :
                         selectedIncident.status === 'investigating' ? '🔍 Investigation en cours' :
                         selectedIncident.status}
                      </span>
                    </div>

                    {/* Suggested Actions */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Actions suggérées par l’IA
                      </h3>
                      <div className="space-y-2">
                        {selectedIncident.suggested_actions.map((action, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <p className="text-sm text-slate-300 flex-1">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Diagnosis */}
                    {selectedIncident.diagnosis && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          Analyse IA
                        </h3>
                        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg max-h-64 overflow-y-auto text-sm text-slate-300 whitespace-pre-wrap">
                          {selectedIncident.diagnosis}
                        </div>
                      </div>
                    )}


                    {/* Executed Actions */}
                    {selectedIncident.executed_actions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          Actions exécutées
                        </h3>
                        <div className="space-y-2">
                          {selectedIncident.executed_actions.map((action, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                              <p className="text-sm text-emerald-300 flex-1">{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-violet-400" />
                        Timeline
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-400">Détecté</p>
                            <p className="text-sm text-slate-300">
                              {new Date(selectedIncident.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        {selectedIncident.resolved_at && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-400">Résolu</p>
                              <p className="text-sm text-slate-300">
                                {new Date(selectedIncident.resolved_at).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {selectedIncident.status === 'pending_approval' && (
                      <div className="flex gap-3 pt-4 border-t border-slate-800">
                        <Button
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white"
                          onClick={() => handleApprove(selectedIncident.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-300 hover:bg-red-500/10"
                          onClick={() => handleReject(selectedIncident.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <div className="h-[700px] flex items-center justify-center">
                  <div className="text-center">
                    <Eye className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400">Sélectionnez un incident</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
