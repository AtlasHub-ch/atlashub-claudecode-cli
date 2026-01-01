---
description: Phase 6 - Génération du prompt de développement
---

# Business Analyse - Handoff

Expert BA senior. Génération du prompt de développement autonome.

## Arguments

```
/business-analyse:handoff [feature-id]
```

- `feature-id` : Identifiant de la feature (ex: FEAT-001)

## Pré-requis

```bash
# Vérifier que le FRD existe et est validé
test -f ".business-analyse/applications/*/modules/*/features/$ARGUMENTS/3-functional-specification.md" || \
  echo "Exécuter /business-analyse:specify d'abord"
```

## Philosophie du Handoff

```
╔══════════════════════════════════════════════════════════════════════════╗
║  LE HANDOFF EST UN PROMPT AUTONOME                                       ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Ce document DOIT contenir TOUT ce dont un développeur a besoin          ║
║  pour implémenter la fonctionnalité SANS avoir à consulter               ║
║  d'autres documents.                                                     ║
║                                                                          ║
║  Il peut être utilisé directement comme prompt pour Claude Code          ║
║  ou tout autre assistant de développement.                               ║
║                                                                          ║
║  ⚠️  LE BA NE CODE JAMAIS - Il fournit les specs, pas le code           ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Workflow

### Étape 1 : Compilation des informations

Charger tous les documents de la feature :

```bash
cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/1-discovery.md"
cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/2-business-requirements.md"
cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/3-functional-specification.md"
cat .business-analyse/config.json
cat .business-analyse/glossary.md
```

### Étape 2 : Analyse de la stack technique

Identifier la stack du projet pour adapter le prompt :

| Stack | Adaptations |
|-------|-------------|
| .NET/C# | Entity, DbContext, Controller, Blazor |
| Node.js | Model, Service, Route, React/Vue |
| Python | Model, Service, API, Template |
| Autre | Adapter selon conventions |

### Étape 3 : Génération du prompt de développement

Créer `4-development-handoff.md` :

```markdown
# Development Handoff - {{FEATURE_NAME}}

> **Ce document est un prompt de développement autonome.**
> Il contient toutes les informations nécessaires pour implémenter cette fonctionnalité.

---

## Métadonnées

| Propriété | Valeur |
|-----------|--------|
| **Feature ID** | {{FEAT-XXX}} |
| **Module** | {{MODULE}} |
| **Priorité** | {{PRIORITE}} |
| **Complexité estimée** | {{FAIBLE/MOYENNE/HAUTE}} |
| **Date création** | {{DATE}} |
| **Specs validées** | {{OUI/NON}} ({{SCORE}}%) |

---

## 1. Contexte

### 1.1 Objectif Business
{{OBJECTIF_1_2_PHRASES}}

### 1.2 Utilisateurs cibles
{{USERS_ROLES}}

### 1.3 Valeur apportée
{{VALEUR_BUSINESS}}

---

## 2. Scope de l'implémentation

### 2.1 Inclus (à implémenter)
- [ ] {{ITEM_1}}
- [ ] {{ITEM_2}}
- [ ] {{ITEM_3}}

### 2.2 Exclus (hors scope)
- {{EXCLUSION_1}}
- {{EXCLUSION_2}}

### 2.3 Dépendances
| Dépendance | Type | Status |
|------------|------|--------|
| {{DEP}} | Technique/Données | Résolu/En attente |

---

## 3. Modèle de données

### 3.1 Entités à créer/modifier

#### {{ENTITY_NAME}}

```
Attributs:
  - id: UUID (PK, auto-généré)
  - name: string (2-100 chars, required, unique)
  - description: string? (max 500 chars, optional)
  - status: enum [active, inactive, archived] (default: active)
  - created_at: datetime (auto, immutable)
  - updated_at: datetime (auto)
  - created_by: UUID (FK → User)

Relations:
  - belongs_to: User (created_by)
  - has_many: {{RELATED_ENTITY}}

Index suggérés:
  - (name) UNIQUE
  - (status, created_at)

Contraintes:
  - name NOT NULL
  - status IN ('active', 'inactive', 'archived')
```

#### {{ENTITY_NAME_2}}
...

### 3.2 Diagramme ER

```mermaid
erDiagram
    {{ER_DIAGRAM}}
```

### 3.3 Migration suggérée
- Nom: `Add{{FeatureName}}`
- Tables: {{LIST}}
- Ordre: {{ORDER}}

---

## 4. API Endpoints

### 4.1 Vue d'ensemble

