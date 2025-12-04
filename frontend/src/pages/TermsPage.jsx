import { DownloadCloud, ArrowLeft } from "lucide-react";

export function TermsPage() {
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
              <span className="text-[10px] text-slate-400">Terms &amp; Legal</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/80 bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-300 text-slate-950 shadow-[0_0_26px_rgba(56,189,248,0.95)] hover:shadow-[0_0_40px_rgba(56,189,248,1)] transition-all overflow-hidden"
            aria-label="Retour à l'accueil"
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(244,244,245,0.55),transparent_65%)] opacity-80 group-hover:opacity-100 transition-opacity" />
            <ArrowLeft className="relative z-10 h-4 w-4 text-cyan-50 drop-shadow-[0_0_10px_rgba(15,23,42,0.9)]" />
          </button>
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
              GitPusher™.AI est une plateforme qui permet d'automatiser la création de dépôts Git à partir de vos
              fichiers ou dossiers (par exemple un projet zip), en générant automatiquement une structure de projet,
              un README, un fichier .gitignore, une licence et d'autres fichiers utiles. Le service se connecte à vos
              comptes Git (GitHub, GitLab, Bitbucket, etc.) via OAuth afin de créer et de mettre à jour des dépôts en
              votre nom.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">2. Création de compte et connexions OAuth</h2>
            <p className="text-slate-300">
              L'accès à GitPusher™.AI se fait via des fournisseurs d'identité externes (GitHub, GitLab, Bitbucket,
              Gitea, Google, etc.). En vous connectant avec l'un de ces providers, vous autorisez GitPusher™.AI à
              recevoir certaines informations de votre profil (par exemple : identifiant, nom, email, avatar) et, dans
              le cas des providers Git, un jeton d'accès afin de créer et mettre à jour des dépôts pour votre compte.
            </p>
            <p className="text-slate-300">
              Vous restez à tout moment responsable de la sécurité de vos comptes Git et pouvez révoquer les accès de
              GitPusher™.AI directement depuis les paramètres de votre fournisseur (par exemple depuis
              developer settings sur GitHub).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">3. Données traitées</h2>
            <p className="text-slate-300">
              Dans le cadre de l'utilisation de GitPusher™.AI, les types de données suivants peuvent être traités :
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
              Lorsque vous connectez un provider Git (par exemple GitHub), GitPusher™.AI utilise le jeton d'accès
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
              GitPusher™.AI ne modifie pas vos dépôts existants sans action explicite de votre part et ne revendique
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
                GitPusher™.AI.
              </li>
            </ul>
            <p className="text-slate-300">
              GitPusher™.AI fournit un outil d'automatisation "en l'état" et ne peut garantir que le code généré, les
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
              La poursuite de l'utilisation de GitPusher™.AI après mise à jour vaut acceptation des nouvelles
              conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">9. Contact</h2>
            <p className="text-slate-300">
              Pour toute question concernant ces conditions générales d'utilisation ou le traitement de vos données,
              vous pouvez contacter l'administrateur de GitPusher™.AI via le chat de support intégré ou par le canal
              habituel mis à votre disposition.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
