import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import AIMeta from "../components/AIMeta";

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

  useEffect(() => {
    fetch("/api/admin/credits")
      .then((r) => r.json())
      .then(setCredits)
      .catch(() => setCredits({ error: true }));

    fetch("/api/admin/billing")
      .then((r) => r.json())
      .then(setBilling)
      .catch(() => setBilling({ error: true }));

    fetch("/api/admin/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => setUsage({ error: true }));

    fetch("/api/admin/stripe/health")
      .then((r) => r.json())
      .then(setStripe)
      .catch(() => setStripe({ ok: false }));
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
            Billing: OK (mock)
          </Badge>
        </div>
      </header>

      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              Credit System
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
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              Stripe Health
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
            {usage && usage.users ? (
              <ul className="space-y-1">
                {usage.users.map((u, i) => (
                  <li key={i}>
                    {u.email} — {u.credits_used} credits
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No usage data.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-700/70">
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
            {[20, 40, 35, 60, 55, 80, 95].map((h, i) => (
              <div
                key={i}
                style={{
                  width: "12%",
                  height: h,
                  background: "linear-gradient(180deg, #ffb340, #ff8c00)",
                  borderRadius: "4px",
                }}
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Simulated 7-day revenue evolution</p>
        </CardContent>
      </Card>
    </main>
  );
}
