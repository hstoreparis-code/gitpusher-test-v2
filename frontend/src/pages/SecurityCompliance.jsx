export const metadata = {
  title: "Security & Compliance — GitPusher.ai",
  description:
    "Learn how GitPusher.ai protects your code, sessions, and Git provider tokens. Enterprise-grade security: 2FA, secure sessions, CSP, rate limiting, encryption, monitoring and AI-based QA.",
  robots: "index, follow",
};

export default function SecurityCompliancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <p className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-400/40 shadow-[0_0_18px_rgba(16,185,129,0.35)]">
            Security &amp; Compliance
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(45,212,191,0.8)]">
            Security &amp; Compliance at GitPusher.ai
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl">
            GitPusher.ai is built with a security-first architecture. We protect your repositories,
            credentials and assets with modern, industry-grade security practices. Below is an overview
            of the safeguards used across the platform.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/30 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
            <p className="text-xs font-semibold text-emerald-300 mb-2">Enterprise-grade posture</p>
            <p className="text-sm text-slate-200">
              GitPusher.ai treats every project as production-critical. Authentication, encryption,
              observability and incident response are designed to match modern SaaS expectations.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(56,189,248,0.35)]">
            <p className="text-xs font-semibold text-cyan-300 mb-2">Quick overview</p>
            <ul className="text-sm text-slate-200 space-y-1 list-disc list-inside">
              <li>Secure sessions (HttpOnly, SameSite, optional Secure)</li>
              <li>Optional TOTP 2FA for admins</li>
              <li>Strict rate limiting and IP allow-list for admin</li>
              <li>Security headers + CSP hardened by default</li>
            </ul>
          </div>
        </section>

      <h2 className="mt-10 mb-3 text-lg font-semibold text-slate-100">1. Secure Authentication</h2>
      <ul className="space-y-1 text-sm text-slate-300 list-disc list-inside">
        <li><strong>Secure session cookies (HttpOnly, Secure, SameSite)</strong></li>
        <li><strong>Optional 2FA (TOTP)</strong> for admin and sensitive operations</li>
        <li>Session expiration + automatic rotation</li>
        <li>Brute-force protection via login lockout</li>
      </ul>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-slate-100">2. Git Provider Token Protection</h2>
      <p className="text-sm text-slate-300">
        GitHub / GitLab / Bitbucket tokens are never exposed to the browser. Tokens are masked in
        logs, validated, and stored with short TTL when possible.
      </p>

      <h2>3. Rate Limiting &amp; Abuse Prevention</h2>
      <ul>
        <li>Global rate-limit engine with Redis integration</li>
        <li>
          Per-IP and per-route limits for: <code>/push</code>, <code>/auth</code>, <code>/admin</code>
        </li>
        <li>Automatic lockout after repeated failed attempts</li>
      </ul>

      <h2>4. CSP &amp; Security Headers</h2>
      <p>We enforce strict HTTP security headers:</p>
      <ul>
        <li><code>Content-Security-Policy</code></li>
        <li><code>X-Content-Type-Options: nosniff</code></li>
        <li><code>X-Frame-Options: DENY</code></li>
        <li><code>Referrer-Policy</code></li>
        <li><code>X-XSS-Protection</code></li>
      </ul>

      <h2>5. Upload Safety</h2>
      <ul>
        <li>Strict file extension allow-list</li>
        <li>Max upload size enforcement</li>
        <li>ZIP traversal protection</li>
        <li>Automatic sanitization and validation</li>
      </ul>

      <h2>6. AI-Driven Quality &amp; Security Monitoring</h2>
      <ul>
        <li>Daily QA cron with email alert</li>
        <li>AI-based log analysis (Anomaly detection + risk score)</li>
        <li>Autofix engine for backend integrity issues</li>
        <li>Security events dashboard (admin)</li>
      </ul>

      <h2>7. Compliance &amp; Privacy</h2>
      <ul>
        <li>GDPR-aligned data handling</li>
        <li>Removal of data upon user request</li>
        <li>Minimal retention policy for logs</li>
        <li>No storage of user code beyond the push operation</li>
      </ul>

      <h2>8. Infrastructure</h2>
      <ul>
        <li>HTTPS enforced everywhere</li>
        <li>Optional IP allow-listing for administration</li>
        <li>Containerized backend with minimal attack surface</li>
      </ul>

      <h2>Contact</h2>
      <p>
        For compliance questions or security disclosures, email:
        <br />
        <strong>security@gitpusher.ai</strong>
      </p>

      <h2>Commitment</h2>
      <p>
        GitPusher.ai aims to provide a safe, reliable and transparent environment for code
        automation. We continuously upgrade our security posture as new threats emerge.
      </p>
    </main>
  );
}
