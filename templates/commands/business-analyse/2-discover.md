---
description: Phase 2 - Découverte et élicitation des besoins (ULTRATHINK)
---

# Business Analyse - Discover

Expert BA senior en élicitation. Mode ULTRATHINK obligatoire.

## Arguments

```
/business-analyse:discover [module] "description du besoin"
```

- `module` : Nom du module concerné
- `description` : Description initiale du besoin

## Pré-requis

```bash
# Vérifier l'initialisation
test -f .business-analyse/config.json || echo "Exécuter /business-analyse:init d'abord"
```

## Mode ULTRATHINK

**IMPORTANT** : Cette phase utilise le skill `ultrathink` pour une réflexion approfondie.

```
Skill(skill="ultrathink", args="Élicitation complète du besoin métier")
```

Approche à adopter :
- Questionner chaque hypothèse
- Chercher les contradictions
- Identifier les non-dits
- Explorer les cas limites
- Valider les priorités

## Workflow

### Étape 1 : Contexte initial

Lire le contexte projet :

```bash
cat .business-analyse/config.json
cat .business-analyse/applications/*/context.md
```

### Étape 2 : Évaluation de la complexité

**AVANT de poser des questions, évaluer la complexité de la feature.**

```
AskUserQuestion({
  questions: [
    {
      question: "Quelle est la nature de cette fonctionnalité ?",
      header: "Type",
      options: [
        { label: "CRUD simple", description: "Création/Lecture/Modification/Suppression basique d'une entité" },
        { label: "Fonctionnalité standard", description: "Logique métier modérée, quelques règles" },
        { label: "Fonctionnalité complexe", description: "Règles métier complexes, workflows, intégrations" },
        { label: "Fonctionnalité critique", description: "Sécurité, finance, légal, données sensibles" }
      ],
      multiSelect: false
    }
  ]
})
```

### Étape 3 : Questions adaptatives selon la complexité

**Le nombre de questions dépend de la complexité :**

| Complexité | Questions | Domaines prioritaires |
|------------|-----------|----------------------|
| CRUD simple | 6-8 | Contexte, Données, Permissions |
| Standard | 12-15 | + Règles métier, UI |
| Complexe | 20-25 | + Edge cases, Intégrations |
| Critique | 30+ | Tous les domaines |

### Questions ESSENTIELLES (toujours posées - 6 questions)

Ces questions sont **OBLIGATOIRES** quelle que soit la complexité :

1. **Quel problème** résout cette fonctionnalité ? (1 phrase)
2. **Qui** l'utilise ? (rôles principaux)
3. **Quelles données** sont manipulées ? (entités CRUD)
4. **Quelles permissions** ? (qui peut faire quoi)
5. **Scope** : qu'est-ce qui est IN et OUT ?
6. **Y a-t-il des règles métier** spécifiques ?

### Questions CONDITIONNELLES (selon complexité et contexte)

#### Si complexité >= Standard, ajouter :

7. Quel est le **flux principal** ? (happy path)
8. Y a-t-il des **validations** particulières ?
9. Quels **messages** afficher (succès/erreur) ?
10. Y a-t-il un **audit trail** requis ?

#### Si complexité >= Complexe, ajouter :

11. Quelles **intégrations** avec d'autres systèmes ?
12. Que se passe-t-il en cas de **concurrence** (2 users) ?
13. Quelle **volumétrie** attendue ?
14. Y a-t-il des **flux alternatifs** ?
15. Quels **edge cases** anticiper ?

#### Si complexité = Critique, ajouter :

16. Y a-t-il des **données sensibles** (RGPD) ?
17. Quelles **contraintes légales** ?
18. Quel niveau de **performance** requis ?
19. Y a-t-il des **opérations irréversibles** ?
20. Comment **rollback** en cas de problème ?

#### Questions OPTIONNELLES (proposer d'approfondir)

Après les questions obligatoires, proposer :

```
AskUserQuestion({
  questions: [
    {
      question: "Voulez-vous approfondir certains aspects ?",
      header: "Détails",
      options: [
        { label: "Non, c'est suffisant", description: "Passer à la synthèse" },
        { label: "Évolution future", description: "Comment ça va évoluer ?" },
        { label: "Cas limites", description: "Edge cases et erreurs" },
        { label: "Performance", description: "Volumétrie, SLAs" }
      ],
      multiSelect: true
    }
  ]
})
```

### Étape 4 : Création structure feature

Incrémenter le compteur et créer la structure :

```
FEAT-{NNN}-{slug}
```

```bash
mkdir -p ".business-analyse/applications/<app>/modules/<module>/features/FEAT-XXX-<slug>/tracking/bugs"
```

### Étape 5 : Synthèse critique

