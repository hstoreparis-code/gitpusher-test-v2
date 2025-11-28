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
      "Dépose tes fichiers, l’IA organise ton projet, génère le README et pousse tes dépôts Git (GitHub aujourd’hui, GitLab & Bitbucket à venir).",
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
  const [activeStep, setActiveStep] = useState(null);

  const handleGetStarted = () => {
    if (token) {
      // Utilisateur connecté : on l'envoie directement sur les tarifs, ancre Freemium
      navigate("/pricing#freemium");
    } else {
      // Non connecté : on ouvre le modal d'authentification comme avant
      setAuthOpen(true);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span>
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
            <button
              onClick={() => navigate("/app/pro")}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 text-sm font-semibold shadow-[0_0_18px_rgba(56,189,248,0.85)]"
            >
              <span>Pro Dashboard</span>
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
        <div className="w-full max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 gap-12 items-start">
          <div className="space-y-4 sm:space-y-8 text-center lg:text-left">
            <p className="inline-flex items-center justify-center gap-2 text-[12px] sm:text-[11px] uppercase tracking-[0.25em] text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-4 py-1.5 rounded-full mx-auto lg:mx-0 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              AI Git Automation
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight max-w-2xl mx-auto lg:mx-0">
              {lang === "fr" ? (
                <>
                  Workflow Git <span className="whitespace-nowrap">No-Code</span>
                </>
              ) : (
                <>
                  <span className="whitespace-nowrap">No-Code</span> Git Workflow
                </>
              )}
              <span className="text-cyan-300 text-5xl sm:text-6xl align-baseline leading-none drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]">.</span>
            </h1>
            {lang === "fr" ? (
              <p className="text-[13px] sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
                Dépose tes fichiers, l’IA organise ton projet, génère le README et pousse tes dépôts Git sur le (
                <span className="text-cyan-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.9)] neon-flicker">
                  GitHub, GitLab, Bitbucket, Gitea, Codeberg, Gitee...
                </span>
                ).
              </p>
            ) : (
              <p className="text-[13px] sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
                {t("heroSubtitle")}
              </p>
            )}

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
                    Drag &amp; Drop
                  </span>
                  <span className="text-base lg:text-lg font-medium">Dépose tes fichiers ici</span>
                </div>
                <p className="text-[12px] lg:text-[13px] text-slate-400 max-w-[80%] text-center">
                  Zip, PDF, dossiers de code… PUSH IN se charge de tout organiser et pousser sur GitHub.
                </p>
                <div className="mt-2 inline-flex items-center gap-2 text-[12px] lg:text-[13px] text-slate-300">
                  <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500" />
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
            <div className="flex flex-wrap items-center gap-4 mt-8 justify-center">
              <Button
                size="lg"
                className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-3 shadow-lg shadow-cyan-500/30 text-sm sm:text-base"
                onClick={() => navigate("/pricing#freemium")}
                data-testid="get-started-button"
              >
                {lang === "fr" ? "Commencer gratuitement" : t("getStarted")}
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

      {/* Footer with White Paper link */}
      <footer className="w-full border-t border-white/5 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2024 Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span>. No-Code Git Workflow powered by AI.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/whitepaper")}
              className="hover:text-cyan-300 transition-colors underline"
            >
              📄 Livre Blanc
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="hover:text-cyan-300 transition-colors"
            >
              Tarifs
            </button>
          </div>
        </div>
      </footer>
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
  const [oauthProvider, setOauthProvider] = useState(null);
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
    <Card className="bg-slate-900/70 border-white/10 shadow-2xl shadow-cyan-500/20 text-slate-50">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Connexion via Git providers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Bloc connexions rapides en premier */}
        <div className="mb-5 space-y-3">
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
  
  // State for uploaded files
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
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

    // Store uploaded files info for display
    const filesInfo = files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    }));
    setUploadedFiles(filesInfo);

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

  if (!token) return <Navigate to="/" replace />;

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
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span>
              </span>
              <span className="text-[11px] md:text-[13px] text-slate-400 truncate">No-Code GitHub workflow</span>
            </div>
          </button>
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-sm">
            <Button
              size="sm"
              className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 text-[11px] font-semibold shadow-[0_0_16px_rgba(56,189,248,0.8)]"
              onClick={() => navigate("/app/pro")}
            >
              Mode Pro
            </Button>
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
        {/* Dashboard Title */}
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
                    const plans = ["Free", "Starter", "Pro", "Enterprise"];
                    const currentIndex = plans.indexOf(currentUser?.plan || "Free");
                    const nextPlan = plans[(currentIndex + 1) % plans.length];
                    setTestUser({ ...currentUser, plan: nextPlan });
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
      </main>
    </div>
  );
}

