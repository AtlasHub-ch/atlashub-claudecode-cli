---
description: Phase 3 - Validation specs avant developpement
---

# BA Validate

Expert QA et BA senior. Valide les specifications.

## Selection de l'analyse

**Dossier source** : `.claude/ba/analyses/`

### Etape 1 : Lister les fichiers disponibles

```bash
ls -1 .claude/ba/analyses/*.md 2>/dev/null
```

### Etape 2 : Logique de selection

**Cas A - Parametre fourni** (`$ARGUMENTS` non vide) :
```
ANALYSIS_FILE = ".claude/ba/analyses/$ARGUMENTS"
Verifier que le fichier existe, sinon ERREUR: "Fichier non trouve: $ARGUMENTS"
```

**Cas B - Aucun parametre** :

| Nombre de fichiers | Action |
|-------------------|--------|
| 0 fichiers | ERREUR: "Aucune analyse disponible. Executez `/ba:2-analyse` d'abord." |
| 1 fichier | Utiliser automatiquement ce fichier |
| 2+ fichiers | Afficher questionnaire de selection (voir ci-dessous) |

### Questionnaire de selection (si plusieurs fichiers)

Utiliser `AskUserQuestion` avec les fichiers trouves :

```
AskUserQuestion({
  questions: [{
    question: "Quelle analyse voulez-vous valider ?",
    header: "Analyse",
    options: [
      // Pour CHAQUE fichier trouve, creer une option :
      {
        label: "<nom-du-fichier>.md",
        description: "Valider l'analyse .claude/ba/analyses/<nom-du-fichier>.md"
      }
    ],
    multiSelect: false
  }]
})
```

### Etape 3 : Executer avec le fichier selectionne

Apres selection (automatique ou par l'utilisateur), stocker :
```
ANALYSIS_FILE = ".claude/ba/analyses/<fichier-selectionne>"
```

Puis continuer avec les etapes suivantes en utilisant `$ANALYSIS_FILE`.

## Etape 1 : Checklist completude

Charge et evalue :

```bash
cat templates/commands/ba/_resources/checklist-validation.md
```

Calcule le score (seuil: 85% = 25/29).

## Etape 2 : Coherence

### Donnees ↔ API

| Entite | GET | POST | PUT | DELETE | Status |
|--------|-----|------|-----|--------|--------|

### API ↔ UI

| Page | Endpoints utilises | Status |
|------|-------------------|--------|

### Permissions

| Action | API Role | UI Visible | Status |
|--------|----------|------------|--------|

## Etape 3 : Ambiguites

Scanner pour :
- Termes vagues ("peut-etre", "a voir")
- Specs incompletes
- Contradictions

## Etape 4 : Resume stakeholder

```
VALIDATION - RESUME
────────────────────────────────
Feature: <NOM>

A CREER :
• <X> table(s) : <liste>
• <X> endpoint(s)
• <X> page(s) Blazor

PERMISSIONS :
• Admin: <actions>
• User: <actions>

QUESTIONS A VALIDER :
1. <question>
2. <question>
────────────────────────────────
[ ] Je valide
[ ] Modifications requises
```

## Etape 5 : Finalisation

Si valide :

1. Copier vers `validations/` avec status VALIDATED
2. Generer **Plan de Developpement** dans `specs/`

```markdown
# Plan de Developpement : <Feature>

**Source** : analyses/<FILE>
**Date validation** : <DATE>
**Status** : READY

---

## 1. Backend - Entites

| Ordre | Entite | Action | Fichier cible |
|-------|--------|--------|---------------|
| 1 | <Entite> | CREATE | Domain/Entities/<Entite>.cs |

## 2. Backend - Migration

- Nom : Add<Feature>
- Tables impactees : <liste>

## 3. Backend - Endpoints

| Ordre | Controller | Method | Route | Action |
|-------|------------|--------|-------|--------|
| 1 | <Controller> | POST | /api/v2/<route> | CREATE |

## 4. Frontend - Pages

| Ordre | Page | URL | Action |
|-------|------|-----|--------|
| 1 | Index.razor | /<module>/<feature> | CREATE |

## 5. Tests

| Composant | Type test | Priorite |
|-----------|-----------|----------|
| <Controller> | Integration | HAUTE |

---

## Definition of Done

- [ ] Entites creees et configurees
- [ ] Migration generee (non appliquee)
- [ ] Endpoints fonctionnels
- [ ] Pages Blazor fonctionnelles
- [ ] Permissions implementees
- [ ] Tests ecrits
```

## Resume

```
VALIDATION COMPLETE
────────────────────────────────
Status:  <VALIDATED|PENDING|REJECTED>
Score:   <X>/29 (<PERCENT>%)

Documents generes :
• Analyse:  .claude/ba/analyses/<FILE>
• Valide:   .claude/ba/validations/<FILE>
• Plan:     .claude/ba/specs/<FILE>
────────────────────────────────
Prochain: /ba:4-implement <FILE>
```