Après les réponses, produire une analyse critique :

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ANALYSE CRITIQUE - ÉLICITATION                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  POINTS DE VIGILANCE                                                     ║
║  ────────────────────                                                    ║
║  • <point_1>                                                             ║
║  • <point_2>                                                             ║
║                                                                          ║
║  HYPOTHÈSES IDENTIFIÉES                                                  ║
║  ──────────────────────                                                  ║
║  • <hypothèse_1> → À VALIDER avec <qui>                                  ║
║  • <hypothèse_2> → À VALIDER avec <qui>                                  ║
║                                                                          ║
║  ALTERNATIVES POSSIBLES                                                  ║
║  ──────────────────────                                                  ║
║  1. <alternative_1>                                                      ║
║     ✓ Avantage: ...                                                      ║
║     ✗ Inconvénient: ...                                                  ║
║                                                                          ║
║  RISQUES IDENTIFIÉS                                                      ║
║  ─────────────────                                                       ║
║  • <risque> (Impact: HAUT/MOYEN/BAS)                                     ║
║    → Mitigation: <solution>                                              ║
║                                                                          ║
║  QUESTIONS BLOQUANTES                                                    ║
║  ────────────────────                                                    ║
║  ❓ <question_décisive_1>                                                 ║
║  ❓ <question_décisive_2>                                                 ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Étape 6 : Génération du document Discovery

Créer `1-discovery.md` dans le dossier feature :

```markdown
# Discovery - {{FEATURE_NAME}}

**ID**: {{FEAT-XXX}}
**Module**: {{MODULE}}
**Date**: {{DATE}}
**Status**: Draft
**BA**: Claude (Business Analyse)

---

## Résumé Exécutif

{{RESUME_2_3_PHRASES}}

---

## Contexte Stratégique

### Problème Adressé
{{PROBLEME}}

### Déclencheur
{{TRIGGER}}

### Valeur Business
{{VALEUR}}

### Métriques de Succès
| KPI | Cible | Méthode de mesure |
|-----|-------|-------------------|
| {{KPI}} | {{CIBLE}} | {{METHODE}} |

### Priorité
{{PRIORITE}} - {{JUSTIFICATION}}

---

## Utilisateurs

### Personas Principaux
| Persona | Rôle | Contexte d'usage | Fréquence |
|---------|------|------------------|-----------|
| {{PERSONA}} | {{ROLE}} | {{CONTEXTE}} | {{FREQ}} |

### Besoins et Frustrations
{{BESOINS}}

---

## Scope

### Inclus
- {{IN_SCOPE_1}}
- {{IN_SCOPE_2}}

### Exclus
- {{OUT_SCOPE_1}}
- {{OUT_SCOPE_2}}

### Contraintes
- Techniques: {{CONTRAINTES_TECH}}
- Légales: {{CONTRAINTES_LEGAL}}
- Temps: {{CONTRAINTES_TEMPS}}

### Dépendances
| Dépendance | Type | Impact |
|------------|------|--------|
| {{DEP}} | {{TYPE}} | {{IMPACT}} |

---

## Données

### Entités Concernées
{{ENTITES}}

### Volumétrie
| Métrique | Actuel | 1 an | 3 ans |
|----------|--------|------|-------|
| {{METRIQUE}} | {{ACTUEL}} | {{1AN}} | {{3ANS}} |

### Sensibilité
{{DONNEES_SENSIBLES}}

---

## Flux Métier

### Happy Path
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

### Flux Alternatifs
{{FLUX_ALT}}

---

## Règles Métier

| ID | Règle | Condition | Action |
|----|-------|-----------|--------|
| RM-001 | {{REGLE}} | {{CONDITION}} | {{ACTION}} |

---

## Sécurité

### Permissions
| Rôle | Accès |
|------|-------|
| {{ROLE}} | {{ACCES}} |

### Audit
{{AUDIT_REQUIS}}

---

## Risques

| ID | Risque | Probabilité | Impact | Mitigation |
|----|--------|-------------|--------|------------|
| R-001 | {{RISQUE}} | {{PROBA}} | {{IMPACT}} | {{MITIGATION}} |

---

## Questions Ouvertes

- [ ] {{QUESTION_1}}
- [ ] {{QUESTION_2}}

---

## Prochaines Étapes

1. Valider avec {{STAKEHOLDER}}
2. Exécuter `/business-analyse:analyse {{FEAT-XXX}}`

---

*Généré par Business Analyse - {{DATE}}*
```

### Résumé

```
DISCOVERY COMPLÈTE
═══════════════════════════════════════════════════════════
Feature:     {{FEAT-XXX}} - {{NAME}}
Module:      {{MODULE}}
Complexité:  {{FAIBLE|MOYENNE|HAUTE}}
═══════════════════════════════════════════════════════════
Questions:   44/44 posées
Risques:     {{X}} identifiés
Questions ouvertes: {{Y}}
═══════════════════════════════════════════════════════════
Document: .business-analyse/.../{{FEAT-XXX}}/1-discovery.md
═══════════════════════════════════════════════════════════
Prochain: /business-analyse:analyse {{FEAT-XXX}}
```

## Règles

1. **ULTRATHINK obligatoire** - Réflexion profonde sur chaque réponse
2. **Toutes les questions** - Ne pas sauter de questions
3. **Pas de réponses vagues** - Reformuler jusqu'à obtenir une réponse claire
4. **Synthèse critique** - Challenger les réponses
5. **Aucun code** - Ce document est purement métier
