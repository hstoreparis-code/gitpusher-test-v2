# Test de l'endpoint /push pour AI Agents

## Prérequis

1. Utilisateur avec GitHub token connecté
2. Crédits disponibles
3. API key valide (JWT token de l'utilisateur)

## Test 1 : Push avec source base64

```bash
export BACKEND_URL="https://megadash-secure.preview.emergentagent.com"

# Login et récupération du token
USER_TOKEN=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Créer un fichier ZIP encodé en base64
# Exemple de contenu simple
echo "# Hello World\nprint('Hello from AI!')" > hello.py
zip -q test.zip hello.py
BASE64_CONTENT=$(base64 -w 0 test.zip)

# Appel de l'endpoint /push
curl -X POST "$BACKEND_URL/push" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $USER_TOKEN" \
  -d "{
    \"source\": \"base64\",
    \"content\": {
      \"data\": \"$BASE64_CONTENT\",
      \"filename\": \"test.zip\"
    },
    \"provider\": \"github\",
    \"repo_name\": \"ai-test-repo-$(date +%s)\"
  }" | python3 -m json.tool

# Cleanup
rm hello.py test.zip
```

## Test 2 : Push avec source URL

```bash
export BACKEND_URL="https://megadash-secure.preview.emergentagent.com"
export USER_TOKEN="your-jwt-token-here"

curl -X POST "$BACKEND_URL/push" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $USER_TOKEN" \
  -d '{
    "source": "url",
    "content": {
      "url": "https://github.com/example/repo/archive/main.zip"
    },
    "provider": "github",
    "repo_name": "ai-imported-repo"
  }' | python3 -m json.tool
```

## Test 3 : Vérifier OpenAPI

```bash
curl -s https://megadash-secure.preview.emergentagent.com/api/openapi.yaml | head -50
```

## Réponse attendue (succès)

```json
{
  "status": "success",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "repo_url": "https://github.com/username/repo-name",
  "repo_name": "repo-name",
  "provider": "github",
  "files_uploaded": 5,
  "next_actions": ["open_repo", "clone_repo", "share_repo"]
}
```

## Erreurs possibles

### 401 - API Key invalide
```json
{
  "detail": "Invalid API key"
}
```

### 400 - Token Git manquant
```json
{
  "detail": "Github token not linked. Connect via OAuth first."
}
```

### 402 - Crédits insuffisants
```json
{
  "detail": "Insufficient credits. Required: 1, Available: 0"
}
```

## Workflow complet

1. **Création du job** : JobManager crée le job, vérifie les crédits (pas de débit)
2. **Téléchargement/Décodage** : Récupération du contenu
3. **Extraction** : Extraction des fichiers du ZIP
4. **Génération AI** : README, .gitignore, LICENSE, CHANGELOG
5. **Création repo** : Création du repository sur le provider
6. **Upload fichiers** : Push de tous les fichiers
7. **Complétion** : Job marqué succès, **crédits débités**

## Avantages pour AI Agents

- ✅ API simple : 1 seul endpoint pour tout le workflow
- ✅ Support base64 et URL
- ✅ Génération automatique de fichiers
- ✅ Multi-provider (GitHub, GitLab, Bitbucket)
- ✅ Gestion robuste des crédits
- ✅ Logs détaillés pour le suivi
- ✅ Idempotence garantie

## Notes importantes

- **API Key** : Peut être fournie via header `X-API-Key` ou dans le body `api_key`
- **Crédits** : 1 crédit par push, débité uniquement si succès
- **Limite de taille** : Dépend du provider (généralement 100MB pour GitHub)
- **Timeout** : 60 secondes pour le téléchargement
