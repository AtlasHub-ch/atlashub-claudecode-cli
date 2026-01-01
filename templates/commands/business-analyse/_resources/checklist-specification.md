# Checklist de Complétude - Spécifications (FRD)

> Seuil de validation : **85% minimum (26/30)**
> Basé sur IEEE 830 et bonnes pratiques FRD

---

## Scoring

| Score | Status | Action |
|-------|--------|--------|
| 90-100% | ✅ Excellent | Prêt pour développement |
| 85-89% | ✅ Acceptable | Prêt avec notes mineures |
| 70-84% | ⚠️ Insuffisant | Compléter avant handoff |
| < 70% | ❌ Incomplet | Retour à l'analyse |

---

## Catégorie 1 : Contexte (4 points)

| # | Critère | Poids | ✓/✗ |
|---|---------|-------|-----|
| 1.1 | Objectif business clairement documenté | 1 | |
| 1.2 | Scope (IN/OUT) explicitement défini | 1 | |
| 1.3 | Stakeholders et rôles identifiés | 1 | |
| 1.4 | Priorité établie (MoSCoW) | 1 | |

**Sous-total**: _/4

---

## Catégorie 2 : Cas d'Utilisation (6 points)

| # | Critère | Poids | ✓/✗ |
|---|---------|-------|-----|
| 2.1 | Happy path complet (toutes les étapes) | 1 | |
| 2.2 | Extensions/flux alternatifs documentés | 1 | |
| 2.3 | Préconditions définies | 1 | |
| 2.4 | Postconditions (succès/échec) définies | 1 | |
| 2.5 | Acteurs clairement identifiés | 1 | |
| 2.6 | Règles métier liées aux UC | 1 | |

**Sous-total**: _/6

---

## Catégorie 3 : Interface Utilisateur (6 points)

| # | Critère | Poids | ✓/✗ |
|---|---------|-------|-----|
| 3.1 | Wireframes/maquettes présents | 1 | |
| 3.2 | URLs/routes définies | 1 | |
| 3.3 | Rôles autorisés par écran | 1 | |
| 3.4 | Éléments interactifs documentés | 1 | |
| 3.5 | Messages (succès/erreur) spécifiés | 1 | |
| 3.6 | Validations front-end définies | 1 | |

**Sous-total**: _/6

---

## Catégorie 4 : Données (5 points)

| # | Critère | Poids | ✓/✗ |
|---|---------|-------|-----|
| 4.1 | Tous les champs spécifiés | 1 | |
| 4.2 | Types de données définis | 1 | |
| 4.3 | Règles de validation par champ | 1 | |
| 4.4 | Valeurs par défaut spécifiées | 1 | |
| 4.5 | Obligatoire/optionnel indiqué | 1 | |

**Sous-total**: _/5

---

## Catégorie 5 : API (5 points)

| # | Critère | Poids | ✓/✗ |
|---|---------|-------|-----|
| 5.1 | Tous les endpoints documentés | 1 | |
| 5.2 | Request/Response formats définis | 1 | |
| 5.3 | Codes d'erreur HTTP spécifiés | 1 | |
| 5.4 | Authentification/Autorisation définie | 1 | |
| 5.5 | Validations back-end documentées | 1 | |

**Sous-total**: _/5

---

## Catégorie 6 : Tests (4 points)

| # | Critère | Poids | ✓/✗ |
|---|---------|-------|-----|
| 6.1 | Critères d'acceptation définis | 1 | |
| 6.2 | Scénarios Gherkin écrits | 1 | |
| 6.3 | Cas nominaux couverts | 1 | |
| 6.4 | Cas d'erreur couverts | 1 | |

**Sous-total**: _/4

---

## Récapitulatif

| Catégorie | Score | Max |
|-----------|-------|-----|
| Contexte | | 4 |
| Cas d'Utilisation | | 6 |
| Interface | | 6 |
| Données | | 5 |
| API | | 5 |
| Tests | | 4 |
| **TOTAL** | | **30** |

**Pourcentage**: _%

**Status**: ✅ Validé / ⚠️ Insuffisant / ❌ Incomplet

---

## Points à compléter

Si score < 85%, lister les points manquants :

| # | Critère manquant | Priorité | Action |
|---|-----------------|----------|--------|
| | | | |

---

## Notes

_Observations du BA :_

---

*Checklist basée sur IEEE 830 et BABOK v3*