function ProDashboard({ t, lang, setLang, dark, setDark, currentLang, languages, isLoadingLang }) {
  const { token, user, logout } = useAuth();
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
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span>
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
              <p className="text-xs text-cyan-300 mb-1">Mode Pro</p>
              <h1 className="text-lg sm:text-xl font-semibold">
                Vue d&apos;ensemble avancée de tes workflows Git et de l&apos;activité IA
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
                Uploads illimités, analytics détaillées, multi-providers et automations avancées.
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardContent className="py-3 px-4">
              <p className="text-[11px] text-slate-400 mb-1">Projets actifs</p>
              <p className="text-2xl font-semibold text-cyan-300">{activeProjects}</p>
              <p className="text-[10px] text-slate-500 mt-1">sur {totalProjects} au total</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardContent className="py-3 px-4">
              <p className="text-[11px] text-slate-400 mb-1">Jobs complétés</p>
              <p className="text-2xl font-semibold text-emerald-300">{completedJobs}</p>
              <p className="text-[10px] text-slate-500 mt-1">{failedJobs} en erreur</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardContent className="py-3 px-4">
              <p className="text-[11px] text-slate-400 mb-1">Taux de succès</p>
              <p className="text-2xl font-semibold text-cyan-300">{successRate}%</p>
              <p className="text-[10px] text-slate-500 mt-1">basé sur tous les jobs</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/80 border-slate-800/80">
            <CardContent className="py-3 px-4">
              <p className="text-[11px] text-slate-400 mb-1">Providers utilisés</p>
              <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-200">
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
              <p className="text-slate-200 font-medium text-[12px]">Multi-utilisateurs (10 à 200)</p>
              <p className="text-slate-400 text-[11px]">
                Visualise et gère plusieurs comptes connectés (étudiants, équipe marketing, clients SaaS) sur un même
                espace.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-200 font-medium text-[12px]">Branding &amp; espaces dédiés</p>
              <p className="text-slate-400 text-[11px]">
                Logo, couleurs, sous-domaine et règles d&apos;automatisation propres à chaque organisation.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-200 font-medium text-[12px]">SLA &amp; support prioritaire</p>
              <p className="text-slate-400 text-[11px]">
                Canal Slack dédié, support 12h, accompagnement à l&apos;intégration pour les offres Business.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// TODO: cleanup duplicate test buttons removed here

                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const currentUser = testUser || authUser;
                    setTestUser({ ...currentUser, credits: 1, plan: "Free" });
                  }}
                  variant="outline"
                  className="text-xs border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
                >
                  ⚠️ Mode Alerte
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setTestUser(null);
                  }}
                  variant="outline"
                  className="text-xs border-slate-500/50 text-slate-300 hover:bg-slate-500/20"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                DASHBOARD
              </h1>
              <p className="hidden sm:block text-slate-400 text-sm mt-1">Gérez vos workflows Git alimentés par l'IA</p>
            </div>
            
            {/* Credits & Subscription Card */}
            <Card className="bg-gradient-to-br from-violet-500/10 via-slate-900/70 to-slate-900/70 border-violet-500/30 backdrop-blur-sm transition-all">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Circular Progress */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                    <svg className="transform -rotate-90 h-full w-full" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(139, 92, 246, 0.1)"
                        strokeWidth="8"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={`${(user?.credits || 0) <= 2 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(139, 92, 246, 0.8)'}`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${((user?.credits || 0) / 100) * 283} 283`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xl sm:text-2xl font-bold ${(user?.credits || 0) <= 2 ? 'text-red-400' : 'text-violet-300'}`}>
                        {user?.credits || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-400">Crédits restants</p>
                    <p className="text-sm sm:text-base font-semibold text-violet-200">
                      Plan: <span className="text-violet-300">{user?.plan || "Free"}</span>
                    </p>
                    {(user?.credits || 0) <= 2 && (
                      <p className="text-[10px] sm:text-xs text-red-400 mt-1 font-semibold">
                        ⚠️ Crédits faibles !
                      </p>
                    )}
                  </div>

                  {/* Desktop Button */}
                  <Button
                    size="sm"
                    onClick={() => navigate("/pricing")}
                    className="hidden sm:flex px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-slate-950 text-sm font-semibold shadow-lg"
                  >
                    🚀 Mise à niveau
                  </Button>

                  {/* Mobile Button */}
                  <Button
                    size="sm"
                    onClick={() => navigate("/pricing")}
                    className="sm:hidden px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-slate-950 text-xs font-semibold shadow-lg"
                  >
                    🚀
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Cards - Mobile */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {/* Total Projects */}
          <Card className="bg-slate-900/80 border border-slate-800 rounded-xl">
            <CardContent className="p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Total Projects</span>
                <div className="h-7 w-7 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <GitBranch className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <p className="text-lg font-semibold text-cyan-300 leading-tight">{projects.length}</p>
              <p className="text-[10px] text-slate-500">Workflows créés avec l&apos;IA.</p>
            </CardContent>
          </Card>

          {/* Completed Projects */}
          <Card className="bg-slate-900/80 border border-slate-800 rounded-xl">
            <CardContent className="p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Completed</span>
                <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <p className="text-lg font-semibold text-emerald-300 leading-tight">
                {projects.filter(p => p.status === "done").length}
              </p>
              <p className="text-[10px] text-slate-500">Workflows terminés avec succès.</p>
            </CardContent>
          </Card>

          {/* Pending Projects */}
          <Card className="bg-slate-900/80 border border-slate-800 rounded-xl">
            <CardContent className="p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Pending</span>
                <div className="h-7 w-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
              </div>
              <p className="text-lg font-semibold text-amber-300 leading-tight">
                {projects.filter(p => p.status !== "done").length}
              </p>
              <p className="text-[10px] text-slate-500">Workflows en attente de traitement.</p>
            </CardContent>
          </Card>

          {/* Total Jobs */}
          <Card className="bg-slate-900/80 border border-slate-800 rounded-xl">
            <CardContent className="p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Total Jobs</span>
                <div className="h-7 w-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-violet-400" />
                </div>
              </div>
              <p className="text-lg font-semibold text-violet-300 leading-tight">{jobs.length}</p>
              <p className="text-[10px] text-slate-500">Exécutions IA effectuées.</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Desktop/Tablet */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Total Projects */}
          <Card className="bg-gradient-to-br from-cyan-500/10 via-slate-900/70 to-slate-900/70 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center ring-2 ring-cyan-500/30">
                  <GitBranch className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <p className="text-sm text-slate-100 mb-2 font-semibold">Total Projects</p>
              <p className="text-3xl font-bold text-cyan-300">{projects.length}</p>
              <p className="text-xs text-slate-300 mt-2">Workflows créés avec l'IA</p>
            </CardContent>
          </Card>

          {/* Completed Projects */}
          <Card className="bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-slate-900/70 border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center ring-2 ring-emerald-500/30">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <p className="text-sm text-slate-100 mb-2 font-semibold">Completed</p>
              <p className="text-3xl font-bold text-emerald-300">
                {projects.filter(p => p.status === "done").length}
              </p>
              <p className="text-xs text-slate-300 mt-2">Workflows terminés avec succès</p>
            </CardContent>
          </Card>

          {/* Pending Projects */}
          <Card className="bg-gradient-to-br from-amber-500/10 via-slate-900/70 to-slate-900/70 border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center ring-2 ring-amber-500/30">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <p className="text-sm text-slate-100 mb-2 font-semibold">Pending</p>
              <p className="text-3xl font-bold text-amber-300">
                {projects.filter(p => p.status !== "done").length}
              </p>
              <p className="text-xs text-slate-300 mt-2">En attente de traitement</p>
            </CardContent>
          </Card>

          {/* Total Jobs */}
          <Card className="bg-gradient-to-br from-violet-500/10 via-slate-900/70 to-slate-900/70 border-violet-500/20 backdrop-blur-sm hover:border-violet-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center ring-2 ring-violet-500/30">
                  <Activity className="h-6 w-6 text-violet-400" />
                </div>
              </div>
              <p className="text-sm text-slate-100 mb-2 font-semibold">Total Jobs</p>
              <p className="text-3xl font-bold text-violet-300">{jobs.length}</p>
              <p className="text-xs text-slate-300 mt-2">Exécutions IA effectuées</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-[1fr,1.5fr] gap-3 sm:gap-6 lg:gap-8">
          {/* Projects List */}
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm flex flex-col shadow-xl text-sm hover:border-slate-700 transition-colors">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 sm:pb-6">
              <div className="flex items-center gap-3 w-full sm:w-auto min-w-0 flex-1">
                <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <GitBranch className="h-5 w-5 sm:h-6 sm:w-6 text-slate-950" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <CardTitle className="text-sm sm:text-xl leading-snug truncate font-bold">
                    {t("dashboardTitle")}
                  </CardTitle>
                  <p className="hidden sm:block text-sm text-slate-400 mt-1 truncate">
                    Clique sur un workflow puis renomme le repo avant de lancer.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full sm:w-auto flex-shrink-0 justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all"
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
                    <div
                      key={p.id}
                      className={`group relative w-full text-left text-sm sm:text-sm px-3 py-2 rounded-xl border transition-all duration-200 ${
                        selected?.id === p.id
                          ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-400/60 shadow-lg shadow-cyan-500/20"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:shadow-md"
                      }`}
                      data-testid={`project-card-${p.id}`}
                    >
                      <button
                        onClick={() => setSelected(p)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                              p.status === "done" ? "bg-emerald-400" : 
                              p.status === "archived" ? "bg-slate-500" : "bg-amber-400"
                            } ${selected?.id === p.id ? "animate-pulse" : ""}`}></div>
                            <span className="font-medium truncate">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`text-xs px-2 py-1 rounded-full border font-medium ${
                                p.status === "done"
                                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                                  : p.status === "archived"
                                  ? "border-slate-500/50 bg-slate-500/10 text-slate-400"
                                  : "border-amber-400/50 bg-amber-400/10 text-amber-200"
                              }`}
                              data-testid="project-status-pill"
                        >
                          {p.status === "archived" ? "Archivé" : p.status}
                        </span>
                          </div>
                        </div>
                        {p.github_repo_url && (
                          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 truncate">
                            <Rocket className="h-3 w-3" />
                            <span className="truncate">{p.github_repo_url}</span>
                          </div>
                        )}
                      </button>

                      {/* Actions Menu */}
                      <Popover open={projectMenuOpen === p.id} onOpenChange={(open) => setProjectMenuOpen(open ? p.id : null)}>
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectMenuOpen(projectMenuOpen === p.id ? null : p.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 hover:border-cyan-400/80 transition-all shadow-[0_0_8px_rgba(34,211,238,0.4)] hover:shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                          >
                            <span className="text-cyan-300 font-bold">⋮</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-xl" align="end">
                          <div className="space-y-1">
                            {/* Modifier */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(p);
                                setProjectMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-all text-left"
                            >
                              <span className="text-cyan-400">✏️</span>
                              <span className="text-sm text-slate-200">Modifier</span>
                            </button>

                            {/* Archiver/Désarchiver */}
                            {p.status !== "archived" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveProject(p.id);
                                  setProjectMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-all text-left"
                              >
                                <span className="text-amber-400">📦</span>
                                <span className="text-sm text-slate-200">Archiver</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveProject(p.id);
                                  setProjectMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-all text-left"
                              >
                                <span className="text-emerald-400">📤</span>
                                <span className="text-sm text-slate-200">Désarchiver</span>
                              </button>
                            )}

                            {/* Supprimer */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProject(p.id);
                                setProjectMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/20 transition-all text-left"
                            >
                              <span className="text-red-400">🗑️</span>
                              <span className="text-sm text-red-300">Supprimer</span>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-slate-900/70 border-slate-800 flex flex-col text-sm hover:border-slate-700 transition-colors" data-testid="project-stepper-card">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-base sm:text-xl flex items-center justify-between font-bold">
                  <span>{selected ? selected.name : t("stepUpload")}</span>
                  {selected && selected.github_repo_url && (
                    <a
                      href={selected.github_repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/70 bg-cyan-500/10 hover:bg-cyan-500/30 text-xs sm:text-sm text-cyan-200 font-semibold shadow-[0_0_12px_rgba(34,211,238,0.8)] neon-flicker transition-all"
                      data-testid="project-github-link"
                    >
                      <Rocket className="h-4 w-4" />
                      <span>{t("linkRepo")}</span>
                    </a>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 sm:gap-6 text-sm">
                {!selected ? (
                  <p className="text-slate-400 text-center py-8">{t("noProjects")}</p>
                ) : (
                  <>
                    {/* Nom du repo */}
                    <div className="space-y-3 p-4 sm:p-6 bg-slate-950/40 rounded-xl border border-slate-800/50">
                      <h3 className="font-semibold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs text-cyan-400">✏️</span>
                        Nom du repo
                      </h3>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            value={selected.name}
                            onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                            className="h-9 sm:h-10 text-sm bg-slate-950/60 border-slate-700 focus:border-cyan-500/50 flex-1"
                            placeholder="Entrez le nom du repo"
                          />
                          <Button
                            size="sm"
                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap"
                            onClick={async () => {
                              const newName = selected.name?.trim();
                              if (!newName) {
                                alert("Le nom du repo ne peut pas être vide");
                                return;
                              }
                              try {
                                await axios.patch(
                                  `${API}/workflows/projects/${selected.id}`,
                                  { name: newName },
                                  { headers: { Authorization: `Bearer ${token}` } },
                                );
                                // Update local state with confirmed name
                                setSelected({ ...selected, name: newName });
                                // Show success feedback
                                const successMsg = document.getElementById(`success-${selected.id}`);
                                if (successMsg) {
                                  successMsg.classList.remove('hidden');
                                  setTimeout(() => {
                                    successMsg.classList.add('hidden');
                                  }, 3000);
                                }
                              } catch (err) {
                                console.error("Failed to update project name", err);
                                alert("Erreur lors de la mise à jour du nom");
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap"
                          >
                            ✓ Confirmer
                          </Button>
                        </div>
                        <div id={`success-${selected.id}`} className="hidden flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <span className="text-emerald-400">✓</span>
                          <p className="text-xs sm:text-sm text-emerald-300">
                            Nom du repo mis à jour avec succès !
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400">
                          Ce nom sera utilisé comme nom du dépôt GitHub créé par Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span>.
                        </p>
                      </div>
                    </div>

                    {/* Sélection Provider Git */}
                    <div className="space-y-3 p-4 sm:p-6 bg-slate-950/40 rounded-xl border border-slate-800/50">
                      <h3 className="font-semibold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">🔗</span>
                        Choisir votre hébergeur Git
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Sélectionnez la plateforme où votre dépôt sera créé
                      </p>
                      
                      {/* Dropdown Menu */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              {selectedProvider === "github" && (
                                <>
                                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  </svg>
                                  <div className="flex flex-col items-start">
                                    <span className="text-sm font-semibold text-slate-200">GitHub</span>
                                    {user?.github_access_token && (
                                      <span className="text-[10px] text-emerald-400">✓ Connecté</span>
                                    )}
                                  </div>
                                </>
                              )}
                              {selectedProvider === "gitlab" && (
                                <>
                                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.9764 3.7296 2.4602 1.8633 1.4991 1.1321a1.0116 1.0116 0 0 0 1.2177 0l1.4991-1.1321 2.4602-1.8633 5.0077-3.7509.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z"/>
                                  </svg>
                                  <span className="text-sm font-semibold text-slate-200">GitLab</span>
                                </>
                              )}
                              {selectedProvider === "bitbucket" && (
                                <>
                                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"/>
                                  </svg>
                                  <span className="text-sm font-semibold text-slate-200">Bitbucket</span>
                                </>
                              )}
                              {selectedProvider === "gitea" && (
                                <>
                                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.186 5.74A9.26 9.26 0 0 0 12 18.26a9.26 9.26 0 0 0 7.814-12.52 9.26 9.26 0 0 0-15.628 0zm8.08 10.396a1.503 1.503 0 1 1 0-3.006 1.503 1.503 0 0 1 0 3.006z"/>
                                  </svg>
                                  <span className="text-sm font-semibold text-slate-200">Gitea</span>
                                </>
                              )}
                              {selectedProvider === "codeberg" && (
                                <>
                                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.955.49A12 12 0 0 0 0 12.49a12 12 0 0 0 1.832 6.373L11.838 5.928a1.2 1.2 0 0 1 1.054-.623 1.2 1.2 0 0 1 1.054.623l10.006 12.935A12 12 0 0 0 24 12.49 12 12 0 0 0 11.955.49z"/>
                                  </svg>
                                  <span className="text-sm font-semibold text-slate-200">Codeberg</span>
                                </>
                              )}
                              {selectedProvider === "gitee" && (
                                <>
                                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"/>
                                  </svg>
                                  <span className="text-sm font-semibold text-slate-200">Gitee</span>
                                </>
                              )}
                            </div>
                            <span className="text-slate-400">▼</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-2 bg-slate-900/95 border border-slate-700/80 shadow-xl rounded-xl">
                          <div className="space-y-1">
                            {/* GitHub */}
                            <button
                              onClick={() => {
                                if (!user?.github_access_token) {
                                  setAuthOpen(true);
                                } else {
                                  setSelectedProvider("github");
                                }
                              }}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                <span className="text-sm font-medium text-slate-200">GitHub</span>
                              </div>
                              {user?.github_access_token && (
                                <span className="text-xs text-emerald-400">✓ Connecté</span>
                              )}
                            </button>

                            {/* GitLab */}
                            <button
                              onClick={() => setAuthOpen(true)}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.9764 3.7296 2.4602 1.8633 1.4991 1.1321a1.0116 1.0116 0 0 0 1.2177 0l1.4991-1.1321 2.4602-1.8633 5.0077-3.7509.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z"/>
                                </svg>
                                <span className="text-sm font-medium text-slate-200">GitLab</span>
                              </div>
                              <span className="text-xs text-slate-500">Bientôt</span>
                            </button>

                            {/* Bitbucket */}
                            <button
                              onClick={() => setAuthOpen(true)}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"/>
                                </svg>
                                <span className="text-sm font-medium text-slate-200">Bitbucket</span>
                              </div>
                              <span className="text-xs text-slate-500">Bientôt</span>
                            </button>

                            {/* Gitea */}
                            <button
                              onClick={() => setAuthOpen(true)}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M4.186 5.74A9.26 9.26 0 0 0 12 18.26a9.26 9.26 0 0 0 7.814-12.52 9.26 9.26 0 0 0-15.628 0zm8.08 10.396a1.503 1.503 0 1 1 0-3.006 1.503 1.503 0 0 1 0 3.006z"/>
                                </svg>
                                <span className="text-sm font-medium text-slate-200">Gitea</span>
                              </div>
                              <span className="text-xs text-slate-500">Bientôt</span>
                            </button>

                            {/* Codeberg */}
                            <button
                              onClick={() => setAuthOpen(true)}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.955.49A12 12 0 0 0 0 12.49a12 12 0 0 0 1.832 6.373L11.838 5.928a1.2 1.2 0 0 1 1.054-.623 1.2 1.2 0 0 1 1.054.623l10.006 12.935A12 12 0 0 0 24 12.49 12 12 0 0 0 11.955.49z"/>
                                </svg>
                                <span className="text-sm font-medium text-slate-200">Codeberg</span>
                              </div>
                              <span className="text-xs text-slate-500">Bientôt</span>
                            </button>

                            {/* Gitee */}
                            <button
                              onClick={() => setAuthOpen(true)}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"/>
                                </svg>
                                <span className="text-sm font-medium text-slate-200">Gitee</span>
                              </div>
                              <span className="text-xs text-slate-500">Bientôt</span>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {selectedProvider === "github" && user?.github_access_token && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <span className="text-emerald-400">✓</span>
                          <p className="text-xs sm:text-sm text-emerald-300">
                            Prêt à créer sur GitHub
                          </p>
                        </div>
                      )}

                      {!user?.github_access_token && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <span className="text-amber-400">⚠️</span>
                          <p className="text-xs sm:text-sm text-amber-300">
                            Veuillez vous connecter à un hébergeur Git pour continuer
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Étape 1 : Upload */}
                    <div className="space-y-3 p-4 sm:p-6 bg-slate-950/60 rounded-2xl border border-cyan-500/25 shadow-[0_0_32px_rgba(34,211,238,0.35)]">
                      <h3 className="font-semibold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs text-violet-400 font-bold">1</span>
                        Uploade tes fichiers
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Ajoute un ZIP ou quelques fichiers (code, texte, docs). L&apos;IA analysera ce contenu pour générer
                        la structure du repo et la documentation.
                      </p>
                      <div className="flex flex-col gap-3">
                        <label className="inline-flex items-center px-4 py-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/50 cursor-pointer text-xs sm:text-sm transition-all w-fit">
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={onFilesSelected}
                            disabled={uploading || processing}
                          />
                          <span className="mr-2">📁 Choisir des fichiers</span>
                          <span className="text-xs text-slate-500">ZIP, .py, .js, .md, PDF…</span>
                        </label>
                        
                        {uploading && (
                          <span className="text-xs sm:text-sm text-cyan-300 animate-pulse">Upload en cours…</span>
                        )}

                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs sm:text-sm text-slate-400 font-semibold">Fichiers uploadés :</p>
                            <div className="space-y-1">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-emerald-400">✓</span>
                                    <span className="text-xs sm:text-sm text-slate-200 truncate">{file.name}</span>
                                  </div>
                                  <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Étape 2 : Lancer l'automatisation */}
                    <div className="space-y-3 p-4 sm:p-6 bg-slate-950/40 rounded-xl border border-slate-800/50">
                      <h3 className="font-semibold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400 font-bold">2</span>
                        Lancer l&apos;automatisation
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span> va créer un nouveau repo GitHub, générer README, .gitignore, LICENSE et CHANGELOG puis pousser
                        les commits.
                      </p>
                      <div className="flex flex-col gap-4">
                        <Button
                          size="lg"
                          className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 text-sm sm:text-base px-6 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all font-semibold"
                          onClick={launch}
                          disabled={processing || uploading}
                          data-testid="launch-workflow-button"
                        >
                          {processing ? "⚙️ Traitement en cours…" : `🚀 ${t("launch")}`}
                        </Button>
                        {progress > 0 && (
                          <div className="flex flex-col gap-2">
                            <Progress value={progress} className="h-2" />
                            {progress === 100 ? (
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                <span className="text-xs sm:text-sm text-emerald-400 font-semibold">
                                  ✅ Terminé ! Tu peux ouvrir le repo GitHub.
                                </span>
                                {selected?.github_repo_url && (
                                  <a
                                    href={selected.github_repo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs sm:text-sm font-semibold shadow-lg transition-all"
                                  >
                                    <span>🚀 Ouvrir le repo</span>
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs sm:text-sm text-slate-400">
                                ⏳ Analyse et génération en cours…
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm flex flex-col shadow-xl text-sm hover:border-slate-700 transition-colors" data-testid="jobs-history-card">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4 sm:pb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-slate-950" />
                  </div>
                  <CardTitle className="text-base sm:text-xl font-bold">Historique des jobs</CardTitle>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30">
                  <span className="text-xs sm:text-sm font-semibold text-violet-300">{jobs.length} total</span>
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
                            <span className="text-xs text-slate-300">
                              {job.project_name || job.project_id}
                            </span>
                            {job.created_at && (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(job.created_at).toLocaleString()}
                              </span>
                            )}
                            {job.error && (
                              <span
                                className="text-[11px] text-red-300 flex items-center gap-1"
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
        </div>

        {/* Aide & Support déplacé dans le menu utilisateur pour le dashboard */}
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
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span>
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
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span>
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
              PLANS &amp; TARIFS
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Payez uniquement pour ce que vous utilisez
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Système de crédits flexible. <strong className="text-cyan-300">2 crédits = 1 upload</strong> avec génération IA complète (README, .gitignore, LICENSE, CHANGELOG) + push vers vos plateformes Git préférées.
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
              <h2 className="text-2xl font-bold">Ou choisissez un abonnement mensuel</h2>
              <p className="text-sm text-slate-400">Uploads illimités chaque mois</p>
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
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span>
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
    <Routes>
      <Route
        path="/"
        element={
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
