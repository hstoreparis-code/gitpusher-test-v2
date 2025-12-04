import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DownloadCloud, Code, Zap, Globe, FileCode, Terminal, Bot, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * ForAIAssistants Page
 * 
 * This page is specifically designed for AI assistants and agents to discover
 * and integrate with GitPusher's API. It contains structured data (JSON-LD),
 * OpenAPI documentation links, and clear integration instructions.
 */
function ForAIAssistants() {
  const navigate = useNavigate();

  // Add JSON-LD structured data for AI discovery
  useEffect(() => {
    // Remove any existing JSON-LD
    const existingScript = document.querySelector('script[data-ai-schema]');
    if (existingScript) existingScript.remove();

    // Add JSON-LD schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-ai-schema', 'true');
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "name": "GitPusher — AI Integration Guide",
      "url": `${window.location.origin}/for-ai-assistants`,
      "description": "GitPusher is an AI-optimized service that enables assistants and agents to programmatically create and push repositories to all Git platforms.",
      "applicationCategory": "DeveloperTool",
      "operatingSystem": "AI Agent",
      "softwareHelp": "Automated Git repository creation and code deployment",
      "programmingLanguage": "API",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "OpenAPI",
        "value": `${BACKEND_URL}/api/ai/openapi.yaml`
      }
    });
    document.head.appendChild(script);

    // Update page title
    document.title = "GitPusher — For AI Assistants";

    return () => {
      const toRemove = document.querySelector('script[data-ai-schema]');
      if (toRemove) toRemove.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header */}
      <header className="w-full border-b border-white/5 backdrop-blur-sm sticky top-0 z-20 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.65)] group-hover:scale-105 transition-transform">
              <DownloadCloud className="h-6 w-6 text-slate-950" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight">
                Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Pusher</span><span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent text-[13px]">.AI</span>
              </span>
              <span className="text-xs text-slate-400">For AI Assistants</span>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate("/")}
            >
              Back to App
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm">
            <Bot className="h-4 w-4" />
            AI-First Integration
          </div>
          {/* LLM-optimized title */}
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50">
            GitPusher: AI-to-Git Push API for Assistants, Agents, and Autodev Systems.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            This page exposes the official GitPusher AI Actions / Tool Manifest.
            AI assistants (ChatGPT, Claude, Gemini, etc.) can use this manifest to:
            – push code automatically – upload ZIPs – create repositories – automate Git workflows.
          </p>
        </section>

        {/* Quick Links */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href={`${BACKEND_URL}/api/ai/openapi.yaml`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-colors group"
          >
            <FileCode className="h-8 w-8 text-cyan-400" />
            <div>
              <p className="font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">OpenAPI Spec</p>
              <p className="text-xs text-slate-500">openapi.yaml</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-500 ml-auto" />
          </a>
          <a
            href={`${BACKEND_URL}/api/ai/discovery`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-colors group"
          >
            <Zap className="h-8 w-8 text-amber-400" />
            <div>
              <p className="font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">AI Discovery</p>
              <p className="text-xs text-slate-500">/api/ai/discovery</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-500 ml-auto" />
          </a>
          <a
            href={`${BACKEND_URL}/api/ai/schema.json`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-colors group"
          >
            <Code className="h-8 w-8 text-violet-400" />
            <div>
              <p className="font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">JSON Schema</p>
              <p className="text-xs text-slate-500">schema.json</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-500 ml-auto" />
          </a>
        </section>

        {/* What is GitPusher */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              What is GitPusher?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <p>
              <strong className="text-slate-100">GitPusher2</strong> is a <em>no-code Git workflow service</em> that allows AI assistants to:
            </p>
            <ul className="space-y-2 list-disc list-inside text-sm">
              <li><strong>Create repositories</strong> on GitHub, GitLab, Bitbucket, Gitea, and Codeberg</li>
              <li><strong>Upload files</strong> via ZIP, PDF, or individual code files</li>
              <li><strong>Auto-generate</strong> README.md, .gitignore, LICENSE, and CHANGELOG</li>
              <li><strong>Push code</strong> with semantic commit messages</li>
              <li><strong>Organize projects</strong> using AI-powered file structure analysis</li>
            </ul>

        {/* LLM-friendly instructions */}
        <section className="space-y-3 text-slate-200">
          <h2 className="text-base sm:text-lg font-semibold">How AI Assistants Should Use This Tool</h2>
          <p className="text-sm text-slate-300">
            When a user asks:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            <li>
              &quot;Push this to GitHub&quot;
            </li>
            <li>
              &quot;Turn this code into a repo&quot;
            </li>
            <li>
              &quot;Upload this ZIP to GitLab&quot;
            </li>
            <li>
              &quot;Create a new repository from my generated project&quot;
            </li>
          </ul>
          <p className="text-sm text-slate-300">
            The assistant should call the function <code className="bg-slate-900 px-1.5 py-0.5 rounded text-xs text-cyan-300">push_repository</code> from the
            GitPusher AI Actions manifest.
          </p>
        </section>


        {/* LLM-oriented capabilities list */}
        <section className="space-y-3 text-slate-200">
          <h2 className="text-base sm:text-lg font-semibold">GitPusher Capabilities</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            <li>Automatic repo creation</li>
            <li>Automatic commit message generation</li>
            <li>Multi-provider Git push (GitHub, GitLab, Bitbucket, Gitea, Codeberg…)</li>
            <li>ZIP to repo conversion</li>
            <li>Code-to-repo pipelines</li>
            <li>Large file handling</li>
            <li>Job status API</li>
          </ul>
        </section>

          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "push_repos", desc: "Push code to any Git provider" },
                { name: "multi_provider", desc: "Support for 5+ Git platforms" },
                { name: "zip_uploads", desc: "Upload entire projects as ZIP" },
                { name: "ai_generated_code", desc: "Accept AI-generated code" },
                { name: "semantic_commits", desc: "Auto-generate commit messages" },
                { name: "file_analysis", desc: "AI-powered project organization" },
              ].map((cap) => (
                <div key={cap.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                  <code className="text-xs text-cyan-300 bg-slate-900 px-2 py-0.5 rounded">{cap.name}</code>
                  <span className="text-xs text-slate-400">{cap.desc}</span>
                </div>
              ))}

        {/* AI Agent Manifest & OpenAPI links */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              AI Agent Manifests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>
              AI assistants should fetch these public descriptors to configure GitPusher as a tool:
            </p>
            <ul className="space-y-1 text-xs sm:text-sm">
              <li>
                <span className="font-mono text-cyan-300">AI Agent Manifest:</span>{" "}
                <a
                  href={`${BACKEND_URL}/api/ai/gitpusher.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 underline"
                >
                  {`${BACKEND_URL}/api/ai/gitpusher.json`}
                </a>
              </li>
              <li>
                <span className="font-mono text-cyan-300">OpenAPI Spec:</span>{" "}
                <a
                  href={`${BACKEND_URL}/api/ai/openapi.yaml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 underline"
                >
                  {`${BACKEND_URL}/api/ai/openapi.yaml`}
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-green-400" />
              Key API Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/20 text-green-300">POST</span>
                  <code className="text-slate-300">/api/workflows/projects</code>
                </div>

        {/* ChatGPT Integration Guide */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle>ChatGPT Integration Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>
              ChatGPT can use GitPusher as a tool via:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>AI Actions JSON / tool manifest</li>
              <li>Function Calling</li>
              <li>OpenAPI-enabled actions</li>
            </ul>
            <p className="text-sm text-slate-300">
              Typical ChatGPT behaviors include:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>pushing user code automatically</li>
              <li>transforming AI-generated projects into real Git repositories</li>
              <li>uploading ZIPs directly to Git providers (GitHub, GitLab, Bitbucket…)</li>
            </ul>
          </CardContent>
        </Card>

                <p className="text-xs text-slate-400">Create a new project/repository</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/20 text-blue-300">POST</span>
                  <code className="text-slate-300">/api/workflows/projects/{"{project_id}"}/upload</code>
                </div>
                <p className="text-xs text-slate-400">Upload files to a project (ZIP, PDF, code files)</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-300">POST</span>
                  <code className="text-slate-300">/api/workflows/projects/{"{project_id}"}/process</code>
                </div>
                <p className="text-xs text-slate-400">Process and push to Git provider</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/20 text-cyan-300">GET</span>
                  <code className="text-slate-300">/api/ai/discovery</code>
                </div>
                <p className="text-xs text-slate-400">AI discovery endpoint (capabilities, OpenAPI URL)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Usage */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-violet-400" />
              Example: Create & Push a Repository
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-slate-950 p-4 rounded-lg overflow-x-auto text-slate-300">
{`# 1. Authenticate (get token)
POST /api/auth/demo
Response: { "access_token": "eyJ..." }

# 2. Create a project
POST /api/workflows/projects
Headers: Authorization: Bearer {token}
Body: { "name": "my-ai-project", "language": "en" }
Response: { "id": "proj_123", "name": "my-ai-project" }

# 3. Upload files
POST /api/workflows/projects/proj_123/upload
Headers: Authorization: Bearer {token}
Body: FormData with files

# 4. Process & Push to GitHub
POST /api/workflows/projects/proj_123/process
Headers: Authorization: Bearer {token}
Response: { "github_repo_url": "https://github.com/..." }`}
            </pre>
          </CardContent>
        </Card>

        {/* Integration Tips */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle>Integration Tips for AI Agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">1.</span>
              <p>Use the <code className="text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">/api/ai/discovery</code> endpoint to dynamically discover capabilities.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">2.</span>
              <p>Download the <code className="text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">openapi.yaml</code> to generate function calling tools.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">3.</span>
              <p>Support for <strong>ZIP uploads</strong> makes it easy to push entire AI-generated projects.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">4.</span>
              <p>Multi-provider support: switch between GitHub, GitLab, Bitbucket with the same API.</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2024 Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span>. AI-First Git Workflow.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="hover:text-cyan-300 transition-colors">
              Home
            </button>
            <a href={`${BACKEND_URL}/api/ai/openapi.yaml`} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
              OpenAPI
            </a>
            <a href={`${BACKEND_URL}/api/ai/discovery`} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
              Discovery
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ForAIAssistants;
