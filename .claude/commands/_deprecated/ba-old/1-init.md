---
description: Phase 1 - Initialisation BA avec scan projet
---

# BA Init

Expert Business Analyst. Initialise le contexte projet.

## Etape 1 : Scan projet

Lance l'agent exploration (Haiku - lecture seule) :

```
Task(subagent_type="explore-codebase", model="haiku", prompt="
Scan projet .NET, retourne JSON compact:

ARCHITECTURE:
- .sln, .csproj (noms, types: API/Web/Shared)
- Patterns (CQRS, MediatR, etc.)

DONNEES:
- DbContext: nom, chemin, provider
- Entites: count par domaine (ex: {identity:5, billing:3})
- Schemas DB si plusieurs

SECURITE:
- Roles systeme (liste)
- Pattern auth (JWT, Cookie, etc.)
- Attributs [Authorize] trouves

API:
- Controllers: count, versions API si presentes
- Dossier racine controllers

UI:
- Pages Blazor: count, modules principaux
- Dossier racine pages

FORMAT: JSON compact, pas de code, juste structure.
")
```

## Etape 2 : Creation config

Avec le resultat du scan, cree `.claude/ba/config.json` :

```json
{
  "version": "1.0.0",
  "initialized": "<DATE_ISO>",
  "project": {
    "name": "<NOM_SOLUTION>",
    "type": "<STACK>",
    "patterns": ["<PATTERNS_TROUVES>"]
  },
  "paths": {
    "entities": "<DOSSIER_ENTITES>",
    "controllers": "<DOSSIER_CONTROLLERS>",
    "pages": "<DOSSIER_PAGES>",
    "dbcontext": "<CHEMIN_DBCONTEXT>"
  },
  "database": {
    "context": "<NOM_DBCONTEXT>",
    "provider": "<PROVIDER>",
    "schemas": ["<SCHEMAS_SI_PLUSIEURS>"]
  },
  "entities": {
    "count": "<TOTAL>",
    "byDomain": {"<domaine>": "<count>"}
  },
  "security": {
    "authPattern": "<JWT|Cookie|Identity>",
    "roles": ["<ROLES_SYSTEME>"],
    "roleHierarchy": "<system|org|resource SI DETECTE>"
  },
  "api": {
    "count": "<TOTAL_CONTROLLERS>",
    "versions": ["<V1|V2 SI PRESENTES>"]
  },
  "ui": {
    "count": "<TOTAL_PAGES>",
    "modules": ["<MODULES_PRINCIPAUX>"]
  },
  "output": {
    "folder": ".claude/ba",
    "naming": "YYYY-MM-DD-{feature}"
  }
}
```

**Note** : Omettre les champs non detectes (pas de valeurs nulles).

## Etape 3 : Structure dossiers

```bash
mkdir -p .claude/ba/{analyses,specs,validations}
```

## Etape 4 : Resume

```
BA INITIALISE
─────────────────────────────────
Projet:      <NOM> (<TYPE>)
Patterns:    <PATTERNS>
─────────────────────────────────
Entites:     <COUNT> (<DOMAINES>)
API:         <COUNT> endpoints
UI:          <COUNT> pages
─────────────────────────────────
Auth:        <PATTERN>
Roles:       <LISTE>
─────────────────────────────────
Config: .claude/ba/config.json
Prochain: /ba:2-analyse
```

## Si erreur

| Probleme | Action |
|----------|--------|
| Pas de .csproj | "Ce n'est pas un projet .NET" |
| Pas d'entites | Demander confirmation EF Core |
