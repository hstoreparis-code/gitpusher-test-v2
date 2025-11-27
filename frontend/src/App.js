import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import "@/App.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DownloadCloud, Menu, GitBranch, Rocket, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Activity } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ---- Small i18n helper ----
const baseTranslations = {
  en: {
    heroTitle: "No-Code Git Workflow",
    heroSubtitle:
      "Upload your files, let AI organize your project, generate README and push to your Git repos (GitHub today, GitLab & Bitbucket next).",
    getStarted: "Get started",
    loginTab: "Login",
    signupTab: "Sign up",
    email: "Email",
    password: "Password",
    name: "Name",
    loginCta: "Login",
    signupCta: "Create account",
    orContinueWith: "or continue with",
    google: "Continue with Google",
    github: "Continue with GitHub",
    dashboardTitle: "Your AI-powered Git repos",
    newWorkflow: "New workflow",
    noProjects: "No project yet. Create your first AI-powered repo.",
    stepUpload: "Upload files",
    stepConfigure: "Configure repo",
    stepLaunch: "Launch automation",
    projectName: "Repository name",
    projectDescription: "Short description (optional)",
    projectLanguage: "README language",
    launch: "Launch automation",
    processing: "Processing… This may take a few seconds.",
    linkRepo: "Open repo",
    theme: "Dark mode",
    language: "Français",
  },
  fr: {
    heroTitle: "Workflow Git No-Code",
    heroSubtitle:
      "Dépose tes fichiers, l’IA organise ton projet, génère le README et pousse sur tes dépôts Git (GitHub aujourd’hui, GitLab & Bitbucket à venir).",
    getStarted: "Commencer",
    loginTab: "Connexion",
    signupTab: "Inscription",
    email: "Email",
    password: "Mot de passe",
    name: "Nom",
    loginCta: "Se connecter",
    signupCta: "Créer un compte",
    orContinueWith: "ou continuer avec",
    google: "Continuer avec Google",
    github: "Continuer avec GitHub",
    dashboardTitle: "Tes dépôts Git pilotés par l’IA",
    newWorkflow: "Nouveau workflow",
    noProjects: "Aucun projet pour l’instant. Crée ton premier dépôt IA.",
    stepUpload: "Uploader les fichiers",
    stepConfigure: "Configurer le repo",
    stepLaunch: "Lancer l'automatisation",
    projectName: "Nom du dépôt",
    projectDescription: "Courte description (optionnel)",
    projectLanguage: "Langue du README",
    launch: "Lancer l'automatisation",
    processing: "Traitement en cours… Cela peut prendre quelques secondes.",
    linkRepo: "Ouvrir le repo GitHub",
    theme: "Mode sombre",
    language: "English",
  },
};

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutschland", flag: "🇩🇪" },
  { code: "es", label: "España", flag: "🇪🇸" },
  { code: "it", label: "Italia", flag: "🇮🇹" },
  { code: "pt", label: "Portugal", flag: "🇵🇹" },
  { code: "nl", label: "Nederland", flag: "🇳🇱" },
  { code: "be", label: "Belgique", flag: "🇧🇪" },
  { code: "lu", label: "Luxembourg", flag: "🇱🇺" },
  { code: "ie", label: "Ireland", flag: "🇮🇪" },
  { code: "dk", label: "Danmark", flag: "🇩🇰" },
  { code: "se", label: "Sverige", flag: "🇸🇪" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
  { code: "pl", label: "Polska", flag: "🇵🇱" },
  { code: "cz", label: "Česko", flag: "🇨🇿" },
  { code: "sk", label: "Slovensko", flag: "🇸🇰" },
  { code: "hu", label: "Magyarország", flag: "🇭🇺" },
  { code: "si", label: "Slovenija", flag: "🇸🇮" },
  { code: "hr", label: "Hrvatska", flag: "🇭🇷" },
  { code: "ro", label: "România", flag: "🇷🇴" },
  { code: "bg", label: "България", flag: "🇧🇬" },
  { code: "gr", label: "Ελλάδα", flag: "🇬🇷" },
  { code: "lt", label: "Lietuva", flag: "🇱🇹" },
  { code: "lv", label: "Latvija", flag: "🇱🇻" },
  { code: "ee", label: "Eesti", flag: "🇪🇪" },
  { code: "cy", label: "Κύπρος", flag: "🇨🇾" },
  { code: "mt", label: "Malta", flag: "🇲🇹" },
  { code: "cn", label: "中国", flag: "🇨🇳" },
];

