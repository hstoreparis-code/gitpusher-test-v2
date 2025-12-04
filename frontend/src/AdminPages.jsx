import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Activity, CreditCard, TrendingUp, Search, Filter, Download, BarChart3, Calendar, DollarSign, CreditCard as CreditCardIcon, Bell, Mail, MessageCircle, Zap, Settings, Gift } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AdminSettingsPanel } from "./components/AdminSettingsPanel";
import { AdminCreditsPanel } from "./components/AdminCreditsPanel";
import { AdminPasswordChange } from "./components/AdminPasswordChange";
import { AdminEmailPanel } from "./components/AdminEmailPanel";
import { AdminSecurityPanel } from "./components/AdminSecurityPanel";
import { AdminFeaturesPanel } from "./components/AdminFeaturesPanel";
import { AdminPagesContentPanel } from "./components/AdminPagesContentPanel";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      const token = res.data.access_token;
      // Vérifier que ce compte est bien admin
      const status = await axios.get(`${API}/auth/admin-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!status.data.is_admin) {
        setError("Ce compte n'est pas admin.");
        setLoading(false);
        return;
      }
      localStorage.setItem("admin_token", token);
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.detail || "Échec de la connexion admin.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4">
      <Card className="bg-slate-900/80 border-white/10 shadow-2xl shadow-cyan-500/20 max-w-md w-full">
        <CardHeader className="text-center space-y-6 pb-6">
          {/* Logo GitPusher Officiel - GRAND */}
          <div className="flex flex-col items-center justify-center gap-4 -mt-4">
            <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.8)] animate-pulse">
              <svg 
                className="h-16 w-16 text-slate-950" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </div>
            
            <div className="flex flex-col leading-tight text-center">
              <span className="text-4xl font-bold tracking-tight">
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">Pusher</span><span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent text-3xl drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">.AI</span>
              </span>
            </div>
          </div>
          
          {/* Welcome Admin - Néon bleu */}
          <CardTitle className="text-3xl font-bold text-center">
            <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,1)] animate-pulse" style={{
              textShadow: '0 0 20px rgba(34,211,238,0.8), 0 0 40px rgba(34,211,238,0.5), 0 0 60px rgba(34,211,238,0.3)'
            }}>
              WELCOME ADMIN
            </span>
          </CardTitle>
          <p className="text-xs text-slate-400">Accès sécurisé au dashboard manager</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-300" htmlFor="admin-email">
                Email admin
              </label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 h-9 text-sm bg-slate-950/60 border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300" htmlFor="admin-password">
                Mot de passe
              </label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 h-9 text-sm bg-slate-950/60 border-slate-700"
              />
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            <Button
              type="submit"
              className="w-full mt-4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white text-sm font-semibold shadow-[0_0_20px_rgba(56,189,248,0.7)] hover:shadow-[0_0_30px_rgba(56,189,248,1)] transition-all"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "🔐 Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [aiEvents, setAiEvents] = useState([]);
  const [aiStats, setAiStats] = useState({ stats_24h: 0, stats_7d: 0, by_source: [], health: "OK" });
  const [aiLiveData, setAiLiveData] = useState([]);
  const [aiLikelihood, setAiLikelihood] = useState(75);
  const [trafficLive, setTrafficLive] = useState([]);
  const [trafficStats, setTrafficStats] = useState({ 
    rps: 0, 
    users: 0, 
    response_ms: 0, 
    top_endpoints: {},
    by_country: {},
    by_hour: [],
    top_pages: {},
    unique_visitors: 0,
    total_ai_requests: 0,
    ai_traffic: {}
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCredits: 0,
    activeJobs: 0,
    planDistribution: {}
  });
  const [chartData, setChartData] = useState({
    newUsersByDay: [],
    subscriptionHistory: [],
    planBreakdown: []
  });
  const [financialData, setFinancialData] = useState({
    stats: null,
    transactions: [],
    revenueChart: [],
    planRevenue: []
  });
  const [newSubscribers, setNewSubscribers] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [supportUnreadCount, setSupportUnreadCount] = useState(0);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  // Préparer les données pour les graphiques
  const prepareChartData = (users) => {
    // 1. Nouveaux utilisateurs par jour (derniers 30 jours)
    const last30Days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last30Days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        count: 0,
        free: 0,
        starter: 0,
        pro: 0,
        premium: 0,
        business: 0
      });
    }

    users.forEach(user => {
      if (user.created_at) {
        const userDate = new Date(user.created_at);
        userDate.setHours(0, 0, 0, 0);
        const dateStr = userDate.toISOString().split('T')[0];
        const dayEntry = last30Days.find(d => d.date === dateStr);
        if (dayEntry) {
          dayEntry.count++;
          const plan = (user.plan || 'free').toLowerCase();
          if (plan === 'free' || plan === 'freemium') dayEntry.free++;
          else if (plan === 'starter') dayEntry.starter++;
          else if (plan === 'pro') dayEntry.pro++;
          else if (plan === 'premium') dayEntry.premium++;
          else if (plan === 'business') dayEntry.business++;
        }
      }
    });

    // 2. Historique des abonnements (cumul)
    const subscriptionHistory = last30Days.map((day, index) => {
      const prevTotal = index > 0 ? last30Days[index - 1].count : 0;
      return {
        ...day,
        total: last30Days.slice(0, index + 1).reduce((sum, d) => sum + d.count, 0)
      };
    });

    // 3. Répartition des plans (pour pie chart)
    const planCounts = users.reduce((acc, u) => {
      const plan = (u.plan || 'free').toLowerCase();
      const planName = plan === 'freemium' ? 'free' : plan;
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {});

    const COLORS = {
      free: '#64748b',
      starter: '#10b981',
      pro: '#3b82f6',
      premium: '#8b5cf6',
      business: '#f59e0b'
    };

    const planBreakdown = Object.entries(planCounts).map(([plan, count]) => ({
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      value: count,
      color: COLORS[plan] || '#64748b'
    }));

    return {
      newUsersByDay: last30Days,
      subscriptionHistory,
      planBreakdown
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/admin-login", { replace: true });
        return;
      }
      try {
        const status = await axios.get(`${API}/auth/admin-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!status.data.is_admin) {
          navigate("/admin-login", { replace: true });
          return;
        }
        const [usersRes, jobsRes, aiStatsRes, aiEventsRes] = await Promise.all([
          axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/ai-monitor/stats`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { stats_24h: 0, stats_7d: 0, by_source: [], health: "OK" } })),
          axios.get(`${API}/admin/ai-monitor/live`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { events: [] } })),
        ]);
        const fetchedUsers = usersRes.data || [];
        const fetchedJobs = jobsRes.data || [];
        
        setUsers(fetchedUsers);
        setJobs(fetchedJobs);
        setAiStats(aiStatsRes.data || { stats_24h: 0, stats_7d: 0, by_source: [], health: "OK" });
        setAiEvents(aiEventsRes.data?.events || []);
        
        // Calculate statistics
        const totalCredits = fetchedUsers.reduce((sum, u) => sum + (u.credits || 0), 0);
        const activeJobs = fetchedJobs.filter(j => j.status === 'processing' || j.status === 'pending').length;
        const planDist = fetchedUsers.reduce((acc, u) => {
          const plan = u.plan || 'free';
          acc[plan] = (acc[plan] || 0) + 1;
          return acc;
        }, {});
        
        setStats({
          totalUsers: fetchedUsers.length,
          totalCredits,
          activeJobs,
          planDistribution: planDist
        });

        // Préparer les données pour les graphiques
        const charts = prepareChartData(fetchedUsers);
        setChartData(charts);

        // Récupérer les données financières depuis Stripe
        try {
          const stripeRes = await axios.get(`${API}/admin/stripe/stats`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          
          const stripeData = stripeRes.data;
          
          setFinancialData({
            stats: stripeData.stats,
            transactions: stripeData.transactions || [],
            revenueChart: [],
            planRevenue: []
          });
        } catch (err) {
          console.error("Stripe stats failed, using fallback", err);
          // Fallback to DB data
          const [transactionsRes, statsRes] = await Promise.all([
            axios.get(`${API}/admin/transactions`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
            axios.get(`${API}/admin/financial-stats`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: {} }))
          ]);

          const transactions = transactionsRes.data || [];
          const financialStats = statsRes.data;

          setFinancialData({
            stats: financialStats,
            transactions,
            revenueChart: financialStats.transactions_by_day || [],
            planRevenue: []
          });
        }

        // Détecter les nouveaux abonnés (dernières 24h)
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentUsers = fetchedUsers.filter(u => {
          if (!u.created_at) return false;
          const createdDate = new Date(u.created_at);
          return createdDate >= last24Hours;
        });
        setNewSubscribers(recentUsers);
        setUnreadAlerts(recentUsers.length);

        // Charger les messages support non lus
        try {
          const unreadRes = await axios.get(`${API}/support/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSupportUnreadCount(unreadRes.data.unread_count || 0);
        } catch (err) {
          console.error("Failed to load unread count", err);
        }
        
        setLoading(false);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("admin_token");
          navigate("/admin-login", { replace: true });
          return;
        }
        setError(err?.response?.data?.detail || "Erreur lors du chargement des données admin.");
        setLoading(false);
      }
    };
    fetchData();

    const handleClickOutside = (event) => {
      if (!event.target.closest("#admin-quick-menu")) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    // SSE for AI Monitor realtime
    let eventSource;
    try {
      eventSource = new EventSource(`${API}/admin/ai-monitor/stream`);
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setAiLiveData(prev => [...prev.slice(-149), { t: data.t, freq: data.freq }]);
          setAiLikelihood(data.likelihood);
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };
      eventSource.onerror = () => {
        console.warn("SSE connection lost");
        setAiLikelihood(35);
      };
    } catch (err) {
      console.error("SSE init error", err);
    }

    // SSE for Traffic Monitor realtime
    let trafficSource;
    try {
      trafficSource = new EventSource(`${API}/admin/traffic/stream`);
      trafficSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setTrafficLive(prev => [...prev.slice(-59), { t: data.t, rps: data.rps }]);
          setTrafficStats({ rps: data.rps, users: data.users, response_ms: data.response_ms, top_endpoints: {} });
        } catch (err) {
          console.error("Traffic SSE error", err);
        }
      };
      
      // Fetch full stats every 5 seconds
      const statsInterval = setInterval(async () => {
        try {
          const res = await axios.get(`${API}/admin/traffic/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTrafficStats(prev => ({
            ...prev,
            top_endpoints: res.data.top_endpoints || {},
            by_country: res.data.by_country || {},
            by_hour: res.data.by_hour || [],
            top_pages: res.data.top_pages || {},
            unique_visitors: res.data.unique_visitors || 0,
            total_ai_requests: res.data.total_ai_requests || 0,
            ai_traffic: res.data.ai_traffic || {}
          }));
        } catch (err) {
          console.error("Traffic stats error", err);
        }
      }, 5000);
      
      return () => {
        if (eventSource) eventSource.close();
        if (trafficSource) trafficSource.close();
        clearInterval(statsInterval);
      };
    } catch (err) {
      console.error("Traffic SSE init error", err);
    }
    
    return () => {
      if (eventSource) eventSource.close();
      if (trafficSource) trafficSource.close();
      document.removeEventListener("click", handleClickOutside);
    };
  }, [navigate, token]);

  const handleUpdateUser = async (userId, plan, credits) => {
    if (!token) return;
    try {
      await axios.patch(
        `${API}/admin/users/${userId}/plan-credits`,
        { plan: plan || undefined, credits: credits !== "" ? Number(credits) : undefined },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: plan || u.plan, credits: credits !== "" ? Number(credits) : u.credits } : u)),
      );
      
      // Recalculate stats
      const updatedUsers = users.map((u) => (u.id === userId ? { ...u, plan: plan || u.plan, credits: credits !== "" ? Number(credits) : u.credits } : u));
      const totalCredits = updatedUsers.reduce((sum, u) => sum + (u.credits || 0), 0);
      const planDist = updatedUsers.reduce((acc, u) => {
        const p = u.plan || 'free';
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      }, {});
      setStats(prev => ({ ...prev, totalCredits, planDistribution: planDist }));
      
    } catch (err) {
      alert(err?.response?.data?.detail || "Échec de la mise à jour de l'utilisateur.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!token) return;
    if (!window.confirm("Supprimer définitivement ce compte utilisateur ?")) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUsers = users.filter((u) => u.id !== userId);
      setUsers(updatedUsers);
      const totalCredits = updatedUsers.reduce((sum, u) => sum + (u.credits || 0), 0);
      const planDist = updatedUsers.reduce((acc, u) => {
        const p = u.plan || 'free';
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      }, {});
      setStats((prev) => ({ ...prev, totalUsers: updatedUsers.length, totalCredits, planDistribution: planDist }));
    } catch (err) {
      alert(err?.response?.data?.detail || "Échec de la suppression de l'utilisateur.");
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || (u.plan || 'free').toLowerCase() === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Manager Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">Gérez l'intégralité de votre plateforme</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => navigate("/manager/ai-discovery")}
              className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-400 text-slate-950 text-xs font-semibold shadow-[0_0_25px_rgba(16,185,129,0.9)] hover:shadow-[0_0_40px_rgba(16,185,129,1)] hover:bg-emerald-300 transition-all border border-emerald-300/80"
            >
              🚀 AI Discovery
            </button>
            <button
              onClick={() => navigate("/manager/seo-monitor")}
              className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500 text-slate-950 text-xs font-semibold shadow-[0_0_25px_rgba(56,189,248,0.9)] hover:shadow-[0_0_40px_rgba(56,189,248,1)] hover:bg-cyan-400 transition-all border border-cyan-300/80"
            >
              📈 Google SEO Monitor
            </button>
            <button
              onClick={() => navigate("/manager/tiktok-monitor")}
              className="inline-flex items-center px-4 py-2 rounded-full bg-pink-500 text-slate-950 text-xs font-semibold shadow-[0_0_25px_rgba(244,114,182,0.9)] hover:shadow-[0_0_40px_rgba(244,114,182,1)] hover:bg-pink-400 transition-all border border-pink-300/80"
            >
              🎵 TikTok SEO Monitor
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-2" id="admin-quick-menu">
              <button
                className="w-9 h-9 flex flex-col items-center justify-center rounded-full border border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 shadow-[0_0_18px_rgba(56,189,248,0.8)] text-cyan-300 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdminMenu((prev) => !prev);
                }}
              >
                <span className="w-5 h-0.5 bg-cyan-400 rounded-full mb-0.5" />
                <span className="w-5 h-0.5 bg-cyan-400 rounded-full mb-0.5" />
                <span className="w-5 h-0.5 bg-cyan-400 rounded-full" />
              </button>
              <span
                className="hidden sm:inline-block text-xs font-medium text-cyan-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdminMenu((prev) => !prev);
                }}
              >
                Menu Admin
              </span>
              {/* Menu déroulant des actions admin (alertes, autofix, support, déconnexion) */}
              {showAdminMenu && (
                <div className="absolute right-0 top-10 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-40">
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                    onClick={() => {
                      setShowAlerts(!showAlerts);
                      setShowAdminMenu(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="w-3 h-3" />
                      Nouvelles conversions
                    </span>
                    {unreadAlerts > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-[10px] text-white font-semibold">
                        {unreadAlerts}
                      </span>
                    )}
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 gap-2"
                    onClick={() => {
                      setShowAdminMenu(false);
                      navigate("/admin/features");
                    }}
                  >
                    <Zap className="w-3 h-3 text-emerald-300" />
                    <span>Features Dashboard</span>
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 gap-2"
                    onClick={() => {
                      setShowAdminMenu(false);
                      navigate("/admin/credits");
                    }}
                  >
                    <Zap className="w-3 h-3 text-amber-300" />
                    <span>Credits & Billing</span>
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 gap-2"
                    onClick={() => {
                      setShowAdminMenu(false);
                      navigate("/admin/autofix");
                    }}
                  >
                    <Zap className="w-3 h-3 text-violet-300" />
                    <span>Autofix</span>
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 gap-2"
                    onClick={() => {
                      setShowAdminMenu(false);
                      navigate("/admin/performance");
                    }}
                  >
                    <Zap className="w-3 h-3 text-cyan-300" />
                    <span>Performance</span>
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 gap-2"
                    onClick={() => {
                      setShowAdminMenu(false);
                      navigate("/admin/ai-indexing");
                    }}
                  >
                    <Zap className="w-3 h-3 text-sky-300" />
                    <span>AI Indexing</span>
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 gap-2"
                    onClick={() => {
                      setShowAdminMenu(false);
                      navigate("/admin/mega");
                    }}
                  >
                    <Zap className="w-3 h-3 text-cyan-200" />
                    <span>Mega Dashboard</span>
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 gap-2"
                    onClick={() => {
                      setShowAdminMenu(false);
                      navigate("/admin/ai-qa");
                    }}
                  >
                    <Zap className="w-3 h-3 text-emerald-200" />
                    <span>AI QA Analyzer</span>
                  </button>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                    onClick={() => {
                      setShowAdminMenu(false);
                      navigate("/admin/support");
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-3 h-3 text-emerald-300" />
                      Support Chat
                    </span>
                    {supportUnreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-[10px] text-white font-semibold">
                        {supportUnreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    className="w-full flex items-center px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 border-t border-slate-800"
                    onClick={() => {
                      localStorage.removeItem("admin_token");
                      navigate("/", { replace: true });
                    }}
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-400 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-slate-300">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Utilisateurs</p>
                      <p className="text-3xl font-bold text-cyan-300">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-10 h-10 text-cyan-400/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20 shadow-[0_0_24px_rgba(139,92,246,0.25)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Crédits Plateforme</p>
                      <p className="text-3xl font-bold text-violet-300">{stats.totalCredits}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Somme de tous les utilisateurs</p>
                    </div>
                    <CreditCard className="w-10 h-10 text-violet-400/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Jobs Actifs</p>
                      <p className="text-3xl font-bold text-emerald-300">{stats.activeJobs}</p>
                    </div>
                    <Activity className="w-10 h-10 text-emerald-400/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 shadow-[0_0_24px_rgba(245,158,11,0.25)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Jobs</p>
                      <p className="text-3xl font-bold text-amber-300">{jobs.length}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-amber-400/40" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Distribution */}
            <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
              <CardHeader>
                <CardTitle className="text-base text-slate-100">Distribution des Plans IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {(() => {
                    const allPlans = [
                      { 
                        key: 'free', 
                        label: 'Gratuit', 
                        icon: '🆓',
                        gradient: 'from-slate-500/20 to-slate-600/10',
                        border: 'border-slate-500/30',
                        glow: 'hover:shadow-[0_0_18px_rgba(100,116,139,0.4)]',
                        textColor: 'text-slate-300'
                      },
                      { 
                        key: 'starter', 
                        label: 'Starter', 
                        icon: '🚀',
                        gradient: 'from-emerald-500/20 to-cyan-500/10',
                        border: 'border-emerald-500/30',
                        glow: 'hover:shadow-[0_0_18px_rgba(16,185,129,0.5)]',
                        textColor: 'text-emerald-300'
                      },
                      { 
                        key: 'pro', 
                        label: 'Pro', 
                        icon: '⚡',
                        gradient: 'from-blue-500/20 to-cyan-500/10',
                        border: 'border-blue-500/30',
                        glow: 'hover:shadow-[0_0_18px_rgba(59,130,246,0.5)]',
                        textColor: 'text-blue-300'
                      },
                      { 
                        key: 'premium', 
                        label: 'Premium', 
                        icon: '💎',
                        gradient: 'from-violet-500/20 to-purple-500/10',
                        border: 'border-violet-500/30',
                        glow: 'hover:shadow-[0_0_18px_rgba(139,92,246,0.5)]',
                        textColor: 'text-violet-300'
                      },
                      { 
                        key: 'business', 
                        label: 'Business', 
                        icon: '🏢',
                        gradient: 'from-amber-500/20 to-orange-500/10',
                        border: 'border-amber-500/30',
                        glow: 'hover:shadow-[0_0_18px_rgba(245,158,11,0.5)]',
                        textColor: 'text-amber-300'
                      }
                    ];

                    // Normaliser les données (freemium → free, demo → free)
                    const normalizedDistribution = {};
                    Object.entries(stats.planDistribution).forEach(([plan, count]) => {
                      const normalized = (plan || 'free').toLowerCase();
                      const key = (normalized === 'freemium' || normalized === 'demo') ? 'free' : normalized;
                      normalizedDistribution[key] = (normalizedDistribution[key] || 0) + count;
                    });

                    return allPlans.map(planConfig => {
                      const count = normalizedDistribution[planConfig.key] || 0;
                      const percentage = stats.totalUsers > 0 ? ((count / stats.totalUsers) * 100).toFixed(1) : '0.0';
                      
                      return (
                        <div 
                          key={planConfig.key} 
                          className={`relative bg-gradient-to-br ${planConfig.gradient} border ${planConfig.border} rounded-xl p-4 ${planConfig.glow} transition-all group overflow-hidden`}
                        >
                          {/* Effet de scan IA */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                          
                          {/* Contenu */}
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl">{planConfig.icon}</span>
                              <span className={`text-xs font-mono ${planConfig.textColor} opacity-60`}>
                                [{planConfig.key.toUpperCase()}]
                              </span>
                            </div>
                            <p className={`text-xs uppercase tracking-wider ${planConfig.textColor} font-semibold mb-1`}>
                              {planConfig.label}
                            </p>
                            <p className={`text-3xl font-bold ${planConfig.textColor} mb-1`}>
                              {count}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] text-slate-500">
                                {percentage}%
                              </p>
                              {count > 0 && (
                                <span className="text-[10px] text-emerald-400 animate-pulse">● Actif</span>
                              )}
                            </div>
                          </div>

                          {/* Bordure animée pour les plans actifs */}
                          {count > 0 && (
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/20 rounded-xl transition-all"></div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="finances" className="mt-4">
              <TabsList className="bg-slate-900/80 border border-slate-700/80 flex overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide sm:flex-wrap sm:overflow-visible">
                <TabsTrigger value="finances" className="flex-shrink-0">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Finances
                </TabsTrigger>
                <TabsTrigger value="overview" className="flex-shrink-0">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistiques
                </TabsTrigger>
                <TabsTrigger value="ai-monitor" className="flex-shrink-0">
                  <Activity className="w-4 h-4 mr-2" />
                  AI Monitor
                </TabsTrigger>
                <TabsTrigger value="credits" className="flex-shrink-0">
                  <Gift className="w-4 h-4 mr-2" />
                  Crédits
                </TabsTrigger>
                <TabsTrigger value="users" className="flex-shrink-0">
                  <Users className="w-4 h-4 mr-2" />
                  Utilisateurs
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex-shrink-0">
                  <Activity className="w-4 h-4 mr-2" />
                  Jobs
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-shrink-0">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </TabsTrigger>
                <TabsTrigger value="features" className="flex-shrink-0">
                  <Zap className="w-4 h-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="pages" className="flex-shrink-0">
                  <Settings className="w-4 h-4 mr-2" />
                  Pages SEO/AEO
                </TabsTrigger>
                <TabsTrigger value="security" className="flex-shrink-0">
                  <Settings className="w-4 h-4 mr-2" />
                  Sécurité
                </TabsTrigger>
                <TabsTrigger value="emails" className="flex-shrink-0">
                  <Mail className="w-4 h-4 mr-2" />
                  Emails
                </TabsTrigger>
                <TabsTrigger value="traffic" className="flex-shrink-0">
                  <Activity className="w-4 h-4 mr-2" />
                  Trafic
                </TabsTrigger>
              </TabsList>

              {/* Onglet AI Monitor */}
              <TabsContent value="ai-monitor" className="mt-4 space-y-4">
                {/* Bouton Monitor Visuel */}
                <div className="text-center">
                  <a
                    href="/admin-monitor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-slate-950 font-bold text-sm shadow-[0_0_24px_rgba(34,211,238,0.9)] hover:shadow-[0_0_32px_rgba(34,211,238,1)] transition-all hover:scale-105"
                  >
                    📊 Oscillogramme IA
                  </a>
                  <p className="text-xs text-slate-500 mt-2">Monitoring temps réel + Jauge prédictive</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                  <Card className="bg-slate-900/80 border-cyan-400/30">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">Événements 24h</p>
                      <p className="text-2xl font-bold text-cyan-400">{aiStats.stats_24h || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/80 border-violet-400/30">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">Événements 7j</p>
                      <p className="text-2xl font-bold text-violet-400">{aiStats.stats_7d || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/80 border-emerald-400/30">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">IA Actives</p>
                      <p className="text-2xl font-bold text-emerald-400">{aiStats.by_source?.length || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className={`bg-slate-900/80 ${aiLikelihood > 70 ? 'border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.5)]' : aiLikelihood > 40 ? 'border-amber-400' : 'border-red-400'}`}>
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">Statut Temps Réel</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${aiLikelihood > 40 ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        <p className={`text-sm font-bold ${aiLikelihood > 40 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {aiLikelihood > 40 ? '✓ ACTIF' : '⚠ INCIDENT'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/80 border-amber-400/30">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">Health</p>
                      <p className="text-lg font-bold text-emerald-400">✓ {aiStats.health || "OK"}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphique Temps Réel */}
                <Card className="bg-slate-900/80 border-cyan-400/30">
                  <CardHeader>
                    <CardTitle className="text-base">📈 Activité IA Temps Réel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={aiLiveData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="t" stroke="#94a3b8" hide />
                        <YAxis stroke="#94a3b8" domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Line type="monotone" dataKey="freq" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/40">
                        <span className="text-xs text-slate-400">Probabilité recommandation</span>
                        <span className="text-xl font-bold text-cyan-400">{Math.round(aiLikelihood)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Graphique Origines IA */}
                <Card className="bg-slate-900/80 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base">🔍 Origine des Recommandations IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={aiStats.by_source || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="_id" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Événements récents */}
                <Card className="bg-slate-900/80 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">📋 Derniers Événements IA</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={async () => {
                          try {
                            const res = await axios.get(`${API}/admin/ai-monitor/live`, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ai-events-${new Date().toISOString()}.json`;
                            a.click();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        📥 Exporter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {aiEvents.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">Aucun événement IA enregistré</p>
                      ) : (
                        aiEvents.slice(0, 50).map((evt, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-cyan-400">{evt.source || "Unknown"}</span>
                              <span className="text-slate-500">{new Date(evt.timestamp).toLocaleString('fr-FR')}</span>
                            </div>
                            <div className="text-slate-400">
                              <span className="text-violet-400">{evt.event_type}</span> • {evt.endpoint || "N/A"}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Info */}
                <Card className="bg-blue-500/10 border-blue-400/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-blue-300">
                      💡 Les événements IA sont enregistrés automatiquement via User-Agent des requêtes (ChatGPT, Claude, Gemini, Perplexity, Mistral, etc.)
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Statistiques */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Graphique: Nouveaux abonnés par jour */}
                <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      Nouveaux abonnés par jour (30 derniers jours)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.newUsersByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="label" 
                          stroke="#94a3b8"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#94a3b8"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            border: '1px solid #334155',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend />
                        <Bar dataKey="free" stackId="a" fill="#64748b" name="Gratuit" />
                        <Bar dataKey="starter" stackId="a" fill="#10b981" name="Starter" />
                        <Bar dataKey="pro" stackId="a" fill="#3b82f6" name="Pro" />
                        <Bar dataKey="premium" stackId="a" fill="#8b5cf6" name="Premium" />
                        <Bar dataKey="business" stackId="a" fill="#f59e0b" name="Business" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Graphique: Croissance cumulative */}
                  <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Croissance cumulative des abonnements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.subscriptionHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis 
                            dataKey="label" 
                            stroke="#94a3b8"
                            style={{ fontSize: '11px' }}
                          />
                          <YAxis 
                            stroke="#94a3b8"
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              border: '1px solid #334155',
                              borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#e2e8f0' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ fill: '#10b981', r: 3 }}
                            name="Total utilisateurs"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Graphique: Répartition des plans */}
                  <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="w-5 h-5 text-violet-400" />
                        Répartition des plans
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.planBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.planBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              border: '1px solid #334155',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Tableau: Historique détaillé jour par jour */}
                <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      Historique détaillé des abonnements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead className="text-xs text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="py-3 pr-4 text-left font-medium">Date</th>
                            <th className="py-3 px-3 text-center font-medium">Nouveaux</th>
                            <th className="py-3 px-3 text-center font-medium">Gratuit</th>
                            <th className="py-3 px-3 text-center font-medium">Starter</th>
                            <th className="py-3 px-3 text-center font-medium">Pro</th>
                            <th className="py-3 px-3 text-center font-medium">Premium</th>
                            <th className="py-3 px-3 text-center font-medium">Business</th>
                            <th className="py-3 pl-4 text-right font-medium">Total cumulé</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.subscriptionHistory.slice().reverse().map((day, index) => (
                            <tr key={index} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                              <td className="py-2.5 pr-4 text-slate-200">{day.label}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  day.count > 0 ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-500'
                                }`}>
                                  {day.count > 0 ? `+${day.count}` : '0'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-400">{day.free || '-'}</td>
                              <td className="py-2.5 px-3 text-center text-emerald-400">{day.starter || '-'}</td>
                              <td className="py-2.5 px-3 text-center text-blue-400">{day.pro || '-'}</td>
                              <td className="py-2.5 px-3 text-center text-violet-400">{day.premium || '-'}</td>
                              <td className="py-2.5 px-3 text-center text-amber-400">{day.business || '-'}</td>
                              <td className="py-2.5 pl-4 text-right font-semibold text-slate-200">{day.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Finances */}
              <TabsContent value="finances" className="mt-4 space-y-4">
                {/* Financial Statistics Cards */}
                {financialData.stats && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Revenus Total</p>
                              <p className="text-3xl font-bold text-emerald-300">{financialData.stats.total_revenue.toFixed(2)}€</p>
                            </div>
                            <DollarSign className="w-10 h-10 text-emerald-400/40" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Revenus Mensuels</p>
                              <p className="text-3xl font-bold text-cyan-300">{financialData.stats.monthly_revenue.toFixed(2)}€</p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-cyan-400/40" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20 shadow-[0_0_24px_rgba(139,92,246,0.25)]">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Transactions</p>
                              <p className="text-3xl font-bold text-violet-300">{financialData.stats.successful_transactions}</p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {financialData.stats.pending_transactions} en attente, {financialData.stats.failed_transactions} échouées
                              </p>
                            </div>
                            <CreditCardIcon className="w-10 h-10 text-violet-400/40" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 shadow-[0_0_24px_rgba(245,158,11,0.25)]">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Transaction Moy.</p>
                              <p className="text-3xl font-bold text-amber-300">{financialData.stats.average_transaction.toFixed(2)}€</p>
                            </div>
                            <Activity className="w-10 h-10 text-amber-400/40" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Revenue Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Revenue over time */}
                      <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Revenus par jour (30 derniers jours)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={financialData.revenueChart}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis 
                                dataKey="label" 
                                stroke="#94a3b8"
                                style={{ fontSize: '11px' }}
                              />
                              <YAxis 
                                stroke="#94a3b8"
                                style={{ fontSize: '12px' }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0f172a', 
                                  border: '1px solid #334155',
                                  borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#e2e8f0' }}
                                formatter={(value) => [`${value}€`, 'Revenus']}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                fillOpacity={1} 
                                fill="url(#colorRevenue)"
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Revenue by plan */}
                      <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="w-5 h-5 text-violet-400" />
                            Revenus par plan
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={financialData.planRevenue}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value.toFixed(2)}€`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {financialData.planRevenue.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0f172a', 
                                  border: '1px solid #334155',
                                  borderRadius: '8px'
                                }}
                                formatter={(value) => `${value.toFixed(2)}€`}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Transactions Table */}
                    <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CreditCardIcon className="w-5 h-5 text-cyan-400" />
                            Transactions récentes
                            <span className="text-xs text-slate-500 ml-2">(connecté à Stripe en temps réel)</span>
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-sm">
                            <thead className="text-xs text-slate-400 border-b border-slate-800">
                              <tr>
                                <th className="py-3 pr-4 text-left font-medium">ID</th>
                                <th className="py-3 px-3 text-left font-medium">Utilisateur</th>
                                <th className="py-3 px-3 text-left font-medium">Plan</th>
                                <th className="py-3 px-3 text-right font-medium">Montant</th>
                                <th className="py-3 px-3 text-center font-medium">Statut</th>
                                <th className="py-3 px-3 text-left font-medium">Méthode</th>
                                <th className="py-3 pl-4 text-left font-medium">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {financialData.transactions.slice(0, 20).map((t, index) => (
                                <tr key={index} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                                  <td className="py-2.5 pr-4 font-mono text-xs text-cyan-300">{t.id.substring(0, 12)}...</td>
                                  <td className="py-2.5 px-3 text-xs text-slate-300">{t.user_email}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                      t.plan === 'business' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                                      t.plan === 'premium' ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20' :
                                      t.plan === 'pro' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                                      'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                    }`}>
                                      {t.plan}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-300">{t.amount.toFixed(2)}€</td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                      t.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                                      t.status === 'pending' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                                      'bg-red-500/10 text-red-300 border border-red-500/20'
                                    }`}>
                                      {t.status === 'succeeded' ? '✓ Réussi' : t.status === 'pending' ? '⏳ En attente' : '✗ Échoué'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-xs text-slate-400">{t.payment_method || '-'}</td>
                                  <td className="py-2.5 pl-4 text-xs text-slate-400">
                                    {new Date(t.created_at).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {financialData.transactions.length === 0 && (
                            <div className="text-center py-8">
                              <p className="text-sm text-slate-400">Aucune transaction trouvée</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="credits" className="mt-4">
                <AdminCreditsPanel />
              </TabsContent>

              <TabsContent value="users" className="mt-4 space-y-3">
                {/* Nouveaux Inscrits + Désinscrits */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-emerald-500/5 border-emerald-400/30">
                    <CardHeader>
                      <CardTitle className="text-sm">✨ Nouveaux Inscrits (7 derniers jours)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                      {users.filter(u => {
                        const created = new Date(u.created_at);
                        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return created >= sevenDaysAgo;
                      }).slice(0, 10).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-2 rounded bg-emerald-500/10 border border-emerald-400/30 text-xs">
                          <div>
                            <p className="text-emerald-300 font-semibold">{u.email}</p>
                            <p className="text-slate-400 text-[10px]">{new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">{u.plan || 'free'}</span>
                        </div>
                      ))}
                      {users.filter(u => {
                        const created = new Date(u.created_at);
                        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return created >= sevenDaysAgo;
                      }).length === 0 && (
                        <p className="text-slate-500 text-center py-4 text-xs">Aucun nouvel inscrit cette semaine</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-500/10 via-slate-900/80 to-red-500/5 border-red-400/30">
                    <CardHeader>
                      <CardTitle className="text-sm">🚫 Comptes Supprimés (30 derniers jours)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                      {users.filter(u => u.deleted_at).slice(0, 10).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-400/30 text-xs">
                          <div>
                            <p className="text-red-300 font-semibold">{u.email}</p>
                            <p className="text-slate-400 text-[10px]">Supprimé: {new Date(u.deleted_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      ))}
                      {users.filter(u => u.deleted_at).length === 0 && (
                        <p className="text-slate-500 text-center py-4 text-xs">Aucun compte supprimé</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Search and Filters */}
                <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="Rechercher par email ou nom..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-slate-950/60 border-slate-700"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={filterPlan}
                          onChange={(e) => setFilterPlan(e.target.value)}
                          className="px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-md text-sm text-slate-100"
                        >
                          <option value="all">Tous les plans</option>
                          <option value="free">Gratuit</option>
                          <option value="freemium">Freemium</option>
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="premium">Premium</option>
                          <option value="business">Business</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <p>{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">Gestion des Utilisateurs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto text-xs sm:text-sm">
                      <table className="w-full border-collapse">
                        <thead className="text-[11px] text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="py-3 pr-2 text-left font-medium">Email</th>
                            <th className="py-3 px-2 text-left font-medium">Nom</th>
                            <th className="py-3 px-2 text-left font-medium">Plan</th>
                            <th className="py-3 px-2 text-left font-medium">Crédits</th>
                            <th className="py-3 px-2 text-left font-medium">Créé le</th>
                            <th className="py-3 pl-2 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u) => (
                            <AdminUserRow key={u.id} user={u} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />
                          ))}
                        </tbody>
                      </table>
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-slate-400">Aucun utilisateur trouvé</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="mt-4 space-y-3">
                <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">Historique des Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto text-xs sm:text-sm">
                      <table className="w-full border-collapse">
                        <thead className="text-[11px] text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="py-3 pr-2 text-left font-medium">Job ID</th>
                            <th className="py-3 px-2 text-left font-medium">User ID</th>
                            <th className="py-3 px-2 text-left font-medium">Project ID</th>
                            <th className="py-3 px-2 text-left font-medium">Statut</th>
                            <th className="py-3 px-2 text-left font-medium">Erreur</th>
                            <th className="py-3 pl-2 text-left font-medium">Créé le</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobs.map((j) => (
                            <tr key={j.id} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                              <td className="py-2 pr-2 font-mono text-[11px] text-cyan-300">{j.id.substring(0, 8)}...</td>
                              <td className="py-2 px-2 font-mono text-[11px] text-slate-400">{j.user_id?.substring(0, 8)}...</td>
                              <td className="py-2 px-2 font-mono text-[11px] text-slate-400">{j.project_id?.substring(0, 8) || "-"}</td>
                              <td className="py-2 px-2 text-xs">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  j.status === 'completed' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                                  j.status === 'processing' || j.status === 'pending' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' :
                                  'bg-red-500/10 text-red-300 border border-red-500/20'
                                }`}>
                                  {j.status}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-[11px] text-red-300 max-w-xs truncate" title={j.error || ""}>
                                {j.error || "-"}
                              </td>
                              <td className="py-2 pl-2 text-[11px] text-slate-400">
                                {new Date(j.created_at).toLocaleString('fr-FR', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {jobs.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-slate-400">Aucun job trouvé</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Paramètres */}
              <TabsContent value="settings" className="mt-4">
                <AdminSettingsPanel />
              </TabsContent>

              {/* Onglet Features */}
              <TabsContent value="features" className="mt-4 space-y-4">
                <AdminFeaturesPanel />
              </TabsContent>

              <TabsContent value="pages" className="mt-4 space-y-4">
                <AdminPagesContentPanel />
              </TabsContent>

              {/* Onglet Security/Roles */}
              <TabsContent value="security" className="mt-4 space-y-4">
                <AdminSecurityPanel />
                
                <AdminPasswordChange />
                
                <Card className="bg-slate-900/80 border-violet-400/30">
                  <CardHeader>
                    <CardTitle className="text-base">🔒 Système de Rôles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-400/40">
                        <p className="font-bold text-red-300 mb-2">👑 FOUNDER_ADMIN</p>
                        <p className="text-slate-400">• Accès total système</p>
                        <p className="text-slate-400">• Gestion des rôles</p>
                        <p className="text-slate-400">• Création admins</p>
                      </div>
                      <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-400/40">
                        <p className="font-bold text-violet-300 mb-2">⚙️ ADMIN</p>
                        <p className="text-slate-400">• Dashboard complet</p>
                        <p className="text-slate-400">• Gestion utilisateurs</p>
                        <p className="text-slate-400">• Crédits & Jobs</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/40">
                        <p className="font-bold text-blue-300 mb-2">👤 STAFF</p>
                        <p className="text-slate-400">• Support tickets</p>
                        <p className="text-slate-400">• Lecture stats</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-700/20 border border-slate-600/40">
                        <p className="font-bold text-slate-300 mb-2">👁️ VIEWER</p>
                        <p className="text-slate-400">• Lecture seule</p>
                        <p className="text-slate-400">• Accès limité</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/80 border-cyan-400/30">
                  <CardHeader>
                    <CardTitle className="text-base">👥 Comptes Admin Actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-400/40">
                        <div>
                          <p className="font-bold text-red-300">founder@gitpusher.ai</p>
                          <p className="text-xs text-slate-400">Role: FOUNDER_ADMIN</p>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold">ACTIF</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-violet-500/10 border border-violet-400/40">
                        <div>
                          <p className="font-bold text-violet-300">admin@pushin.app</p>
                          <p className="text-xs text-slate-400">Role: ADMIN</p>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold">ACTIF</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500/10 via-slate-900/80 to-violet-500/10 border-2 border-dashed border-cyan-400/40">
                  <CardContent className="p-4">
                    <p className="text-xs text-cyan-300">
                      🔒 <strong>Sécurité</strong> : JWT avec expiration 60min, tokens refresh automatique, rôles hiérarchiques, routes protégées par middleware
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Emails */}
              <TabsContent value="emails" className="mt-4 space-y-4">
                <AdminEmailPanel />
              </TabsContent>

              {/* Onglet Trafic Temps Réel */}
              <TabsContent value="traffic" className="mt-4 space-y-4">
                {/* Bouton Actualiser */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-cyan-400/60 text-cyan-400"
                    onClick={async () => {
                      try {
                        const res = await axios.get(`${API}/admin/traffic/stats`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setTrafficStats(prev => ({
                          ...prev,
                          ...res.data,
                          top_endpoints: res.data.top_endpoints || {},
                          by_country: res.data.by_country || {},
                          by_hour: res.data.by_hour || [],
                          top_pages: res.data.top_pages || {},
                          unique_visitors: res.data.unique_visitors || 0,
                          total_ai_requests: res.data.total_ai_requests || 0,
                          ai_traffic: res.data.ai_traffic || {}
                        }));
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    🔄 Actualiser
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-slate-900/80 border-cyan-400/30">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">Req/sec</p>
                      <p className="text-3xl font-bold text-cyan-400">{trafficStats.rps || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/80 border-violet-400/30">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">Visiteurs Uniques</p>
                      <p className="text-3xl font-bold text-violet-400">{trafficStats.unique_visitors || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/80 border-emerald-400/30">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">Temps réponse</p>
                      <p className="text-3xl font-bold text-emerald-400">{trafficStats.response_ms || 0}<span className="text-sm">ms</span></p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-900/80 border-cyan-400/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">📊 Trafic Temps Réel (60 dernières secondes)</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={async () => {
                          try {
                            window.open(`${API}/admin/traffic/export`, '_blank');
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        📥 Exporter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={trafficLive}>
                        <defs>
                          <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="t" stroke="#94a3b8" hide />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Area type="monotone" dataKey="rps" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRps)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* AI Traffic Card */}
                <Card className="bg-slate-900/80 border-violet-400/30">
                  <CardHeader>
                    <CardTitle className="text-base">🤖 Trafic IA ({trafficStats.total_ai_requests || 0} requêtes)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={Object.entries(trafficStats.ai_traffic || {}).map(([name, count]) => ({ name, count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                    {Object.keys(trafficStats.ai_traffic || {}).length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">Aucun trafic IA détecté</p>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-slate-900/80 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm">🎯 Top Pages Visitées</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs max-h-64 overflow-y-auto">
                      {Object.entries(trafficStats.top_pages || {}).length === 0 ? (
                        <p className="text-slate-500 text-center py-4">En collecte...</p>
                      ) : (
                        Object.entries(trafficStats.top_pages).map(([path, count]) => (
                          <div key={path} className="flex justify-between p-2 bg-slate-950/60 rounded">
                            <span className="truncate">{path}</span>
                            <span className="text-cyan-400 font-mono">{count}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/80 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm">🌍 Visiteurs par Pays</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs max-h-64 overflow-y-auto">
                      {Object.entries(trafficStats.by_country || {}).length === 0 ? (
                        <p className="text-slate-500 text-center py-4">En collecte...</p>
                      ) : (
                        Object.entries(trafficStats.by_country).map(([country, count]) => (
                          <div key={country} className="flex justify-between p-2 bg-slate-950/60 rounded">
                            <span>{country}</span>
                            <span className="text-violet-400 font-mono">{count}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-900/80 border-violet-400/30">
                  <CardHeader>
                    <CardTitle className="text-sm">⏰ Trafic par Heure (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={trafficStats.by_hour || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="hour" stroke="#94a3b8" style={{ fontSize: '10px' }} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-slate-900/80 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm">🎯 Top Endpoints API</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs max-h-64 overflow-y-auto">
                      {Object.entries(trafficStats.top_endpoints || {}).length === 0 ? (
                        <p className="text-slate-500 text-center py-4">En collecte...</p>
                      ) : (
                        Object.entries(trafficStats.top_endpoints).map(([path, count]) => (
                          <div key={path} className="flex justify-between p-2 bg-slate-950/60 rounded">
                            <span className="truncate">{path}</span>
                            <span className="text-cyan-400 font-mono">{count}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className={`bg-slate-900/80 ${trafficStats.response_ms < 200 ? 'border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.4)]' : trafficStats.response_ms < 500 ? 'border-amber-400' : 'border-red-400'}`}>
                    <CardHeader>
                      <CardTitle className="text-sm">🚨 Statut Serveur</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-full ${trafficStats.response_ms < 500 ? 'bg-emerald-500/20 border-2 border-emerald-400' : 'bg-red-500/20 border-2 border-red-400'}`}>
                          <span className={`h-3 w-3 rounded-full ${trafficStats.response_ms < 500 ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-ping'}`} />
                          <span className={`text-lg font-bold ${trafficStats.response_ms < 500 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trafficStats.response_ms < 500 ? '✓ ACTIF' : '⚠ INCIDENT'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-3">Dernière mesure : {new Date().toLocaleTimeString('fr-FR')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

function AdminUserRow({ user, onUpdate, onDelete }) {
  const [plan, setPlan] = useState(user.plan || "");
  const [credits, setCredits] = useState(user.credits ?? "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(user.id, plan, credits);
    setIsEditing(false);
  };

  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors">
      <td className="py-2.5 pr-2 text-[11px] sm:text-xs text-slate-200">{user.email}</td>
      <td className="py-2.5 px-2 text-[11px] sm:text-xs text-slate-300">{user.display_name || "-"}</td>
      <td className="py-2.5 px-2">
        {isEditing ? (
          <select
            className="bg-slate-950/60 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-100 focus:border-cyan-500 focus:outline-none"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option value="">-</option>
            <option value="free">Gratuit</option>
            <option value="freemium">Freemium</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
            <option value="business">Business</option>
          </select>
        ) : (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
            (user.plan || '').toLowerCase() === 'premium' || (user.plan || '').toLowerCase() === 'business'
              ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
              : (user.plan || '').toLowerCase() === 'pro'
              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
              : (user.plan || '').toLowerCase() === 'starter'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-slate-700/50 text-slate-300 border border-slate-600'
          }`}>
            {user.plan || 'free'}
          </span>
        )}
      </td>
      <td className="py-2.5 px-2">
        {isEditing ? (
          <Input
            type="number"
            className="h-8 text-[11px] bg-slate-950/60 border-slate-700 max-w-[100px] focus:border-cyan-500"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
          />
        ) : (
          <span className="text-xs font-mono text-slate-300">{user.credits ?? '-'}</span>
        )}
      </td>
      <td className="py-2.5 px-2 text-[11px] text-slate-400">
        {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : "-"}
      </td>
      <td className="py-2.5 pl-2 text-right">
        {isEditing ? (
          <div className="flex gap-1 justify-end">
            <Button
              size="sm"
              className="h-7 px-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[11px] text-slate-950"
              onClick={handleSave}
            >
              ✓ Sauver
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 rounded-full border-slate-700 text-[11px]"
              onClick={() => {
                setPlan(user.plan || "");
                setCredits(user.credits ?? "");
                setIsEditing(false);
              }}
            >
              ✕ Annuler
            </Button>
          </div>
        ) : (
          <div className="flex gap-1 justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 rounded-full border-slate-700 hover:border-cyan-500 text-[11px]"
              onClick={() => setIsEditing(true)}
            >
              ✎ Modifier
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 rounded-full border-red-500/60 text-[11px] text-red-300 hover:bg-red-500/10"
              onClick={() => onDelete(user.id)}
            >
              🗑 Supprimer
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