| Method | Route | Description | Auth | Roles |
|--------|-------|-------------|------|-------|
| GET | /api/v2/{{resource}} | Liste paginée | Oui | User, Admin |
| GET | /api/v2/{{resource}}/:id | Détail | Oui | User, Admin |
| POST | /api/v2/{{resource}} | Création | Oui | Admin |
| PUT | /api/v2/{{resource}}/:id | Modification | Oui | Admin |
| DELETE | /api/v2/{{resource}}/:id | Suppression | Oui | Admin |

### 4.2 Détails des endpoints

#### GET /api/v2/{{resource}}

**Description**: Retourne la liste paginée des {{resource}}

**Query Parameters**:
- `page` (int, default: 1): Numéro de page
- `limit` (int, default: 20, max: 100): Items par page
- `status` (string, optional): Filtrer par statut
- `search` (string, optional): Recherche sur name

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Règles métier**:
- BR-001: Seuls les items avec status != 'archived' sont retournés par défaut
- BR-002: La recherche est case-insensitive

#### POST /api/v2/{{resource}}

**Description**: Crée un nouveau {{resource}}

**Request Body**:
```json
{
  "name": "string (required, 2-100)",
  "description": "string (optional, max 500)"
}
```

**Validations**:
- `name`: Required, 2-100 chars, unique
- `description`: Optional, max 500 chars

**Response 201**:
```json
{
  "id": "uuid",
  "name": "string",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Erreurs**:
- 400: Validation failed
- 409: Name already exists

---

## 5. Interface utilisateur

### 5.1 Pages à créer

| Page | URL | Description | Rôles |
|------|-----|-------------|-------|
| Liste | /{{module}}/{{resource}} | Liste avec filtres | User, Admin |
| Formulaire | /{{module}}/{{resource}}/new | Création | Admin |
| Détail | /{{module}}/{{resource}}/:id | Vue détaillée | User, Admin |
| Édition | /{{module}}/{{resource}}/:id/edit | Modification | Admin |

### 5.2 Wireframes

#### Page Liste

```
┌─────────────────────────────────────────────────────────────────┐
│ {{APP_NAME}}                                    [User ▼] [Exit] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  {{RESOURCE_PLURAL}}                           [+ Nouveau]      │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Recherche: [________________________] [🔍]                     │
│  Filtres:   [Status ▼]                                          │
│                                                                 │
│  ┌─────┬─────────────┬──────────┬──────────┬─────────────┐      │
│  │ ☐   │ Nom         │ Status   │ Créé le  │ Actions     │      │
│  ├─────┼─────────────┼──────────┼──────────┼─────────────┤      │
│  │ ☐   │ Item 1      │ ● Actif  │ 15/01/24 │ [✎] [🗑]   │      │
│  │ ☐   │ Item 2      │ ○ Inactif│ 16/01/24 │ [✎] [🗑]   │      │
│  └─────┴─────────────┴──────────┴──────────┴─────────────┘      │
│                                                                 │
│  [◀ Précédent]  Page 1/5  [Suivant ▶]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Comportements**:
- Recherche: Filtre en temps réel après 300ms debounce
- [+ Nouveau]: Visible seulement si rôle Admin
- [✎][🗑]: Visible seulement si rôle Admin
- [🗑]: Confirmation avant suppression

#### Page Formulaire