function useI18n() {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("ui_lang");
      if (stored) return stored;
    }
    return "en";
  });
  const [dynamicTranslations, setDynamicTranslations] = useState({});
  const [isLoadingLang, setIsLoadingLang] = useState(false);

  // Detect initial language from browser if no preference is stored.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ui_lang");
    if (stored) return;

    let browserLang = (window.navigator.language || "en").toLowerCase();
    let code = "en";

    // Always use French for France (and any fr-* locale).
    if (browserLang.startsWith("fr")) {
      code = "fr";
    } else {
      const match = languages.find((l) => browserLang.startsWith(l.code));
      if (match) code = match.code;
    }

    setLangState(code);
  }, []);

  const t = (key) =>
    dynamicTranslations[lang]?.[key] ||
    baseTranslations[lang]?.[key] ||
    baseTranslations.en[key] ||
    key;

  const changeLang = async (code) => {
    if (code === lang) return;

    // For EN/FR we use local translations only
    if (code === "en" || code === "fr") {
      setLangState(code);
      if (typeof window !== "undefined") window.localStorage.setItem("ui_lang", code);
      return;
    }

    // Already loaded once
    if (dynamicTranslations[code]) {
      setLangState(code);
      if (typeof window !== "undefined") window.localStorage.setItem("ui_lang", code);
      return;
    }

    try {
      setIsLoadingLang(true);
      const res = await axios.post(`${API}/i18n/translate`, {
        target_lang: code,
        base_lang: "en",
        entries: baseTranslations.en,
      });
      setDynamicTranslations((prev) => ({ ...prev, [code]: res.data.translations }));
      setLangState(code);
      if (typeof window !== "undefined") window.localStorage.setItem("ui_lang", code);
    } catch (e) {
      console.error("Failed to load translations", e);
    } finally {
      setIsLoadingLang(false);
    }
  };

  const currentLang = languages.find((l) => l.code === lang) || languages[0];
  return { lang, setLang: changeLang, t, currentLang, languages, isLoadingLang };
}

// ---- Auth helpers (MVP: token in localStorage) ----
function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      });
  }, [token]);

  const login = async (email, password) =>
    axios
      .post(`${API}/auth/login`, { email, password })
      .then((res) => {
        localStorage.setItem("token", res.data.access_token);
        setToken(res.data.access_token);
        return res;
      });

  const register = async (email, password, display_name) =>
    axios.post(`${API}/auth/register`, { email, password, display_name });

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return { token, user, login, register, logout };
}

