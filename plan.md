# Plan MVP – Plateforme No-Code Push GitHub (FR/EN, OAuth, IA)

## 1. Objectifs MVP

- Permettre à un utilisateur non-tech de :
  - Créer un compte / se connecter via : email + mot de passe, Google OAuth, GitHub OAuth.
  - Se connecter aussi via GitHub (pour récupérer les droits repo) sans manipuler Git en local.
  - Uploader des fichiers (zip, PDF, code, autres docs).
  - Laisser l’IA :
    - Détecter les types de fichiers.
    - Organiser automatiquement la structure (src, docs, assets,…).
    - Générer un README.md pertinent.
    - Générer des messages de commit logiques.
  - Créer automatiquement un repo GitHub et pousser les fichiers + README.
  - Voir le lien du repo et éventuellement re-télécharger un zip final.

- UX :
  - Interface bilingue FR/EN.
  - Toggle Dark/Light moderne type dashboard, adapté mobile.
  - Flow très simple et guidé (stepper).

## 2. Architecture technique

- Backend : FastAPI existant dans `server.py` (port 8001, préfixe /api) + MongoDB (déjà branché via MONGO_URL, DB_NAME).
- Frontend : React 19 + React Router + Tailwind + shadcn UI, backend appelé via `process.env.REACT_APP_BACKEND_URL` (déjà configuré).
- Authentification :
  - Email/password + JWT (tokens signés côté backend, stockés en http-only cookies ou localStorage pour MVP).
  - OAuth Google & GitHub (option A choisie : récupération permissions via OAuth, pas de token PAT manuel pour MVP).
- IA :
  - Intégration LLM via Emergent LLM key + OpenAI GPT (pour : README, messages de commit, analyse / organisation fichiers).
- GitHub API :
  - Utilisation du token OAuth GitHub pour :
    - Créer un repo.
    - Créer branches, pousser commits.

## 3. Backend – Design détaillé

### 3.1. Modules / Découpage

On garde `server.py` comme entrypoint mais on ajoute des routers structurés :

- `server.py`
  - Crée l’app FastAPI + CORS (déjà présent).
  - Initialise Mongo (déjà présent) + collections logiques.
  - Monte des sous-routers :
    - `/api/auth` : auth & profils utilisateurs.
    - `/api/workflows` : upload fichiers + orchestration IA + push GitHub.
    - `/api/github` : endpoints utilitaires GitHub (optionnel, peut être inclus dans workflows).

Nouveaux fichiers (dans /backend) pour simplifier mais en gardant un seul module si besoin :
- Pour MVP sur cette plateforme, on peut coder tout dans `server.py` + quelques helpers pour rester simple.

### 3.2. Modèle de données (MongoDB)

Collections principales :

- `users` :
  - `_id` (ObjectId)
  - `email` (unique)
  - `password_hash` (nullable si social-only)
  - `provider_google_id` (nullable)
  - `provider_github_id` (nullable)
  - `github_access_token` (chiffré de préférence, pour MVP stocké brut mais clairement marqué comme à sécuriser)
  - `display_name`
  - `created_at`, `updated_at`

- `projects` (un workflow par repo créé) :
  - `_id`
  - `user_id`
  - `name` (nom du repo)
  - `status` (pending, processing, done, error)
  - `github_repo_url`
  - `github_repo_name`
  - `commit_messages` (liste)
  - `readme_md` (texte généré)
  - `file_summary` (résumé IA)
  - `created_at`, `updated_at`

- `uploads` (optionnel pour historiser les fichiers) :
  - `_id`
  - `project_id`
  - `original_filename`
  - `stored_path` (chemin local pour MVP)
  - `mime_type`
  - `size_bytes`

### 3.3. Auth backend

Endpoints (tous sous `/api/auth`) :

- `POST /auth/register` – email/password
  - Body : { email, password, display_name }
  - Crée user, hash bcrypt, renvoie user sans mdp.

- `POST /auth/login` – email/password
  - Body : { email, password }
  - Vérifie mdp, génère JWT (access_token, éventuellement refresh_token) avec `sub=user_id`.
  - Retourne JSON + (MVP) peut aussi mettre access_token en cookie httpOnly.

- `GET /auth/me` – profil courant
  - En-tête Authorization: Bearer <token>.

- `GET /auth/oauth/google/url`
  - Retourne l’URL Google OAuth construite.

- `GET /auth/oauth/google/callback?code=...`
  - Backend échange code contre token Google.
  - Récupère info profil (email, name).
  - Lie ou crée l’utilisateur.
  - Crée JWT et renvoie à frontend (par JSON pour MVP).

- `GET /auth/oauth/github/url`
  - Retourne URL GitHub OAuth pour créer repo.

- `GET /auth/oauth/github/callback?code=...`
  - Échange code contre access_token GitHub (scope repo).
  - Sauvegarde `github_access_token` pour l’utilisateur.
  - Retourne succès.

### 3.4. Workflow backend (fichiers + IA + GitHub)

Endpoints sous `/api/workflows` :

- `POST /workflows/projects` – créer un workflow / projet
  - Auth requis.
  - Body : { repo_name (optionnel), description (optionnel), language ("fr"|"en") }.
  - Crée un `project` en status `pending`.

- `POST /workflows/projects/{project_id}/upload` – upload fichiers
  - Auth requis, `multipart/form-data` avec un ou plusieurs fichiers.
  - Stocke fichiers **localement** (ex: `/app/backend/uploads/{user_id}/{project_id}/...`).
  - Enregistre les métadonnées dans `uploads`.

