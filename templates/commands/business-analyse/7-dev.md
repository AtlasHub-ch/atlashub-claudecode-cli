---
description: Phase 7 - Implémentation guidée par phases avec validation utilisateur
model: opus
args: [feature-id, phase]
---

# Business Analyse - DEV (Implémentation)

Expert développeur senior. Implémentation guidée par phases avec validation obligatoire.

> **INSTRUCTION CLAUDE:** Les blocs `AskUserQuestion({...})` sont des instructions pour utiliser le tool `AskUserQuestion` de maniere **interactive**. Tu DOIS executer le tool avec ces parametres pour obtenir la reponse de l'utilisateur AVANT de continuer.

## Arguments

```
/business-analyse:7-dev [feature-id] [phase]
```

- `feature-id` : Identifiant de la feature (ex: FEAT-001)
- `phase` : Phase à exécuter (optionnel: data|api|ui|integration|all)

## Philosophie

```
╔══════════════════════════════════════════════════════════════════════════╗
║  VALIDATION UTILISATEUR OBLIGATOIRE                                      ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  AUCUNE phase ne s'exécute automatiquement.                             ║
║  L'utilisateur DOIT valider explicitement avant chaque phase.           ║
║                                                                          ║
║  Workflow:                                                               ║
║    1. Afficher le plan d'implémentation                                 ║
║    2. Demander validation utilisateur                                   ║
║    3. Exécuter UNIQUEMENT si validé                                     ║
║    4. Valider les résultats avant phase suivante                        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Pré-requis

```bash
# Vérifier que le handoff existe
test -f ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/4-development-handoff.md" || \
  echo "Exécuter /business-analyse:6-handoff d'abord"
