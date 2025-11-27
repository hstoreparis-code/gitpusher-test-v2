# Guide de Configuration OAuth - GitPusher

Ce guide vous explique comment configurer l'authentification OAuth pour Google et GitHub dans votre application GitPusher.

## 📋 Prérequis

Vous devrez ajouter les variables d'environnement suivantes dans `/app/backend/.env` :

```env
# Google OAuth
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_secret_client_google
GOOGLE_REDIRECT_URI={VOTRE_URL_BACKEND}/api/auth/oauth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=votre_client_id_github
GITHUB_CLIENT_SECRET=votre_secret_client_github
GITHUB_REDIRECT_URI={VOTRE_URL_BACKEND}/api/auth/oauth/github/callback

# Frontend URL (pour les redirections OAuth)
FRONTEND_URL=http://localhost:3000
```

## 🔵 Configuration Google OAuth

### Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur **"Select a project"** puis **"New Project"**
3. Donnez un nom à votre projet (ex: "GitPusher")
4. Cliquez sur **"Create"**

### Étape 2 : Configurer l'écran de consentement OAuth

1. Dans le menu latéral, allez dans **"APIs & Services" > "OAuth consent screen"**
2. Choisissez **"External"** (pour tester avec n'importe quel compte Google)
3. Cliquez sur **"Create"**
4. Remplissez les informations requises :
   - **App name** : GitPusher
   - **User support email** : Votre email
   - **Developer contact information** : Votre email
5. Cliquez sur **"Save and Continue"**
6. Dans **"Scopes"**, ajoutez les scopes suivants :
   - `openid`
   - `email`
   - `profile`
7. Cliquez sur **"Save and Continue"** jusqu'à la fin

### Étape 3 : Créer les identifiants OAuth

1. Allez dans **"APIs & Services" > "Credentials"**
2. Cliquez sur **"+ CREATE CREDENTIALS"** puis **"OAuth client ID"**
3. Choisissez **"Web application"**
4. Configurez :
   - **Name** : GitPusher Web Client
   - **Authorized JavaScript origins** :
     - `http://localhost:3000` (pour dev)
     - Votre URL de production si applicable
   - **Authorized redirect URIs** :
     - `http://localhost:8001/api/auth/oauth/google/callback` (pour dev)
     - `{VOTRE_URL_PRODUCTION}/api/auth/oauth/google/callback`
5. Cliquez sur **"Create"**
6. **IMPORTANT** : Copiez le **Client ID** et le **Client Secret** qui s'affichent

### Étape 4 : Ajouter à .env

Ajoutez ces valeurs dans `/app/backend/.env` :

```env
GOOGLE_CLIENT_ID=votre_client_id_ici.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_secret_ici
GOOGLE_REDIRECT_URI=http://localhost:8001/api/auth/oauth/google/callback
```

---

## 🐙 Configuration GitHub OAuth

### Étape 1 : Créer une OAuth App sur GitHub

1. Allez sur [GitHub](https://github.com) et connectez-vous
2. Cliquez sur votre photo de profil > **"Settings"**
3. Dans le menu latéral, scrollez jusqu'à **"Developer settings"**
4. Cliquez sur **"OAuth Apps"** puis **"New OAuth App"**

### Étape 2 : Configurer l'application

Remplissez le formulaire :

- **Application name** : GitPusher
- **Homepage URL** : `http://localhost:3000` (pour dev)
- **Application description** : (optionnel) "No-Code Git Workflow Application"
- **Authorization callback URL** : 
  - Pour dev : `http://localhost:8001/api/auth/oauth/github/callback`
  - Pour prod : `{VOTRE_URL_PRODUCTION}/api/auth/oauth/github/callback`

### Étape 3 : Obtenir les identifiants

1. Cliquez sur **"Register application"**
2. Sur la page qui s'affiche, vous verrez votre **Client ID**
3. Cliquez sur **"Generate a new client secret"**
4. **IMPORTANT** : Copiez immédiatement le **Client Secret** (il ne sera plus affiché après)

### Étape 4 : Ajouter à .env

Ajoutez ces valeurs dans `/app/backend/.env` :

```env
GITHUB_CLIENT_ID=votre_client_id_github
GITHUB_CLIENT_SECRET=votre_secret_github
GITHUB_REDIRECT_URI=http://localhost:8001/api/auth/oauth/github/callback
```

---

## 🔄 Redémarrer l'application

Après avoir ajouté toutes les variables d'environnement, redémarrez le backend :

```bash
sudo supervisorctl restart backend
```

---

## ✅ Tester l'authentification OAuth

1. Allez sur `http://localhost:3000`
2. Cliquez sur **"Login / Sign up"**
3. Cliquez sur **"Continue with Google"** ou **"Continue with GitHub"**
4. Vous serez redirigé vers la page d'autorisation du provider
5. Après autorisation, vous serez redirigé vers `/auth/callback` puis automatiquement vers `/app`

---

## 🎯 Configuration pour la Production

Pour la production, n'oubliez pas de :

1. **Mettre à jour les URLs autorisées** dans Google Cloud Console et GitHub OAuth settings
2. **Utiliser HTTPS** pour toutes les URLs de redirection
3. **Remplacer `FRONTEND_URL`** dans `.env` avec votre URL de production
4. **Ne JAMAIS commiter** vos secrets dans Git (ajoutez `.env` à `.gitignore`)

### Exemple de configuration production :

```env
GOOGLE_REDIRECT_URI=https://votre-domaine.com/api/auth/oauth/google/callback
GITHUB_REDIRECT_URI=https://votre-domaine.com/api/auth/oauth/github/callback
FRONTEND_URL=https://votre-domaine.com
```

---

## ❓ Dépannage

### Erreur "OAuth not configured"
- Vérifiez que les variables `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc. sont bien définies dans `/app/backend/.env`
- Redémarrez le backend après avoir ajouté les variables

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URL de redirection dans `.env` correspond exactement à celle configurée dans Google Cloud Console ou GitHub

### Erreur "invalid_client"
- Vérifiez que le Client ID et le Client Secret sont corrects
- Assurez-vous qu'il n'y a pas d'espaces ou de caractères cachés dans les valeurs

---

## 📚 Ressources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
