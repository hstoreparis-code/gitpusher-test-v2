import asyncio
from datetime import datetime, timezone

from backend.server import db


PAGES = [
    {
        "slug": "seo/push-automatically",
        "page_type": "seo",
        "title": "Comment pousser du code sur GitHub automatiquement — GitPusher.ai",
        "description": "Poussez votre code sur GitHub automatiquement, sans Git CLI, grâce à GitPusher.ai. Uploadez votre projet, GitPusher crée le dépôt, le README, le .gitignore et le premier commit.",
        "body": """# La façon la plus simple de pousser du code sur GitHub (sans Git CLI)

Pousser du code sur GitHub n'a pas besoin d'être compliqué. Vous pouvez maintenant créer et pousser un dépôt en quelques secondes — automatiquement.

## Le problème avec Git

Git demande des lignes de commande, de la configuration, des tokens d’accès et peut vite devenir intimidant pour les débutants ou les nocoders.

## La solution

GitPusher.ai vous permet de pousser du code automatiquement — sans installer Git. Il suffit d’uploader votre projet, de sélectionner GitHub puis de cliquer sur "Push".

## Comment fonctionne GitPusher (étape par étape)

1. Uploadez votre projet (zip, dossier ou code)
2. GitPusher structure vos fichiers
3. Crée le dépôt GitHub
4. Génère le README, le .gitignore et le premier commit
5. Pousse automatiquement vers GitHub

## FAQ

- **Dois‑je avoir Git installé ?** Non.
- **Ai‑je besoin de clés SSH ?** Non.
- **Puis‑je pousser du code généré par IA ?** Oui.
- **Est‑ce sécurisé ?** Oui.
- **Puis‑je utiliser des dépôts privés ?** Oui.
- **Est‑ce adapté aux débutants ?** Totalement.
- **Supporte‑t‑il plusieurs providers Git ?** Oui.
- **À quelle vitesse le push est‑il effectué ?** En quelques secondes.
- **GitPusher remplace‑t‑il GitHub Desktop ?** Pour les premiers pushes, oui.
- **Puis‑je l’utiliser sur mobile ?** Oui.

## Essayez GitPusher

Commencez à pousser du code automatiquement avec GitPusher.ai.
""",
    },
    {
        "slug": "seo/deploy-ai-code",
        "page_type": "seo",
        "title": "Comment déployer du code généré par IA — GitPusher.ai",
        "description": "Déployez en toute sécurité du code généré par IA sur GitHub avec GitPusher.ai. Transformez une sortie brute en dépôt structuré avec README, .gitignore et historique propre.",
        "body": """# Comment déployer du code généré par IA sur GitHub en toute sécurité

Les outils d’IA peuvent écrire beaucoup de code, mais transformer ce code en dépôt propre et structuré est une autre histoire. GitPusher.ai convertit une sortie IA brute en projet GitHub exploitable.

## Le problème des "dumps" de code IA

La plupart des IA fournissent des fichiers épars, des copier‑coller ou des archives sans structure, sans README ni .gitignore. Pousser cela directement sur GitHub produit des dépôts désorganisés, difficiles à maintenir.

## L’approche GitPusher.ai

Au lieu de configurer Git à la main ou de nettoyer vos dossiers, vous uploadez votre code généré par IA sur GitPusher.ai. La plateforme organise le tout et pousse un dépôt propre sur votre compte GitHub.

## De la sortie IA au dépôt prêt pour la production

1. Générez votre code avec n’importe quelle IA (ChatGPT, Claude, Gemini, etc.).
2. Exportez ou téléchargez les fichiers, ou copiez‑les dans un dossier projet.
3. Uploadez le projet sur GitPusher.ai.
4. GitPusher analyse et structure le dépôt.
5. Il génère un README et un .gitignore adaptés à votre stack.
6. Un premier commit propre est créé.
7. Le dépôt est poussé sur votre compte GitHub.

## Bonnes pratiques pour le code généré par IA

- Relisez le code avant de le déployer, surtout tout ce qui touche aux secrets ou à la facturation.
- Utilisez des fichiers `.env` pour les variables d’environnement au lieu de coder en dur vos clés.
- Utilisez des dépôts privés pour vos expérimentations ou prototypes.
- Gardez un historique de commits clair en laissant GitPusher gérer le premier push.

## FAQ

- **Quelles IA sont supportées ?** Toute IA capable d’exporter du code ou des fichiers.
- **Puis‑je l’utiliser pour des projets en production ?** Oui, à condition de tester et de relire le code.
- **GitPusher modifie‑t‑il mon code IA ?** Il structure le projet et ajoute des fichiers de dépôt, mais la logique métier reste la vôtre.
- **Ai‑je besoin d’un compte GitHub ?** Oui, GitPusher pousse directement sur vos dépôts.
- **Puis‑je choisir le nom du dépôt ?** Oui, vous le définissez durant le processus de push.
- **Est‑ce adapté aux nocoders ?** Oui, l’interface est pensée pour eux.
- **Gère‑t‑il les monorepos simples ?** Oui, les structures simples sont supportées.
- **Et pour le code privé ?** Vous pouvez pousser vers des dépôts privés.
- **Dois‑je installer quelque chose ?** Non, tout se fait dans le navigateur.
- **Combien de temps dure un déploiement ?** En général moins d’une minute, selon la taille du projet.

## Déployez votre code généré par IA

Utilisez GitPusher.ai pour transformer une sortie IA en dépôt GitHub propre et exploitable.
""",
    },
    {
        "slug": "seo/push-without-git",
        "page_type": "seo",
        "title": "Pousser du code sur GitHub sans Git — GitPusher.ai",
        "description": "Poussez du code sur GitHub sans installer Git ni utiliser le terminal. GitPusher.ai vous permet d’uploader votre projet et de pousser en quelques clics.",
        "body": """# Pousser du code sur GitHub sans installer Git

Beaucoup d’équipes et de créateurs veulent utiliser GitHub sans gérer les commandes Git, la configuration des tokens ou les clés SSH. GitPusher.ai supprime cette friction.

## Pourquoi les gens évitent Git

La ligne de commande Git est puissante mais intimidante. Il faut apprendre des commandes, gérer des branches, configurer des remotes et résoudre des conflits de fusion.

## Une alternative sans Git

Avec GitPusher.ai, vous ne touchez jamais à la CLI Git. Vous uploadez vos fichiers, vous vous connectez à votre provider Git, et GitPusher gère le push en coulisses.

## Pour qui est‑ce fait ?

- Nocoders qui construisent des projets avec des builders web ou de l’IA.
- Équipes produit qui veulent archiver du code dans GitHub simplement.
- Agences qui livrent des projets à des clients.
- Enseignants qui souhaitent que les étudiants rendent leurs travaux via GitHub.

## Comment ça se passe en pratique

1. Préparez votre dossier de projet.
2. Uploadez‑le sur GitPusher.ai.
3. Choisissez votre provider Git (GitHub, GitLab, Bitbucket, etc.).
4. Confirmez le nom du dépôt et sa visibilité.
5. GitPusher pousse le premier commit pour vous.

## FAQ

- **Vais‑je voir des commandes Git ?** Non, tout est abstrait.
- **Les développeurs peuvent‑ils ensuite utiliser Git normalement ?** Oui, ils peuvent cloner le dépôt et travailler en Git classique.
- **Est‑ce adapté aux prototypes ?** C’est idéal, surtout pour les expérimentations rapides.
- **Est‑ce que je garde la propriété du dépôt ?** Oui, le dépôt vit sur votre compte Git.
- **Supporte‑t‑il les organisations ?** Oui, vous pouvez viser des repos d’organisation si vos droits le permettent.
- **Quels types de fichiers sont supportés ?** Tous les fichiers habituels de projet.
- **Puis‑je l’utiliser depuis un Chromebook ?** Oui, tout se passe dans le navigateur.
- **Y a‑t‑il une offre gratuite ?** Voir la page tarifs pour les offres en cours.
- **Est‑ce que cela marche pour les designers ?** Oui, vous pouvez pousser des exports de maquettes ou des sites statiques.
- **Puis‑je pousser plusieurs fois ?** Vous pouvez créer autant de nouveaux dépôts que nécessaire.

## Poussez sans Git dès aujourd’hui

Utilisez GitPusher.ai pour envoyer vos projets sur GitHub sans installer ni apprendre Git.
""",
    },
    {
        "slug": "seo/ai-to-git-automation",
        "page_type": "seo",
        "title": "Automatisation IA vers Git — GitPusher.ai",
        "description": "Automatisez le passage du code généré par IA vers des dépôts Git. GitPusher.ai relie les sorties IA à GitHub et autres providers avec un minimum de friction.",
        "body": """# De l’IA vers Git : automatisez la création de dépôts

Les assistants IA peuvent désormais générer des applications complètes, mais les amener dans Git de façon propre et répétable reste très manuel. GitPusher.ai crée un pont automatisé entre vos outils IA et vos providers Git.

## Pourquoi le flux IA → Git est souvent pénible

Vous copiez du code depuis des chats, téléchargez des archives, les décompressez, ouvrez un terminal, lancez des commandes Git, corrigez des erreurs puis poussez. Répéter ces étapes pour chaque expérimentation IA est lent et source d’erreurs.

## Automatiser le pipeline

Avec GitPusher.ai, vous considérez l’IA comme une source de code et Git comme la destination. La plateforme gère la couche intermédiaire ennuyeuse : structure des fichiers, scaffolding du dépôt et premier push.

## Exemples de workflows IA‑vers‑Git

- Générer une application prototype avec un assistant IA, puis la pousser en dépôt privé.
- Centraliser plusieurs expérimentations IA dans des dépôts séparés pour les comparer.
- Partager des projets construits par IA avec l’équipe via GitHub.
- Utiliser GitPusher comme étape finale d’un pipeline IA automatisé.

## FAQ

- **GitPusher s’intègre‑t‑il directement avec les outils IA ?** Vous pouvez uploader des fichiers issus de n’importe quelle IA ; des intégrations via l’API de push sont possibles.
- **Quels providers Git sont supportés ?** GitHub, GitLab, Bitbucket et d’autres selon votre configuration.
- **Puis‑je tout automatiser de bout en bout ?** Oui, en combinant vos outils IA avec l’endpoint de push GitPusher.
- **Est‑ce adapté aux solo founders ?** Oui, c’est parfait pour les solos et petites équipes.
- **Et pour les équipes entreprise ?** C’est possible avec les bons contrôles d’accès et de sécurité.
- **Ai‑je besoin de compétences DevOps ?** Non, GitPusher masque la complexité Git et infra.
- **Peut‑on l’utiliser pour enseigner le code généré par IA ?** Oui, les étudiants peuvent transformer des sorties IA en dépôts Git très facilement.
- **Y a‑t‑il une API ?** Oui, GitPusher expose un endpoint public de push pour les intégrations.
- **Y a‑t‑il un coût supplémentaire pour l’automatisation ?** Voir la page tarifs pour les fonctionnalités liées.
- **Les pushes sont‑ils journalisés ?** Oui, les jobs et pushes sont tracés dans la plateforme.

## Automatisez votre flux IA‑vers‑Git

Utilisez GitPusher.ai pour relier vos projets générés par IA à Git avec un minimum de friction.
""",
    },
    {
        "slug": "seo/create-repo-automatically",
        "page_type": "seo",
        "title": "La meilleure façon de créer un dépôt automatiquement — GitPusher.ai",
        "description": "Créez automatiquement des dépôts Git à partir de vos projets. GitPusher.ai structure les fichiers, ajoute README et .gitignore, et pousse le premier commit pour vous.",
        "body": """# Créez des dépôts Git automatiquement à partir de n’importe quel projet

Que votre projet vienne d’une IA, d’un outil nocode ou d’un dossier local, GitPusher.ai peut le transformer en dépôt Git propre en quelques clics.

## La création manuelle de dépôt est lente

Créer un nouveau dépôt signifie généralement ouvrir GitHub, nommer le repo, le cloner, copier les fichiers, commit puis push. Répéter cela casse le focus et fait perdre du temps.

## Création de dépôt automatisée

GitPusher.ai supprime ces étapes répétitives. Vous partez de vos fichiers de projet, et la plateforme se charge de créer et de remplir automatiquement le dépôt.

## Cas d’usage idéaux

- Fondateurs qui lancent de nombreux petits prototypes.
- Agences qui gèrent les livrables de plusieurs clients.
- Enseignants qui générent des dépôts de démarrage pour leurs étudiants.
- Équipes qui archivent des outils ou scripts internes.

## FAQ

- **Puis‑je contrôler le nom du dépôt ?** Oui, vous choisissez le nom de chaque dépôt.
- **GitPusher ajoute‑t‑il un README ?** Oui, un README de base est généré selon votre projet.
- **Un .gitignore est‑il inclus ?** Oui, avec les patterns courants automatiquement ajoutés.
- **Où est hébergé le dépôt ?** Sur votre compte chez votre provider Git (GitHub, etc.).
- **Puis‑je créer des dépôts privés ?** Oui, la confidentialité est configurable dépôt par dépôt.
- **Est‑ce utile pour les hackathons ?** Oui, les équipes peuvent créer des repos très vite pour chaque idée.
- **Gère‑t‑il plusieurs pushes ?** L’outil se concentre sur la création initiale et le premier commit.
- **Ai‑je besoin de la ligne de commande ?** Non, tout se fait via l’interface web.
- **Puis‑je supprimer les dépôts ensuite ?** Oui, comme d’habitude depuis votre provider Git.
- **Y a‑t‑il du lock‑in ?** Non, ce sont des dépôts Git standards.

## Créez votre prochain dépôt automatiquement

Utilisez GitPusher.ai pour transformer vos projets en dépôts sans travail Git manuel.
""",
    },
]


async def main():
    now = datetime.now(timezone.utc).isoformat()
    for page in PAGES:
        existing = await db.pages.find_one({"slug": page["slug"]})
        doc = {
            "id": existing.get("id") if existing else page["slug"],
            "slug": page["slug"],
            "page_type": page["page_type"],
            "title": page["title"],
            "description": page["description"],
            "body": page["body"],
            "created_at": existing.get("created_at") if existing else now,
            "updated_at": now,
        }
        await db.pages.update_one({"slug": page["slug"]}, {"$set": doc}, upsert=True)


if __name__ == "__main__":
    asyncio.run(main())