```

## Workflow

### Étape 1 : Chargement du contexte

Charger le handoff et le FRD :

```bash
HANDOFF=$(cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/4-development-handoff.md")
FRD=$(cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/3-functional-specification.md")
```

Extraire le plan d'implémentation (section 9 du FRD).

### Étape 2 : Affichage du plan

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PLAN D'IMPLÉMENTATION - {{FEATURE_NAME}}                                ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Complexité détectée: {{COMPLEXITE}}                                     ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────────┐  ║
║  │ PHASE │ SCOPE                    │ VALIDATION      │ STATUS       │  ║
║  ├───────┼──────────────────────────┼─────────────────┼──────────────┤  ║
║  │ 1     │ Data Layer (Entités)     │ EF OK           │ ⏳ En attente │  ║
║  │ 2     │ API Layer (Endpoints)    │ Swagger OK      │ ⏳ En attente │  ║
║  │ 3     │ UI Layer (Composants)    │ Gherkin OK      │ ⏳ En attente │  ║
║  │ 4     │ Intégration              │ UAT OK          │ ⏳ En attente │  ║
║  └────────────────────────────────────────────────────────────────────┘  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Étape 3 : Demande de validation utilisateur

**OBLIGATOIRE** - Utiliser AskUserQuestion :

```
AskUserQuestion({
  questions: [{
    question: "Quelle phase voulez-vous exécuter ?",
    header: "Phase",
    options: [
      { label: "1. Data Layer", description: "Entités, migrations, repositories" },
      { label: "2. API Layer", description: "Endpoints, services, DTOs" },
      { label: "3. UI Layer", description: "Composants, formulaires, state" },
      { label: "4. Intégration", description: "Wiring complet, tests E2E" },
      { label: "Voir le plan détaillé", description: "Afficher le plan sans exécuter" }
    ],
    multiSelect: false
  }]
})
```

**SI l'utilisateur choisit "Voir le plan détaillé"** → Afficher le détail et redemander

**SI l'utilisateur choisit une phase** → Passer à l'étape 4

### Étape 4 : Confirmation avant exécution

**OBLIGATOIRE** - Double confirmation :

```
AskUserQuestion({
  questions: [{
    question: "Confirmer l'exécution de la Phase {{N}} ?",
    header: "Confirmer",
    options: [
      { label: "Oui, exécuter maintenant", description: "Lancer l'implémentation" },
      { label: "Non, annuler", description: "Retour au menu" }
    ],
    multiSelect: false
  }]
})
```

**SI "Non"** → Retour à l'étape 3
**SI "Oui"** → Passer à l'étape 5

---

## Étape 5 : Exécution des phases

### Phase 1: DATA LAYER

**Scope:**
- Créer/modifier les entités (classes C#, modèles TypeScript, etc.)
- Configurer le DbContext / ORM
- Générer les migrations
- Créer les repositories (si pattern utilisé)
- Ajouter les seed data de test

**Actions:**

```
1. Lire le modèle de données du handoff (section 3)
2. Créer les fichiers d'entités selon la stack :
   - .NET : Models/*.cs
   - Node : models/*.ts
   - Python : models/*.py
3. Configurer les relations
4. Générer la migration
```

**Validation:**
```bash
# .NET
dotnet ef migrations add Add{{FeatureName}} --project {{PROJECT}}
dotnet ef database update --project {{PROJECT}}

# Node/Prisma
npx prisma migrate dev --name add_{{feature}}

# Node/TypeORM
npm run migration:generate -- Add{{FeatureName}}
npm run migration:run
```

**Critère de succès:** Migration appliquée sans erreur

**Après exécution - Demander validation:**

```
AskUserQuestion({
  questions: [{
    question: "Phase 1 (Data Layer) terminée. La migration s'est-elle appliquée correctement ?",
    header: "Valider P1",
    options: [
      { label: "Oui, passer à Phase 2", description: "Data Layer validé" },
      { label: "Non, il y a des erreurs", description: "Corriger avant de continuer" },
      { label: "Arrêter ici", description: "Ne pas continuer avec les autres phases" }
    ],
    multiSelect: false
  }]
})
```

---

### Phase 2: API LAYER

**Pré-requis:** Phase 1 validée

**Scope:**
- Créer les Controllers/Routes
- Implémenter les Services
- Créer les DTOs (Request/Response)
- Ajouter les validations
- Configurer l'authentification/autorisation

**Actions:**

```
1. Lire les endpoints du handoff (section 4)
2. Créer les fichiers selon la stack :
   - .NET : Controllers/*Controller.cs, Services/*Service.cs
   - Node : routes/*.ts, services/*.ts
   - Python : routes/*.py, services/*.py
3. Implémenter chaque endpoint
4. Ajouter les validations
```

**Validation:**
```bash
# Lancer l'API et tester via Swagger/Postman
# Vérifier que tous les endpoints répondent correctement
```

**Critère de succès:** Tous les endpoints testables via Swagger/Postman

**Après exécution - Demander validation:**

```
AskUserQuestion({
  questions: [{
    question: "Phase 2 (API Layer) terminée. Tous les endpoints fonctionnent-ils correctement ?",
    header: "Valider P2",
    options: [
      { label: "Oui, passer à Phase 3", description: "API Layer validé" },
      { label: "Non, il y a des erreurs", description: "Corriger avant de continuer" },
      { label: "Arrêter ici", description: "Ne pas continuer avec les autres phases" }
    ],
    multiSelect: false
  }]
})
```

---

### Phase 3: UI LAYER

**Pré-requis:** Phase 2 validée

**Scope:**
- Créer les pages/composants
- Implémenter le state management
- Créer les formulaires avec validations
- Intégrer les appels API
- Ajouter les messages/notifications

**Actions:**

```
1. Lire les wireframes du handoff (section 5)
2. Créer les composants selon la stack :
   - React : components/*.tsx, pages/*.tsx
   - Angular : *.component.ts
   - Vue : *.vue
   - Blazor : *.razor
3. Implémenter les formulaires
4. Connecter à l'API
```

**Validation:**
```bash
# Lancer les tests E2E
npm run test:e2e
# Ou
dotnet test --filter Category=E2E
```

**Critère de succès:** Scénarios Gherkin passent en E2E

**Après exécution - Demander validation:**

```
AskUserQuestion({
  questions: [{
    question: "Phase 3 (UI Layer) terminée. L'interface fonctionne-t-elle correctement ?",
    header: "Valider P3",
    options: [
      { label: "Oui, passer à Phase 4", description: "UI Layer validé" },
      { label: "Non, il y a des erreurs", description: "Corriger avant de continuer" },
      { label: "Arrêter ici", description: "Ne pas continuer avec l'intégration" }
    ],
    multiSelect: false
  }]
})
```

---

### Phase 4: INTÉGRATION

**Pré-requis:** Phases 1, 2, 3 validées

**Scope:**
- Vérifier le wiring complet front ↔ back
- Exécuter la suite de tests complète
- Optimiser les performances si nécessaire
- Finaliser la documentation technique

**Actions:**

```
1. Tests E2E complets
2. Vérification des permissions
3. Test de charge (si applicable)
4. Documentation technique
```

**Validation:**
```bash
# Suite complète
npm run test
npm run test:e2e
npm run lint

# Ou .NET
dotnet test
dotnet build --configuration Release
```

**Critère de succès:** UAT (User Acceptance Testing) OK

**Après exécution - Confirmation finale:**

```
AskUserQuestion({
  questions: [{
    question: "Phase 4 (Intégration) terminée. La feature est-elle prête pour la livraison ?",
    header: "Valider P4",
    options: [
      { label: "Oui, feature complète", description: "Prêt pour merge/PR" },
      { label: "Non, corrections nécessaires", description: "Retouches à faire" }
    ],
    multiSelect: false
  }]
})
```

---

## Résumé de fin

```
IMPLÉMENTATION TERMINÉE
═══════════════════════════════════════════════════════════
Feature:     {{FEAT-XXX}} - {{NAME}}
═══════════════════════════════════════════════════════════
Phases exécutées:
  • Phase 1 - Data Layer:    ✅ Validé
  • Phase 2 - API Layer:     ✅ Validé
  • Phase 3 - UI Layer:      ✅ Validé
  • Phase 4 - Intégration:   ✅ Validé
═══════════════════════════════════════════════════════════
Fichiers créés:
  • Entités:     {{X}} fichiers
  • Migrations:  {{Y}} fichiers
  • Endpoints:   {{Z}} fichiers
  • Composants:  {{W}} fichiers
  • Tests:       {{N}} fichiers
═══════════════════════════════════════════════════════════

PROCHAINES ÉTAPES:
  1. Créer une PR: /gitflow:7-pull-request
  2. Ou commiter: /gitflow:3-commit
═══════════════════════════════════════════════════════════
```

---

## Modes d'utilisation

| Commande | Action |
|----------|--------|
| `/business-analyse:7-dev FEAT-001` | Affiche le plan et demande quelle phase |
| `/business-analyse:7-dev FEAT-001 data` | Demande confirmation puis exécute Phase 1 |
| `/business-analyse:7-dev FEAT-001 api` | Demande confirmation puis exécute Phase 2 |
| `/business-analyse:7-dev FEAT-001 ui` | Demande confirmation puis exécute Phase 3 |
| `/business-analyse:7-dev FEAT-001 integration` | Demande confirmation puis exécute Phase 4 |
| `/business-analyse:7-dev FEAT-001 all` | Exécute toutes les phases avec validation entre chaque |

---

## Règles

1. **Validation obligatoire** - JAMAIS d'exécution automatique
2. **Double confirmation** - Afficher plan + confirmer avant action
3. **Phase par phase** - Valider chaque phase avant la suivante
4. **Rollback possible** - L'utilisateur peut arrêter à tout moment
5. **Contexte FRD** - Toujours se baser sur les specs du handoff
6. **Tests après chaque phase** - Validation par tests automatisés
7. **Stack-agnostic** - S'adapter à la stack détectée du projet