```
┌─────────────────────────────────────────────────────────────────┐
│ {{APP_NAME}}                                    [User ▼] [Exit] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ◀ Retour à la liste                                            │
│                                                                 │
│  Nouveau {{RESOURCE}}                                           │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │  Nom *                                                  │    │
│  │  [_____________________________________________]        │    │
│  │  ⚠️ 2 à 100 caractères                                  │    │
│  │                                                         │    │
│  │  Description                                            │    │
│  │  [                                                 ]    │    │
│  │  [                                                 ]    │    │
│  │  [_________________________________________________]    │    │
│  │  0/500 caractères                                       │    │
│  │                                                         │    │
│  │                          [Annuler] [Créer]              │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Validations front-end**:
- Nom: Required, 2-100 chars
- Description: Max 500 chars
- Bouton Créer: Disabled si formulaire invalide

### 5.3 Messages

| Contexte | Message |
|----------|---------|
| Création réussie | "{{Resource}} créé avec succès" |
| Modification réussie | "{{Resource}} modifié avec succès" |
| Suppression réussie | "{{Resource}} supprimé" |
| Confirmation suppression | "Êtes-vous sûr de vouloir supprimer ce {{resource}} ?" |
| Erreur validation | "Veuillez corriger les erreurs du formulaire" |
| Erreur serveur | "Une erreur est survenue. Veuillez réessayer." |
| Liste vide | "Aucun {{resource}} trouvé. Créez le premier !" |

---

## 6. Règles métier

| ID | Règle | Implémentation |
|----|-------|----------------|
| BR-001 | Le nom doit être unique | Contrainte DB + validation API |
| BR-002 | Seul Admin peut créer/modifier | Middleware auth + [Authorize] |
| BR-003 | Soft delete (archivage) | status = 'archived', pas de DELETE réel |
| BR-004 | Audit trail | created_by, created_at, updated_at auto |

---

## 7. Permissions

| Action | Admin | User | Anonymous |
|--------|-------|------|-----------|
| Voir liste | ✓ | ✓ | ✗ |
| Voir détail | ✓ | ✓ | ✗ |
| Créer | ✓ | ✗ | ✗ |
| Modifier | ✓ | ✗ | ✗ |
| Supprimer | ✓ | ✗ | ✗ |

---

## 8. Ordre d'implémentation suggéré

### Phase 1: Backend Core
1. [ ] Créer entité {{Entity}}
2. [ ] Configurer DbContext
3. [ ] Créer migration `Add{{Feature}}`
4. [ ] Créer DTOs (Request/Response)
5. [ ] Implémenter {{Entity}}Controller

### Phase 2: Backend Validation
6. [ ] Ajouter validations FluentValidation
7. [ ] Implémenter règles métier (BR-001 à BR-004)
8. [ ] Ajouter gestion d'erreurs

### Phase 3: Frontend
9. [ ] Créer page Liste
10. [ ] Créer page Formulaire (Create/Edit)
11. [ ] Implémenter validations front-end
12. [ ] Ajouter messages toast

### Phase 4: Finalisation
13. [ ] Écrire tests unitaires (Controller)
14. [ ] Écrire tests d'intégration
15. [ ] Vérifier permissions
16. [ ] Review code

---

## 9. Critères d'acceptation

### Happy Path
```gherkin
Scenario: Création d'un {{resource}}
  Given je suis connecté en tant qu'Admin
  And je suis sur la page de liste des {{resource}}
  When je clique sur "Nouveau"
  And je remplis le nom avec "Test {{Resource}}"
  And je clique sur "Créer"
  Then je vois le message "{{Resource}} créé avec succès"
  And le {{resource}} "Test {{Resource}}" apparaît dans la liste
```

### Cas d'erreur
```gherkin
Scenario: Validation nom unique
  Given un {{resource}} "Existant" existe déjà
  When je crée un {{resource}} avec le nom "Existant"
  Then je vois l'erreur "Ce nom est déjà utilisé"
```

---

## 10. Références

| Document | Description |
|----------|-------------|
| [Discovery](./1-discovery.md) | Élicitation du besoin |
| [BRD](./2-business-requirements.md) | Exigences métier |
| [FRD](./3-functional-specification.md) | Spécifications complètes |
| [Glossaire](../../../glossary.md) | Termes métier |

---

## Definition of Done

- [ ] Entités créées et configurées
- [ ] Migration générée (NON appliquée en prod)
- [ ] Endpoints fonctionnels et documentés
- [ ] Pages UI fonctionnelles
- [ ] Validations front + back
- [ ] Permissions implémentées
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Code review effectuée

---

*Généré par Business Analyse - {{DATE}}*
*Ce prompt peut être utilisé directement avec Claude Code ou tout assistant de développement.*
```

### Résumé

```
HANDOFF GÉNÉRÉ
═══════════════════════════════════════════════════════════
Feature:     {{FEAT-XXX}} - {{NAME}}
═══════════════════════════════════════════════════════════
Prompt de développement créé:
  • Entités:     {{X}} spécifiées
  • Endpoints:   {{Y}} documentés
  • Pages:       {{Z}} wireframées
  • Règles:      {{W}} à implémenter
  • Steps:       {{N}} étapes d'implémentation
═══════════════════════════════════════════════════════════
Document: .../{{FEAT-XXX}}/4-development-handoff.md

UTILISATION:
  1. Copier le contenu du handoff
  2. L'utiliser comme prompt pour le développeur
  3. Ou l'exécuter avec Claude Code

⚠️  LE BA A TERMINÉ SON TRAVAIL
    Le développeur prend le relais pour l'implémentation.
═══════════════════════════════════════════════════════════
```

## Règles

1. **Prompt autonome** - Tout le contexte inclus
2. **Ordre logique** - Backend → Frontend → Tests
3. **DoD clair** - Critères de validation explicites
4. **Pas de code** - Specs seulement, le dev code
5. **Références** - Liens vers docs détaillées
6. **Prêt à l'emploi** - Utilisable directement
