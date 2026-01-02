---
description: Configure test-web targets from external config file
argument-hint: [path/to/config.json]
allowed-tools: Read, Write, AskUserQuestion, Glob
model: haiku
---

# /test-web:config - Configuration des tests web

Met à jour la configuration des tests web depuis un fichier externe.

> **INSTRUCTION CLAUDE:** Les blocs `AskUserQuestion({...})` sont des instructions pour utiliser le tool `AskUserQuestion` de maniere **interactive**. Tu DOIS executer le tool avec ces parametres pour obtenir la reponse de l'utilisateur AVANT de continuer.

## Usage

```
/test-web:config                     # Demande le fichier interactivement
/test-web:config path/to/config.json # Charge directement le fichier
```

## Workflow

### 1. Obtenir le fichier source

**Si argument fourni** : Utiliser le chemin donné

**Sinon** : Demander à l'utilisateur

```
AskUserQuestion:
  question: "Quel fichier de configuration voulez-vous charger ?"
  header: "Config file"
  options:
    - label: "Chercher dans le projet"
      description: "Glob pour trouver les fichiers *test-web*.json"
    - label: "Entrer le chemin"
      description: "Spécifier manuellement le chemin du fichier"
```

### 2. Valider le fichier

1. Vérifier que le fichier existe
2. Lire le contenu JSON
3. Valider la structure (targets, settings)

**Structure attendue** :

```json
{
  "targets": [
    {
      "name": "string (requis)",
      "url": "string (requis pour fetch)",
      "query": "string (requis pour search)",
      "type": "fetch|search (requis)",
      "expects": {
        "status": "number (optionnel)",
        "contains": ["strings"] "(optionnel)",
        "hasResults": "boolean (optionnel)"
      }
    }
  ],
  "chrome": {
    "enabled": "boolean",
    "targets": [...]
  },
  "settings": {
    "timeout": "number",
    "retries": "number",
    "reportPath": "string"
  }
}
```

### 3. Merger ou remplacer

```
AskUserQuestion:
  question: "Comment appliquer la nouvelle configuration ?"
  header: "Mode"
  options:
    - label: "Remplacer"
      description: "Remplace entièrement la config existante"
    - label: "Merger (ajouter)"
      description: "Ajoute les nouveaux targets à l'existant"
```

### 4. Appliquer

1. Lire [.claude/test-web/config.json](.claude/test-web/config.json) existant
2. Appliquer le mode choisi (remplacer ou merger)
3. Écrire le résultat

### 5. Confirmer

```
CONFIG MISE À JOUR
────────────────────────────────
Source:  {chemin_fichier_source}
Mode:    {remplacer|merger}
Targets: {nombre_total}
────────────────────────────────

Tester maintenant:
/test-web --quick
```

## Exemples de fichiers source

### Minimal

```json
{
  "targets": [
    {
      "name": "Mon site",
      "url": "https://example.com",
      "type": "fetch",
      "expects": { "status": 200 }
    }
  ]
}
```

### Complet

```json
{
  "targets": [
    {
      "name": "API Health",
      "url": "https://api.example.com/health",
      "type": "fetch",
      "expects": {
        "status": 200,
        "contains": ["healthy", "ok"]
      }
    },
    {
      "name": "SEO Check",
      "query": "site:example.com",
      "type": "search",
      "expects": { "hasResults": true }
    }
  ],
  "settings": {
    "timeout": 60000,
    "retries": 3
  }
}
```

## Templates disponibles

Des templates de configuration sont disponibles dans :
[templates/test-web/](templates/test-web/)

---

User: $ARGUMENTS
