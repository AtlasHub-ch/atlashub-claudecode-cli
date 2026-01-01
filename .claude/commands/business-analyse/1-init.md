---
description: Phase 1 - Initialisation structure Business Analyse
---

# Business Analyse - Init

Expert BA senior. Initialise la structure d'analyse métier.

## Arguments

```
/business-analyse:init [app-name]
```

- `app-name` (optionnel) : Nom de l'application. Si absent, demander.

## Workflow

### Étape 1 : Collecte d'informations

Si `$ARGUMENTS` est vide, poser ces questions :

```
AskUserQuestion({
  questions: [
    {
      question: "Quel est le nom de l'application à analyser ?",
      header: "Application",
      options: [
        { label: "Nouvelle application", description: "Créer une nouvelle structure d'application" },
        { label: "Existante", description: "Analyser une application existante dans le projet" }
      ],
      multiSelect: false
    }
  ]
})
```

Si "Existante" → Scanner le projet pour détecter la stack technique.

### Étape 2 : Scan technique (si projet existant)

Utiliser l'agent explore pour scanner :

```
Task(subagent_type="Explore", model="haiku", prompt="
Scan le projet pour identifier:

ARCHITECTURE:
- Type de projet (solution .sln, package.json, etc.)
- Stack technique (frameworks, langages)
- Structure des dossiers principaux

DONNÉES (si applicable):
- ORM utilisé (EF Core, Prisma, etc.)
- Entités/Modèles existants (count par domaine)

API (si applicable):
- Type d'API (REST, GraphQL, etc.)
- Nombre d'endpoints estimé

UI (si applicable):
- Framework frontend
- Nombre de pages/composants estimé

Retourne un JSON compact avec ces informations.
")
```

### Étape 3 : Création de la structure

Créer la structure `.business-analyse/` :

```bash
mkdir -p .business-analyse/{applications,documentation/{data-dictionary,process-flows,architecture-decisions},templates}
```

### Étape 4 : Création config.json

```json
{
  "version": "2.0.0",
  "initialized": "<DATE_ISO>",
  "application": {
    "name": "<APP_NAME>",
    "description": "<DESCRIPTION>",
    "type": "<STACK_TYPE>",
    "status": "active"
  },
  "structure": {
    "naming": {
      "features": "FEAT-{NNN}-{slug}",
      "bugs": "BUG-{NNN}"
    },
    "paths": {
      "applications": ".business-analyse/applications",
      "documentation": ".business-analyse/documentation",
      "templates": ".business-analyse/templates"
    }
  },
  "settings": {
    "validationThreshold": 85,
    "ultrathinkPhases": ["discover", "analyse", "specify"],
    "diagramFormats": ["mermaid", "ascii"]
  },
  "technical": {
    "stack": "<DETECTED_STACK>",
    "frameworks": ["<FRAMEWORKS>"],
    "database": "<DB_TYPE_IF_DETECTED>"
  },
  "counters": {
    "features": 0,
    "bugs": 0
  }
}
```

### Étape 5 : Création du glossaire

Créer `.business-analyse/glossary.md` :

```markdown
# Glossaire Métier - {{APP_NAME}}

> Dictionnaire des termes métier utilisés dans l'application.
> Maintenu à jour lors de chaque phase d'analyse.

## Instructions d'utilisation

- Chaque terme doit avoir une définition claire et non ambiguë
- Indiquer le contexte d'utilisation si nécessaire
- Utiliser les termes définis ici dans tous les documents BA

---

## Termes Métier

| Terme | Définition | Contexte | Ajouté le |
|-------|------------|----------|-----------|
| *À compléter lors des analyses* | | | |

---

## Acronymes

| Acronyme | Signification | Définition |
|----------|---------------|------------|
| BA | Business Analyse | Processus d'analyse des besoins métier |
| BRD | Business Requirements Document | Document des exigences métier |
| FRD | Functional Requirements Document | Document des spécifications fonctionnelles |

---

*Dernière mise à jour : {{DATE}}*
```

### Étape 6 : Création du .claudeignore

Créer `.business-analyse/.claudeignore` :

```
# Business Analyse - Fichiers à exclure du contexte Claude
# Ces fichiers sont pour la documentation métier uniquement

# Exclure les phases de découverte et analyse (trop verbeux)
applications/**/1-discovery.md
applications/**/2-business-requirements.md

# Exclure la documentation transverse
documentation/**

# Exclure les templates (utilisés uniquement par les commandes BA)
templates/**

# Exclure le tracking des bugs résolus
applications/**/tracking/bugs/*_RESOLVED.md

# GARDER pour le contexte dev:
# - 3-functional-specification.md (specs techniques)
# - 4-development-handoff.md (prompt dev)
# - glossary.md (termes métier)
# - config.json (configuration)
```

### Étape 7 : Création structure application

Créer `.business-analyse/applications/<app-name>/` :

```bash
mkdir -p ".business-analyse/applications/<app-name>/modules"
```

Créer `context.md` :

```markdown
# Contexte Applicatif - {{APP_NAME}}

## Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **Nom** | {{APP_NAME}} |
| **Type** | {{STACK_TYPE}} |
| **Date création BA** | {{DATE}} |
| **Status** | Active |

## Description

{{DESCRIPTION}}

## Stack Technique

{{STACK_DETAILS}}

## Parties Prenantes

| Rôle | Responsabilité |
|------|----------------|
| Product Owner | Définition des priorités et validation métier |
| Business Analyst | Analyse et spécification des besoins |
| Tech Lead | Validation technique et architecture |
| Développeurs | Implémentation selon les specs |

## Modules

| Module | Description | Status |
|--------|-------------|--------|
| *À définir lors des analyses* | | |

---

*Initialisé le {{DATE}}*
```

### Étape 8 : Copie des templates

Copier les templates dans `.business-analyse/templates/` depuis les ressources.

### Résumé

```
BUSINESS ANALYSE - INITIALISÉ
═══════════════════════════════════════════════════════════
Application:    {{APP_NAME}}
Type:           {{STACK_TYPE}}
═══════════════════════════════════════════════════════════
Structure créée:
  ✓ .business-analyse/config.json
  ✓ .business-analyse/glossary.md
  ✓ .business-analyse/.claudeignore
  ✓ .business-analyse/applications/{{APP_NAME}}/
  ✓ .business-analyse/templates/
  ✓ .business-analyse/documentation/
═══════════════════════════════════════════════════════════
Prochain: /business-analyse:discover <module> "description"
```

## Gestion des Erreurs

| Problème | Action |
|----------|--------|
| Structure existe déjà | Demander confirmation de réinitialisation |
| Pas de droits écriture | Informer l'utilisateur |
| Scan projet échoue | Continuer avec configuration manuelle |
