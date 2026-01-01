---
description: Phase 4 - Spécifications fonctionnelles FRD (ULTRATHINK)
---

# Business Analyse - Specify

Expert BA senior en spécifications. Mode ULTRATHINK obligatoire.

## Arguments

```
/business-analyse:specify [feature-id]
```

- `feature-id` : Identifiant de la feature (ex: FEAT-001)

## Pré-requis

```bash
# Vérifier que le BRD existe
test -f ".business-analyse/applications/*/modules/*/features/$ARGUMENTS/2-business-requirements.md" || \
  echo "Exécuter /business-analyse:analyse d'abord"
```

## Mode ULTRATHINK

**IMPORTANT** : Cette phase utilise le skill `ultrathink` pour des spécifications précises.

```
Skill(skill="ultrathink", args="Spécifications fonctionnelles détaillées FRD")
```

Approche à adopter :
- Spécifier avec précision chirurgicale
- Aucune ambiguïté tolérée
- Cas d'utilisation complets
- Critères d'acceptation vérifiables

## Workflow

### Étape 1 : Chargement du contexte

```bash
cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/2-business-requirements.md"
cat .business-analyse/config.json
```

### Étape 2 : Cas d'utilisation détaillés

Pour chaque fonctionnalité, créer un cas d'utilisation complet :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ USE CASE: UC-{{XXX}} - {{NOM}}                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Acteur principal: {{ACTEUR}}                                            │
│ Acteurs secondaires: {{ACTEURS_SECONDAIRES}}                            │
│ Préconditions: {{PRECONDITIONS}}                                        │
│ Postconditions (succès): {{POSTCONDITIONS_SUCCESS}}                     │
│ Postconditions (échec): {{POSTCONDITIONS_FAILURE}}                      │
├─────────────────────────────────────────────────────────────────────────┤
│ SCÉNARIO PRINCIPAL (Happy Path)                                         │
│ ───────────────────────────────                                         │
│ 1. {{ACTEUR}} {{ACTION_1}}                                              │
│ 2. Le système {{REACTION_1}}                                            │
│ 3. {{ACTEUR}} {{ACTION_2}}                                              │
│ 4. Le système {{REACTION_2}}                                            │
│ 5. ...                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ EXTENSIONS (Flux alternatifs)                                           │
│ ─────────────────────────────                                           │
│ 2a. Si {{CONDITION}}:                                                   │
│     2a.1. Le système {{ACTION_ALTERNATIVE}}                             │
│     2a.2. Retour à l'étape 3                                            │
│                                                                         │
│ 4a. Si {{ERREUR}}:                                                      │
│     4a.1. Le système affiche "{{MESSAGE_ERREUR}}"                       │
│     4a.2. Le cas d'utilisation se termine                               │
├─────────────────────────────────────────────────────────────────────────┤
│ RÈGLES MÉTIER APPLICABLES                                               │
│ ─────────────────────────                                               │
│ • BR-001: {{REGLE}}                                                     │
│ • BR-002: {{REGLE}}                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Étape 3 : Spécifications d'interface (Wireframes ASCII)

