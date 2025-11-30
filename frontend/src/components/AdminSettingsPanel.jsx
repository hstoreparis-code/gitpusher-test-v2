import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, Globe, CreditCard, Lock, Palette, Zap, Mail, MessageSquare, Shield, Users as UsersIcon } from "lucide-react";

export function AdminSettingsPanel() {
  // Paramètres Généraux
  const [generalSettings, setGeneralSettings] = useState({
    platform_name: "GitPusher.AI",
    platform_url: "https://gitpusher.ai",
    support_email: "support@gitpusher.ai",
    max_upload_size_mb: 100,
    session_timeout_hours: 24
  });

  // Paramètres Crédits & Plans
  const [creditSettings, setCreditSettings] = useState({
    free_initial_credits: 2,
    starter_initial_credits: 10,
    pro_initial_credits: 50,
    credits_per_automation: 2,
    free_max_projects: 5,
    starter_max_projects: 20,
    pro_max_projects: 100,
    premium_unlimited: true,
    business_unlimited: true
  });

  // Paramètres OAuth
  const [oauthSettings, setOauthSettings] = useState({
    github_enabled: true,
    gitlab_enabled: true,
    bitbucket_enabled: false,
    google_enabled: true
  });

  // Paramètres Email
  const [emailSettings, setEmailSettings] = useState({
    welcome_email_enabled: true,
    welcome_email_subject: "Bienvenue sur GitPusher !",
    credit_alert_enabled: true,
    credit_alert_threshold: 2,
    newsletter_enabled: false
  });

  // Paramètres Chatbot
  const [chatbotSettings, setChatbotSettings] = useState({
    enabled: true,
    auto_response: true,
    admin_online_status: true,
    max_messages_per_user: 50,
    response_delay_ms: 1000
  });

  // Paramètres Sécurité
  const [securitySettings, setSecuritySettings] = useState({
    require_email_verification: false,
    max_login_attempts: 5,
    password_min_length: 8,
    session_timeout_minutes: 1440,
    enable_2fa: false
  });

  // Features Flags
  const [features, setFeatures] = useState({
    autofix_enabled: true,
    support_chat_enabled: true,
    new_subscriber_alerts: true,
    financial_dashboard: true,
    gitlab_integration: true,
    bitbucket_integration: false,
    stripe_integration: false
  });

  // Autofix settings (loaded from backend)
  const [autofixSettings, setAutofixSettings] = useState({ auto_mode: false, webhook_secret: "" });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) return;

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const API = `${BACKEND_URL}/api`;

    fetch(`${API}/admin/autofix/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setAutofixSettings({
            auto_mode: !!data.auto_mode,
            webhook_secret: data.webhook_secret || ""
          });
        }
      })
      .catch(() => {
        // silent fail, keep defaults
      });
  }, []);

  const saveSettings = (section) => {
    alert(`Paramètres ${section} sauvegardés !`);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-900/80 border border-slate-700/80">
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="credits">
            <CreditCard className="w-4 h-4 mr-2" />
            Crédits & Plans
          </TabsTrigger>
          <TabsTrigger value="oauth">
            <Lock className="w-4 h-4 mr-2" />
            OAuth
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="chatbot">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chatbot
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap className="w-4 h-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="autofix">
            <Zap className="w-4 h-4 mr-2" />
            Autofix
          </TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Paramètres de la Plateforme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Nom de la plateforme</label>
                  <Input
                    value={generalSettings.platform_name}
                    onChange={(e) => setGeneralSettings({...generalSettings, platform_name: e.target.value})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">URL de la plateforme</label>
                  <Input
                    value={generalSettings.platform_url}
                    onChange={(e) => setGeneralSettings({...generalSettings, platform_url: e.target.value})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Email support</label>
                  <Input
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) => setGeneralSettings({...generalSettings, support_email: e.target.value})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Taille max upload (MB)</label>
                  <Input
                    type="number"
                    value={generalSettings.max_upload_size_mb}
                    onChange={(e) => setGeneralSettings({...generalSettings, max_upload_size_mb: parseInt(e.target.value)})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.5)]"
                onClick={() => saveSettings('généraux')}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres généraux
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Crédits & Plans */}
        <TabsContent value="credits" className="mt-4 space-y-4">
          <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Configuration des Crédits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Crédits initiaux - Free</label>
                  <Input
                    type="number"
                    value={creditSettings.free_initial_credits}
                    onChange={(e) => setCreditSettings({...creditSettings, free_initial_credits: parseInt(e.target.value)})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Crédits initiaux - Starter</label>
                  <Input
                    type="number"
                    value={creditSettings.starter_initial_credits}
                    onChange={(e) => setCreditSettings({...creditSettings, starter_initial_credits: parseInt(e.target.value)})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Crédits initiaux - Pro</label>
                  <Input
                    type="number"
                    value={creditSettings.pro_initial_credits}
                    onChange={(e) => setCreditSettings({...creditSettings, pro_initial_credits: parseInt(e.target.value)})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Crédits par automatisation</label>
                  <Input
                    type="number"
                    value={creditSettings.credits_per_automation}
                    onChange={(e) => setCreditSettings({...creditSettings, credits_per_automation: parseInt(e.target.value)})}
        {/* Onglet Autofix */}
        <TabsContent value="autofix" className="mt-4 space-y-4">
          <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Autofix - Webhook & Mode Auto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300 mb-1 block">Secret Webhook Autofix</label>
                <p className="text-xs text-slate-500 mb-1">
                  Utilisé pour sécuriser l'endpoint public <code className="bg-slate-950/60 px-1 py-0.5 rounded border border-slate-700">POST /api/autofix/webhook/alert</code>.
                  Le système externe doit inclure l'en-tête <code className="bg-slate-950/60 px-1 py-0.5 rounded border border-slate-700">X-Autofix-Secret</code>.
                </p>
                <Input
                  type="text"
                  value={autofixSettings.webhook_secret}
                  onChange={(e) => setAutofixSettings({ ...autofixSettings, webhook_secret: e.target.value })}
                  placeholder="Laisser vide pour désactiver la vérification du secret (démo uniquement)"
                  className="bg-slate-950/60 border-slate-700 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">Mode AutoFix</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Lorsque ce mode est activé, les actions <span className="text-emerald-400">low risk</span> peuvent être exécutées automatiquement.
                  </p>
                </div>
                <button
                  onClick={() => setAutofixSettings({ ...autofixSettings, auto_mode: !autofixSettings.auto_mode })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autofixSettings.auto_mode ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      autofixSettings.auto_mode ? 'translate-x-[26px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="text-xs text-slate-500 bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <p className="font-semibold text-slate-300 mb-1">URL Webhook à utiliser :</p>
                <code className="block break-all text-cyan-300">
                  {process.env.REACT_APP_BACKEND_URL}/api/autofix/webhook/alert
                </code>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.5)]"
                onClick={async () => {
                  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
                  if (!token) return;
                  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
                  const API = `${BACKEND_URL}/api`;
                  try {
                    await fetch(`${API}/admin/autofix/settings`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        auto_mode: autofixSettings.auto_mode,
                        webhook_secret: autofixSettings.webhook_secret || null
                      })
                    });
                    alert('Paramètres Autofix sauvegardés');
                  } catch (err) {
                    alert("Erreur lors de la sauvegarde des paramètres Autofix");
                  }
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres Autofix
              </Button>
            </CardContent>
          </Card>
        </TabsContent>


                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Projets max - Free</label>
                  <Input
                    type="number"
                    value={creditSettings.free_max_projects}
                    onChange={(e) => setCreditSettings({...creditSettings, free_max_projects: parseInt(e.target.value)})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">Premium & Business - Illimité</p>
                  <p className="text-xs text-slate-400 mt-1">Crédits et projets illimités pour ces plans</p>
                </div>
                <span className="text-sm font-bold text-violet-300">✓ Activé</span>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.5)]"
                onClick={() => saveSettings('crédits')}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder la configuration crédits
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet OAuth */}
        <TabsContent value="oauth" className="mt-4 space-y-4">
          <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Providers OAuth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'github_enabled', label: 'GitHub', color: 'slate' },
                { key: 'gitlab_enabled', label: 'GitLab', color: 'orange' },
                { key: 'google_enabled', label: 'Google', color: 'blue' },
                { key: 'bitbucket_enabled', label: 'Bitbucket', color: 'cyan' }
              ].map(provider => (
                <div key={provider.key} className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-${provider.color}-500/10 border border-${provider.color}-500/20 flex items-center justify-center`}>
                      <Lock className={`w-5 h-5 text-${provider.color}-400`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-200 font-medium">{provider.label}</p>
                      <p className="text-xs text-slate-400">Authentification OAuth {provider.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOauthSettings({...oauthSettings, [provider.key]: !oauthSettings[provider.key]})}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      oauthSettings[provider.key] ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      oauthSettings[provider.key] ? 'translate-x-[26px]' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.5)]"
                onClick={() => saveSettings('OAuth')}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder OAuth
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Emails */}
        <TabsContent value="email" className="mt-4 space-y-4">
          <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Configuration des Emails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">Email de bienvenue</p>
                  <p className="text-xs text-slate-400 mt-1">Envoi automatique lors de l'inscription</p>
                </div>
                <button
                  onClick={() => setEmailSettings({...emailSettings, welcome_email_enabled: !emailSettings.welcome_email_enabled})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailSettings.welcome_email_enabled ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    emailSettings.welcome_email_enabled ? 'translate-x-[26px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Sujet email de bienvenue</label>
                <Input
                  value={emailSettings.welcome_email_subject}
                  onChange={(e) => setEmailSettings({...emailSettings, welcome_email_subject: e.target.value})}
                  className="bg-slate-950/60 border-slate-700 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">Alertes crédits faibles</p>
                  <p className="text-xs text-slate-400 mt-1">Notifier quand crédits ≤ {emailSettings.credit_alert_threshold}</p>
                </div>
                <button
                  onClick={() => setEmailSettings({...emailSettings, credit_alert_enabled: !emailSettings.credit_alert_enabled})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailSettings.credit_alert_enabled ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    emailSettings.credit_alert_enabled ? 'translate-x-[26px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.5)]"
                onClick={() => saveSettings('emails')}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les emails
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Chatbot */}
        <TabsContent value="chatbot" className="mt-4 space-y-4">
          <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Paramètres du Chatbot Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">Chatbot activé</p>
                  <p className="text-xs text-slate-400 mt-1">Afficher le widget de support sur toutes les pages</p>
                </div>
                <button
                  onClick={() => setChatbotSettings({...chatbotSettings, enabled: !chatbotSettings.enabled})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    chatbotSettings.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    chatbotSettings.enabled ? 'translate-x-[26px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">Réponses automatiques</p>
                  <p className="text-xs text-slate-400 mt-1">Le bot répond automatiquement aux questions courantes</p>
                </div>
                <button
                  onClick={() => setChatbotSettings({...chatbotSettings, auto_response: !chatbotSettings.auto_response})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    chatbotSettings.auto_response ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    chatbotSettings.auto_response ? 'translate-x-[26px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">Indicateur admin en ligne</p>
                  <p className="text-xs text-slate-400 mt-1">Afficher le statut vert/rouge de l'admin</p>
                </div>
                <button
                  onClick={() => setChatbotSettings({...chatbotSettings, admin_online_status: !chatbotSettings.admin_online_status})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    chatbotSettings.admin_online_status ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    chatbotSettings.admin_online_status ? 'translate-x-[26px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.5)]"
                onClick={() => saveSettings('chatbot')}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres chatbot
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Paramètres de Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Tentatives de connexion max</label>
                  <Input
                    type="number"
                    value={securitySettings.max_login_attempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, max_login_attempts: parseInt(e.target.value)})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Longueur min mot de passe</label>
                  <Input
                    type="number"
                    value={securitySettings.password_min_length}
                    onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: parseInt(e.target.value)})}
                    className="bg-slate-950/60 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">Vérification email obligatoire</p>
                  <p className="text-xs text-slate-400 mt-1">Les nouveaux utilisateurs doivent vérifier leur email</p>
                </div>
                <button
                  onClick={() => setSecuritySettings({...securitySettings, require_email_verification: !securitySettings.require_email_verification})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    securitySettings.require_email_verification ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    securitySettings.require_email_verification ? 'translate-x-[26px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.5)]"
                onClick={() => saveSettings('sécurité')}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder la sécurité
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Features */}
        <TabsContent value="features" className="mt-4 space-y-4">
          <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Fonctionnalités de la Plateforme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'autofix_enabled', label: 'Autofix & Monitoring', desc: 'Auto-remédiation intelligente avec IA' },
                { key: 'support_chat_enabled', label: 'Support Chat en Direct', desc: 'Chat temps réel entre users et admins' },
                { key: 'new_subscriber_alerts', label: 'Alertes Nouveaux Abonnés', desc: 'Notifications admin pour nouveaux inscrits' },
                { key: 'financial_dashboard', label: 'Dashboard Financier', desc: 'Graphiques et stats des revenus' },
                { key: 'gitlab_integration', label: 'Intégration GitLab', desc: 'Push vers dépôts GitLab' },
                { key: 'bitbucket_integration', label: 'Intégration Bitbucket', desc: 'Push vers dépôts Bitbucket' },
                { key: 'stripe_integration', label: 'Paiements Stripe', desc: 'Système de paiement en ligne' }
              ].map(feature => (
                <div key={feature.key} className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-cyan-500/30 transition-colors">
                  <div>
                    <p className="text-sm text-slate-200 font-medium">{feature.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{feature.desc}</p>
                  </div>
                  <button
                    onClick={() => setFeatures({...features, [feature.key]: !features[feature.key]})}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      features[feature.key] ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      features[feature.key] ? 'translate-x-[26px]' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.5)]"
                onClick={() => saveSettings('fonctionnalités')}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les features
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
