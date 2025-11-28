# GitPusher API V1 - Documentation Complète

## 🚀 Architecture Simplifiée

L'API V1 de GitPusher offre une architecture moderne et modulaire avec support multi-provider.

---

## 📡 Endpoints Principaux

### 1. Upload Simplifié (All-in-One) ⚡

**Le plus rapide - Tout en un seul appel !**

```bash
POST /api/v1/upload
```

**Description :** Upload un fichier et push vers la plateforme Git choisie en une seule requête.

**Request:**
```bash
curl -X POST {BASE_URL}/api/v1/upload \
  -H "Authorization: Bearer {TOKEN}" \
  -F "provider=github" \
  -F "repoName=my-awesome-project" \
  -F "file=@myproject.zip"
```

**Providers supportés :**
- `github` ✅ (Active)
- `gitlab` ✅ (Active)
- `bitbucket` ✅ (Active)
- `gitea` ✅ (Active)
- `codeberg` ✅ (Active)
- `gitee` ✅ (Active)
- `azure` 🟡 (Limited)
- `aws` 🟡 (Limited)
- `gcp` 🟡 (Limited)
- `aliyun` 🟡 (Limited)
- `tencent` 🟡 (Limited)
- `sourceforge` 🟡 (Limited)

**Response:**
```json
{
  "jobId": "abc123...",
  "status": "success",
  "repoUrl": "https://github.com/username/my-awesome-project",
  "message": "Repository created and files pushed successfully!"
}
```

**Ce que fait cet endpoint automatiquement :**
1. ✅ Upload et extraction du fichier (ZIP supporté)
2. ✅ Consommation de 1 crédit
3. ✅ Génération IA de README.md
4. ✅ Génération de .gitignore adapté
5. ✅ Génération de LICENSE (MIT)
6. ✅ Génération de CHANGELOG.md
7. ✅ Création du repository sur le provider choisi
8. ✅ Push de tous les fichiers (originaux + générés)
9. ✅ Logs détaillés de chaque étape

---

### 2. Statut du Job

```bash
GET /api/v1/jobs/{jobId}
```

**Description :** Récupère le statut et les logs détaillés d'un job.

**Response:**
```json
{
  "jobId": "abc123...",
  "status": "success",
  "logs": [
    "Job created",
    "Processing upload...",
    "File received: project.zip (12345 bytes)",
    "Extracted 5 files",
    "Generating README with AI...",
    "Repository created: https://github.com/user/repo",
    "✅ Complete!"
  ],
  "repoUrl": "https://github.com/username/my-awesome-project",
  "errors": []
}
```

**Status possibles :**
- `pending` - En attente
- `running` - En cours d'exécution
- `success` - Terminé avec succès
- `failed` - Échec (voir logs pour détails)

---

### 3. Liste des Repositories

```bash
GET /api/v1/repos/by-provider?provider=github
```

**Description :** Liste tous les repos créés via GitPusher, optionnellement filtré par provider.

**Response:**
```json
{
  "repos": [
    {
      "id": "repo-id-1",
      "name": "my-project",
      "url": "https://github.com/user/my-project",
      "provider": "github",
      "private": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "provider": "github"
}
```

---

### 4. Liste des Providers

```bash
GET /api/v1/providers
```

**Description :** Liste tous les providers Git supportés.

**Response:**
```json
{
  "providers": [
    {"name": "github", "label": "GitHub", "status": "active"},
    {"name": "gitlab", "label": "GitLab", "status": "active"},
    {"name": "bitbucket", "label": "Bitbucket", "status": "active"},
    ...
  ]
}
```

---

## 💳 Système de Crédits

### Obtenir le solde

```bash
GET /api/v1/billing/credits
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "credits": 42,
  "currency": "EUR"
}
```

### Acheter des crédits

```bash
POST /api/v1/billing/purchase
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "packId": "pack_50"
}
```

**Packs disponibles :**
- `pack_10` - 10 crédits / 5€
- `pack_50` - 50 crédits / 20€
- `pack_100` - 100 crédits / 35€

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

### Historique des transactions

```bash
GET /api/v1/billing/history
Authorization: Bearer {TOKEN}
```

---

## 🔄 Autopush

### Obtenir les paramètres

```bash
GET /api/v1/autopush/settings
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "enabled": true,
  "frequency": "every_upload",
  "autoCommitMessage": true,
  "autoReadme": true,
  "autoChangelog": true
}
```

### Configurer l'autopush

```bash
POST /api/v1/autopush/settings
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "enabled": true,
  "frequency": "hourly",
  "autoCommitMessage": true,
  "autoReadme": true,
  "autoChangelog": true
}
```

**Fréquences disponibles :**
- `every_upload` - À chaque upload
- `hourly` - Toutes les heures
- `daily` - Une fois par jour

---

## 🤝 Partner API

### Créer un repo pour un utilisateur

```bash
POST /api/v1/partner/v1/repos/create
x-api-key: {PARTNER_API_KEY}
Content-Type: application/json

{
  "partnerApiKey": "pk_...",
  "userIdentifier": "user@example.com",
  "s3ArtifactUrl": "https://s3.../file.zip",
  "repoName": "partner-repo",
  "visibility": "public"
}
```

---

## 🔔 Webhooks

### Job Completed