Pour chaque écran, créer un wireframe ASCII :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ÉCRAN: {{NOM_ECRAN}}                                                    │
│ URL: {{URL_PATTERN}}                                                    │
│ Rôles autorisés: {{ROLES}}                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ {{APP_NAME}}                              [User ▼] [Logout]     │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │ [Menu1] [Menu2] [Menu3]                                         │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                 │    │
│  │  {{PAGE_TITLE}}                           [+ Nouveau]           │    │
│  │  ─────────────────────────────────────────────────────────      │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │ Recherche: [________________________] [🔍]               │    │    │
│  │  │ Filtres:   [Status ▼] [Date ▼]                          │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  │                                                                 │    │
│  │  ┌──────┬─────────────┬──────────┬─────────┬─────────────┐     │    │
│  │  │ ☐    │ Nom         │ Status   │ Date    │ Actions     │     │    │
│  │  ├──────┼─────────────┼──────────┼─────────┼─────────────┤     │    │
│  │  │ ☐    │ Item 1      │ ● Actif  │ 01/01   │ [✎] [🗑]    │     │    │
│  │  │ ☐    │ Item 2      │ ○ Inactif│ 02/01   │ [✎] [🗑]    │     │    │
│  │  └──────┴─────────────┴──────────┴─────────┴─────────────┘     │    │
│  │                                                                 │    │
│  │  [◀ Précédent]  Page 1 sur 5  [Suivant ▶]                      │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ ÉLÉMENTS INTERACTIFS                                                    │
│ ────────────────────                                                    │
│ • [+ Nouveau]: Ouvre formulaire création (voir écran FORM-001)          │
│ • [✎]: Ouvre formulaire édition avec données pré-remplies              │
│ • [🗑]: Confirmation puis suppression (soft delete si applicable)       │
│ • Recherche: Filtre en temps réel sur nom                               │
│ • Pagination: 20 items par page                                         │
│                                                                         │
│ VALIDATIONS FRONT-END                                                   │
│ ─────────────────────                                                   │
│ • Minimum 1 item sélectionné pour actions de masse                      │
│ • Confirmation obligatoire avant suppression                            │
│                                                                         │
│ MESSAGES                                                                │
│ ────────                                                                │
│ • Succès création: "{{ENTITY}} créé avec succès"                        │
│ • Succès suppression: "{{ENTITY}} supprimé"                             │
│ • Erreur: "Une erreur est survenue. Veuillez réessayer."                │
│ • Vide: "Aucun résultat trouvé. Créez votre premier {{ENTITY}}."        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Étape 4 : Spécifications des champs

Pour chaque formulaire, documenter précisément les champs :

| Champ | Label | Type | Obligatoire | Validation | Default | Aide |
|-------|-------|------|-------------|------------|---------|------|
| `name` | Nom | text | Oui | 2-100 chars, alphanum | - | "Nom unique" |
| `email` | Email | email | Oui | Format email valide | - | - |
| `status` | Statut | select | Oui | [actif, inactif] | actif | - |
| `date` | Date | date | Non | >= aujourd'hui | aujourd'hui | - |

### Étape 5 : Spécifications API (si applicable)

Pour chaque endpoint, documenter :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ENDPOINT: {{METHOD}} {{ROUTE}}                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Description: {{DESCRIPTION}}                                            │
│ Authentification: {{AUTH_REQUIRED}}                                     │
│ Rôles autorisés: {{ROLES}}                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ REQUEST                                                                 │
│ ───────                                                                 │
│ Headers:                                                                │
│   Authorization: Bearer {{token}}                                       │
│   Content-Type: application/json                                        │
│                                                                         │
│ Path params:                                                            │
│   {{param}}: {{type}} - {{description}}                                 │
│                                                                         │
│ Query params:                                                           │
│   page: int (default: 1) - Numéro de page                               │
│   limit: int (default: 20, max: 100) - Items par page                   │
│                                                                         │
│ Body (JSON):                                                            │
│   {                                                                     │
│     "field1": "string (required, 2-100)",                               │
│     "field2": "number (optional)"                                       │
│   }                                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ RESPONSES                                                               │
│ ─────────                                                               │
│ 200 OK:                                                                 │
│   {                                                                     │
│     "data": [...],                                                      │
│     "pagination": { "page": 1, "total": 100 }                           │
│   }                                                                     │
│                                                                         │
│ 400 Bad Request:                                                        │
│   { "error": "Validation failed", "details": [...] }                    │
│                                                                         │
│ 401 Unauthorized:                                                       │
│   { "error": "Authentication required" }                                │
│                                                                         │
│ 403 Forbidden:                                                          │
│   { "error": "Insufficient permissions" }                               │
│                                                                         │
│ 404 Not Found:                                                          │
│   { "error": "Resource not found" }                                     │
│                                                                         │
│ 500 Internal Server Error:                                              │
│   { "error": "An unexpected error occurred" }                           │
├─────────────────────────────────────────────────────────────────────────┤
│ RÈGLES MÉTIER APPLICABLES                                               │
│ ─────────────────────────                                               │
│ • BR-001: {{REGLE}}                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Étape 6 : Critères d'acceptation (Gherkin)