- `POST /workflows/projects/{project_id}/process` – lancer l’orchestration IA + GitHub
  - Vérifie que l’utilisateur a un `github_access_token`.
  - Étapes internes :
    1. Analyse des fichiers (types, structure) – IA :
       - Lit quelques exemples de contenu (texte, noms de fichiers).
       - Prompt IA pour :
         - Proposer une arborescence cible (`src`, `docs`, `assets`, ...).
         - Résumer le projet.
    2. Génération `README.md` – IA.
    3. Génération d’une liste de commits logiques (titres + description) – IA.
    4. Création repo GitHub via API :
       - `POST /user/repos` avec `github_access_token`.
       - Nom = paramètre ou nom généré IA.
    5. Création des fichiers et push :
       - Pour MVP :
         - Créer un repo local temporaire avec `git` CLI est compliqué dans cet env → on simule via GitHub Contents API :
           - `PUT /repos/{owner}/{repo}/contents/{path}` pour chaque fichier + README, avec `message` (commit message IA).
  - Met à jour `projects.status`, `github_repo_url`, `readme_md`, `commit_messages`.

- `GET /workflows/projects` – liste des projets de l’utilisateur.
- `GET /workflows/projects/{project_id}` – détail, inclut `github_repo_url`, status, etc.

### 3.5. IA integration backend

- Créer un helper IA simple dans `server.py` ou module dédié :
  - Utilise Emergent LLM key (OpenAI GPT modèle récent) pour 3 tâches :
    1. `summarize_files_for_readme(files_metadata, samples)`
    2. `generate_readme(project_summary, language)`
    3. `generate_commit_messages(file_operations)`

- Appels HTTP sortants vers l’API Emergent (fourni par integration_playbook) avec `EMERGENT_LLM_KEY`.
- Prompts bilingues (FR/EN) selon choix utilisateur.

### 3.6. GitHub API integration backend

- Basé sur `requests` ou `httpx` :
  - `create_repo(token, name)` → retourne `{html_url, full_name}`.
  - `create_or_update_file(token, full_name, path, content_base64, message)`.

- Gestion d’erreurs :
  - Token invalide → 401 renvoyé proprement à l’utilisateur.
  - Taille trop grosse → message clair.

## 4. Frontend – Design & UX

### 4.1. Navigation & routes

- `/` : Landing page marketing légère expliquant le concept (FR/EN toggle).
- `/auth` :
  - Tabs Login / Signup.
  - Boutons :
    - "Continue with Google".
    - "Continue with GitHub".
    - Email/password.
- `/dashboard` (protégé) :
  - Liste des projets (cards) + CTA "Nouveau workflow".
- `/projects/:id` :
  - Stepper 1–3 :
    1. Upload fichiers.
    2. Configuration (nom repo, langue, description).
    3. Lancement et suivi (spinner + timeline des étapes, lien repo).

### 4.2. UI components (shadcn + Tailwind)

- Utiliser `button`, `card`, `tabs`, `switch`, `input`, `textarea`, `progress`, `alert`, `dialog`, `accordion` pour :
  - Stepper vertical avec animation.
  - Liste des projets dans des cards responsive.
  - Thème Dark/Light avec `next-themes` ou un simple contexte maison basé sur `className` `dark` sur `html`.

### 4.3. Bilingue + thème

- Simple système de traduction MVP :
  - Un objet `translations = { fr: {...}, en: {...} }` et un contexte `I18nContext` avec langue et `t(key)`.
- Toggle FR/EN dans le header.
- Toggle Dark/Light via un `Switch` shadcn, qui ajoute/enlève la classe `dark` sur `document.documentElement`.

### 4.4. Intégration auth côté frontend

- Stocker le JWT (MVP) dans `localStorage` + le passer dans Authorization Bearer.
- Hook `useAuth` + contexte Auth :
  - `user`, `token`, `login`, `logout`.
- Composant `ProtectedRoute` pour `dashboard` et `projects/*`.

### 4.5. Flow complet utilisateur côté UI

1. Arrive sur `/` → call-to-action "Get started" → `/auth`.
2. Se connecte via Google / GitHub / email.
3. Arrive sur `/dashboard` avec message "Créer ton premier workflow".
4. Clique "New workflow" :
   - Étape 1 : Upload par drag & drop (zone large, support mobile, liste des fichiers).
   - Étape 2 : Formulaire repo name + langue du README + description optionnelle.
   - Étape 3 : Bouton "Launch automation" → appelle `/process`.
   - Affiche timeline : "Analyse IA", "Création README", "Création repo GitHub", "Upload fichiers", puis lien.

## 5. Tests & Qualité

- Backend :
  - Tests unitaires basiques sur `/auth/register`, `/auth/login`, `/workflows/projects`.
  - Appels manuels avec `curl` pour vérifier OAuth/GitHub si possible.

- Frontend :
  - Vérifier build via `yarn build`.
  - Lint vite via ESLint avant d’appeler le testing agent.

## 6. Étapes d’implémentation

1. Backend :
   - Ajouter auth email/password + modèle `users`.
   - Ajouter endpoints projets + uploads (stockage local).
   - Intégrer IA via Emergent (README + commits) – première version simple.
   - Intégrer GitHub OAuth + création repo + push via Contents API.

2. Frontend :
   - Remplacer l’écran Home actuel par landing + router complet.
   - Implémenter AuthContext + écrans Login/Signup.
   - Implémenter Dashboard + page projet + stepper.
   - Bilingue + dark/light toggle.

3. Tests :
   - Lint backend & frontend.
   - Utiliser le testing agent pour un tour E2E (auth + création workflow basique).

4. Itérations :
   - Améliorer design, animations, et gestion d’erreurs en fonction de tes retours.