```bash
POST /api/v1/webhooks/job.completed
Content-Type: application/json

{
  "jobId": "abc123",
  "status": "success",
  "repoUrl": "https://github.com/user/repo",
  "summary": {}
}
```

---

## 🎯 Workflow Complet - Exemple

### Scénario : Upload et Push vers GitHub

```bash
# 1. Obtenir un token (via OAuth ou connexion)
TOKEN="eyJhbGc..."

# 2. Vérifier les crédits
curl -H "Authorization: Bearer $TOKEN" \
  {BASE_URL}/api/v1/billing/credits

# 3. Upload et push en une commande !
curl -X POST {BASE_URL}/api/v1/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "provider=github" \
  -F "repoName=my-awesome-app" \
  -F "file=@myapp.zip"

# Réponse immédiate avec jobId et repoUrl

# 4. (Optionnel) Suivre les logs en temps réel
curl -H "Authorization: Bearer $TOKEN" \
  {BASE_URL}/api/v1/jobs/{jobId}
```

---

## 📊 Architecture Backend

```
/app/backend/
├── server.py              # Point d'entrée principal
├── models/
│   └── schemas.py         # Schémas Pydantic V1
├── services/
│   ├── credits_service.py # Gestion crédits
│   ├── storage_service.py # Upload & extraction
│   └── git_service.py     # Multi-provider Git
└── providers/
    ├── base_provider.py   # Interface abstraite
    ├── github.py          # GitHub API
    ├── gitlab.py          # GitLab API
    ├── bitbucket.py       # Bitbucket API
    ├── gitea.py           # Gitea API
    ├── codeberg.py        # Codeberg API
    ├── gitee.py           # Gitee (CN)
    ├── azure.py           # Azure DevOps
    ├── aws.py             # AWS CodeCommit
    ├── gcp.py             # Google Cloud
    ├── aliyun.py          # Alibaba Cloud
    ├── tencent.py         # Tencent Cloud
    ├── sourceforge.py     # SourceForge
    └── provider_factory.py # Factory pattern
```

---

## 🔐 Authentification

### Méthode 1 : GitHub OAuth (Recommandé)
1. Cliquez sur "Continue with GitHub"
2. Autorisez l'application
3. JWT token retourné automatiquement

### Méthode 2 : Personal Access Token

```bash
POST /api/v1/auth/github
Content-Type: application/json

{
  "githubToken": "ghp_xxxxx..."
}
```

---

## 💡 Avantages de l'API V1

✨ **All-in-One** - Un seul endpoint pour tout faire  
🌍 **Multi-Provider** - 12 plateformes Git supportées  
🤖 **IA Intégrée** - Génération automatique de fichiers pro  
💳 **Pay-per-Use** - Système de crédits flexible  
🔄 **Autopush** - Automatisation configurable  
🤝 **Partner-Ready** - API pour intégrations tierces  
📊 **Logs Détaillés** - Suivi complet de chaque opération  

---

## 📖 Documentation Interactive

- **Swagger UI:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc
- **OpenAPI Spec:** http://localhost:8001/openapi.json

---

## 🎓 Cas d'Usage

### Use Case 1: Developer Solo
```bash
# Upload code → GitHub en 1 commande
curl -X POST /api/v1/upload \
  -F "provider=github" \
  -F "repoName=my-app" \
  -F "file=@code.zip"
```

### Use Case 2: Multi-Platform Publishing
```bash
# Même code sur GitHub, GitLab et Bitbucket
for provider in github gitlab bitbucket; do
  curl -X POST /api/v1/upload \
    -F "provider=$provider" \
    -F "repoName=my-app" \
    -F "file=@code.zip"
done
```

### Use Case 3: SaaS Integration (Partner)
```bash
# Créer repo pour vos utilisateurs
curl -X POST /api/v1/partner/v1/repos/create \
  -H "x-api-key: pk_partner_xxx" \
  -d '{
    "userIdentifier": "user@example.com",
    "s3ArtifactUrl": "https://...",
    "repoName": "generated-app"
  }'
```

---

## 🛡️ Rate Limits & Quotas

**Plan Free:**
- 10 crédits gratuits à l'inscription
- 1 crédit = 1 upload/push

**Plan Premium:**
- 100 crédits/mois
- Support prioritaire

**Plan Business:**
- Crédits illimités
- API Partner
- SLA 99.9%

---

## 🔧 Configuration Requise

### Variables d'environnement (.env)

```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database

# Auth
JWT_SECRET=your-secret-key
EMERGENT_LLM_KEY=sk-emergent-xxx

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23liJwKIdDCi58Wyu1
GITHUB_CLIENT_SECRET=xxx
GITHUB_REDIRECT_URI=https://your-domain/api/auth/oauth/github/callback

# Frontend
FRONTEND_URL=http://localhost:3000

# Billing (for production)
STRIPE_SECRET_KEY=sk_test_xxx (optionnel pour MVP)
```

---

## 🎉 Prêt à Utiliser !

Votre API V1 est maintenant complète avec :
- ✅ 20+ endpoints
- ✅ 12 Git providers
- ✅ Génération IA automatique
- ✅ Système de crédits
- ✅ Autopush
- ✅ Partner API
- ✅ Webhooks

**Documentation interactive :** http://localhost:8001/docs
