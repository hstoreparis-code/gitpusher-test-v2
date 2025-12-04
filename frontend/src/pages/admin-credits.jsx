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

  const Box = ({ title, children }) => (
    <div style={{
      padding: "18px",
      marginBottom: "18px",
      borderRadius: "10px",
      background: "#0d1117",
      border: "1px solid #222",
      color: "white"
    }}>
      <h2 style={{ marginBottom: "10px" }}>{title}</h2>
      {children}
    </div>
  );

  const Tag = ({ ok }) => (
    <span style={{
      padding: "3px 8px",
      borderRadius: "8px",
      background: ok ? "#0f0a" : "#f002",
      color: ok ? "lime" : "red",
      fontSize: "0.8rem",
      marginLeft: "6px"
    }}>
      {ok ? "OK" : "ERROR"}
    </span>
  );

  return (
    <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto", color: "#fff" }}>
      <AIMeta />

      <h1>Credits & Billing — Admin Dashboard</h1>
      <p style={{ opacity: 0.7 }}>Track monetization, credit consumption, and Stripe integration health.</p>

      {/* ---- CREDIT STATUS ---- */}
      <Box title="Credit System Overview">
        {credits ? (
          <>
            <p>Total Credits: {credits.total}</p>
            <p>Credits Remaining: {credits.remaining}</p>
            <p>Credits Used Today: {credits.used_today}</p>
            <p>Credit System: <Tag ok={!credits.error} /></p>
          </>
        ) : <p>Loading...</p>}
      </Box>

      {/* ---- USER USAGE ---- */}
      <Box title="User Credit Usage">
        {usage && usage.users ? (
          <ul>
            {usage.users.map((u, i) => (
              <li key={i}>
                {u.email} — {u.credits_used} credits
              </li>
            ))}
          </ul>
        ) : <p>No usage data.</p>}
      </Box>

      {/* ---- BILLING / STRIPE ---- */}
      <Box title="Stripe Billing Status">
        {stripe ? (
          <>
            <p>Webhook: <Tag ok={stripe.webhook_ok} /></p>
            <p>API Keys: <Tag ok={stripe.keys_ok} /></p>
            <p>Subscription Sync: <Tag ok={stripe.sync_ok} /></p>
            <p>Last Invoice: {stripe.last_invoice || "N/A"}</p>
          </>
        ) : <p>Loading...</p>}
      </Box>

      {/* ---- BILLING METRICS ---- */}
      <Box title="Billing Metrics (MRR / ARR)">
        {billing ? (
          <>
            <p>Active Subscribers: {billing.subscribers}</p>
            <p>MRR (Monthly Recurring Revenue): ${billing.mrr}</p>
            <p>ARR (Annual Recurring Revenue): ${billing.arr}</p>
            <p>Last 30 Days Revenue: ${billing.revenue_30d}</p>
          </>
        ) : <p>Loading...</p>}
      </Box>

      {/* ---- LIGHT GRAPH ---- */}
      <Box title="Revenue Trend (Light Graph)">
        <div style={{
          display: "flex",
          gap: "6px",
          alignItems: "flex-end",
          height: "120px"
        }}>
          {[20, 40, 35, 60, 55, 80, 95].map((h, i) => (
            <div key={i} style={{
              width: "12%",
              height: h,
              background: "linear-gradient(180deg, #ffb340, #ff8c00)",
              borderRadius: "4px"
            }}></div>
          ))}
        </div>
        <p style={{ opacity: 0.6, fontSize: "0.8rem" }}>Simulated 7-day revenue evolution</p>
      </Box>

      {/* ---- ALERTS ---- */}
      <Box title="Alerts">
        {credits && credits.remaining < 100 ? (
          <p style={{ color: "orange" }}>⚠️ Low credits — consider upgrading quota.</p>
        ) : (
          <p>No alerts.</p>
        )}
      </Box>

    </main>
  );
}
