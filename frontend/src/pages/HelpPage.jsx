import { DownloadCloud, Mail, ArrowLeft } from "lucide-react";

export function HelpPage() {
  const faqs = [
    {
      category: "Démarrage",
      questions: [
        {
          q: "Comment commencer avec GitPusher™.AI ?",
          a: "1. Connectez-vous avec votre compte Google, GitHub, GitLab ou Bitbucket. 2. Liez votre compte Git provider (GitHub recommandé). 3. Uploadez vos fichiers (ZIP, PDF, code). 4. GitPusher génère automatiquement README, .gitignore, LICENSE et pousse sur Git !"
        },
        {
          q: "Quels types de fichiers puis-je uploader ?",
          a: "ZIP, PDF, dossiers de code, fichiers individuels. GitPusher™.AI s'occupe de tout organiser et générer la structure de projet complète avec documentation."
        },
        {
          q: "Ai-je besoin d'installer quelque chose ?",
          a: "Non ! GitPusher™.AI est 100% no-code et fonctionne directement dans votre navigateur. Aucune CLI, aucun Git local requis."
        }
      ]
    },
    {
      category: "Crédits & Plans",
      questions: [
        {
          q: "Comment fonctionnent les crédits ?",
          a: "1 crédit = 1 automatisation complète (génération README + .gitignore + LICENSE + push Git). Les nouveaux utilisateurs reçoivent 5 crédits gratuits à l'inscription."
        },
        {
          q: "Quels sont les différents plans ?",
          a: "• Free/Freemium : 5 crédits gratuits à l'inscription\n• Pack Starter : 10 crédits (essai)\n• Pack Pro : 50 crédits (populaire)\n• Pack Premium : 100 crédits\n• Business : Crédits illimités inclus dans l'abonnement"
        },
        {
          q: "Que se passe-t-il si un job échoue ?",
          a: "Bonne nouvelle ! Les crédits ne sont débités QUE si le job réussit. Si votre push échoue pour une raison technique, vos crédits sont préservés."
        },
        {
          q: "Comment recharger mes crédits ?",
          a: "Cliquez sur 'Acheter des crédits' dans votre dashboard, choisissez un pack (Starter, Pro ou Premium), et procédez au paiement sécurisé via Stripe."
        }
      ]
    },
    {
      category: "Utilisation",
      questions: [
        {
          q: "Comment créer un nouveau dépôt ?",
          a: "Dans votre Dashboard : 1. Cliquez sur 'Nouveau projet'. 2. Uploadez vos fichiers via drag & drop. 3. Choisissez le provider Git (GitHub, GitLab, etc.). 4. Nommez votre repo. 5. Validez ! GitPusher s'occupe du reste."
        },
        {
          q: "Puis-je personnaliser les fichiers générés ?",
          a: "Les fichiers README, .gitignore et LICENSE sont générés automatiquement par IA en fonction de votre projet. Vous pouvez les modifier après sur votre dépôt Git."
        },
        {
          q: "Quels providers Git sont supportés ?",
          a: "GitHub, GitLab, Bitbucket, Gitea, Codeberg, et plus encore. 12 providers Git au total !"
        },
        {
          q: "Comment archiver ou supprimer un projet ?",
          a: "Dans les détails du projet, utilisez les boutons 'Archiver' (violet) ou 'Supprimer' (rouge). L'archivage est réversible, la suppression est définitive."
        }
      ]
    },
    {
      category: "Sécurité & Confidentialité",
      questions: [
        {
          q: "GitPusher™.AI conserve-t-il mes projets et fichiers ?",
          a: "NON. GitPusher™.AI ne conserve PAS vos fichiers uploadés. Votre code et vos fichiers sont traités temporairement pour générer la structure du projet, puis immédiatement supprimés après le push Git réussi. Seules les métadonnées du projet (nom, provider, statut) sont conservées."
        },
        {
          q: "Mes données sont-elles sécurisées ?",
          a: "OUI. Toutes les communications sont chiffrées (HTTPS/TLS). Les tokens OAuth sont stockés de manière sécurisée et jamais exposés. Les fichiers uploadés sont supprimés automatiquement après traitement. Nous ne vendons ni ne partageons vos données avec des tiers."
        },
        {
          q: "Qui a accès à mes dépôts Git ?",
          a: "VOUS UNIQUEMENT. GitPusher™.AI utilise VOS tokens OAuth pour créer des dépôts sur VOTRE compte Git. Nous n'avons aucun accès permanent à vos dépôts. Vous pouvez révoquer l'accès à tout moment depuis les paramètres de votre provider Git."
        },
        {
          q: "Que se passe-t-il avec mes fichiers sensibles ?",
          a: "Vos fichiers sont traités uniquement pour l'analyse de structure et la génération de documentation. Ils transitent de manière sécurisée et sont supprimés immédiatement après le push. Pour des données hautement sensibles, nous recommandons de les exclure avant upload."
        },
        {
          q: "Puis-je supprimer mes données ?",
          a: "OUI. Vous pouvez supprimer vos projets à tout moment depuis le dashboard. Pour une suppression complète de votre compte et données associées, contactez support@gitpusher.ai."
        }
      ]
    },
    {
      category: "Support par Plan",
      questions: [
        {
          q: "Quel support pour le plan Free/Freemium ?",
          a: "• Support par email sous 48-72h\n• Accès à la documentation complète\n• FAQ en ligne\n• 5 crédits gratuits"
        },
        {
          q: "Quel support pour les packs Starter/Pro/Premium ?",
          a: "• Support par email prioritaire sous 24-48h\n• Accès à toutes les fonctionnalités\n• Documentation complète et guides\n• Assistance technique pour problèmes d'intégration"
        },
        {
          q: "Quel support pour le plan Business ?",
          a: "• Support premium par email sous 12-24h\n• Crédits illimités\n• Assistance technique prioritaire\n• Conseils personnalisés pour workflows entreprise\n• Support pour intégrations personnalisées"
        }
      ]
    }
  ];

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
              <span className="text-[10px] text-slate-400">Centre d'aide</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.9)] hover:shadow-[0_0_32px_rgba(34,211,238,1)] transition-all overflow-hidden"
            aria-label="Retour"
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(244,244,245,0.45),transparent_60%)] opacity-70 group-hover:opacity-100 transition-opacity" />
            <ArrowLeft className="relative z-10 h-4 w-4 drop-shadow-[0_0_8px_rgba(15,23,42,0.9)]" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-8">
          <section className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-300 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
              Besoin d'aide ?
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Centre d'aide <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">GitPusher™.AI</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Questions fréquentes et support technique
            </p>
          </section>

          {faqs.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-cyan-400 flex items-center gap-2">
                <span className="h-1 w-8 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full" />
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.questions.map((faq, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-colors"
                  >
                    <h3 className="text-sm sm:text-base font-semibold text-slate-100 mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 whitespace-pre-line leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section className="mt-12 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 via-slate-900/60 to-violet-500/10 border-2 border-dashed border-cyan-400/40 shadow-[0_0_24px_rgba(34,211,238,0.3)]">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_24px_rgba(34,211,238,0.6)]">
                <Mail className="h-8 w-8 text-slate-950" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
                  Besoin d'aide supplémentaire ?
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Notre équipe est là pour vous aider
                </p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-700/50">
                  <p className="text-cyan-400 font-semibold mb-2">📧 Contact Email</p>
                  <a
                    href="mailto:support@gitpusher.ai"
                    className="text-slate-300 hover:text-cyan-400 transition-colors underline"
                  >
                    support@gitpusher.ai
                  </a>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                    <p className="text-emerald-400 font-semibold mb-1">Free/Freemium</p>
                    <p className="text-slate-400">Réponse sous 48-72h</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                    <p className="text-violet-400 font-semibold mb-1">Starter/Pro/Premium</p>
                    <p className="text-slate-400">Réponse sous 24-48h</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-amber-400/20">
                    <p className="text-amber-400 font-semibold mb-1">Business</p>
                    <p className="text-slate-400">Réponse sous 12-24h</p>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
                  <p className="text-xs text-blue-300">
                    💡 <strong>Conseil</strong> : Incluez votre email d'inscription, le nom du projet concerné et une description détaillée du problème pour une résolution plus rapide.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center space-y-3">
            <h3 className="text-sm font-semibold text-slate-400">Liens utiles</h3>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <a href="/pricing" className="px-4 py-2 rounded-full border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
                Plans & Tarifs
              </a>
              <a href="/terms" className="px-4 py-2 rounded-full border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
                CGU
              </a>
              <a href="/dashboard" className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-semibold shadow-[0_0_18px_rgba(34,211,238,0.6)] hover:shadow-[0_0_24px_rgba(34,211,238,0.9)] transition-all">
                Retour au Dashboard
              </a>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>Git<span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-semibold">Pusher</span>.AI © 2024</p>
        <p className="mt-2">Support technique disponible 7j/7</p>
      </footer>
    </div>
  );
}
