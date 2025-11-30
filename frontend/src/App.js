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
import { DownloadCloud, Menu, GitBranch, Rocket, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Activity, Github, ArrowLeft } from "lucide-react";
import { AdminLoginPage, AdminDashboardPage } from "./AdminPages";
import { AdminSupportPanel } from "./components/AdminSupportPanel";
import { AdminAutofixPanel } from "./components/AdminAutofixPanel";
import ForAIAssistants from "./pages/ForAIAssistants";

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
    gitlab: "Continue with GitLab",
    bitbucket: "Continue with Bitbucket",
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
    // Landing specific
    landingHeroBadge: "AI Git Automation",
    landingDropLabel: "Drag & Drop",
    landingDropTitle: "Drop your files here",
    landingDropDescription:
      "Zip, PDFs, code folders… GitPusher organizes everything and pushes to Git for you.",
    landingDropTagline: "No Git, no CLI, just your browser.",
    landingDemoCta: "Access the demo",
    landingPrimaryCta: "Start for free",
    navPricing: "Pricing",
    navWhitepaper: "White Paper",
    navForAIAssistants: "For AI Assistants",
    // Pricing specific
    pricingBadge: "PLANS & PRICING",
    pricingHeroTitle: "Pay only for what you use",
    pricingHeroSubtitle:
      "Flexible credit system. 2 credits = 1 upload with full AI generation (README, .gitignore, LICENSE, CHANGELOG) + push to your favorite Git platforms.",
    pricingMonthlyTitle: "Or choose a monthly subscription",
    pricingMonthlySubtitle: "Unlimited uploads every month",
  },
  fr: {
    heroTitle: "Workflow Git No-Code",
    heroSubtitle:
      "Dépose tes fichiers, l’IA organise ton projet, génère le README et pousse tes dépôts Git (GitHub, GitLab, Bitbucket, Azure DevOps, Gitea…).",
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
    gitlab: "Continuer avec GitLab",
    bitbucket: "Continuer avec Bitbucket",
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
    // Landing specific
    landingHeroBadge: "Automatisation Git par IA",
    landingDropLabel: "Drag & Drop",
    landingDropTitle: "Dépose tes fichiers ici",
    landingDropDescription:
      "Zip, PDF, dossiers de code… GitPusher s’occupe de tout organiser et pousser sur Git.",
    landingDropTagline: "No Git, no CLI, juste ton navigateur.",
    landingDemoCta: "Accéder à la démo",
    landingPrimaryCta: "Commencer gratuitement",
    navPricing: "Tarifs",
    navWhitepaper: "Livre Blanc",
    navForAIAssistants: "Pour les assistants IA",
    // Pricing specific
    pricingBadge: "PLANS & TARIFS",
    pricingHeroTitle: "Payez uniquement pour ce que vous utilisez",
    pricingHeroSubtitle:
      "Système de crédits flexible. 2 crédits = 1 upload avec génération IA complète (README, .gitignore, LICENSE, CHANGELOG) + push vers vos plateformes Git préférées.",
    pricingMonthlyTitle: "Ou choisissez un abonnement mensuel",
    pricingMonthlySubtitle: "Uploads illimités chaque mois",
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
    // Si on clique sur la langue déjà active, on ne fait rien
    if (code === lang) return;

    // EN / FR : on reste sur les traductions locales stables
    if (code === "en" || code === "fr") {
      setLangState(code);
      if (typeof window !== "undefined") window.localStorage.setItem("ui_lang", code);
      return;
    }

    // Autres langues : on force un appel LLM à chaque clic pour un effet direct / test
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

function Landing({ t, lang, setLang, dark, setDark, currentLang, languages, isLoadingLang, forceSignupMode = false }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  const handleGetStarted = () => {
    if (token) {
      // Utilisateur connecté : accès direct au dashboard
      navigate("/app");
    } else {
      // Non connecté : redirection vers la page de création de compte
      navigate("/signup");
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Si on est en mode /signup, ouvrir immédiatement le bloc d'inscription
  useEffect(() => {
    if (!forceSignupMode) return;
    const id = window.setTimeout(() => {
      setAuthOpen(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [forceSignupMode]);




  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 md:gap-3 group"
          >
            <div className="h-11 w-11 md:h-[52px] md:w-[52px] rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)] transition-transform group-hover:scale-105">
              <DownloadCloud className="h-[22px] w-[22px] md:h-[26px] md:w-[26px] text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[17px] md:text-[19px] font-semibold tracking-tight">
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span><span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent text-[13px] md:text-[15px]">.AI</span>
              </span>
              <span className="text-[11px] md:text-[13px] text-slate-400">No-Code GitHub workflow</span>
            </div>
          </button>
          <div className="flex items-center gap-2 md:gap-3 text-xs sm:text-sm relative">
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
              <span className="text-slate-400 hidden sm:inline text-sm">{t("theme")}</span>
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                data-testid="theme-toggle-switch"

              />
            </div>
            <button
              onClick={() => navigate("/pricing")}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/50 hover:border-cyan-400/80 hover:from-cyan-500/30 hover:to-violet-500/30 transition-all text-sm font-medium"
              data-testid="nav-pricing-button"
            >
              <span className="text-cyan-300">💎</span>
              <span className="text-slate-100">Plans &amp; Tarifs</span>
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm flex items-center gap-2"
                  data-testid="language-popover-trigger"
                >
                  <span className="text-lg" aria-hidden="true">{currentLang.flag}</span>
                  <span className="hidden sm:inline text-slate-200">{currentLang.label}</span>
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
                  className="hidden md:inline-flex px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm items-center gap-2"
                  data-testid="auth-popover-trigger"
                >
                  <span className="text-slate-200">Login / Sign up</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="mt-2 w-80 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-2xl p-0 overflow-hidden"
                data-testid="auth-popover-content"
              >
                <AuthCard
                  t={t}
                  onSuccess={() => {
                    setAuthOpen(false);
                    navigate("/app");
                  }}
                  onClose={() => setAuthOpen(false)}
                  initialTab={forceSignupMode ? "signup" : "login"}
                />
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
        <div className="w-full max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 gap-12 items-start">
          <div className="space-y-4 sm:space-y-8 text-center lg:text-left">
            <p className="inline-flex items-center justify-center gap-2 text-[12px] sm:text-[11px] uppercase tracking-[0.25em] text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-4 py-1.5 rounded-full mx-auto lg:mx-0 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              {t("landingHeroBadge")}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight max-w-2xl mx-auto lg:mx-0">
              {lang === "fr" ? (
                <>
                  Workflow Git <span className="whitespace-nowrap bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(56,189,248,1)] neon-flicker">No-Code</span>
                </>
              ) : (
                <>
                  <span className="whitespace-nowrap bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(56,189,248,1)] neon-flicker">No-Code</span> Git Workflow
                </>
              )}
              <span className="text-cyan-300 text-5xl sm:text-6xl align-baseline leading-none drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]">.</span>
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200/70 font-medium max-w-2xl mx-auto lg:mx-0 mt-1 lg:-mt-8">
              The universal AI-to-Git push engine used by assistants, agents, and autonomous coding systems worldwide.
            </p>
            <p className="text-[13px] sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 mt-3">
              <span className="text-slate-300">
                Dépose tes fichiers, l’IA organise ton projet, génère le README et pousse tes dépôts Git
              </span>
              <span className="ml-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-300 bg-clip-text text-transparent font-semibold drop-shadow-[0_0_22px_rgba(56,189,248,1)] neon-flicker">
                (GitHub, GitLab, Bitbucket, Azure DevOps, Gitea…)
              </span>
            </p>

            {/* Steps now just above CTA - redesigned inline */}
            <div className="mt-6 flex flex-col gap-3 text-[12px] sm:text-xs lg:text-sm">
              <div className="flex flex-wrap gap-2 lg:gap-3">
                {/* Step 1 */}
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 1 ? null : 1)}
                  className={`flex-1 min-w-[130px] lg:min-w-[160px] rounded-full border px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-2 transition-all duration-200 hover:border-cyan-400/80 hover:bg-cyan-500/10 ${
                    activeStep === 1 ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_18px_rgba(34,211,238,0.6)]" : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className="h-6 w-6 lg:h-7 lg:w-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] lg:text-[13px] font-semibold">
                    1
                  </span>
                  <div className="flex flex-col leading-tight text-left">
                    <span className="font-medium">Upload</span>
                    <span className="text-[10px] lg:text-[11px] text-slate-300">Zip, PDF, code…</span>
                  </div>
                </button>

                {/* Step 2 */}
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 2 ? null : 2)}
                  className={`flex-1 min-w-[130px] lg:min-w-[160px] rounded-full border px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-2 transition-all duration-200 hover:border-cyan-400/80 hover:bg-cyan-500/10 ${
                    activeStep === 2 ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_18px_rgba(34,211,238,0.6)]" : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className="h-6 w-6 lg:h-7 lg:w-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] lg:text-[13px] font-semibold">
                    2
                  </span>
                  <div className="flex flex-col leading-tight text-left">
                    <span className="font-medium">IA organise</span>
                    <span className="text-[10px] lg:text-[11px] text-slate-300">Structure &amp; dossiers</span>
                  </div>
                </button>

                {/* Step 3 */}
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 3 ? null : 3)}
                  className={`flex-1 min-w-[130px] lg:min-w-[160px] rounded-full border px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-2 transition-all duration-200 hover:border-cyan-400/80 hover:bg-cyan-500/10 ${
                    activeStep === 3 ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_18px_rgba(34,211,238,0.6)]" : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className="h-6 w-6 lg:h-7 lg:w-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] lg:text-[13px] font-semibold">
                    3
                  </span>
                  <div className="flex flex-col leading-tight text-left">
                    <span className="font-medium">Push GitHub</span>
                    <span className="text-[10px] lg:text-[11px] text-slate-300">Repo auto-créé</span>
                  </div>
                </button>

                {/* Step 4 */}
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 4 ? null : 4)}
                  className={`flex-1 min-w-[130px] lg:min-w-[160px] rounded-full border px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-2 transition-all duration-200 hover:border-cyan-400/80 hover:bg-cyan-500/10 ${
                    activeStep === 4 ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_18px_rgba(34,211,238,0.6)]" : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className="h-6 w-6 lg:h-7 lg:w-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] lg:text-[13px] font-semibold">
                    4
                  </span>
                  <div className="flex flex-col leading-tight text-left">
                    <span className="font-medium">Analytics</span>
                    <span className="text-[10px] lg:text-[11px] text-slate-300">Suivi des repos</span>
                  </div>
                </button>
              </div>

              {/* Contextual helper under steps */}
              <div className="min-h-[40px] text-[11px] sm:text-xs text-slate-300 mt-1">
                {activeStep === 1 && (
                  <p>
                    Après l&apos;upload, Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span> analyse ton ZIP, PDF ou dossier de code et prépare le job.
                  </p>
                )}
                {activeStep === 2 && (
                  <p>
                    L&apos;IA détecte les langages, crée l&apos;arborescence propre et ajoute les bons fichiers README, .gitignore, LICENSE, CHANGELOG.
                  </p>
                )}
                {activeStep === 3 && (
                  <p>
                    On crée automatiquement un dépôt Git (GitHub, GitLab, Bitbucket…) puis on pousse tous les commits pour toi.
                  </p>
                )}
                {activeStep === 4 && (
                  <p>
                    Tu suis l&apos;état de chaque push (succès, erreurs, logs) directement depuis ton tableau de bord.
                  </p>
                )}
                {!activeStep && (
                  <p className="text-slate-500">
                    Clique sur une étape pour voir en un coup d&apos;œil ce que fait Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span> pour toi.
                  </p>
                )}
              </div>
            </div>

            {/* Central drag & drop square (centered & larger) */}
            <div className="mt-8 flex justify-center">
              <label
                className="relative w-full max-w-md lg:max-w-lg h-52 lg:h-64 rounded-3xl border border-dashed border-cyan-400/60 bg-slate-950/40 hover:bg-slate-900/60 transition-colors flex flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_0_44px_rgba(34,211,238,0.35)]"
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
                  <span className="text-[12px] lg:text-[14px] uppercase tracking-[0.22em] text-cyan-300">
                    {t("landingDropLabel")}
                  </span>
                  <span className="text-base lg:text-lg font-medium">{t("landingDropTitle")}</span>
                </div>
                <p className="text-[12px] lg:text-[13px] text-slate-400 max-w-[80%] text-center">
                  {t("landingDropDescription")}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 text-[12px] lg:text-[13px] text-slate-300">
                  <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500" />
                  <span>{t("landingDropTagline")}</span>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      if (typeof window !== "undefined") {
                        window.__landingFiles = files;
                      }
                      handleGetStarted();
                    }
                  }}
                  data-testid="landing-file-input"
                />
              </label>
            </div>

            {/* CTA moved below steps & dropzone */}
            <div className="flex flex-wrap items-center gap-4 mt-8 justify-center">
              <Button
                size="lg"
                className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-3 shadow-lg shadow-cyan-500/30 text-sm sm:text-base"
                onClick={handleGetStarted}
                data-testid="get-started-button"
              >
                {t("landingPrimaryCta")}
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
                  {t("landingDemoCta")}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer with White Paper link */}
      <footer className="w-full border-t border-white/5 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2024 Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span>. No-Code Git Workflow powered by AI.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/whitepaper")}
              className="hover:text-cyan-300 transition-colors underline"
            >
              📄 {t("navWhitepaper")}
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="hover:text-cyan-300 transition-colors"
            >
              {t("navPricing")}
            </button>
            <button
              onClick={() => navigate("/terms")}
              className="hover:text-cyan-300 transition-colors text-[11px]"
            >
              {"CGU"}
            </button>
            <button
              onClick={() => navigate("/for-ai-assistants")}
              className="hover:text-cyan-300 transition-colors"
            >
              🤖 {t("navForAIAssistants")}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuthCard({ t, onSuccess, onClose, initialTab = "login" }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");

  const { token } = useAuth();

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
    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions générales d'utilisation pour créer un compte.");
      return;
    }
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
      setOauthProvider(provider);
      setError("");
      
      // Récupère l'URL OAuth côté backend
      const response = await axios.get(`${API}/auth/oauth/${provider}/url`);
      const oauthUrl = response.data.url;
      
      // Laisse une micro-pause visuelle avant la redirection (feedback utilisateur)
      setTimeout(() => {
        window.location.href = oauthUrl;
      }, 150);
    } catch (err) {
      setError(
        err?.response?.data?.detail || 
        `OAuth ${provider} n'est pas encore configuré. Veuillez contacter l'administrateur.`
      );
      setLoading(false);
      setOauthProvider(null);
    }
  };

  return (
    <Card className="bg-slate-900/70 border-white/10 shadow-2xl shadow-cyan-500/20 text-slate-50 relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-2 text-slate-300 hover:text-white text-2xl leading-none"
        aria-label="Fermer"
      >
        ×
      </button>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-center">
          Bienvenue sur GitPusher.AI
        </CardTitle>
        <p className="text-xs text-slate-400 text-center mt-2">Choisissez une option pour continuer</p>
      </CardHeader>
      <CardContent>
        {/* Boutons de distinction Connexion / Inscription */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-slate-950/60 rounded-full border border-slate-800">
          <button
            onClick={() => setTab("login")}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === "login"
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-[0_0_18px_rgba(56,189,248,0.6)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            🔓 Connexion
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === "signup"
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-[0_0_18px_rgba(56,189,248,0.6)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            ✨ Inscription
          </button>
        </div>

        <p className="text-sm text-slate-300 mb-3 text-center font-medium">
          {tab === "login" ? "Connectez-vous avec :" : "Créez votre compte avec :"}
        </p>

        {/* Bloc connexions rapides en premier */}
        <div className="mb-5 space-y-4">
          <div className="space-y-2 flex flex-col items-center">
            <p className="text-[11px] text-slate-400 self-start">Connexion ultra-rapide :</p>
            <Button
              className={`w-full sm:w-auto justify-center rounded-full bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border text-xs sm:text-sm font-semibold px-3 py-2 flex items-center gap-2 transition-all duration-200 text-slate-50 ${
                oauthProvider === "github"
                  ? "border-cyan-300 shadow-[0_0_28px_rgba(56,189,248,1)]"
                  : "border-cyan-400/80 hover:border-cyan-300 hover:bg-slate-900 shadow-[0_0_18px_rgba(56,189,248,0.7)]"
              }`}
              onClick={() => startOAuth("github")}
              data-testid="github-oauth-button"
              disabled={loading}
            >
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-cyan-400/80">
                  <Github className="h-5 w-5 text-cyan-300" />
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-sm font-semibold text-slate-50 whitespace-nowrap">
                    Continuer avec GitHub
                  </span>
                  {oauthProvider === "github" && (
                    <span className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </span>
              </span>
            </Button>
            {oauthProvider === "github" && (
              <p className="mt-1 text-[10px] text-cyan-300/80 text-center">
                Redirection sécurisée vers GitHub en cours…
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
            <Button
              variant="outline"
              className="w-full justify-center rounded-full border border-cyan-500/40 bg-slate-900 hover:bg-slate-900/80 text-slate-50 shadow-[0_0_18px_rgba(56,189,248,0.55)] transition-all"
              onClick={() => startOAuth("google")}
              data-testid="google-oauth-button"
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center rounded-full border border-cyan-500/40 bg-slate-900 hover:bg-slate-900/80 text-slate-50 shadow-[0_0_18px_rgba(56,189,248,0.55)] transition-all"
              onClick={() => startOAuth("gitlab")}
              data-testid="gitlab-oauth-button"
            >
              GitLab
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center rounded-full border border-cyan-500/40 bg-slate-900 hover:bg-slate-900/80 text-slate-50 shadow-[0_0_18px_rgba(56,189,248,0.55)] transition-all"
              onClick={() => startOAuth("bitbucket")}
              data-testid="bitbucket-oauth-button"
            >
              Bitbucket
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center rounded-full border border-cyan-500/40 bg-slate-900 hover:bg-slate-900/80 text-slate-50 shadow-[0_0_18px_rgba(56,189,248,0.55)] transition-all"
              onClick={() => startOAuth("gitea")}
              data-testid="gitea-oauth-button"
            >
              Gitea / Codeberg
            </Button>
          </div>

          {/* Message d'information à la place de l'auth email */}
          <p className="text-[11px] text-slate-500 pt-1 text-center">
            Pour utiliser Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span>, inscris-toi ou connecte-toi avec l&apos;un de ces providers.
          </p>
        </div>
        {/* Bouton Accès Business sous les providers */}
        <div className="mt-5 flex flex-col gap-3 items-stretch">
          <Button
            className="w-full justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 text-xs sm:text-sm font-semibold px-3 py-2 flex items-center gap-2 shadow-[0_0_18px_rgba(56,189,248,0.85)]"
            onClick={() => navigate("/app/pro")}
            data-testid="auth-pro-dashboard-button"
          >
            Accès Business
          </Button>
        </div>


        {/* Auth email désactivée : l'accès se fait uniquement via OAuth */}
        {/* Les onglets et formulaires email/mot de passe ont été retirés pour simplifier l'onboarding */}
      </CardContent>
    </Card>
  );
}

function Dashboard({ t, lang, setLang, dark, setDark, currentLang, languages, isLoadingLang }) {
  const { token, user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [landingFilesHandled, setLandingFilesHandled] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // State for testing credits/plan (overrides authUser for display)
  const [testUser, setTestUser] = useState(null);
  const user = testUser || authUser;
  
  // State for selected git provider
  const [selectedProvider, setSelectedProvider] = useState("github");
  
  // State for auth modal
  const [authOpen, setAuthOpen] = useState(false);
  const [lastAutomationStatus, setLastAutomationStatus] = useState(null);

  const credits = typeof user?.credits === "number" ? user.credits : null;

  const currentPlan = (user?.plan || "freemium").toLowerCase();

  
  // State for uploaded files
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // Pending File objects to upload on launch (permet de retirer des fichiers avant l'envoi)
  const [pendingFiles, setPendingFiles] = useState([]);
  
  const [editName, setEditName] = useState("");
  const [renameStatus, setRenameStatus] = useState(null);
  const [descriptionStatus, setDescriptionStatus] = useState(null);

  const [renaming, setRenaming] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [updatingDescription, setUpdatingDescription] = useState(false);


  // State for project actions menu
  const [projectMenuOpen, setProjectMenuOpen] = useState(null);

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

  useEffect(() => {
    if (selected) {
      setEditName(selected.name || "");
      setEditDescription(selected.description || "");
    }
  }, [selected]);

  const renameProject = async () => {
    if (!selected) return;
    const newName = editName.trim();
    if (!newName || newName === (selected.name || "")) return;

    setRenaming(true);
    setRenameStatus(null);
    try {
      const res = await axios.patch(
        `${API}/workflows/projects/${selected.id}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const updated = res.data;
      setSelected(updated);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

      // Feedback visuel : succès
      setRenameStatus({ type: "success", message: "Nom du dépôt mis à jour (Git provider synchronisé si possible)." });
    } catch (err) {
      console.error("Rename failed", err);
      // Feedback visuel : échec provider, mais nom local peut être à jour
      setRenameStatus({
        type: "error",
        message: "Erreur lors du renommage sur le provider. Le nom peut être mis à jour seulement côté GitPusher.",
      });
    } finally {
      setRenaming(false);
    }
  };

  const updateDescription = async () => {
    if (!selected) return;
    const newDesc = editDescription;
    if (newDesc === (selected.description || "")) return;

    setUpdatingDescription(true);
    setDescriptionStatus(null);
    try {
      const res = await axios.patch(
        `${API}/workflows/projects/${selected.id}`,
        { description: newDesc },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const updated = res.data;
      setSelected(updated);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

      setDescriptionStatus({ type: "success", message: "Description mise à jour." });
    } catch (err) {
      console.error("Update description failed", err);
      setDescriptionStatus({ type: "error", message: "Erreur lors de la mise à jour de la description." });
    } finally {
      setUpdatingDescription(false);
    }
  };


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

  // Si on arrive sur le dashboard juste après un drag&drop sur la landing,
  // récupérer les fichiers temporaires stockés en global et préparer l'upload
  useEffect(() => {
    if (!token) return;
    if (landingFilesHandled) return;
    if (typeof window === "undefined") return;
    const files = window.__landingFiles;
    if (!files || !Array.isArray(files) || files.length === 0) return;

    const run = async () => {
      try {
        // Créer un nouveau projet si aucun projet sélectionné
        let project = selected;
        if (!project) {
          setCreating(true);
          const res = await axios.post(
            `${API}/workflows/projects`,
            { name: null, description: null, language: "en" },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          project = res.data;
          setProjects((prev) => [res.data, ...prev]);
          setSelected(res.data);
        }

        // Préparer l'upload des fichiers
        setPendingFiles(files);
        const filesInfo = files.map((f) => ({ name: f.name, size: f.size, type: f.type }));
        setUploadedFiles(filesInfo);
        setProgress(33);
      } finally {
        setCreating(false);
        setLandingFilesHandled(true);
        window.__landingFiles = null;
      }
    };

    run();
  }, [token, selected, landingFilesHandled]);


  const openAccountSettings = () => {
    if (!user) return;
    navigate("/account");
  };

  const onFilesSelected = async (e) => {
    if (!selected) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Store File objects for later upload (avant le lancement)
    setPendingFiles(files);

    // Store uploaded files info for display
    const filesInfo = files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setUploadedFiles(filesInfo);

    // On ne fait plus l'upload ici : il sera effectué juste avant launch()
    setProgress(33);
  };

  const launch = async () => {
    if (!selected) return;
    setProcessing(true);
    setLastAutomationStatus(null);

    try {
      // Si des fichiers sont en attente, on les upload d'abord
      if (pendingFiles.length > 0) {
        const formData = new FormData();
        pendingFiles.forEach((f) => formData.append("files", f));
        setUploading(true);
        await axios.post(`${API}/workflows/projects/${selected.id}/upload`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUploading(false);
        setPendingFiles([]);
        setProgress(50);
      } else {
        setProgress(40);
      }

      const res = await axios.post(
        `${API}/workflows/projects/${selected.id}/process`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelected(res.data);
      setProjects((prev) => prev.map((p) => (p.id === res.data.id ? res.data : p)));
      setProgress(100);

      setLastAutomationStatus({ type: "success", message: "Automatisation réussie. Tu peux maintenant vérifier ton dépôt sur la plateforme." });

      // Rafraîchir l'historique des jobs après une automatisation réussie
      try {
        const jobsRes = await axios.get(`${API}/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(jobsRes.data);
      } catch (jobsErr) {
        console.error("Refresh jobs failed", jobsErr);
      }
    } catch (err) {
      console.error("Launch failed", err);
      setProgress(0);
      setLastAutomationStatus({ type: "error", message: "Échec de l'automatisation. Vérifie les logs ou réessaie." });
    } finally {
      setProcessing(false);
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;
    
    try {
      await axios.delete(`${API}/workflows/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (selected?.id === projectId) {
        setSelected(null);
        setProgress(0);
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Erreur lors de la suppression du projet");
    }
  };

  // Archive project
  const archiveProject = async (projectId) => {
    try {
      await axios.patch(
        `${API}/workflows/projects/${projectId}`,
        { status: "archived" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProjects((prev) => prev.map((p) => 
        p.id === projectId ? { ...p, status: "archived" } : p
      ));
      if (selected?.id === projectId) {
        setSelected({ ...selected, status: "archived" });
      }
    } catch (err) {
      console.error("Archive failed", err);
      alert("Erreur lors de l'archivage du projet");
    }
  };

  // Si pas de token, on redirige vers la landing et on demande l'ouverture de la modale de connexion
  useEffect(() => {
    if (!token) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("open_auth_on_landing", "1");
      }
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col transition-opacity duration-500 overflow-x-hidden ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-20 bg-slate-950/80 overflow-x-hidden">
        <div className="w-full max-w-full px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 md:gap-3 min-w-0 group"
          >
            <div className="h-11 w-11 md:h-[52px] md:w-[52px] rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)] group-hover:scale-105 transition-transform">
              <DownloadCloud className="h-[22px] w-[22px] md:h-[26px] md:w-[26px] text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight truncate text-left">
              <span className="text-[17px] md:text-[19px] font-semibold tracking-tight truncate">
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span><span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent text-[13px] md:text-[15px]">.AI</span>
              </span>
              <span className="text-[11px] md:text-[13px] text-slate-400 truncate">No-Code GitHub workflow</span>
            </div>
          </button>
          {/* Toggle Free / Premium (mobile, sous le logo) supprimé - présent dans le titre */}

          <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-sm">
            <div className="hidden xs:flex items-center gap-2">
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
                  className="px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] sm:text-xs flex items-center gap-1"
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
            <div className="flex items-center gap-2 text-[11px] sm:text-xs">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 max-w-[160px] sm:max-w-[220px]"
                    data-testid="dashboard-user-menu-button"
                  >
                    <span className="hidden sm:inline truncate text-slate-200 text-xs sm:text-sm">{user?.email || "Compte"}</span>
                    <span className="inline-flex sm:hidden items-center justify-center h-5 w-5 rounded-full bg-slate-800 text-[11px]">👤</span>
                    <span className="text-[11px] text-slate-400">▼</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="mt-2 w-72 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-2xl p-3 text-xs sm:text-sm"
                >
                  <div className="space-y-3" data-testid="dashboard-user-menu">
                    <div>
                      <p className="text-[11px] text-slate-400 mb-1">Compte</p>
                      <p className="font-semibold text-slate-100 truncate">{user?.email}</p>
                      {user?.display_name && (
                        <p className="text-[11px] text-slate-400 truncate">{user.display_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400">Tokens de providers</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-300">GitHub token</span>
                          <Button
                            variant="outline"
                            size="xs"
                            className="h-7 px-2 rounded-full border-slate-600 text-[11px]"
                            onClick={openAccountSettings}
                          >
                            Gérer
                          </Button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Renseigne ton token GitHub personnel ou vérifie la connexion OAuth.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-2 space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 rounded-lg"
                        onClick={() => navigate("/account")}
                      >
                        Paramètres du compte
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 rounded-lg"
                        onClick={() => {
                          window.location.href = "mailto:support@votresupport.local?subject=Support%20GitPusher";
                        }}
                      >
                        Aide &amp; support
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          logout();
                          navigate("/");
                        }}
                        className="w-full rounded-full border-red-500/60 text-red-300 text-xs mt-1"
                        data-testid="logout-button"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-full sm:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-3 sm:space-y-8 overflow-x-hidden">
        {/* TEST MODE - Developer Controls */}
        <Card className="mb-4 bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-300 mb-1">🧪 MODE TEST - Simulateur d'abonnement</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Testez les différents scénarios de crédits et d'abonnement</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const currentUser = testUser || authUser;
                    const newCredits = Math.max(0, (currentUser?.credits || 0) - 1);
                    setTestUser({ ...currentUser, credits: newCredits });
                  }}
                  variant="outline"
                  className="text-xs border-red-500/50 text-red-300 hover:bg-red-500/20"
                >
                  -1 crédit
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const currentUser = testUser || authUser;
                    setTestUser({ ...currentUser, credits: (currentUser?.credits || 0) + 5 });
                  }}
                  variant="outline"
                  className="text-xs border-green-500/50 text-green-300 hover:bg-green-500/20"
                >
                  +5 crédits
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const currentUser = testUser || authUser;
                    setTestUser({ ...currentUser, credits: (currentUser?.credits || 0) + 50 });
                  }}
                  variant="outline"
                  className="text-xs border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
                >
                  +50 crédits
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const currentUser = testUser || authUser;
                    const plans = ["Free", "Starter", "Pro", "Premium", "Business"];
                    const currentIndex = plans.indexOf(currentUser?.plan || "Free");
                    const nextPlan = plans[(currentIndex + 1) % plans.length];
                    
                    // Attribuer les crédits selon le plan
                    let newCredits = currentUser?.credits || 2;
                    if (nextPlan === "Free") {
                      newCredits = 2;
                    } else if (nextPlan === "Starter") {
                      newCredits = 10;
                    } else if (nextPlan === "Pro") {
                      newCredits = 50;
                    } else if (nextPlan === "Premium" || nextPlan === "Business") {
                      // Premium et Business ont un accès illimité
                      newCredits = 999999;
                    }
                    
                    setTestUser({ ...currentUser, plan: nextPlan, credits: newCredits });
                  }}
                  variant="outline"
                  className="text-xs border-violet-500/50 text-violet-300 hover:bg-violet-500/20"
                >
                  Changer Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Title + Toggle Free/Premium (mobile à droite du titre) */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">Dashboard</h1>
          {/* Toggle Free / Premium (mobile, à droite du titre) */}
          <div className="flex sm:hidden items-center gap-2 text-[11px]">
            <div className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center gap-2">
              <span className="text-[10px] font-medium text-slate-50">Free</span>
              <button
                type="button"
                onClick={() => navigate("/pricing#pro")}
                className="relative w-12 h-6 rounded-full bg-slate-300 transition-colors duration-200"
                aria-label="Basculer vers Premium"
              >
                <span className="absolute top-[3px] w-4 h-4 rounded-full bg-black transition-transform duration-200 translate-x-[2px]" />
              </button>
              <span className="text-[10px] font-medium text-slate-400">Premium</span>
            </div>
          </div>
        </div>

        {/* BLOC CRÉATIF CRÉDITS */}
        <div className="relative">
          <div className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-3xl bg-gradient-to-r from-cyan-500/35 via-sky-500/30 to-violet-500/35 blur-2xl opacity-80" />
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/70 border border-cyan-500/20 shadow-none overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />
            <CardContent className="p-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Partie gauche - Compteur principal */}
                <div className="flex items-center gap-6">
                {/* Icône circulaire avec animation */}
                <div className="relative">
                  {((user?.plan || '').toLowerCase() === 'premium' || (user?.plan || '').toLowerCase() === 'business') ? (
                    // Effet spécial pour Premium et Business illimités
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-400 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-full blur-xl opacity-40 animate-pulse" />
                  )}
                  <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full ${
                    (user?.plan || '').toLowerCase() === 'premium' || (user?.plan || '').toLowerCase() === 'business'
                      ? 'bg-gradient-to-br from-violet-500/20 to-pink-500/20 border-2 border-violet-400/40'
                      : 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-2 border-cyan-400/30'
                  } flex flex-col items-center justify-center backdrop-blur-sm`}>
                    {((user?.plan || '').toLowerCase() === 'premium' || (user?.plan || '').toLowerCase() === 'business') ? (
                      // Affichage infini pour Premium et Business
                      <>
                        <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-violet-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                          ∞
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-violet-300 mt-0.5 font-semibold">
                          illimité
                        </span>
                      </>
                    ) : (
                      // Affichage normal pour tous les autres plans (Free, Starter, Pro)
                      <>
                        <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                          {credits == null ? "—" : credits}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">
                          {credits === 1 ? "crédit" : "crédits"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Texte et statut */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-100">
                      Crédits disponibles
                    </h3>
                    {/* Badge du plan actuel */}
                    {user?.plan && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        (user.plan || '').toLowerCase() === 'free' || (user.plan || '').toLowerCase() === 'freemium' || (user.plan || '').toLowerCase() === 'demo'
                          ? 'bg-gradient-to-r from-cyan-300/30 via-sky-400/30 to-cyan-300/30 text-cyan-100 border border-cyan-300/70 shadow-[0_0_18px_rgba(56,189,248,0.9)]'
                          : (user.plan || '').toLowerCase() === 'starter'
                          ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-400/40'
                          : (user.plan || '').toLowerCase() === 'pro'
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-400/40'
                          : (user.plan || '').toLowerCase() === 'premium'
                          ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-400/40'
                          : (user.plan || '').toLowerCase() === 'business'
                          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/40'
                          : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                      }`}>
                        {(user.plan || '').toLowerCase() === 'freemium' || (user.plan || '').toLowerCase() === 'demo' ? 'Free' : user.plan}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {((user?.plan || '').toLowerCase() === 'premium' || (user?.plan || '').toLowerCase() === 'business') ? (
                      // Statut premium pour plans illimités
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/40">
                        <span className="text-lg">✨</span>
                        <span className="text-xs font-semibold text-violet-300">Accès illimité</span>
                      </div>
                    ) : credits != null && credits <= 2 ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 animate-pulse">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-amber-300">⚠️ Crédits faibles</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-400/30">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                        <span className="text-xs font-medium text-emerald-300">✓ Solde sain</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    {((user?.plan || '').toLowerCase() === 'premium' || (user?.plan || '').toLowerCase() === 'business')
                      ? `Plan ${user.plan} : Crédits illimités inclus dans votre abonnement`
                      : '2 crédits = 1 automatisation complète (README, .gitignore, LICENSE, push Git)'}
                  </p>
                </div>
              </div>
              
              {/* Partie droite - Actions rapides */}
              <div className="flex flex-col gap-2 min-w-[140px]">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Actions rapides</div>
                {((user?.plan || '').toLowerCase() === 'free' || (user?.plan || '').toLowerCase() === 'freemium' || (user?.plan || '').toLowerCase() === 'demo' || (user?.plan || '').toLowerCase() === 'starter') ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs rounded-lg border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200"
                      onClick={() => navigate("/pricing")}
                    >
                      <span className="mr-2">💳</span> Acheter des crédits
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs rounded-lg border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300 hover:text-violet-200"
                      onClick={() => navigate("/pricing")}
                    >
                      <span className="mr-2">⭐</span> Passer au Premium
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs rounded-lg border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300 hover:text-violet-200"
                      onClick={() => navigate("/account")}
                    >
                      <span className="mr-2">⚙️</span> Gérer l'abonnement
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs rounded-lg border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 hover:text-emerald-200"
                      onClick={() => navigate("/app/pro")}
                    >
                      <span className="mr-2">📊</span> Dashboard Pro
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* CONTENU PRINCIPAL DU DASHBOARD USER */}
        <div className="grid gap-4 lg:grid-cols-[2fr,3fr] mt-4">
          {/* Colonne projets */}
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center justify-between gap-2">
                <span className="font-semibold">Projets</span>
                <Button
                  size="sm"
                  className="text-[11px] rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.9)] border border-cyan-300"
                  onClick={newProject}
                  disabled={creating}
                  data-testid="dashboard-new-project-button"
                >
                  {creating ? "Création..." : "Nouveau"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 text-xs sm:text-sm space-y-2">
              {loading ? (
                <p className="text-slate-400 text-xs">Chargement des projets...</p>
              ) : projects.length === 0 ? (
                <p className="text-slate-500 text-xs">
                  Aucun projet pour l&apos;instant. Crée ton premier dépôt IA avec le bouton "Nouveau".
                </p>
              ) : (
                <>
                  {/* Projets actifs */}
                  <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1" data-testid="dashboard-projects-list">
                    {projects.filter((project) => project.status !== "archived").length === 0 ? (
                      <p className="text-slate-500 text-[11px]">
                        Aucun projet actif. Crée un nouveau projet ou restaure un projet archivé.
                      </p>
                    ) : (
                      projects
                        .filter((project) => project.status !== "archived")
                        .map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => setSelected(project)}
                            className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border text-left transition-colors text-[11px] sm:text-xs ${
                              selected?.id === project.id
                                ? "border-cyan-400/70 bg-cyan-500/10 text-slate-50"
                                : "border-slate-800 bg-slate-950/60 hover:bg-slate-900/60 text-slate-200"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="font-medium truncate">{project.name || "Projet sans nom"}</p>
                              <p className="text-[10px] text-slate-400 truncate">{project.description || "Sans description"}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] border ${
                                  project.status === "completed"
                                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                                    : "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                                }`}
                              >
                                {project.status || "draft"}
                              </span>
                              {project.repo_url && (
                                <a
                                  href={project.repo_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-200"
                                >
                                  <Github className="w-3 h-3" />
                                  Repo
                                </a>
                              )}
                            </div>
                          </button>
                        ))
                    )}
                  </div>

                  {/* Bloc d'archives */}
                  {projects.filter((project) => project.status === "archived").length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800/70">
                      <p className="text-[10px] text-slate-400 mb-1">Archives</p>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                        {projects
                          .filter((project) => project.status === "archived")
                          .map((project) => (
                            <div
                              key={project.id}
                              className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] sm:text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-medium truncate">{project.name || "Projet archivé"}</p>
                                <p className="text-[10px] text-slate-500 truncate">{project.description || "Sans description"}</p>
                              </div>
                              <Button
                                size="xs"
                                variant="outline"
                                className="h-7 px-2 rounded-full border-red-500/60 text-red-300 text-[10px]"
                                onClick={() => deleteProject(project.id)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Colonne principale: détails projet + drag & drop + jobs */}
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center justify-between gap-2">
                <span className="font-semibold">Détails du projet</span>
                {selected && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-7 px-2 rounded-full border-slate-600 text-[10px]"
                      onClick={() => archiveProject(selected.id)}
                    >
                      Archiver
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-7 px-2 rounded-full border-red-500/60 text-red-300 text-[10px]"
                      onClick={() => deleteProject(selected.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 text-xs sm:text-sm space-y-4">
              {!selected ? (
                <p className="text-slate-500 text-xs">
                  Sélectionne un projet dans la colonne de gauche pour voir les détails, uploader des fichiers et lancer
                  l&apos;automatisation.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 flex flex-col gap-1">
                        <Label className="text-[11px] text-slate-300">Nom du dépôt</Label>
                        <div className="flex flex-col sm:flex-row gap-1.5 items-stretch">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                renameProject();
                              }
                            }}
                            className="h-8 text-xs bg-slate-950/60 border-slate-700/80 flex-1"
                          />
                          <Button
                            size="xs"
                            className="h-8 px-3 rounded-full text-[11px] bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-300 text-slate-950 whitespace-nowrap w-full sm:w-auto shadow-[0_0_22px_rgba(56,189,248,1)] border border-cyan-200"
                            onClick={renameProject}
                            disabled={renaming || !editName.trim() || editName === (selected.name || "")}
                          >
                            {renaming ? "..." : "Valider"}
                          </Button>
                        </div>
                        {renameStatus && (
                          <p
                            className={`mt-1 text-[10px] ${
                              renameStatus.type === "success" ? "text-emerald-300" : "text-amber-300"
                            }`}
                          >
                            {renameStatus.message}
                          </p>
                        )}
                      </div>
                      <div className="flex-1">
                        <Label className="text-[11px] text-slate-300">Langue du README</Label>
                        <Input
                          value={selected.language || "en"}
                          disabled
                          className="h-8 text-xs bg-slate-950/60 border-slate-700/80"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-slate-300">Description</Label>
                      <div className="flex flex-col gap-1">
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full mt-1 rounded-md bg-slate-950/60 border border-slate-700/80 text-xs text-slate-200 p-2 resize-none min-h-[40px]"
                          rows={3}
                        />
                        <div className="flex justify-between items-center mt-1">
                          {descriptionStatus && (
                            <p
                              className={`text-[10px] ${
                                descriptionStatus.type === "success" ? "text-emerald-300" : "text-amber-300"
                              }`}
                            >
                              {descriptionStatus.message}
                            </p>
                          )}
                          <Button
                            size="xs"
                            className="h-7 px-3 rounded-full text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-100"
                            onClick={updateDescription}
                            disabled={updatingDescription || editDescription === (selected.description || "")}
                          >
                            {updatingDescription ? "..." : "Mettre à jour"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zone drag & drop */}
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-400 mb-1">Fichiers du projet</p>
                    <label
                      className="relative flex flex-col items-center justify-center gap-3 border-2 border-dashed border-cyan-400 rounded-2xl bg-slate-950/60 hover:bg-slate-900/80 cursor-pointer py-8 shadow-[0_0_30px_rgba(56,189,248,0.4)]"
                    >
                      <span className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">
                        {t("landingDropLabel")}
                      </span>
                      <span className="text-xs text-slate-200 font-medium">
                        {t("landingDropTitle")}
                      </span>
                      <span className="text-[11px] text-slate-400 max-w-[80%] text-center">
                        {t("landingDropDescription")}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        {uploadedFiles.length > 0
                          ? `${uploadedFiles.length} fichier${uploadedFiles.length > 1 ? "s" : ""} sélectionné${uploadedFiles.length > 1 ? "s" : ""} (${Math.round(uploadedFiles.reduce((acc, f) => acc + f.size, 0) / 1024)} Ko / 51200 Ko max)`
                          : "Aucun fichier sélectionné (0 Ko / 51200 Ko max)"}
                      </span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={onFilesSelected}
                        data-testid="dashboard-file-input"
                      />
                    </label>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2 text-[11px] text-slate-300">
                        <p className="font-semibold">Fichiers sélectionnés :</p>
                        <ul className="max-h-24 overflow-y-auto pr-1 space-y-1">
                          {uploadedFiles.map((f, idx) => (
                            <li key={`${f.name}-${idx}`} className="flex items-center justify-between gap-2">
                              <span className="truncate">
                                {f.name} <span className="text-slate-500">({Math.round(f.size / 1024)} Ko)</span>
                              </span>
                              <button
                                type="button"
                                className="text-[10px] text-red-300 hover:text-red-200"
                                onClick={() => {
                                  setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
                                  setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
                                }}
                              >
                                Retirer
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Progression & bouton Lancer */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-400">Automatisation</p>
                      <Button
                        size="sm"
                        className="text-[11px] rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.9)] border border-cyan-300"
                        onClick={launch}
                        disabled={processing}
                        data-testid="dashboard-launch-button"
                      >
                        {processing ? "En cours..." : "Lancer l'automatisation"}
                      </Button>
                    </div>
                    {processing || progress > 0 ? (
                      <div className="space-y-1">
                        <Progress value={progress} className="h-1.5 bg-slate-800" />
                        <p className="text-[10px] text-slate-500">
                          {processing ? "Traitement en cours..." : progress === 100 ? "Terminé" : `${progress}%`}
                        </p>
                      </div>
                    ) : null}

                    {/* Feedback d'automatisation + bouton pour ouvrir le repo */}
                    {lastAutomationStatus && (
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p
                          className={`text-[10px] ${
                            lastAutomationStatus.type === "success" ? "text-emerald-300" : "text-amber-300"
                          }`}
                        >
                          {lastAutomationStatus.message}
                        </p>
                        {lastAutomationStatus.type === "success" && (selected?.repo_url || selected?.github_repo_url) && (
                          <a
                            href={selected.repo_url || selected.github_repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.95)] border border-cyan-200 animate-pulse hover:animate-[pulse_1s_ease-in-out_infinite]"
                          >
                            <span className="text-yellow-400 text-xs">✨</span>
                            <span>Voir le dépôt (GitHub / GitLab / Bitbucket…)</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Jobs récents pour ce projet */}
                  <div className="mt-4">
                    <p className="text-[11px] text-slate-400 mb-1">Jobs pour ce projet</p>
                    {jobsLoading ? (
                      <p className="text-[11px] text-slate-400">Chargement...</p>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-[11px]">
                        {jobs
                          .filter((j) => j.project_id === selected.id)
                          .slice(0, 5)
                          .map((job) => (
                            <div
                              key={job.id}
                              className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-1"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-slate-100 truncate">{job.status}</p>
                                <p className="font-mono text-[10px] text-slate-500 truncate">{job.id}</p>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] border ${
                                  job.status === "completed"
                                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                                    : job.status === "failed" || job.error
                                      ? "bg-red-500/15 text-red-300 border-red-500/40"
                                      : "bg-slate-800 text-slate-200 border-slate-600"
                                }`}
                              >
                                {job.status}
                              </span>
                            </div>
                          ))}
                        {jobs.filter((j) => j.project_id === selected.id).length === 0 && (
                          <p className="text-[11px] text-slate-500">Aucun job encore pour ce projet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ProDashboard({ t, lang, setLang, dark, setDark, currentLang, languages, isLoadingLang }) {
  // utilisateur Business / Premium
  const { token, user, logout } = useAuth();
  const effectivePlan = user?.plan?.toLowerCase?.() || "freemium";

  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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
      try {
        const [projectsRes, jobsRes] = await Promise.all([
          axios.get(`${API}/workflows/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProjects(projectsRes.data || []);
        setJobs(jobsRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  if (!token) return <Navigate to="/" replace />;

  // Analytics de base
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status !== "archived").length;
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const failedJobs = jobs.filter((j) => j.status === "failed" || j.error).length;
  const successRate = totalJobs ? Math.round((completedJobs * 100) / totalJobs) : 0;

  const providerCounts = projects.reduce((acc, p) => {
    const key = (p.provider || "github").toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const recentJobs = jobs.slice(0, 8);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col transition-opacity duration-500 overflow-x-hidden ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Header Pro */}
      <header className="w-full border-b border-cyan-400/30 backdrop-blur-sm sticky top-0 z-20 bg-slate-950/90">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 md:gap-3 min-w-0 group"
          >
            <div className="h-11 w-11 md:h-[52px] md:w-[52px] rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)] group-hover:scale-105 transition-transform">
              <DownloadCloud className="h-[22px] w-[22px] md:h-[26px] md:w-[26px] text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight truncate text-left">
              <span className="text-[17px] md:text-[19px] font-semibold tracking-tight truncate">
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span><span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent text-[13px] md:text-[15px]">.AI</span>
                <span className="ml-1 text-xs align-middle px-2 py-0.5 rounded-full border border-cyan-400/60 text-cyan-200 bg-cyan-500/10">
                  Pro
                </span>
              </span>
              <span className="text-[11px] md:text-[13px] text-slate-400 truncate">Dashboard avancé &amp; analytics</span>
            </div>
          </button>
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-sm">
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex rounded-full border-cyan-400/60 text-cyan-200 text-[11px]"
              onClick={() => navigate("/app")}
            >
              Retour au dashboard
            </Button>
            <div className="hidden xs:flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline">{t("theme")}</span>
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                data-testid="pro-dashboard-theme-toggle-switch"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button

function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <header className="w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_18px_rgba(56,189,248,0.8)]">
              <DownloadCloud className="h-4 w-4 text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span>
                <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent text-xs">.AI</span>
              </span>
              <span className="text-[10px] text-slate-400">Conditions générales d'utilisation</span>
            </div>
          </div>
          <Link
            to="/"
            className="text-[11px] px-3 py-1 rounded-full border border-slate-700 text-slate-300 hover:text-slate-50 hover:border-cyan-400/70 hover:bg-slate-900/70 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-6 text-sm sm:text-base">
          <section className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Conditions générales d'utilisation</h1>
            <p className="text-xs text-slate-400">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">1. Objet du service</h2>
            <p className="text-slate-300">
              GitPusher.AI est une plateforme qui permet d'automatiser la création de dépôts Git à partir de vos
              fichiers ou dossiers (par exemple un projet zip), en générant automatiquement une structure de projet,
              un README, un fichier .gitignore, une licence et d'autres fichiers utiles. Le service se connecte à vos
              comptes Git (GitHub, GitLab, Bitbucket, etc.) via OAuth afin de créer et de mettre à jour des dépôts en
              votre nom.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">2. Création de compte et connexions OAuth</h2>
            <p className="text-slate-300">
              L'accès à GitPusher.AI se fait via des fournisseurs d'identité externes (GitHub, GitLab, Bitbucket,
              Gitea, Google, etc.). En vous connectant avec l'un de ces providers, vous autorisez GitPusher.AI à
              recevoir certaines informations de votre profil (par exemple : identifiant, nom, email, avatar) et, dans
              le cas des providers Git, un jeton d'accès afin de créer et mettre à jour des dépôts pour votre compte.
            </p>
            <p className="text-slate-300">
              Vous restez à tout moment responsable de la sécurité de vos comptes Git et pouvez révoquer les accès de
              GitPusher.AI directement depuis les paramètres de votre fournisseur (par exemple depuis
              developer settings sur GitHub).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">3. Données traitées</h2>
            <p className="text-slate-300">
              Dans le cadre de l'utilisation de GitPusher.AI, les types de données suivants peuvent être traités :
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Données de compte : nom, email, identifiant provider, plan et crédits disponibles.</li>
              <li>
                Jetons d'accès OAuth aux providers Git, stockés de manière sécurisée pour permettre la création et la
                mise à jour de dépôts en votre nom.
              </li>
              <li>
                Fichiers que vous uploadez (ex : zip, PDF, code source) afin de générer la structure du dépôt et les
                fichiers associés (README, .gitignore, LICENSE, etc.).
              </li>
              <li>
                Métadonnées de projets et d'automatisations : nom du dépôt, description, provider cible, statut des
                jobs, logs d'exécution techniques.
              </li>
              <li>
                Messages échangés via le chat de support, utilisés uniquement pour le support et l'amélioration du
                service.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">4. Accès à vos dépôts Git</h2>
            <p className="text-slate-300">
              Lorsque vous connectez un provider Git (par exemple GitHub), GitPusher.AI utilise le jeton d'accès
              fourni par ce provider pour :
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Créer de nouveaux dépôts sous votre compte ou votre organisation, selon les permissions accordées.</li>
              <li>
                Envoyer ou mettre à jour des fichiers dans ces dépôts (par exemple README, .gitignore, LICENSE, code
                généré ou préparé).
              </li>
            </ul>
            <p className="text-slate-300">
              GitPusher.AI ne modifie pas vos dépôts existants sans action explicite de votre part et ne revendique
              aucun droit de propriété sur le contenu de vos projets.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">5. Responsabilités</h2>
            <p className="text-slate-300">
              Vous êtes seul responsable :
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Du contenu que vous uploadez dans la plateforme (fichiers, code, documents).</li>
              <li>Des dépôts créés sur vos comptes Git et de la gestion des accès associés.</li>
              <li>
                Du respect des droits d'auteur, licences et obligations légales applicables au contenu traité par
                GitPusher.AI.
              </li>
            </ul>
            <p className="text-slate-300">
              GitPusher.AI fournit un outil d'automatisation "en l'état" et ne peut garantir que le code généré, les
              fichiers produits ou la structure proposée soient exempts d'erreurs ou adaptés à tous les cas d'usage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">6. Sécurité</h2>
            <p className="text-slate-300">
              Nous mettons en œuvre des mesures techniques raisonnables pour protéger vos données (chiffrement des
              communications, stockage sécurisé, séparation des environnements). Toutefois, aucun système n'est
              parfaitement sécurisé et vous êtes invité à ne pas envoyer de données hautement sensibles via la
              plateforme.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">7. Conservation et suppression</h2>
            <p className="text-slate-300">
              Vos projets, jobs d'automatisation et messages de support peuvent être conservés aussi longtemps que
              nécessaire pour le fonctionnement du service et le suivi de votre compte. Vous pouvez demander la
              suppression de votre compte et des données associées en contactant l'administrateur de la plateforme.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">8. Modifications des conditions</h2>
            <p className="text-slate-300">
              Les présentes conditions peuvent être mises à jour pour refléter l'évolution du service ou des exigences
              légales. En cas de changement significatif, une notification pourra être affichée dans l'application.
              La poursuite de l'utilisation de GitPusher.AI après mise à jour vaut acceptation des nouvelles
              conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">9. Contact</h2>
            <p className="text-slate-300">
              Pour toute question concernant ces conditions générales d'utilisation ou le traitement de vos données,
              vous pouvez contacter l'administrateur de GitPusher.AI via le chat de support intégré ou par le canal
              habituel mis à votre disposition.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

                  className="px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] sm:text-xs flex items-center gap-1"
                >
                  <span className="text-lg" aria-hidden="true">{currentLang.flag}</span>
                  <span className="hidden sm:inline">{currentLang.label}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="mt-2 w-64 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-2xl p-2"
              >
                <div className="max-h-64 overflow-auto text-xs">
                  {languages.map((lng) => (
                    <button
                      key={lng.code}
                      onClick={() => setLang(lng.code)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800 text-left ${
                        lng.code === lang ? "bg-slate-800/80" : ""
                      }`}
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
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-red-500/60 text-red-300 text-[11px]"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Bandeau plan Pro / Business */}
        <Card className="bg-gradient-to-r from-cyan-500/15 via-slate-900/80 to-violet-500/10 border-cyan-400/40">
          <CardContent className="py-4 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-cyan-300 mb-1">Accès Business</p>
              <h1 className="text-lg sm:text-xl font-semibold">
                Vue d&apos;ensemble avancée pour équipes &amp; organisations
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
                10 à 200 utilisateurs, API complète + webhooks, automations avancées et tableau de bord boosté IA.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-900/80 border border-cyan-400/40 text-[10px] text-cyan-200">
                {totalProjects} projets • {totalJobs} jobs
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-900/80 border border-emerald-400/40 text-[10px] text-emerald-200">
                {successRate}% taux de succès
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques principales */}
        {/* Mobile : cartes compactes en 2 colonnes ; Desktop : 4 colonnes comme avant */}
        <div className="grid gap-3 grid-cols-2 md:gap-4 md:grid-cols-4">
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardContent className="py-3 px-3 sm:px-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] sm:text-[11px] text-slate-400">Projets actifs</p>
                {(effectivePlan === "premium" || effectivePlan === "business") && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/40">
                    {effectivePlan === "business" ? "Business" : "Premium"}
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-cyan-300">{activeProjects}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">sur {totalProjects} au total</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardContent className="py-3 px-3 sm:px-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] sm:text-[11px] text-slate-400">Jobs complétés</p>
                {effectivePlan === "business" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-400/40">
                    Business
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-emerald-300">{completedJobs}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">{failedJobs} en erreur</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardContent className="py-3 px-3 sm:px-4">
              <p className="text-[10px] sm:text-[11px] text-slate-400 mb-1">Taux de succès</p>
              <p className="text-xl sm:text-2xl font-semibold text-cyan-300">{successRate}%</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">basé sur tous les jobs</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardContent className="py-3 px-3 sm:px-4">
              <p className="text-[10px] sm:text-[11px] text-slate-400 mb-1">Providers utilisés</p>
              <div className="flex flex-wrap gap-1 mt-1 text-[9px] sm:text-[10px] text-slate-200">
                {Object.keys(providerCounts).length === 0 && <span>Aucun pour l&apos;instant</span>}
                {Object.entries(providerCounts).map(([prov, count]) => (
                  <span
                    key={prov}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/80"
                  >
                    <span className="capitalize mr-1">{prov}</span>
                    <span className="text-slate-400">×{count}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activité récente & multi-providers */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Activité récente</CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm">
              {loading ? (
                <p className="text-slate-400">Chargement…</p>
              ) : recentJobs.length === 0 ? (
                <p className="text-slate-400">Aucun job pour l&apos;instant.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {recentJobs.map((job) => {
                    const project = projects.find((p) => p.id === job.project_id);
                    return (
                      <div
                        key={job.id}
                        className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-1.5"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-100 truncate">
                            {project?.name || "Projet sans nom"}
                          </p>
                          <p className="font-mono text-[10px] text-slate-500 truncate">{job.id}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(job.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] ${
                              job.status === "completed"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                                : job.status === "failed" || job.error
                                  ? "bg-red-500/15 text-red-300 border border-red-500/40"
                                  : "bg-slate-800 text-slate-200 border border-slate-600"
                            }`}
                          >
                            {job.status}
                          </span>
                          {job.error && (
                            <span className="text-[10px] text-red-300 max-w-[180px] truncate" title={job.error}>
                              {job.error}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Multi-providers &amp; accès prioritaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <p className="text-slate-300 text-[11px]">
                Gérez vos dépôts sur plusieurs providers depuis un même endroit. GitHub est actif aujourd&apos;hui, GitLab
                &amp; Bitbucket arrivent en priorité pour les comptes Pro.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-950/70 border border-emerald-500/40 flex items-center justify-between">
                  <span className="text-[11px] text-slate-100">GitHub</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/50">
                    Actif
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-700/80 flex items-center justify-between opacity-70">
                  <span className="text-[11px] text-slate-300">GitLab</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-600">
                    Bientôt
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-700/80 flex items-center justify-between opacity-70">
                  <span className="text-[11px] text-slate-300">Bitbucket</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-600">
                    Bientôt
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-700/80 flex items-center justify-between opacity-70">
                  <span className="text-[11px] text-slate-300">Autres</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-600">
                    Roadmap
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Les comptes Pro &amp; Business reçoivent les nouveaux providers en priorité.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Automations & API Partner (UI avancée, backend à venir) */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Automations &amp; autopush</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <p className="text-[11px] text-slate-300">
                Configure des pushs récurrents (autopush) sur tes dépôts les plus critiques. Idéal pour synchroniser du
                contenu (docs, cours, assets) sans intervention manuelle.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-200">Autopush hebdomadaire</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                    Bêta UI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  UI prête, logique backend à activer : fréquence, sélection de projets, fenêtres de déploiement.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-700/80">
                  <p className="text-slate-200 mb-1">Scénarios</p>
                  <ul className="space-y-0.5 text-slate-400">
                    <li>• Push auto chaque lundi 9h</li>
                    <li>• Nettoyage branches mortes</li>
                    <li>• Versioning IA des README</li>
                  </ul>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-700/80">
                  <p className="text-slate-200 mb-1">À venir</p>
                  <ul className="space-y-0.5 text-slate-400">
                    <li>• Intégration CI/CD (GitHub Actions)</li>
                    <li>• Workflows multi-repos</li>
                    <li>• Notifications Slack</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">API Partner &amp; webhooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <p className="text-[11px] text-slate-300">
                Intègre GitPusher dans ta plateforme SaaS : déclenche des pushs, écoute des webhooks, gère des comptes
                multiples.
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-[11px] text-slate-400 mb-1">Clé API Partner</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-2 py-1 rounded bg-slate-950/80 border border-slate-700/80 font-mono text-[10px] text-slate-400 truncate">
                      sk_live_************************
                    </div>
                    <Button
                      size="xs"
                      variant="outline"
                      className="h-7 px-2 rounded-full border-slate-600 text-[10px]"
                      onClick={() => alert("Copie de la clé API en mode démo.")}
                    >
                      Copier
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 mb-1">Webhooks configurés</p>
                  <ul className="space-y-1 text-[10px] text-slate-300">
                    <li>• push.completed → https://votreapp.com/webhooks/gitpusher</li>
                    <li>• push.failed → https://votreapp.com/webhooks/gitpusher-errors</li>
                  </ul>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Cette section est prête niveau UI. L&apos;activation réelle de l&apos;API Partner et des webhooks dépendra de
                ton back-end.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bloc Business / multi-comptes (maquette) */}
        <Card className="bg-slate-900/80 border-amber-500/40">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Business &amp; équipes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 text-xs sm:text-sm">
            <div className="space-y-1">
              <p className="text-slate-200 font-medium text-[12px]">10 à 200 utilisateurs</p>
              <p className="text-slate-400 text-[11px]">
                Gestion multi-comptes (écoles, agences, équipes SaaS, créateurs IA) sur un même espace centralisé.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-200 font-medium text-[12px]">Intégration API complète + webhooks</p>
              <p className="text-slate-400 text-[11px]">
                API Partner, webhooks avancés et automations (CI/CD auto, nettoyage, versioning IA) pour vos dépôts.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-200 font-medium text-[12px]">Tableau de bord IA &amp; SLA entreprise</p>
              <p className="text-slate-400 text-[11px]">
                Tableau de bord boosté IA, branding entreprise, SLA &amp; support dédié (Slack, 12h).
              </p>
            </div>
          </CardContent>
        </Card>
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
      {/* Header réutilisé du landing page */}
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 md:gap-3 group"
          >
            <div className="h-11 w-11 md:h-[52px] md:w-[52px] rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)] transition-colors group-hover:scale-105">
              <DownloadCloud className="h-[22px] w-[22px] md:h-[26px] md:w-[26px] text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[17px] md:text-[19px] font-semibold tracking-tight">
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span><span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent text-[13px] md:text-[15px]">.AI</span>
              </span>
              <span className="text-[11px] md:text-[13px] text-slate-400">Mon compte</span>
            </div>
          </button>
          <div className="flex items-center gap-2 md:gap-3 text-xs sm:text-sm relative">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline text-sm">{t("theme")}</span>
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                data-testid="account-theme-toggle-switch"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm flex items-center gap-2"
                  data-testid="account-language-popover-trigger"
                >
                  <span className="text-lg" aria-hidden="true">
                    {currentLang.flag}
                  </span>
                  <span className="hidden sm:inline text-slate-200">{currentLang.label}</span>
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
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-11 w-11 md:h-[52px] md:w-[52px] rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)] transition-colors">
              <DownloadCloud className="h-[22px] w-[22px] md:h-[26px] md:w-[26px] text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[17px] md:text-[19px] font-semibold tracking-tight">
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span><span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent text-[13px] md:text-[15px]">.AI</span>
              </span>
              <span className="text-[11px] md:text-[13px] text-slate-400">Plans &amp; Tarifs</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline text-sm">{t("theme")}</span>
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                data-testid="pricing-theme-toggle-switch"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm flex items-center gap-2"
                  data-testid="pricing-language-popover-trigger"
                >
                  <span className="text-lg" aria-hidden="true">{currentLang.flag}</span>
                  <span className="hidden sm:inline text-slate-200">{currentLang.label}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="mt-2 w-64 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-2xl p-2"
                data-testid="pricing-language-popover-content"
              >
                <div className="max-h-64 overflow-auto text-xs">
                  {languages.map((lng) => (
                    <button
                      key={lng.code}
                      onClick={() => setLang(lng.code)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800 text-left ${
                        lng.code === lang ? "bg-slate-800/80" : ""
                      }`}
                      data-testid={`pricing-language-option-${lng.code}`}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-lg border-cyan-400 text-cyan-300 text-sm bg-cyan-500/10 hover:bg-cyan-500/20 shadow-[0_0_18px_rgba(34,211,238,0.65)] hover:shadow-[0_0_26px_rgba(34,211,238,0.9)] transition-all flex items-center gap-2"
              data-testid="pricing-back-button"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-300 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
              {t("pricingBadge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              {t("pricingHeroTitle")}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              {t("pricingHeroSubtitle")}
            </p>
          </section>

          {/* Credit Packs */}
          <section className="grid gap-6 md:grid-cols-3">
            {/* Pack Starter */}
            <Card className="bg-slate-900/70 border-cyan-400/50 hover:border-cyan-500/70 transition-all duration-300 shadow-[0_0_40px_rgba(34,211,238,0.35)]">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-bold">Pack Starter</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">Essai</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-cyan-300">10</span>
                  <span className="text-cyan-300 text-sm">crédits</span>
                </div>
                <p className="text-2xl font-semibold text-slate-300 mt-2">9,99€</p>
                <p className="text-xs text-emerald-400">≈ 1€ par crédit • 5 uploads</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>5 uploads avec génération IA complète</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>Support de 6 plateformes Git</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>README + .gitignore + LICENSE + CHANGELOG</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>Support email (48h)</span>
                  </li>
                </ul>
                <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 mt-4" size="lg">
                  Acheter - 9,99€
                </Button>
              </CardContent>
            </Card>

            {/* Pack Pro */}
            <Card className="bg-gradient-to-br from-violet-500/10 via-slate-900/70 to-slate-900/70 border-violet-500/30 hover:border-violet-500/50 transition-all duration-300 relative shadow-[0_0_40px_rgba(139,92,246,0.35)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 text-xs font-bold">
                  ⭐ POPULAIRE
                </span>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2 mt-2">
                  <CardTitle className="text-xl font-bold">Pack Pro</CardTitle>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-violet-300">50</span>
                  <span className="text-slate-400 text-sm">crédits</span>
                </div>
                <p className="text-2xl font-semibold text-slate-300 mt-2">39,99€</p>
                <p className="text-xs text-emerald-400">≈ 0,80€ par crédit • 25 uploads</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">25 uploads avec génération IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span>Tous les providers supportés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span>4 fichiers générés par IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span>Historique illimité</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span>Support prioritaire (24h)</span>
                  </li>
                </ul>
                <Button className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 font-semibold mt-4 shadow-lg" size="lg">
                  Acheter - 39,99€
                </Button>
                <p className="text-center text-xs text-slate-500">Meilleur rapport qualité/prix</p>
              </CardContent>
            </Card>

            {/* Pack Business */}
            <Card className="bg-slate-900/70 border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 shadow-[0_0_40px_rgba(251,191,36,0.35)]">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-bold">Pack Business</CardTitle>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-amber-300">100</span>
                  <span className="text-slate-400 text-sm">crédits</span>
                </div>
                <p className="text-2xl font-semibold text-slate-300 mt-2">79,99€</p>
                <p className="text-xs text-emerald-400">≈ 0,80€ par crédit • 50 uploads</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>50 uploads avec génération IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Accès prioritaire aux nouveaux providers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Génération IA personnalisable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>API Partner pour intégrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Autopush automatique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Support premium (12h) + Slack</span>
                  </li>
                </ul>
                <Button className="w-full rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold mt-4" size="lg">
                  Acheter - 79,99€
                </Button>
                <p className="text-center text-xs text-slate-500">Maximum d'économies</p>
              </CardContent>
            </Card>
          </section>

          {/* Monthly Subscriptions - Keep existing */}
          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{t("pricingMonthlyTitle")}</h2>
              <p className="text-sm text-slate-400">{t("pricingMonthlySubtitle")}</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {/* Freemium */}
              <Card
                id="freemium"
                className="bg-slate-900/70 border-slate-800 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_0_40px_rgba(148,163,184,0.25)]"
                data-testid="pricing-freemium-card"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-bold">Free</CardTitle>
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">Gratuit</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-cyan-300">0€</span>
                    <span className="text-cyan-300 text-sm">/ mois</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Pour tester la plateforme sans engagement.
                  </p>
                </CardHeader>
                <CardContent className="pt-4 md:pt-0 text-sm">
                  <ul className="text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>1 upload / mois (ZIP, PDF, fichiers ou code)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Création automatique d&apos;un dépôt GitHub</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Organisation IA basique des fichiers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Génération d&apos;un README simplifié</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Commit automatique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Support par email (48–72h)</span>
                    </li>
                  </ul>
                </CardContent>
                <div className="px-6 pb-5 md:pb-4">
                  <Button
                    className="w-full rounded-full bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-300 text-sm font-semibold shadow-lg"
                    data-testid="pricing-freemium-cta"
                    onClick={async () => {
                      try {
                        const res = await axios.post(
                          `${API}/billing/plan`,
                          { plan: "freemium" },
                          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
                        );
                        console.log("Plan freemium appliqué", res.data);
                        alert("✅ Plan Freemium activé avec succès ! Vous avez maintenant accès aux 5 crédits gratuits.");
                        // Redirect to dashboard
                        window.location.href = "/app";
                      } catch (e) {
                        console.error("Set freemium plan failed", e);
                        alert("❌ Erreur lors de l'activation du plan Freemium. Veuillez réessayer.");
                      }
                    }}
                  >
                    Commencer gratuitement
                  </Button>
                </div>
              </Card>

            {/* Premium */}
            <Card
              className="bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-slate-900 border border-cyan-400/60 flex flex-col justify-between shadow-[0_0_40px_rgba(34,211,238,0.40)] relative"
              data-testid="pricing-premium-card"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 text-xs font-bold">
                  ⭐ RECOMMANDÉ
                </span>
              </div>
              <CardHeader className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-bold">Premium</CardTitle>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-cyan-300">29,99€</span>
                  <span className="text-cyan-300 text-sm">/ mois</span>
                </div>
                <p className="text-xs text-slate-400">
                  Pour créateurs réguliers, non-dev, auto-entrepreneurs, étudiants IA.
                </p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-2xl font-bold text-cyan-300">Illimité</span>
                  <span className="text-xs text-cyan-300">uploads / mois</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <ul className="space-y-2 text-slate-100">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300 flex-shrink-0 mt-0.5" />
                    <span>Uploads illimités avec génération IA avancée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300 flex-shrink-0 mt-0.5" />
                    <span>Structuration automatique des dossiers &amp; langage détecté</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300 flex-shrink-0 mt-0.5" />
                    <span>README complet (pro, marketing, documentation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300 flex-shrink-0 mt-0.5" />
                    <span>Commits intelligents multi-étapes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300 flex-shrink-0 mt-0.5" />
                    <span>Support GitHub, GitLab &amp; Bitbucket + support prioritaire</span>
                  </li>
                </ul>
              </CardContent>
              <div className="px-6 pb-5 space-y-2">
                <Button
                  className="w-full rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
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
                <p className="text-[10px] text-slate-200 text-center">
                  Sans engagement. Annulation en un clic.
                </p>
              </div>
            </Card>

            {/* Business */}
            <Card
              className="bg-slate-900/80 border-amber-500/40 hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between shadow-[0_0_40px_rgba(251,191,36,0.35)]"
              data-testid="pricing-business-card"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-bold">Business</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/40">Sur devis</span>
                </div>
                <p className="text-xs text-slate-300">
                  Pour écoles, agences, équipes SaaS et créateurs IA multi-comptes.
                </p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-2xl font-semibold text-amber-300">À partir de 199€</span>
                  <span className="text-amber-300 text-sm">/ mois</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 md:pt-0 text-sm">
                <ul className="text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>10 à 200 utilisateurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Intégration API complète + webhooks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Automations avancées (CI/CD auto, nettoyage, versioning IA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Tableau de bord boosté IA &amp; branding entreprise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>SLA &amp; support dédié</span>
                  </li>
                </ul>
              </CardContent>
              <div className="px-6 pb-5 md:pb-4">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-amber-400/60 text-amber-200 text-xs hover:bg-amber-500/10"
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
            </div>
          </section>

          {/* Section "Ce qui rend la plateforme unique" avec 3 barres dépliantes */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Ce qui rend Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span> unique</h2>
            <div className="space-y-3">
              <details
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 cursor-pointer transition-colors"
                data-testid="pricing-unique-accordion-1"
              >
                <summary className="flex items-center justify-between gap-2 list-none">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Aucun Git, aucune CLI, aucun IDE</span>
                    <span className="text-[11px] text-slate-400">
                      Publiez depuis votre navigateur, Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span> gère toute la plomberie Git.
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

// White Paper Page
function WhitePaperPage({ t, lang, setLang, dark, setDark, currentLang, languages }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 md:gap-3 group"
          >
            <div className="h-11 w-11 md:h-[52px] md:w-[52px] rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)] transition-colors group-hover:scale-105">
              <DownloadCloud className="h-[22px] w-[22px] md:h-[26px] md:w-[26px] text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[17px] md:text-[19px] font-semibold tracking-tight">
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span><span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent text-[13px] md:text-[15px]">.AI</span>
              </span>
              <span className="text-[11px] md:text-[13px] text-slate-400">Livre Blanc</span>
            </div>
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg border-cyan-400 text-cyan-300 text-sm bg-cyan-500/10 hover:bg-cyan-500/20 shadow-[0_0_18px_rgba(34,211,238,0.65)] hover:shadow-[0_0_26px_rgba(34,211,238,0.9)] transition-all flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-300 mb-4">
            <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
            Livre Blanc Technique
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span>
            <span className="block text-2xl sm:text-3xl mt-2 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Révolutionnez Votre Workflow Git
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            La plateforme No-Code qui automatise vos dépôts Git avec l'Intelligence Artificielle
          </p>
        </div>

        {/* Executive Summary */}
        <Card className="bg-slate-900/70 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Résumé Exécutif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <p>
              <strong className="text-slate-50">Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span></strong> est une plateforme SaaS innovante qui élimine la complexité 
              de Git pour les développeurs, designers et créateurs de contenu. En combinant l'automatisation IA et une 
              interface No-Code, Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span> permet de créer et gérer des repositories Git en quelques clics.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <p className="text-2xl font-bold text-cyan-300">12</p>
                <p className="text-xs text-slate-400">Plateformes Git</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <p className="text-2xl font-bold text-emerald-300">4</p>
                <p className="text-xs text-slate-400">Fichiers IA générés</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <p className="text-2xl font-bold text-violet-300">20+</p>
                <p className="text-xs text-slate-400">API Endpoints</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Provider Support */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-violet-400" />
              Support Multi-Plateformes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-slate-300">
              Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span> supporte <strong className="text-cyan-300">12 plateformes Git</strong> différentes, 
              permettant une distribution mondiale et une flexibilité maximale.
            </p>
            
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-emerald-300 mb-2">✅ Providers Actifs (API Complète)</p>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-cyan-500/20 text-center">
                  <p className="text-base">
                    <span className="text-cyan-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.9)] neon-flicker font-semibold">
                      GitHub, GitLab, Bitbucket, Gitea, Codeberg, Gitee
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">6 plateformes Git entièrement opérationnelles</p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold text-amber-300 mb-2">🟡 Providers En Développement</p>
                <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/30">
                    <Clock className="h-4 w-4" />
                    <span>Azure DevOps</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/30">
                    <Clock className="h-4 w-4" />
                    <span>AWS CodeCommit</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/30">
                    <Clock className="h-4 w-4" />
                    <span>Google Cloud Source</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/30">
                    <Clock className="h-4 w-4" />
                    <span>Alibaba Cloud + Tencent</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Capabilities */}
        <Card className="bg-gradient-to-br from-violet-500/10 via-slate-900/70 to-slate-900/70 border-violet-500/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Rocket className="h-5 w-5 text-violet-400" />
              Intelligence Artificielle Intégrée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-slate-300">
              Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span> utilise des <strong className="text-violet-300">modèles d'IA avancés</strong> pour générer 
              automatiquement une documentation professionnelle et des fichiers de projet standards.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-violet-500/20 space-y-2">
                <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-2">
                  <span className="text-lg">📝</span>
                </div>
                <h3 className="font-semibold text-violet-300">README.md Intelligent</h3>
                <p className="text-xs text-slate-400">
                  Analyse automatique du code pour générer une documentation complète : Overview, Features, Installation, Usage
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-950/50 border border-violet-500/20 space-y-2">
                <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-2">
                  <span className="text-lg">🔧</span>
                </div>
                <h3 className="font-semibold text-violet-300">.gitignore Adaptatif</h3>
                <p className="text-xs text-slate-400">
                  Détection automatique du stack technologique (Node.js, Python, Java, etc.) et génération du .gitignore optimal
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-950/50 border border-violet-500/20 space-y-2">
                <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-2">
                  <span className="text-lg">⚖️</span>
                </div>
                <h3 className="font-semibold text-violet-300">LICENSE Automatique</h3>
                <p className="text-xs text-slate-400">
                  Génération de licence MIT avec votre nom, prêt pour l'open-source
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-950/50 border border-violet-500/20 space-y-2">
                <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-2">
                  <span className="text-lg">📋</span>
                </div>
                <h3 className="font-semibold text-violet-300">CHANGELOG.md</h3>
                <p className="text-xs text-slate-400">
                  Format Keep a Changelog avec versionning sémantique (SemVer) pré-configuré
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API & Architecture */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              API & Architecture Technique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-cyan-300 mb-2">Architecture RESTful OpenAPI 3.1</h3>
                <p className="text-slate-400 text-xs mb-3">
                  API complète avec 20+ endpoints, documentation Swagger/ReDoc interactive, et conformité OpenAPI.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-950/50 text-center">
                    <p className="font-bold text-cyan-300">20+</p>
                    <p className="text-slate-500">Endpoints</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950/50 text-center">
                    <p className="font-bold text-emerald-300">REST</p>
                    <p className="text-slate-500">Protocol</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950/50 text-center">
                    <p className="font-bold text-violet-300">JWT</p>
                    <p className="text-slate-500">Auth</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950/50 text-center">
                    <p className="font-bold text-amber-300">OpenAPI</p>
                    <p className="text-slate-500">Spec 3.1</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-cyan-300 mb-2">Endpoints Clés</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 p-2 rounded bg-slate-950/30">
                    <span className="text-cyan-400 font-mono">POST</span>
                    <div>
                      <p className="font-medium">/api/v1/upload</p>
                      <p className="text-slate-500">Upload simplifié all-in-one</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-slate-950/30">
                    <span className="text-emerald-400 font-mono">GET</span>
                    <div>
                      <p className="font-medium">/api/v1/jobs/{"{id}"}</p>
                      <p className="text-slate-500">Suivi temps réel avec logs détaillés</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-slate-950/30">
                    <span className="text-emerald-400 font-mono">GET</span>
                    <div>
                      <p className="font-medium">/api/v1/providers</p>
                      <p className="text-slate-500">Liste des 12 plateformes supportées</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-slate-950/30">
                    <span className="text-violet-400 font-mono">GET</span>
                    <div>
                      <p className="font-medium">/api/v1/repos/by-provider</p>
                      <p className="text-slate-500">Filtrage multi-provider</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Model (section retirée sur demande) */}

        {/* Advanced Features */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Rocket className="h-5 w-5 text-cyan-400" />
              Fonctionnalités Avancées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-sm">🔄</span>
                  </div>
                  <h3 className="font-semibold text-cyan-300">Autopush</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Automatisation programmable : poussez automatiquement vos mises à jour selon une fréquence 
                  définie (every_upload, hourly, daily).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <span className="text-sm">🤝</span>
                  </div>
                  <h3 className="font-semibold text-violet-300">Partner API</h3>
                </div>
                <p className="text-xs text-slate-400">
                  API dédiée pour intégrations SaaS : permettez à vos utilisateurs de créer des repos 
                  directement depuis votre plateforme.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-sm">🔔</span>
                  </div>
                  <h3 className="font-semibold text-emerald-300">Webhooks</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Notifications en temps réel pour chaque job complété, intégrable avec vos systèmes.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <span className="text-sm">☁️</span>
                  </div>
                  <h3 className="font-semibold text-amber-300">Presigned URLs</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Upload direct vers le stockage avec URLs pré-signées pour des performances optimales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Potential (section retirée sur demande) */}

        {/* Technical Stack (section retirée sur demande) */}

        {/* Competitive Advantages (section retirée sur demande) */}

        {/* Roadmap (section retirée sur demande) */}

        {/* Call to Action */}
        <div className="text-center space-y-6 py-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Prêt à Révolutionner Votre Workflow Git ?</h2>
            <p className="text-slate-400">
              Rejoignez les développeurs qui ont choisi la simplicité.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 px-8 py-3 shadow-lg text-sm"
              onClick={() => navigate("/pricing")}
            >
              Commencer Gratuitement
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-slate-700 text-sm"
              onClick={() => window.open("http://localhost:8001/docs", "_blank")}
            >
              Explorer l'API
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            10 crédits gratuits • Aucune carte requise • Support multi-provider
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          <p>Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span> © 2024</p>
          <p className="mt-2">Version 1.0.0 • API V1 • 12 Git Providers</p>
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
    <>
      <Routes>
        <Route path="/terms" element={<TermsPage />} />
        <Route
          path="/signup"
          element={
            <Landing
              t={t}
              lang={lang}
              setLang={setLang}
              dark={dark}
              setDark={setDark}
              currentLang={currentLang}
              languages={languages}
              isLoadingLang={isLoadingLang}
              forceSignupMode
            />
          }
        />
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
        path="/app/pro" 
        element={
          <ProDashboard 
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
        path="/whitepaper" 
        element={
          <WhitePaperPage 
            t={t} 
            lang={lang}
            setLang={setLang}
            dark={dark}
            setDark={setDark}
            currentLang={currentLang}
            languages={languages}
          />
        } 
      />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/support" element={<AdminSupportPanel />} />
      <Route path="/admin/autofix" element={<AdminAutofixPanel />} />
      <Route path="/for-ai-assistants" element={<ForAIAssistants />} />
      <Route 
        path="/auth/callback" 
        element={<OAuthCallback />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <SupportChatbot />
  </>
  );
}

// ---- Support Chatbot Component ----
function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminName, setAdminName] = useState('');
  const token = localStorage.getItem('token');

  // Check admin online status - TEMPS RÉEL
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API}/support/admin-online`);
        setAdminOnline(res.data.online);
        setAdminName(res.data.admin_name || 'Support');
      } catch (err) {
        setAdminOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000); // Check every 3s for real-time effect
    return () => clearInterval(interval);
  }, []);

  // Load existing messages if user is logged in
  useEffect(() => {
    if (token && isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [token, isOpen]);

  const loadMessages = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/support/my-messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formattedMessages = res.data.map(msg => ({
        type: msg.is_admin ? 'bot' : 'user',
        text: msg.message,
        timestamp: msg.created_at
      }));
      if (formattedMessages.length === 0) {
        setMessages([{ type: 'bot', text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?' }]);
      } else {
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const quickReplies = [
    { text: 'Comment créer un dépôt ?', response: 'Pour créer un dépôt, cliquez sur "Nouveau workflow", uploadez vos fichiers, configurez les paramètres et lancez l\'automatisation !' },
    { text: 'Comment gérer mes crédits ?', response: 'Consultez votre dashboard pour voir vos crédits disponibles. Vous pouvez acheter plus de crédits dans la section Pricing.' },
    { text: 'Problème de connexion', response: 'Si vous avez des problèmes de connexion, essayez de vous reconnecter via GitHub, GitLab ou Bitbucket. Si le problème persiste, contactez-nous à support@gitpusher.ai' },
    { text: 'Contacter le support', response: 'Vous pouvez nous contacter par email à support@gitpusher.ai ou utiliser le formulaire de contact sur notre site.' }
  ];

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { type: 'user', text }]);
    setInputMessage('');

    // If logged in, send to backend
    if (token) {
      try {
        await axios.post(
          `${API}/support/messages`,
          { message: text },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Failed to send message", err);
      }
    } else {
      // Simuler une réponse du bot pour utilisateurs non connectés
      setTimeout(() => {
        const reply = quickReplies.find(q => text.toLowerCase().includes(q.text.toLowerCase()));
        const botResponse = reply?.response || 'Merci pour votre message. Pour une assistance personnalisée, veuillez vous connecter ou écrivez-nous à support@gitpusher.ai';
        setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
      }, 1000);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
        aria-label="Ouvrir le support"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">!</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] w-full h-full bg-slate-900 border-0 sm:border sm:border-slate-700 sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-violet-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Support GitPusher</h3>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${adminOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              <p className="text-white/80 text-xs">
                {adminOnline ? `${adminName} en ligne` : 'Hors ligne - Email uniquement'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              msg.type === 'user'
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                : 'bg-slate-800 text-slate-100 border border-slate-700'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <p className="text-xs text-slate-400 mb-2">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(reply.text)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors"
              >
                {reply.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => window.location.href = 'mailto:support@gitpusher.ai'}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email: support@gitpusher.ai
          </button>
        </div>
      </div>
    </div>
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
