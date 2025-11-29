import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Activity, CreditCard, TrendingUp, Search, Filter, Download, BarChart3, Calendar, DollarSign, CreditCard as CreditCardIcon, Bell, Mail, MessageCircle, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

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
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-center">Admin Login</CardTitle>
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
              className="w-full mt-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm"
              disabled={loading}
            >
              {loading ? "…" : "Se connecter en admin"}
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
        const [usersRes, jobsRes] = await Promise.all([
          axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const fetchedUsers = usersRes.data || [];
        const fetchedJobs = jobsRes.data || [];
        
        setUsers(fetchedUsers);
        setJobs(fetchedJobs);
        
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

        // Récupérer les données financières
        const [transactionsRes, statsRes] = await Promise.all([
          axios.get(`${API}/admin/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/financial-stats`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const transactions = transactionsRes.data || [];
        const financialStats = statsRes.data;

        // Préparer les données pour les graphiques financiers
        const planRevenueData = Object.entries(financialStats.revenue_by_plan || {}).map(([plan, revenue]) => ({
          name: plan.charAt(0).toUpperCase() + plan.slice(1),
          value: revenue,
          color: { starter: '#10b981', pro: '#3b82f6', premium: '#8b5cf6', business: '#f59e0b' }[plan] || '#64748b'
        }));

        setFinancialData({
          stats: financialStats,
          transactions,
          revenueChart: financialStats.transactions_by_day || [],
          planRevenue: planRevenueData
        });

        // Détecter les nouveaux abonnés (dernières 24h)
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentUsers = fetchedUsers.filter(u => {
          if (!u.created_at) return false;
          const createdDate = new Date(u.created_at);
          return createdDate >= last24Hours;
        });
        setNewSubscribers(recentUsers);
        setUnreadAlerts(recentUsers.length);
        
        setLoading(false);
      } catch (err) {
        // Si erreur 401, le token est invalide -> rediriger vers login
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
          <div className="flex items-center gap-3">
            {/* Bouton Alertes Nouveaux Abonnés */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-full border-slate-700 text-xs flex items-center gap-2 ${
                  unreadAlerts > 0 ? 'border-amber-500/50 bg-amber-500/10' : ''
                }`}
                onClick={() => setShowAlerts(!showAlerts)}
              >
                <Bell className={`w-4 h-4 ${unreadAlerts > 0 ? 'text-amber-400 animate-pulse' : ''}`} />
                Alertes
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadAlerts}
                  </span>
                )}
              </Button>
              
              {/* Popup Alertes */}
              {showAlerts && (
                <div className="absolute right-0 top-12 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-auto">
                  <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-100">Nouveaux abonnés (24h)</h3>
                      <button 
                        onClick={() => {
                          setUnreadAlerts(0);
                          setShowAlerts(false);
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        Marquer comme lu
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {newSubscribers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-400">
                        Aucun nouvel abonné dans les dernières 24h
                      </div>
                    ) : (
                      newSubscribers.map((user, index) => (
                        <div key={index} className="p-3 hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-200">{user.email}</p>
                              <p className="text-xs text-slate-400 mt-1">{user.display_name || 'Sans nom'}</p>
                              <div className="flex items-center gap-2 mt-2">
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
                                <span className="text-[10px] text-slate-500">
                                  {new Date(user.created_at).toLocaleString('fr-FR', { 
                                    day: '2-digit', 
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                              onClick={() => {
                                window.location.href = `mailto:${user.email}?subject=Bienvenue sur GitPusher&body=Bonjour,\n\nMerci de vous être inscrit !`;
                              }}
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bouton Autofix */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-violet-500/50 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 text-xs flex items-center gap-2"
              onClick={() => navigate("/admin/autofix")}
            >
              <Zap className="w-4 h-4" />
              Autofix
            </Button>

            {/* Bouton Support Chat */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs flex items-center gap-2"
              onClick={() => navigate("/admin/support")}
            >
              <MessageCircle className="w-4 h-4" />
              Support Chat
            </Button>

            {/* Bouton Déconnexion */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-700 text-xs"
              onClick={() => {
                localStorage.removeItem("admin_token");
                navigate("/", { replace: true });
              }}
            >
              Déconnexion
            </Button>
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
                <CardTitle className="text-base text-slate-100">Distribution des Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.entries(stats.planDistribution).map(([plan, count]) => (
                    <div key={plan} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 hover:border-cyan-500/30 hover:shadow-[0_0_12px_rgba(56,189,248,0.2)] transition-all">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{plan}</p>
                      <p className="text-2xl font-bold text-slate-100 mt-1">{count}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {((count / stats.totalUsers) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="bg-slate-900/80 border border-slate-700/80">
                <TabsTrigger value="overview">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistiques
                </TabsTrigger>
                <TabsTrigger value="finances">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Finances
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="w-4 h-4 mr-2" />
                  Utilisateurs
                </TabsTrigger>
                <TabsTrigger value="jobs">
                  <Activity className="w-4 h-4 mr-2" />
                  Jobs
                </TabsTrigger>
              </TabsList>

              {/* Onglet Statistiques */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Graphique: Nouveaux abonnés par jour */}
                <Card className="bg-slate-900/80 border-slate-800">
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
                        <Bar dataKey="free" stackId="a" fill="#64748b" name="Free" />
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
                  <Card className="bg-slate-900/80 border-slate-800">
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
                  <Card className="bg-slate-900/80 border-slate-800">
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
                <Card className="bg-slate-900/80 border-slate-800">
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
                            <th className="py-3 px-3 text-center font-medium">Free</th>
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
                      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
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

                      <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
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

                      <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
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

                      <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
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
                      <Card className="bg-slate-900/80 border-slate-800">
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
                      <Card className="bg-slate-900/80 border-slate-800">
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
                    <Card className="bg-slate-900/80 border-slate-800">
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

              <TabsContent value="users" className="mt-4 space-y-3">
                {/* Search and Filters */}
                <Card className="bg-slate-900/80 border-slate-800">
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
                          <option value="free">Free</option>
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
                <Card className="bg-slate-900/80 border-slate-800">
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
                            <AdminUserRow key={u.id} user={u} onUpdate={handleUpdateUser} />
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
                <Card className="bg-slate-900/80 border-slate-800">
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
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

function AdminUserRow({ user, onUpdate }) {
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
            <option value="free">Free</option>
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
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 rounded-full border-slate-700 hover:border-cyan-500 text-[11px]"
            onClick={() => setIsEditing(true)}
          >
            ✎ Modifier
          </Button>
        )}
      </td>
    </tr>
  );
}
