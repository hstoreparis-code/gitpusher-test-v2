import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import AIMeta from "../components/AIMeta";
import { InfoBadge } from "../components/InfoBadge";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

export const metadata = {
  title: "GitPusher Admin — Credits & Billing Dashboard",
  description:
    "Internal dashboard showing credits usage, billing stats, Stripe health, and overall monetization performance.",
  robots: "noindex, nofollow",
};

export default function AdminCreditsBillingDashboard() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(null);
  const [billing, setBilling] = useState(null);
  const [usage, setUsage] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [mintUser, setMintUser] = useState({ email: "", amount: "" });
  const [mintAllAmount, setMintAllAmount] = useState("");
  const [mintMessage, setMintMessage] = useState("");

  const loadAll = async () => {
    try {
      // récupérer le statut admin pour savoir si super admin
      const statusRes = await fetch(`${API_BASE}/api/auth/admin-status`, { credentials: "include" });
      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        setIsSuperAdmin(!!statusJson.is_super_admin);
      }

      const [usersRes, statsRes, txRes, stripeHealthRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, { credentials: "include" }),
        fetch(`${API_BASE}/api/admin/financial-stats`, { credentials: "include" }),
        fetch(`${API_BASE}/api/admin/transactions`, { credentials: "include" }),
        fetch(`${API_BASE}/api/admin/stripe/health`, { credentials: "include" }).catch(() => null),
      ]);

      const [usersJson, statsJson, txJson, stripeJson] = await Promise.all([
        usersRes.ok ? usersRes.json() : Promise.resolve([]),
        statsRes.ok ? statsRes.json() : Promise.resolve({}),
        txRes.ok ? txRes.json() : Promise.resolve([]),
        stripeHealthRes && stripeHealthRes.ok ? stripeHealthRes.json() : Promise.resolve(null),
      ]);

      const users = Array.isArray(usersJson) ? usersJson : [];
      const transactions = Array.isArray(txJson) ? txJson : [];

      // Crédit total et restant = somme des crédits utilisateurs
      const totalCredits = users.reduce((sum, u) => sum + (u.credits || 0), 0);

      // Utilisation par utilisateur = cumul des montants de transactions "consumption" ou "purchase" négatives
      const usageByUser = {};
      transactions.forEach((t) => {
        if (!t.user_email) return;
        const email = t.user_email;
        const amount = typeof t.amount === "number" ? t.amount : 0;
        if (!usageByUser[email]) usageByUser[email] = 0;
        usageByUser[email] += amount;
      });

      const usageUsers = Object.entries(usageByUser)
        .map(([email, amount]) => ({ email, credits_used: amount }))
        .sort((a, b) => b.credits_used - a.credits_used)
        .slice(0, 10);

      setCredits({
        total: totalCredits,
        remaining: totalCredits,
        used_today: 0, // TODO: dériver à partir des transactions du jour si besoin
      });

      setBilling({
        subscribers: statsJson.total_transactions ?? 0,
        mrr: statsJson.monthly_revenue ?? 0,
        arr: (statsJson.monthly_revenue ?? 0) * 12,
        revenue_30d: statsJson.total_revenue ?? 0,
        transactions_by_day: statsJson.transactions_by_day || [],
      });

      setUsage({ users: usageUsers });

      if (stripeJson) {
        setStripe(stripeJson);
      } else {
        setStripe(null);
      }
    } catch (e) {
      // en cas d'erreur globale, on affiche des messages d'attente dans l'UI
      console.warn("Failed to load admin credits dashboard", e);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await loadAll();
    };
    initializeData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 sm:p-8 space-y-6">
      <AIMeta />

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)] border border-cyan-300/80"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Credits &amp; Billing Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Suivi des crédits, revenus récurrents et santé de l’intégration Stripe.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className="text-xs px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-400/50">
            Billing: Live data
          </Badge>
        </div>
      </header>

      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-1 text-xs font-medium text-cyan-300 uppercase tracking-wide">
              <span>Credit System</span>
              <InfoBadge text={"Vue agrégée des crédits disponibles dans l'écosystème GitPusher : total, restant et utilisé aujourd'hui. Sert à vérifier que les utilisateurs ont assez de marge avant d'être bloqués."} />
            </CardTitle>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            {credits ? (
              <>
                <p>Total Credits: {credits.total}</p>
                <p>Remaining: {credits.remaining}</p>
                <p>Used Today: {credits.used_today}</p>
              </>
            ) : (
              <p className="text-slate-500">Loading credit system…</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-1 text-xs font-medium text-cyan-300 uppercase tracking-wide">
              <span>Stripe Health</span>
              <InfoBadge text={"Etat de santé de l'intégration Stripe : webhook, clés API et synchronisation des abonnements. Si un indicateur est en ERROR, corrige d'abord Stripe avant d'enquêter côté app."} />
            </CardTitle>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            {stripe ? (
              <>
                <p>Webhook: {stripe.webhook_ok ? "OK" : "ERROR"}</p>
                <p>API Keys: {stripe.keys_ok ? "OK" : "ERROR"}</p>
                <p>Subscription Sync: {stripe.sync_ok ? "OK" : "ERROR"}</p>
                <p>Last Invoice: {stripe.last_invoice || "N/A"}</p>
              </>
            ) : (
              <p className="text-slate-500">Loading Stripe health…</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              MRR / ARR
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            {billing ? (
              <>
                <p>Subscribers: {billing.subscribers}</p>
                <p>MRR: ${billing.mrr}</p>
                <p>ARR: ${billing.arr}</p>
                <p>Revenue 30d: ${billing.revenue_30d}</p>
              </>
            ) : (
              <p className="text-slate-500">Loading billing metrics…</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900/70 border-slate-700/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              User Credit Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            {usage && usage.users && usage.users.length > 0 ? (
              <ul className="space-y-1">
                {usage.users.map((u, i) => (
                  <li key={i}>
                    {u.email} — {u.credits_used} crédits utilisés
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No usage data.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
      {isSuperAdmin && (
        <Card className="bg-gradient-to-br from-emerald-500/10 via-slate-900 to-emerald-500/5 border border-emerald-500/40 mt-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-emerald-300 uppercase tracking-wide">
              Super Admin — Recharge infinie du système de crédits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-200">
            {mintMessage && (
              <p className="text-[11px] text-emerald-300">{mintMessage}</p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Mint ciblé sur un utilisateur */}
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400">Ajouter des crédits à un utilisateur spécifique (mint hors Stripe).</p>
                <input
                  type="email"
                  placeholder="Email utilisateur (exact)"
                  value={mintUser.email}
                  onChange={(e) => setMintUser({ ...mintUser, email: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-md bg-slate-950/70 border border-slate-700 text-xs"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Montant à mint (crédits)"
                  value={mintUser.amount}
                  onChange={(e) => setMintUser({ ...mintUser, amount: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-md bg-slate-950/70 border border-slate-700 text-xs"
                />
                <Button
                  size="sm"
                  className="mt-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold"
                  onClick={async () => {
                    try {
                      setMintMessage("");
                      if (!mintUser.email || !mintUser.amount) return;

                      // récupérer l'utilisateur cible via /admin/users
                      const usersRes = await fetch(`${API_BASE}/api/admin/users`, { credentials: "include" });
                      const usersJson = usersRes.ok ? await usersRes.json() : [];
                      const target = Array.isArray(usersJson)
                        ? usersJson.find((u) => u.email === mintUser.email)
                        : null;
                      if (!target) {
                        setMintMessage("Utilisateur introuvable pour cet email.");
                        return;
                      }

                      const res = await fetch(`${API_BASE}/api/admin/credits/mint/user`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: target.id, amount: Number(mintUser.amount) || 0 }),
                      });
                      if (!res.ok) {
                        setMintMessage("Erreur lors du mint ciblé.");
                        return;
                      }
                      setMintMessage(`Mint de ${mintUser.amount} crédits appliqué à ${mintUser.email}.`);
                      setMintUser({ email: "", amount: "" });
                      // Recharger les données globales
                      await loadAll();
                    } catch (e) {
                      setMintMessage("Erreur inattendue pendant le mint utilisateur.");
                    }
                  }}
                >
                  Mint utilisateur
                </Button>
              </div>

              {/* Mint global sur tous les utilisateurs */}
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400">Ajouter des crédits à tous les utilisateurs (attention, impact global).</p>
                <input
                  type="number"
                  min="1"
                  placeholder="Montant à mint pour chaque user"
                  value={mintAllAmount}
                  onChange={(e) => setMintAllAmount(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md bg-slate-950/70 border border-slate-700 text-xs"
                />
                <Button
                  size="sm"
                  className="mt-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold"
                  onClick={async () => {
                    try {
                      setMintMessage("");
                      if (!mintAllAmount) return;
                      const res = await fetch(`${API_BASE}/api/admin/credits/mint/all`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ amount: Number(mintAllAmount) || 0 }),
                      });
                      if (!res.ok) {
                        setMintMessage("Erreur lors du mint global.");
                        return;
                      }
                      setMintMessage(`Mint global de ${mintAllAmount} crédits appliqué à tous les utilisateurs.`);
                      setMintAllAmount("");
                      await loadAll();
                    } catch (e) {
                      setMintMessage("Erreur inattendue pendant le mint global.");
                    }
                  }}
                >
                  Mint global
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-slate-300">
            {credits && credits.remaining < 100 ? (
              <p className="text-amber-300">⚠️ Low credits — consider upgrading quota.</p>
            ) : (
              <p className="text-slate-500">No alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/70 border-slate-700/70">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
            Revenue Trend (Light Graph)
          </CardTitle>
          <Activity className="w-4 h-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {(billing && Array.isArray(billing.transactions_by_day) ? billing.transactions_by_day : []).map((d, i) => {
              const h = typeof d.amount === "number" ? Math.max(4, Math.min(100, d.amount)) : 4;
              return (
                <div
                  key={i}
                  style={{
                    width: "12%",
                    height: `${h}%`,
                    background: "linear-gradient(180deg, #ffb340, #ff8c00)",
                    borderRadius: "4px",
                  }}
                  title={`${d.date}: ${d.amount?.toFixed ? d.amount.toFixed(2) : d.amount}€`}
                />
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Évolution réelle du revenu (30 derniers jours)</p>
        </CardContent>
      </Card>
    </main>
  );
}
