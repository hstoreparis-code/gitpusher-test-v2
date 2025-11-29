import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Activity, CreditCard, TrendingUp, Search, Filter, Download } from "lucide-react";

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

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

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
        setUsers(usersRes.data || []);
        setJobs(jobsRes.data || []);
        setLoading(false);
      } catch (err) {
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
    } catch (err) {
      alert(err?.response?.data?.detail || "Échec de la mise à jour de l'utilisateur.");
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-700 text-xs"
            onClick={() => {
              localStorage.removeItem("admin_token");
              navigate("/", { replace: true });
            }}
          >
            Logout admin
          </Button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-300">Chargement…</p>
        ) : (
          <Tabs defaultValue="users" className="mt-4">
            <TabsList className="bg-slate-900/80 border border-slate-700/80">
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4 space-y-3">
              <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto text-xs sm:text-sm">
                    <table className="w-full border-collapse">
                      <thead className="text-[11px] text-slate-400">
                        <tr className="border-b border-slate-800">
                          <th className="py-2 pr-2 text-left">Email</th>
                          <th className="py-2 px-2 text-left">Nom</th>
                          <th className="py-2 px-2 text-left">Plan</th>
                          <th className="py-2 px-2 text-left">Crédits</th>
                          <th className="py-2 px-2 text-left">Créé le</th>
                          <th className="py-2 pl-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <AdminUserRow key={u.id} user={u} onUpdate={handleUpdateUser} />
                        ))}
                      </tbody>
                    </table>
                    {users.length === 0 && <p className="text-xs text-slate-400 mt-2">Aucun utilisateur.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs" className="mt-4 space-y-3">
              <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto text-xs sm:text-sm">
                    <table className="w-full border-collapse">
                      <thead className="text-[11px] text-slate-400">
                        <tr className="border-b border-slate-800">
                          <th className="py-2 pr-2 text-left">Job ID</th>
                          <th className="py-2 px-2 text-left">User ID</th>
                          <th className="py-2 px-2 text-left">Project ID</th>
                          <th className="py-2 px-2 text-left">Statut</th>
                          <th className="py-2 px-2 text-left">Erreur</th>
                          <th className="py-2 pl-2 text-left">Créé le</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((j) => (
                          <tr key={j.id} className="border-b border-slate-800/60">
                            <td className="py-1.5 pr-2 font-mono text-[11px] text-slate-300">{j.id}</td>
                            <td className="py-1.5 px-2 font-mono text-[11px] text-slate-400">{j.user_id}</td>
                            <td className="py-1.5 px-2 font-mono text-[11px] text-slate-400">{j.project_id || "-"}</td>
                            <td className="py-1.5 px-2 text-xs">
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                                {j.status}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-[11px] text-red-300 max-w-xs truncate" title={j.error || ""}>
                              {j.error || ""}
                            </td>
                            <td className="py-1.5 pl-2 text-[11px] text-slate-400">
                              {new Date(j.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {jobs.length === 0 && <p className="text-xs text-slate-400 mt-2">Aucun job.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function AdminUserRow({ user, onUpdate }) {
  const [plan, setPlan] = useState(user.plan || "");
  const [credits, setCredits] = useState(user.credits ?? "");

  return (
    <tr className="border-b border-slate-800/60">
      <td className="py-1.5 pr-2 text-[11px] sm:text-xs text-slate-200">{user.email}</td>
      <td className="py-1.5 px-2 text-[11px] sm:text-xs text-slate-300">{user.display_name || "-"}</td>
      <td className="py-1.5 px-2">
        <select
          className="bg-slate-950/60 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-100"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="">-</option>
          <option value="freemium">Free</option>
          <option value="premium">Premium</option>
          <option value="business">Business</option>
        </select>
      </td>
      <td className="py-1.5 px-2">
        <Input
          type="number"
          className="h-7 text-[11px] bg-slate-950/60 border-slate-700 max-w-[80px]"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
        />
      </td>
      <td className="py-1.5 px-2 text-[11px] text-slate-400">
        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
      </td>
      <td className="py-1.5 pl-2 text-right">
        <Button
          size="sm"
          className="h-7 px-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[11px] text-slate-950"
          onClick={() => onUpdate(user.id, plan, credits)}
        >
          Enregistrer
        </Button>
      </td>
    </tr>
  );
}