Pour chaque exigence, écrire des critères testables :

```gherkin
Feature: {{FEATURE_NAME}}

  Background:
    Given l'utilisateur est connecté avec le rôle "{{ROLE}}"
    And il se trouve sur la page "{{PAGE}}"

  @{{TAG}}
  Scenario: {{SCENARIO_NOM}} - Happy path
    Given {{PRECONDITION}}
    When l'utilisateur {{ACTION}}
    Then le système {{RESULTAT_ATTENDU}}
    And {{VERIFICATION_SUPPLEMENTAIRE}}

  @{{TAG}}
  Scenario: {{SCENARIO_NOM}} - Cas d'erreur
    Given {{PRECONDITION}}
    When l'utilisateur {{ACTION_INVALIDE}}
    Then le système affiche le message "{{MESSAGE_ERREUR}}"
    And {{ETAT_PRESERVE}}

  @{{TAG}}
  Scenario Outline: {{SCENARIO_NOM}} - Validation
    Given l'utilisateur saisit "<valeur>" dans le champ "{{CHAMP}}"
    When il valide le formulaire
    Then le résultat est "<resultat>"

    Examples:
      | valeur        | resultat    |
      | valeur_valide | succès      |
      | valeur_vide   | erreur      |
      | valeur_trop_long | erreur   |
```

### Étape 7 : Checklist de complétude (85% minimum)

Évaluer avec la checklist :

```bash
cat .claude/commands/business-analyse/_resources/checklist-specification.md
```

| Catégorie | Critère | Status |
|-----------|---------|--------|
| **Contexte (4/4)** | | |
| | Objectif documenté | ✓/✗ |
| | Scope défini | ✓/✗ |
| | Stakeholders identifiés | ✓/✗ |
| | Priorité établie | ✓/✗ |
| **Use Cases (6/6)** | | |
| | Happy path complet | ✓/✗ |
| | Extensions documentées | ✓/✗ |
| | Préconditions | ✓/✗ |
| | Postconditions | ✓/✗ |
| | Acteurs identifiés | ✓/✗ |
| | Règles métier liées | ✓/✗ |
| **Interface (6/6)** | | |
| | Wireframes présents | ✓/✗ |
| | URLs définies | ✓/✗ |
| | Rôles par écran | ✓/✗ |
| | Éléments interactifs | ✓/✗ |
| | Messages définis | ✓/✗ |
| | Validations front | ✓/✗ |
| **Données (5/5)** | | |
| | Champs spécifiés | ✓/✗ |
| | Types de données | ✓/✗ |
| | Validations | ✓/✗ |
| | Valeurs par défaut | ✓/✗ |
| | Obligatoire/optionnel | ✓/✗ |
| **API (5/5)** | | |
| | Endpoints documentés | ✓/✗ |
| | Request/Response | ✓/✗ |
| | Codes d'erreur | ✓/✗ |
| | Auth/Permissions | ✓/✗ |
| | Validations back | ✓/✗ |
| **Tests (4/4)** | | |
| | Critères d'acceptation | ✓/✗ |
| | Scénarios Gherkin | ✓/✗ |
| | Cas nominaux | ✓/✗ |
| | Cas d'erreur | ✓/✗ |

**Score**: {{X}}/30 ({{PERCENT}}%)
**Seuil**: 85% (26/30)

### Étape 8 : Génération du FRD

Créer `3-functional-specification.md` :

```markdown
# Functional Requirements Document - {{FEATURE_NAME}}

**ID**: {{FEAT-XXX}}
**Version**: 1.0
**Date**: {{DATE}}
**Status**: Draft
**Auteur**: Claude (Business Analyse)
**Source**: BRD v1.0

---

## 1. Vue d'ensemble

### 1.1 Objectif
{{OBJECTIF}}

### 1.2 Références
| Document | Version | Lien |
|----------|---------|------|
| BRD | 1.0 | [2-business-requirements.md](./2-business-requirements.md) |
| Discovery | 1.0 | [1-discovery.md](./1-discovery.md) |

### 1.3 Terminologie
Voir [glossary.md](../../../glossary.md)

---

## 2. Cas d'Utilisation

### 2.1 Diagramme des cas d'utilisation

```mermaid
graph LR
    subgraph Acteurs
        A1[{{ACTEUR_1}}]
        A2[{{ACTEUR_2}}]
    end
    subgraph "Feature: {{NAME}}"
        UC1((UC-001))
        UC2((UC-002))
    end
    A1 --> UC1
    A1 --> UC2
    A2 --> UC1