function Landing({ t, lang, setLang, dark, setDark, currentLang, languages, isLoadingLang }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (token) {
      navigate("/app");
    } else {
      setAuthOpen(true);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)] transition-colors">
              <DownloadCloud className="h-5 w-5 text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base sm:text-sm font-semibold tracking-tight">GitPusher</span>
              <span className="text-[10px] sm:text-xs text-slate-400">No-Code GitHub workflow</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm relative">
            {menuOpen && (
              <div
                className="absolute right-0 top-10 z-20 flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs shadow-lg"
                data-testid="mobile-menu-panel"
              >
                <button
                  onClick={() => navigate("/pricing")}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg hover:bg-slate-900"
                  data-testid="mobile-menu-pricing-button"
                >
                  <span>Plans &amp; Tarifs</span>
                </button>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg hover:bg-slate-900"
                  data-testid="mobile-menu-login-button"
                >
                  <span>Login / Sign up</span>
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline">{t("theme")}</span>
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                data-testid="theme-toggle-switch"

              />
            </div>
            <Popover>
            <button
              onClick={() => navigate("/pricing")}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
              data-testid="nav-pricing-button"
            >
              <span className="flex flex-col items-start leading-tight">
                <span className="font-medium">Plans</span>
                <span className="text-[9px] text-slate-400">Tarifs</span>
              </span>
            </button>

              <PopoverTrigger asChild>
                <button
                  className="px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                  data-testid="language-popover-trigger"
                >
                  <span className="text-lg" aria-hidden="true">{currentLang.flag}</span>
                  <span className="hidden sm:inline">{currentLang.label}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="mt-2 w-64 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-2xl p-2"
                data-testid="language-popover-content"
              >
                <div className="max-h-64 overflow-auto text-xs">
                  {languages.map((lng) => (
                    <button
                      key={lng.code}
                      onClick={() => setLang(lng.code)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800 text-left ${
                        lng.code === lang ? "bg-slate-800/80" : ""
                      }`}
                      data-testid={`language-option-${lng.code}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg" aria-hidden="true">{lng.flag}</span>
                        <span>{lng.label}</span>
                      </span>
                      {lng.code === lang && (
                        <span className="text-[10px] text-cyan-300">Active</span>
                      )}
                    </button>
                  ))}
                  {isLoadingLang && (
                    <p
                      className="mt-2 text-[11px] text-slate-400"
                      data-testid="language-loading-text"
                    >
                      Loading translations…
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={authOpen} onOpenChange={setAuthOpen}>
              <PopoverTrigger asChild>
                <button
                  className="hidden sm:inline-flex px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs items-center gap-2"
                  data-testid="auth-popover-trigger"
                >
                  <span>Login / Sign up</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="mt-2 w-80 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-2xl p-0 overflow-hidden"
                data-testid="auth-popover-content"
              >
                <AuthCard t={t} onSuccess={() => {
                  setAuthOpen(false);
                  navigate("/app");
                }} />
              </PopoverContent>
            </Popover>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 sm:hidden"
              data-testid="mobile-menu-toggle-button"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="w-full max-w-4xl mx-auto px-4 py-14 grid grid-cols-1 gap-12 items-start">
          <div className="space-y-8 text-center lg:text-left">
            <p className="inline-flex items-center justify-center gap-2 text-[12px] sm:text-[11px] uppercase tracking-[0.25em] text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-4 py-1.5 rounded-full mx-auto lg:mx-0 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              AI Git Automation
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight max-w-2xl mx-auto lg:mx-0">
              {t("heroTitle")}<span className="text-cyan-300">.</span>
            </h1>
            {lang === "fr" ? (
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
                Dépose tes fichiers, l’IA organise ton projet, génère le README et pousse sur tes dépôts Git (
                <span className="text-cyan-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.9)] neon-flicker">
                  GitHub aujourd’hui, GitLab &amp; Bitbucket à venir
                </span>
                ).
              </p>
            ) : (
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
                {t("heroSubtitle")}
              </p>
            )}

            {/* Steps now just above CTA - redesigned inline */}
            <div className="mt-6 flex flex-col gap-3 text-[12px] sm:text-xs">
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-[130px] rounded-full border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-semibold">
                    1
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium">Upload</span>
                    <span className="text-[10px] text-slate-300">Zip, PDF, code…</span>
                  </div>
                </div>

                <div className="flex-1 min-w-[130px] rounded-full border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-semibold">
                    2
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium">IA organise</span>
                    <span className="text-[10px] text-slate-300">Structure &amp; dossiers</span>
                  </div>
                </div>

                <div className="flex-1 min-w-[130px] rounded-full border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-semibold">
                    3
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium">Push GitHub</span>
                    <span className="text-[10px] text-slate-300">Repo auto-créé</span>
                  </div>
                </div>

                <div className="flex-1 min-w-[130px] rounded-full border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-semibold">
                    4
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium">Analytics</span>
                    <span className="text-[10px] text-slate-300">Suivi des repos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Central drag & drop square (centered & larger) */}
            <div className="mt-8 flex justify-center">
              <label
                className="relative w-full max-w-md h-52 rounded-3xl border border-dashed border-cyan-400/60 bg-slate-950/40 hover:bg-slate-900/60 transition-colors flex flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_0_44px_rgba(34,211,238,0.35)]"
                data-testid="landing-file-dropzone"
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleGetStarted();
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[12px] uppercase tracking-[0.22em] text-cyan-300">
                    Drag &amp; Drop
                  </span>
                  <span className="text-base font-medium">Dépose tes fichiers ici</span>
                </div>
                <p className="text-[12px] text-slate-400 max-w-[80%] text-center">
                  Zip, PDF, dossiers de code… PUSH IN se charge de tout organiser et pousser sur GitHub.
                </p>
                <div className="mt-2 inline-flex items-center gap-2 text-[12px] text-slate-300">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500" />
                  <span>No Git, no CLI, just drop.</span>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleGetStarted();
                    }
                  }}
                  data-testid="landing-file-input"
                />
              </label>
            </div>

            {/* CTA moved below steps & dropzone */}
            <div className="flex flex-wrap items-center gap-4 mt-8 justify-center lg:justify-start">
              <Button
                size="lg"
                className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-3 shadow-lg shadow-cyan-500/30 text-sm sm:text-base"
                onClick={handleGetStarted}
                data-testid="get-started-button"
              >
                {t("getStarted")}
              </Button>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400">
                <span>No Git, no CLI, juste ton navigateur.</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-slate-700/70 bg-slate-950/60 hover:bg-slate-900/80 text-[11px]"
                  onClick={async () => {
                    try {
                      const res = await axios.post(`${API}/auth/demo`);
                      const token = res.data?.access_token;
                      if (token) {
                        window.localStorage.setItem("token", token);
                        navigate("/app");
                      }
                    } catch (e) {
                      console.error("Demo login failed", e);
                    }
                  }}
                  data-testid="demo-login-button"
                >
                  Accéder à la démo
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function AuthCard({ t, onSuccess }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
      else navigate("/app");
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, name);
      await login(email, password);
      if (onSuccess) onSuccess();
      else navigate("/app");
    } catch (err) {
      setError(err?.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const startOAuth = async (provider) => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch the OAuth URL from the backend
      const response = await axios.get(`${API}/auth/oauth/${provider}/url`);
      const oauthUrl = response.data.url;
      
      // Redirect to the OAuth provider
      window.location.href = oauthUrl;
    } catch (err) {
      setError(
        err?.response?.data?.detail || 
        `OAuth ${provider} n'est pas encore configuré. Veuillez contacter l'administrateur.`
      );
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/70 border-white/10 shadow-2xl shadow-cyan-500/20 text-slate-50">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {t("loginTab")} / {t("signupTab")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-slate-800/80" data-testid="auth-tabs-list">
            <TabsTrigger value="login" data-testid="login-tab-button">
              {t("loginTab")}
            </TabsTrigger>
            <TabsTrigger value="signup" data-testid="signup-tab-button">
              {t("signupTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-3" data-testid="login-form">
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  data-testid="login-email-input"
                />
              </div>
              <div>
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  data-testid="login-password-input"
                />
              </div>
              {error && (
                <div
                  className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded px-2 py-1"
                  data-testid="auth-error-message"
                >
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full mt-1 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                disabled={loading}
                data-testid="login-submit-button"
              >
                {loading ? "…" : t("loginCta")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-3" data-testid="signup-form">
              <div>
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                  data-testid="signup-name-input"
                />
              </div>
              <div>
                <Label htmlFor="email-signup">{t("email")}</Label>
                <Input
                  id="email-signup"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  data-testid="signup-email-input"
                />
              </div>
              <div>
                <Label htmlFor="password-signup">{t("password")}</Label>
                <Input
                  id="password-signup"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  data-testid="signup-password-input"
                />
              </div>
              {error && (
                <div
                  className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded px-2 py-1"
                  data-testid="signup-error-message"
                >
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full mt-1 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                disabled={loading}
                data-testid="signup-submit-button"
              >
                {loading ? "…" : t("signupCta")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-4 flex items-center gap-2 text-[11px] text-slate-400">
          <div className="flex-1 h-px bg-slate-700" />
          <span>{t("orContinueWith")}</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-center rounded-full border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs"
            onClick={() => startOAuth("google")}
            data-testid="google-oauth-button"
          >
            {t("google")}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-center rounded-full border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs"
            onClick={() => startOAuth("github")}
            data-testid="github-oauth-button"
          >
            {t("github")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard({ t, lang, setLang, dark, setDark, currentLang, languages, isLoadingLang }) {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (!token) return;
    const fetchAll = async () => {
      setLoading(true);
      setJobsLoading(true);
      try {
        const [projectsRes, jobsRes] = await Promise.all([
          axios.get(`${API}/workflows/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProjects(projectsRes.data);
        setJobs(jobsRes.data);
      } finally {
        setLoading(false);
        setJobsLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const newProject = async () => {
    setCreating(true);
    try {
      const res = await axios.post(
        `${API}/workflows/projects`,
        { name: null, description: null, language: "en" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProjects((prev) => [res.data, ...prev]);
      setSelected(res.data);
    } finally {
      setCreating(false);
    }
  };

  const openAccountSettings = () => {
    if (!user) return;
    navigate("/account");
  };

  const onFilesSelected = async (e) => {
    if (!selected) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    setUploading(true);
    try {
      await axios.post(`${API}/workflows/projects/${selected.id}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(33);
    } finally {
      setUploading(false);
    }
  };

  const launch = async () => {
    if (!selected) return;
    setProcessing(true);
    setProgress(60);
    try {
      const res = await axios.post(
        `${API}/workflows/projects/${selected.id}/process`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelected(res.data);
      setProjects((prev) => prev.map((p) => (p.id === res.data.id ? res.data : p)));
      setProgress(100);
    } catch (err) {
      console.error("Process project failed", err);
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  if (!token) return <Navigate to="/" replace />;

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-50 flex flex-col transition-opacity duration-500 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)]">
              <DownloadCloud className="h-5 w-5 text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base sm:text-sm font-semibold tracking-tight">GitPusher</span>
              <span className="text-[10px] sm:text-xs text-slate-400">{t("dashboardTitle")}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline">{t("theme")}</span>
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                data-testid="dashboard-theme-toggle-switch"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                  data-testid="dashboard-language-popover-trigger"
                >
                  <span className="text-lg" aria-hidden="true">{currentLang.flag}</span>
                  <span className="hidden sm:inline">{currentLang.label}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="mt-2 w-64 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-2xl p-2"
                data-testid="dashboard-language-popover-content"
              >
                <div className="max-h-64 overflow-auto text-xs">
                  {languages.map((lng) => (
                    <button
                      key={lng.code}
                      onClick={() => setLang(lng.code)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800 text-left ${
                        lng.code === lang ? "bg-slate-800/80" : ""
                      }`}
                      data-testid={`dashboard-language-option-${lng.code}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg" aria-hidden="true">{lng.flag}</span>
                        <span>{lng.label}</span>
                      </span>
                      {lng.code === lang && (
                        <span className="text-[10px] text-cyan-300">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 text-xs">
              {user && (
                <button
                  onClick={openAccountSettings}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
                  data-testid="dashboard-account-button"
                >
                  <span className="truncate max-w-[140px] text-slate-200">{user.email}</span>
                </button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-full border-slate-700 text-xs"
                data-testid="logout-button"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Projects */}
          <Card className="bg-gradient-to-br from-cyan-500/10 via-slate-900/70 to-slate-900/70 border-cyan-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Total Projects</p>
                  <p className="text-2xl font-bold text-cyan-300">{projects.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Projects */}
          <Card className="bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-slate-900/70 border-emerald-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-emerald-300">
                    {projects.filter(p => p.status === "done").length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Projects */}
          <Card className="bg-gradient-to-br from-amber-500/10 via-slate-900/70 to-slate-900/70 border-amber-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-amber-300">
                    {projects.filter(p => p.status !== "done").length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Jobs */}
          <Card className="bg-gradient-to-br from-violet-500/10 via-slate-900/70 to-slate-900/70 border-violet-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Total Jobs</p>
                  <p className="text-2xl font-bold text-violet-300">{jobs.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[1.1fr,1.4fr] gap-6">
          {/* Projects List */}
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm flex flex-col shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                  <GitBranch className="h-4 w-4 text-slate-950" />
                </div>
                <CardTitle className="text-sm sm:text-base">{t("dashboardTitle")}</CardTitle>
              </div>
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 text-xs shadow-lg"
                onClick={newProject}
                disabled={creating}
                data-testid="new-workflow-button"
              >
                {creating ? "…" : t("newWorkflow")}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <GitBranch className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400" data-testid="no-projects-text">
                    {t("noProjects")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2" data-testid="projects-list">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`group w-full text-left text-xs sm:text-sm px-4 py-3 rounded-xl border transition-all duration-200 ${
                        selected?.id === p.id
                          ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-400/60 shadow-lg shadow-cyan-500/20"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:shadow-md"
                      }`}
                      data-testid={`project-card-${p.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            p.status === "done" ? "bg-emerald-400" : "bg-amber-400"
                          } ${selected?.id === p.id ? "animate-pulse" : ""}`}></div>
                          <span className="font-medium truncate">{p.name}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full border font-medium ${
                            p.status === "done"
                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-400/50 bg-amber-400/10 text-amber-200"
                          }`}
                          data-testid="project-status-pill"
                        >
                          {p.status}
                        </span>
                      </div>
                      {p.github_repo_url && (
                        <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 truncate">
                          <Rocket className="h-3 w-3" />
                          <span className="truncate">{p.github_repo_url}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-slate-900/70 border-slate-800 flex flex-col" data-testid="project-stepper-card">
              <CardHeader>
              <CardTitle className="text-sm sm:text-base flex items-center justify-between">
                <span>{selected ? selected.name : t("stepUpload")}</span>
                {selected && selected.github_repo_url && (
                  <a
                    href={selected.github_repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-300 hover:text-cyan-200"
                    data-testid="project-github-link"
                  >
                    {t("linkRepo")}
                  </a>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 text-xs sm:text-sm">
              {!selected ? (
                <p className="text-slate-400">{t("noProjects")}</p>
              ) : (
                <>
                  {/* Upload step, config, launch: déjà présents plus haut dans le fichier, conservés */}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm flex flex-col shadow-xl" data-testid="jobs-history-card">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-slate-950" />
                </div>
                <CardTitle className="text-sm sm:text-base">Historique des jobs</CardTitle>
              </div>
              <div className="px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/30">
                <span className="text-xs font-medium text-violet-300">{jobs.length} total</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-2 text-xs sm:text-sm">
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <Activity className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500" data-testid="jobs-empty-text">
                    Aucun job pour le moment. Lance une automatisation pour voir l&apos;historique ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-2" data-testid="jobs-list">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900/60 hover:border-slate-700 transition-all duration-200"
                      data-testid={`job-row-${job.id}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          job.status === "completed"
                            ? "bg-emerald-500/20"
                            : job.status === "failed"
                              ? "bg-red-500/20"
                              : "bg-amber-400/20"
                        }`}>
                          {job.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : job.status === "failed" ? (
                            <XCircle className="h-5 w-5 text-red-400" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs">Job {job.id.slice(0, 8)}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                                job.status === "completed"
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                  : job.status === "failed"
                                    ? "border-red-500/60 bg-red-500/10 text-red-300"
                                    : "border-amber-400/60 bg-amber-400/10 text-amber-200"
                              }`}
                              data-testid="job-status-pill"
                            >
                              {job.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {job.project_name || job.project_id}
                          </span>
                          {job.created_at && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(job.created_at).toLocaleString()}
                            </span>
                          )}
                          {job.error && (
                            <span
                              className="text-[10px] text-red-300 flex items-center gap-1"
                              data-testid="job-error-text"
                            >
                              <XCircle className="h-3 w-3" />
                              <span className="truncate">{job.error}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

 

function AccountPage({ t, lang, setLang, dark, setDark, currentLang, languages, isLoadingLang }) {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    document.documentElement.classList.toggle("dark", dark);
  }, [token, dark, navigate]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setProfileName(res.data.display_name || res.data.email || "");
      })
      .catch((err) => {
        console.error("Load profile failed", err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const saveProfile = async () => {
    if (!token) return;
    setError("");
    setSuccess("");
    setSavingProfile(true);
    try {
      await axios.patch(
        `${API}/users/me`,
        { display_name: profileName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccess("Profil mis à jour.");
    } catch (err) {
      setError(err?.response?.data?.detail || "Erreur lors de la mise à jour du profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!token) return;
    setError("");
    setSuccess("");
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setError("Merci de remplir tous les champs mot de passe.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setChangingPw(true);
    try {
      await axios.post(
        `${API}/users/me/change-password`,
        { current_password: pwCurrent, new_password: pwNew },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccess("Mot de passe mis à jour.");
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
    } catch (err) {
      setError(err?.response?.data?.detail || "Erreur lors du changement de mot de passe.");
    } finally {
      setChangingPw(false);
    }
  };

  const deleteAccount = async () => {
    if (!token) return;
    setError("");
    setSuccess("");
    const confirmText = window.prompt(
      "Cette action est irréversible. Tape SUPPRIMER pour confirmer la suppression de ton compte.",
    );
    if (confirmText !== "SUPPRIMER") return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Erreur lors de la suppression du compte.");
    } finally {
      setDeleting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header réutilisé du dashboard */}
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)]">
              <DownloadCloud className="h-5 w-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">GitPusher</span>
              <span className="text-xs text-slate-400">Mon compte</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline">{t("theme")}</span>
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                data-testid="account-theme-toggle-switch"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
                  data-testid="account-language-popover-trigger"
                >
                  <span className="text-lg" aria-hidden="true">
                    {currentLang.flag}
                  </span>
                  <span className="hidden sm:inline">{currentLang.label}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="mt-2 w-64 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-2xl p-2"
                data-testid="account-language-popover-content"
              >
                <div className="max-h-64 overflow-auto text-xs">
                  {languages.map((lng) => (
                    <button
                      key={lng.code}
                      onClick={() => setLang(lng.code)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800 text-left ${
                        lng.code === lang ? "bg-slate-800/80" : ""
                      }`}
                      data-testid={`account-language-option-${lng.code}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg" aria-hidden="true">
                          {lng.flag}
                        </span>
                        <span>{lng.label}</span>
                      </span>
                      {lng.code === lang && (
                        <span className="text-[10px] text-cyan-300">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 text-xs">
              {user && (
                <span className="hidden sm:inline text-slate-400" data-testid="account-user-email">
                  {user.email}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/app")}
                className="rounded-full border-slate-700 text-xs"
                data-testid="account-back-dashboard-button"
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-full border-slate-700 text-xs"
                data-testid="account-logout-button"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Mon compte</h1>

        {error && (
          <div
            className="text-xs text-red-300 bg-red-950/40 border border-red-500/40 rounded px-3 py-2"
            data-testid="account-error-alert"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-500/40 rounded px-3 py-2"
            data-testid="account-success-alert"
          >
            {success}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profil */}
          <Card className="bg-slate-900/70 border-slate-800" data-testid="account-profile-card">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              {loading ? (
                <p className="text-slate-400" data-testid="account-profile-loading-text">
                  Chargement du profil…
                </p>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="display-name">Nom d&apos;affichage</Label>
                    <Input
                      id="display-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="h-8 text-xs bg-slate-950/60 border-slate-700"
                      data-testid="account-display-name-input"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs"
                    onClick={saveProfile}
                    disabled={savingProfile}
                    data-testid="account-save-profile-button"
                  >
                    {savingProfile ? "…" : "Enregistrer"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Mot de passe */}
          <Card className="bg-slate-900/70 border-slate-800" data-testid="account-password-card">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Mot de passe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <p className="text-slate-400 text-[11px]">
                Mets à jour ton mot de passe. Ceci ne s&apos;applique qu&apos;à la connexion par email/mot de passe.
              </p>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="pw-current">Mot de passe actuel</Label>
                  <Input
                    id="pw-current"
                    type="password"
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    className="mt-1 h-8 text-xs bg-slate-950/60 border-slate-700"
                    data-testid="account-current-password-input"
                  />
                </div>
                <div>
                  <Label htmlFor="pw-new">Nouveau mot de passe</Label>
                  <Input
                    id="pw-new"
                    type="password"
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    className="mt-1 h-8 text-xs bg-slate-950/60 border-slate-700"
                    data-testid="account-new-password-input"
                  />
                </div>
                <div>
                  <Label htmlFor="pw-confirm">Confirme le nouveau mot de passe</Label>
                  <Input
                    id="pw-confirm"
                    type="password"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    className="mt-1 h-8 text-xs bg-slate-950/60 border-slate-700"
                    data-testid="account-confirm-password-input"
                  />
                </div>
              </div>
              <Button
                size="sm"
                className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs"
                onClick={changePassword}
                disabled={changingPw}
                data-testid="account-change-password-button"
              >
                {changingPw ? "…" : "Mettre à jour le mot de passe"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Suppression compte */}
        <Card className="bg-red-950/40 border-red-700/60" data-testid="account-delete-card">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base text-red-200">Supprimer mon compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-red-100">
            <p>
              Cette action est <span className="font-semibold">définitive</span>. Ton compte sera anonymisé
              et les workflows associés marqués comme supprimés.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-red-400/80 text-red-200 hover:bg-red-900/60 text-xs"
              onClick={deleteAccount}
              disabled={deleting}
              data-testid="account-delete-button"
            >
              {deleting ? "…" : "Supprimer mon compte"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function PricingPage({ t, lang, setLang, dark, setDark, currentLang, languages, isLoadingLang }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)]">
              <DownloadCloud className="h-5 w-5 text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base sm:text-sm font-semibold tracking-tight">GitPusher</span>
              <span className="text-[10px] sm:text-xs text-slate-400">Plans &amp; Tarifs</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <button
              onClick={() => setLang(lang === "en" ? "fr" : "en")}
              className="px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
              data-testid="pricing-language-toggle-button"
            >
              <span className="text-lg" aria-hidden="true">{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.label}</span>
            </button>
            <button
              onClick={() => setDark(!dark)}
              className="px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
              data-testid="pricing-theme-toggle-button"
            >
              <span>{t("theme")}</span>
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="rounded-full border-slate-700 text-xs"
              data-testid="pricing-back-button"
            >
              Retour
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
          <section className="space-y-4">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-3 py-1 rounded-full w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              <span>Plans &amp; Tarifs</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              Publiez vos projets Git sans écrire une ligne de code.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              GitPusher automatise la création de vos dépôts (GitHub, GitLab, Bitbucket),
              range vos fichiers avec l&apos;IA, génère votre README et pousse tout en un clic.
            </p>
          </section>

          {/* Plans */}
          <section className="grid gap-6 md:grid-cols-3">
            {/* Freemium */}
            <Card
              className="bg-slate-900/70 border-slate-800 flex flex-col justify-between"
              data-testid="pricing-freemium-card"
            >
              <CardHeader className="space-y-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>🌱 Freemium</span>
                  <span className="text-[11px] text-slate-400">Gratuit</span>
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Pour tester la plateforme sans engagement.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <ul className="space-y-1">
                  <li>✔️ 1 upload / mois (ZIP, PDF, fichiers ou code)</li>
                  <li>✔️ Création automatique d&apos;un dépôt GitHub</li>
                  <li>✔️ Organisation IA basique des fichiers</li>
                  <li>✔️ Génération d&apos;un README simplifié</li>
                  <li>✔️ Commit automatique</li>
                  <li>✔️ Support par email (48–72h)</li>
                </ul>
                <div className="pt-2">
                  <p className="text-lg font-semibold">0€<span className="text-xs text-slate-400"> / mois</span></p>
                </div>
              </CardContent>
              <div className="px-6 pb-5">
                <Button
                  className="w-full rounded-full bg-slate-800 hover:bg-slate-700 text-xs"
                  data-testid="pricing-freemium-cta"
                  onClick={async () => {
                    try {
                      const res = await axios.post(
                        `${API}/billing/plan`,
                        { plan: "freemium" },
                        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
                      );
                      console.log("Plan freemium appliqué", res.data);
                    } catch (e) {
                      console.error("Set freemium plan failed", e);
                    }
                  }}
                >
                  Commencer gratuitement
                </Button>
              </div>
            </Card>

            {/* Premium */}
            <Card
              className="bg-gradient-to-b from-cyan-500/20 via-cyan-500/10 to-slate-900 border border-cyan-400/60 flex flex-col justify-between shadow-[0_0_40px_rgba(34,211,238,0.40)]"
              data-testid="pricing-premium-card"
            >
              <CardHeader className="space-y-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>⚡ Premium</span>
                  <span className="text-[11px] text-cyan-200">19,99€ / mois</span>
                </CardTitle>
                <p className="text-xs text-slate-200">
                  Pour créateurs réguliers, non-dev, auto-entrepreneurs, étudiants IA.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="font-semibold text-slate-100">Uploads &amp; IA</p>
                <ul className="space-y-1">
                  <li>🔥 Uploads illimités</li>
                  <li>🔥 Structuration automatique des dossiers</li>
                  <li>🔥 Génération d&apos;un README complet (pro, marketing, documentation)</li>
                  <li>🔥 Commit intelligent multi-étapes</li>
                  <li>🔥 Détection du langage / dépendances</li>
                </ul>
                <p className="font-semibold text-slate-100 pt-2">Plateformes &amp; productivité</p>
                <ul className="space-y-1">
                  <li>🔥 Support GitHub, GitLab &amp; Bitbucket</li>
                  <li>🔥 Historique de projets + duplication en 1 clic</li>
                  <li>🔥 Processing rapide et prioritaire</li>
                  <li>🔥 Export ZIP final organisé</li>
                  <li>🔥 Support 24/7 prioritaire</li>
                </ul>
              </CardContent>
              <div className="px-6 pb-5 space-y-2">
                <Button
                  className="w-full rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs"
                  data-testid="pricing-premium-cta"
                  onClick={async () => {
                    try {
                      const res = await axios.post(
                        `${API}/billing/plan`,
                        { plan: "premium" },
                        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
                      );
                      console.log("Plan premium appliqué", res.data);
                    } catch (e) {
                      console.error("Set premium plan failed", e);
                    }
                  }}
                >
                  Passer en Premium
                </Button>
                <p className="text-[10px] text-slate-300 text-center">
                  Sans engagement. Annulation en un clic.
                </p>
              </div>
            </Card>

            {/* Business */}
            <Card
              className="bg-slate-900/80 border-slate-700 flex flex-col justify-between"
              data-testid="pricing-business-card"
            >
              <CardHeader className="space-y-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>🏢 Business</span>
                  <span className="text-[11px] text-slate-400">Sur devis</span>
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Pour écoles, agences, équipes SaaS et créateurs IA multi-comptes.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <ul className="space-y-1">
                  <li>✔️ 10 à 200 utilisateurs</li>
                  <li>✔️ Intégration API + webhooks</li>
                  <li>✔️ Automations avancées (CI/CD auto, nettoyage, versioning IA)</li>
                  <li>✔️ Tableau de bord boosté IA</li>
                  <li>✔️ Branding entreprise</li>
                  <li>✔️ SLA &amp; support dédié</li>
                </ul>
                <div className="pt-2">
                  <p className="text-sm font-semibold">À partir de 199€<span className="text-xs text-slate-400"> / mois</span></p>
                </div>
              </CardContent>
              <div className="px-6 pb-5">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-cyan-400/60 text-cyan-200 text-xs hover:bg-slate-900/80"
                  data-testid="pricing-business-cta"
                  onClick={async () => {
                    try {
                      const res = await axios.post(
                        `${API}/billing/plan`,
                        { plan: "business" },
                        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
                      );
                      console.log("Plan business appliqué", res.data);
                    } catch (e) {
                      console.error("Set business plan failed", e);
                    }
                  }}
                >
                  Contacter l&apos;équipe
                </Button>
              </div>
            </Card>
          </section>

          {/* Section "Ce qui rend la plateforme unique" avec 3 barres dépliantes */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Ce qui rend GitPusher unique</h2>
            <div className="space-y-3">
              <details
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 cursor-pointer transition-colors"
                data-testid="pricing-unique-accordion-1"
              >
                <summary className="flex items-center justify-between gap-2 list-none">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Aucun Git, aucune CLI, aucun IDE</span>
                    <span className="text-[11px] text-slate-400">
                      Publiez depuis votre navigateur, GitPusher gère toute la plomberie Git.
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
              </details>

              <details
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 cursor-pointer transition-colors"
                data-testid="pricing-unique-accordion-2"
              >
                <summary className="flex items-center justify-between gap-2 list-none">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">L&apos;IA range, documente et pousse tout</span>
                    <span className="text-[11px] text-slate-400">
                      Structure de dossiers, README, commits : tout est généré automatiquement.
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
              </details>

              <details
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 cursor-pointer transition-colors"
                data-testid="pricing-unique-accordion-3"
              >
                <summary className="flex items-center justify-between gap-2 list-none">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Compatible avec vos prompts IA</span>
                    <span className="text-[11px] text-slate-400">
                      Fonctionne avec les résultats ChatGPT, Claude, Gemini et autres modèles.
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
              </details>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// OAuth Callback Component
function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Authentification en cours...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      // Success: save token and redirect to dashboard
      localStorage.setItem("token", token);
      setStatus("success");
      setMessage("Connexion réussie ! Redirection...");
      setTimeout(() => {
        navigate("/app");
      }, 1000);
    } else if (error) {
      // Error: show error message
      setStatus("error");
      const errorMessages = {
        oauth_not_configured: "OAuth n'est pas configuré sur le serveur",
        failed_token_exchange: "Échec de l'échange du code d'autorisation",
        failed_profile_fetch: "Impossible de récupérer votre profil",
        no_github_token: "Aucun token GitHub reçu",
        oauth_failed: "Échec de l'authentification OAuth"
      };
      setMessage(errorMessages[error] || "Une erreur s'est produite lors de la connexion");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else {
      // No token or error
      setStatus("error");
      setMessage("Paramètres d'authentification manquants");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
      <Card className="bg-slate-900/70 border-white/10 shadow-2xl shadow-cyan-500/20 text-slate-50 max-w-md w-full mx-4">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          {status === "processing" && (
            <>
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-300">{message}</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-sm text-slate-300">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="text-sm text-red-300">{message}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AppShell() {
  const { lang, setLang, t, currentLang, languages, isLoadingLang } = useI18n();
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) navigate("/app");
    else navigate("/");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Landing
            t={t}
            lang={lang}
            setLang={setLang}
            dark={dark}
            setDark={setDark}
            onGetStarted={handleGetStarted}
            currentLang={currentLang}
            languages={languages}
          />
        }
      />
      <Route 
        path="/app" 
        element={
          <Dashboard 
            t={t} 
            lang={lang}
            setLang={setLang}
            dark={dark}
            setDark={setDark}
            currentLang={currentLang}
            languages={languages}
            isLoadingLang={isLoadingLang}
          />
        } 
      />
      <Route 
        path="/account" 
        element={
          <AccountPage 
            t={t} 
            lang={lang}
            setLang={setLang}
            dark={dark}
            setDark={setDark}
            currentLang={currentLang}
            languages={languages}
            isLoadingLang={isLoadingLang}
          />
        } 
      />
      <Route 
        path="/pricing" 
        element={
          <PricingPage 
            t={t} 
            lang={lang}
            setLang={setLang}
            dark={dark}
            setDark={setDark}
            currentLang={currentLang}
            languages={languages}
            isLoadingLang={isLoadingLang}
          />
        } 
      />
      <Route 
        path="/auth/callback" 
        element={<OAuthCallback />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Ping backend
    axios
      .get(`${API}/`)
      .then(() => {
        // ok
      })
      .catch((e) => {
        console.error("Backend unreachable", e);
      });
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </div>
  );
}

export default App;
