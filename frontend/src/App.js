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
import { DownloadCloud } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ---- Small i18n helper ----
const translations = {
  en: {
    heroTitle: "No-Code GitHub Workflow",
    heroSubtitle:
      "Upload your files, let AI organize your project, generate README and push to GitHub.",
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
    dashboardTitle: "Your AI-powered repos",
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
    linkRepo: "Open GitHub repo",
    theme: "Dark mode",
    language: "Français",
  },
  fr: {
    heroTitle: "Workflow GitHub No-Code",
    heroSubtitle:
      "Dépose tes fichiers, l’IA organise ton projet, génère le README et pousse sur GitHub.",
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
    dashboardTitle: "Tes dépôts pilotés par l’IA",
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

function useI18n() {
  const [lang, setLang] = useState("en");
  const t = (key) => translations[lang][key] || key;
  return { lang, setLang, t };
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

function Landing({ t, onGetStarted, lang, setLang, dark, setDark }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.55)] transition-colors">
              <DownloadCloud className="h-4 w-4 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">PUSH IN</span>
              <span className="text-xs text-slate-400">No-Code GitHub workflow</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline">{t("theme")}</span>
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                data-testid="theme-toggle-switch"
              />
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "fr" : "en")}
              className="px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
              data-testid="language-toggle-button"
            >
              {t("language")}
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-2"
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
                <AuthCard t={t} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-[1.2fr,1fr] gap-10 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-3 py-1 rounded-full w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              AI Git Automation
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
              {t("heroTitle")}<span className="text-cyan-300">.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 shadow-lg shadow-cyan-500/30"
                onClick={onGetStarted}
                data-testid="get-started-button"
              >
                {t("getStarted")}
              </Button>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500" />
                <span>No Git, no CLI, just drag &amp; drop.</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <p className="font-medium mb-1">1. Upload</p>
                <p className="text-slate-300">Fichiers zip, PDF, code… en un geste.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <p className="font-medium mb-1">2. IA organise</p>
                <p className="text-slate-300">Structure, README, commits intelligents.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <p className="font-medium mb-1">3. Push GitHub</p>
                <p className="text-slate-300">Repo créé et prêt à être partagé.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <p className="font-medium mb-1">4. Analytics</p>
                <p className="text-slate-300">Suivi des repos créés (optionnel).</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function AuthCard({ t }) {
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
      navigate("/app");
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
      navigate("/app");
    } catch (err) {
      setError(err?.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const startOAuth = (provider) => {
    // For now we focus on email/password flow; social login will come in a next iteration
    setError("Social login (" + provider + ") sera disponible dans une prochaine version.");
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

function Dashboard({ t }) {
  const { token, user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/workflows/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false));
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
    } finally {
      setProcessing(false);
    }
  };

  if (!token) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{t("dashboardTitle")}</span>
            {user && (
              <span className="text-xs text-slate-400" data-testid="dashboard-user-email">
                {user.email}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="rounded-full border-slate-700 text-xs"
            data-testid="logout-button"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1.1fr,1.4fr] gap-6">
        <Card className="bg-slate-900/70 border-slate-800 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-sm sm:text-base">{t("dashboardTitle")}</CardTitle>
            <Button
              size="sm"
              className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs"
              onClick={newProject}
              disabled={creating}
              data-testid="new-workflow-button"
            >
              {creating ? "…" : t("newWorkflow")}
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-3">
            {loading ? (
              <p className="text-xs text-slate-400">Loading…</p>
            ) : projects.length === 0 ? (
              <p className="text-xs text-slate-400" data-testid="no-projects-text">
                {t("noProjects")}
              </p>
            ) : (
              <div className="space-y-2" data-testid="projects-list">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`w-full text-left text-xs sm:text-sm px-3 py-2 rounded-xl border transition-colors ${
                      selected?.id === p.id
                        ? "bg-cyan-500/10 border-cyan-400/60"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-600"
                    }`}
                    data-testid={`project-card-${p.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{p.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          p.status === "done"
                            ? "border-emerald-500/50 text-emerald-300"
                            : "border-amber-400/50 text-amber-200"
                        }`}
                        data-testid="project-status-pill"
                      >
                        {p.status}
                      </span>
                    </div>
                    {p.github_repo_url && (
                      <p className="text-[11px] text-cyan-300 truncate mt-1">
                        {p.github_repo_url}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                <div className="space-y-2">
                  <p className="font-medium text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    1. {t("stepUpload")}
                  </p>
                  <label
                    className="border border-dashed border-slate-700 rounded-2xl px-4 py-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/60 hover:border-cyan-400/80 hover:bg-slate-900/80 transition-colors"
                    data-testid="file-dropzone"
                  >
                    <span className="text-[11px] text-slate-300">Drop files or click to browse</span>
                    <Input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={onFilesSelected}
                      data-testid="file-input"
                    />
                    {uploading && (
                      <span className="text-[11px] text-cyan-300">Uploading…</span>
                    )}
                  </label>
                </div>

                <div className="space-y-3 mt-2">
                  <p className="font-medium text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    2. {t("stepConfigure")}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="repo-name" className="text-[11px]">
                        {t("projectName")}
                      </Label>
                      <Input
                        id="repo-name"
                        defaultValue={selected.name}
                        className="mt-1 h-8 text-xs bg-slate-950/60 border-slate-700"
                        disabled
                        data-testid="project-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="readme-lang" className="text-[11px]">
                        {t("projectLanguage")}
                      </Label>
                      <select
                        id="readme-lang"
                        className="mt-1 h-8 w-full rounded-md bg-slate-950/60 border border-slate-700 text-xs px-2"
                        defaultValue="en"
                        disabled
                        data-testid="readme-language-select"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-2">
                  <p className="font-medium text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    3. {t("stepLaunch")}
                  </p>
                  <Button
                    className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs px-5"
                    onClick={launch}
                    disabled={processing}
                    data-testid="launch-automation-button"
                  >
                    {processing ? "…" : t("launch")}
                  </Button>
                  {(processing || progress > 0) && (
                    <div className="space-y-1">
                      <Progress value={progress} className="h-1.5 bg-slate-800" data-testid="workflow-progress-bar" />
                      <p className="text-[11px] text-slate-400" data-testid="processing-status-text">
                        {processing ? t("processing") : selected.status}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function AppShell() {
  const { lang, setLang, t } = useI18n();
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
        element={<Landing t={t} lang={lang} setLang={setLang} dark={dark} setDark={setDark} onGetStarted={handleGetStarted} />}
      />
      <Route path="/app" element={<Dashboard t={t} />} />
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