```

### 2.2 UC-001: {{NOM}}

{{USE_CASE_COMPLET}}

### 2.3 UC-002: {{NOM}}

{{USE_CASE_COMPLET}}

---

## 3. Spécifications d'Interface

### 3.1 Plan de navigation

```mermaid
flowchart TD
    {{NAVIGATION_FLOW}}
```

### 3.2 Écrans

#### 3.2.1 {{SCREEN_NAME}}

{{WIREFRAME_ASCII}}

#### 3.2.2 {{SCREEN_NAME}}

{{WIREFRAME_ASCII}}

---

## 4. Spécifications des Données

### 4.1 Formulaires

#### {{FORM_NAME}}

| Champ | Label | Type | Obligatoire | Validation | Default | Aide |
|-------|-------|------|-------------|------------|---------|------|
{{FIELDS_TABLE}}

---

## 5. Spécifications API

### 5.1 Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
{{ENDPOINTS_TABLE}}

### 5.2 Détails des endpoints

{{ENDPOINT_DETAILS}}

---

## 6. Règles de Validation

### 6.1 Validations Front-end

| Champ | Règle | Message d'erreur |
|-------|-------|------------------|
{{VALIDATION_FRONT}}

### 6.2 Validations Back-end

| Endpoint | Règle | Code | Message |
|----------|-------|------|---------|
{{VALIDATION_BACK}}

---

## 7. Messages et Notifications

### 7.1 Messages de succès

| Action | Message |
|--------|---------|
{{SUCCESS_MESSAGES}}

### 7.2 Messages d'erreur

| Erreur | Message | Action utilisateur |
|--------|---------|-------------------|
{{ERROR_MESSAGES}}

---

## 8. Critères d'Acceptation

### 8.1 Scénarios de test

```gherkin
{{GHERKIN_SCENARIOS}}
```

### 8.2 Matrice de couverture

| Exigence | Use Case | Scénario | Status |
|----------|----------|----------|--------|
{{COVERAGE_MATRIX}}

---

## 9. Annexes

### 9.1 Checklist de complétude

Score: {{SCORE}}/30 ({{PERCENT}}%)

### 9.2 Questions résolues

{{RESOLVED_QUESTIONS}}

### 9.3 Décisions prises

| Décision | Justification | Date |
|----------|---------------|------|
{{DECISIONS}}

---

## Historique des modifications

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | {{DATE}} | Claude BA | Création initiale |

---

*Généré par Business Analyse - {{DATE}}*
```

### Résumé

```
SPÉCIFICATIONS COMPLÈTES
═══════════════════════════════════════════════════════════
Feature:     {{FEAT-XXX}} - {{NAME}}
═══════════════════════════════════════════════════════════
Contenu:
  • Use Cases:       {{X}} documentés
  • Écrans:          {{Y}} wireframés
  • Endpoints:       {{Z}} spécifiés
  • Critères:        {{W}} scénarios Gherkin

Score complétude:    {{SCORE}}/30 ({{PERCENT}}%)
Seuil:               85% (26/30) ✓/✗
═══════════════════════════════════════════════════════════
Document: .../{{FEAT-XXX}}/3-functional-specification.md
═══════════════════════════════════════════════════════════
Prochain: /business-analyse:document {{FEAT-XXX}}
```

## Règles

1. **ULTRATHINK obligatoire** - Précision maximale
2. **Zéro ambiguïté** - Chaque spec doit être claire
3. **Wireframes ASCII** - Visualisation sans outil externe
4. **Gherkin testable** - Critères vérifiables
5. **Score 85%+** - Minimum pour valider
6. **Aucun code** - Specs fonctionnelles, pas techniques
