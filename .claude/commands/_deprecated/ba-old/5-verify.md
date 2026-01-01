---
description: Phase 5 - Verification build, tests et qualite .NET
allowed-tools: Bash(dotnet *), Read, Edit, Task, Grep
---

# BA Verify

Expert QA .NET senior. Validation complete du code genere.

## Selection de l'implementation

**Dossier source** : `.claude/ba/implementations/`

### Etape 1 : Lister les fichiers disponibles

```bash
ls -1 .claude/ba/implementations/*.md 2>/dev/null
```

### Etape 2 : Logique de selection

**Cas A - Parametre fourni** (`$ARGUMENTS` non vide) :
```
IMPLEMENTATION_FILE = ".claude/ba/implementations/$ARGUMENTS"
Verifier que le fichier existe, sinon ERREUR: "Fichier non trouve: $ARGUMENTS"
```

**Cas B - Aucun parametre** :

| Nombre de fichiers | Action |
|-------------------|--------|
| 0 fichiers | ERREUR: "Aucune implementation disponible. Executez `/ba:4-implement` d'abord." |
| 1 fichier | Utiliser automatiquement ce fichier |
| 2+ fichiers | Afficher questionnaire de selection (voir ci-dessous) |

### Questionnaire de selection (si plusieurs fichiers)

Utiliser `AskUserQuestion` avec les fichiers trouves :

```
AskUserQuestion({
  questions: [{
    question: "Quelle implementation voulez-vous verifier ?",
    header: "Impl",
    options: [
      // Pour CHAQUE fichier trouve, creer une option :
      {
        label: "<nom-du-fichier>.md",
        description: "Verifier l'implementation .claude/ba/implementations/<nom-du-fichier>.md"
      }
    ],
    multiSelect: false
  }]
})
```

### Etape 3 : Executer avec le fichier selectionne

Apres selection (automatique ou par l'utilisateur), stocker :
```
IMPLEMENTATION_FILE = ".claude/ba/implementations/<fichier-selectionne>"
```

Puis continuer avec les etapes suivantes en utilisant `$IMPLEMENTATION_FILE`.

## Workflow

### 1. Build

```bash
dotnet restore
dotnet build --configuration Release
```

**Si erreurs** : Parser erreurs → grouper par fichier (max 5) → lancer snipper pour fix → re-build

### 2. EF Core

```bash
dotnet ef migrations list --project src/Infrastructure --startup-project src/Api
dotnet ef migrations script --idempotent -o migration.sql
```

**NE PAS** executer `database update`

### 3. Tests

```bash
dotnet test --no-build --configuration Release
```

**Si echecs** : Analyser cause → lancer snipper pour fix → re-test

### 4. Format

```bash
dotnet format --verify-no-changes
dotnet format  # si necessaire
```

### 5. Fix automatique (si erreurs)

Pour chaque groupe d'erreurs :

```
Task(subagent_type="snipper", model="opus", prompt="
Fix erreurs .NET:
{liste_erreurs_avec_fichier_ligne}
Contexte: .NET 8 / ASP.NET Core / EF Core
Corrections minimales.
")
```

Re-executer build/test apres fix. Maximum 3 iterations.

### 6. Rapport

Creer `.claude/ba/verifications/YYYY-MM-DD-{feature}.md` :

| Check | Status |
|-------|--------|
| Build | ✓/✗ |
| EF Migration | ✓/✗ |
| Tests | X/Y passed |
| Format | ✓/✗ |

## Resume

```
BA VERIFY
────────────────────────────────
Feature: {NAME}

Build:     ✓ (0 errors)
Migration: ✓ migration.sql
Tests:     {X}/{Y} passed
Format:    ✓

STATUS: READY / NOT READY
────────────────────────────────

Si READY:
1. Review code
2. Review migration.sql
3. dotnet ef database update
4. Test manuel
```

## Regles

1. Build MUST pass
2. Tests MUST pass
3. NE PAS appliquer migration auto
4. Max 3 iterations fix
5. Si blocage → reporter a l'utilisateur
