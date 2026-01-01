---
description: Documentation et spécification de résolution de bug
---

# Business Analyse - Bug

Expert BA senior. Documentation et spécification de résolution de bug.

## Arguments

```
/business-analyse:bug [feature-id] "description du bug"
```

- `feature-id` : Identifiant de la feature concernée (ex: FEAT-001)
- `description` : Description du bug rencontré

## Pré-requis

```bash
# Vérifier que la feature existe
test -d ".business-analyse/applications/*/modules/*/features/$FEATURE_ID" || \
  echo "Feature non trouvée"
```

## Philosophie

```
╔══════════════════════════════════════════════════════════════════════════╗
║  LE BA DOCUMENTE LE BUG, IL NE LE CORRIGE PAS                           ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Le Business Analyst:                                                    ║
║  ✓ Documente le bug (reproduction, impact)                               ║
║  ✓ Analyse la cause probable                                             ║
║  ✓ Spécifie le comportement attendu                                      ║
║  ✓ Met à jour les specs si nécessaire                                    ║
║                                                                          ║
║  Le Développeur:                                                         ║
║  ✓ Implémente la correction                                              ║
║  ✓ Écrit les tests de non-régression                                     ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Workflow

### Étape 1 : Collecte d'informations

Poser les questions pour documenter le bug :

```
AskUserQuestion({
  questions: [
    {
      question: "Quelle est la sévérité du bug ?",
      header: "Sévérité",
      options: [
        { label: "Critique", description: "Bloque l'utilisation, perte de données" },
        { label: "Majeur", description: "Fonctionnalité principale impactée" },
        { label: "Mineur", description: "Fonctionnalité secondaire, contournement possible" },
        { label: "Cosmétique", description: "Affichage, UX, pas d'impact fonctionnel" }
      ],
      multiSelect: false
    },
    {
      question: "Le bug est-il reproductible ?",
      header: "Repro",
      options: [
        { label: "Toujours", description: "100% reproductible" },
        { label: "Souvent", description: "~75% des tentatives" },
        { label: "Parfois", description: "~25% des tentatives" },
        { label: "Rarement", description: "Difficile à reproduire" }
      ],
      multiSelect: false
    }
  ]
})
```

### Étape 2 : Documentation détaillée

Questions à poser à l'utilisateur :

1. **Étapes de reproduction** - Exactement quelles actions mènent au bug ?
2. **Comportement observé** - Que se passe-t-il ?
3. **Comportement attendu** - Que devrait-il se passer ?
4. **Environnement** - Navigateur, OS, version, données ?
5. **Screenshots/Logs** - Preuves visuelles ou techniques ?
6. **Impact utilisateur** - Combien d'utilisateurs affectés ?

### Étape 3 : Analyse de la cause

Identifier la cause probable :

| Type de cause | Description | Exemple |
|---------------|-------------|---------|
| **Spec manquante** | Le cas n'était pas spécifié | Edge case non prévu |
| **Spec ambiguë** | La spec prête à confusion | Interprétation différente |
| **Régression** | Fonctionnait avant, plus maintenant | Effet de bord |
| **Données** | Données invalides ou corrompues | Format inattendu |
| **Technique** | Bug d'implémentation | Code incorrect |
| **Infrastructure** | Environnement/config | Timeout, mémoire |

### Étape 4 : Génération ID bug

Incrémenter le compteur dans config.json :

```
BUG-{NNN}
```

### Étape 5 : Création du rapport de bug

Créer `.business-analyse/.../features/{{FEAT-XXX}}/tracking/bugs/BUG-{{NNN}}.md` :

```markdown
# BUG-{{NNN}} - {{TITRE_COURT}}

## Métadonnées

| Propriété | Valeur |
|-----------|--------|
| **ID** | BUG-{{NNN}} |
| **Feature** | {{FEAT-XXX}} |
| **Sévérité** | {{CRITIQUE/MAJEUR/MINEUR/COSMETIQUE}} |
| **Reproductibilité** | {{TOUJOURS/SOUVENT/PARFOIS/RAREMENT}} |
| **Status** | Ouvert |
| **Date découverte** | {{DATE}} |
| **Rapporté par** | {{USER}} |
| **Assigné à** | Non assigné |

---

## 1. Description

### 1.1 Résumé
{{RESUME_1_PHRASE}}

### 1.2 Comportement observé
{{CE_QUI_SE_PASSE}}

### 1.3 Comportement attendu
{{CE_QUI_DEVRAIT_SE_PASSER}}

---

## 2. Reproduction

### 2.1 Prérequis
- {{PREREQUIS_1}}
- {{PREREQUIS_2}}

### 2.2 Étapes
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}
4. Observer: {{OBSERVATION}}

### 2.3 Environnement
| Propriété | Valeur |
|-----------|--------|
| Navigateur | {{BROWSER}} |
| OS | {{OS}} |
| Version app | {{VERSION}} |
| Données | {{DATA_CONTEXT}} |

---

## 3. Preuves

### 3.1 Screenshots
{{SCREENSHOTS_OU_DESCRIPTIONS}}

### 3.2 Logs
```
{{LOGS_PERTINENTS}}
```

### 3.3 Données de test
{{DONNEES_TEST}}

---

## 4. Analyse

### 4.1 Cause probable
**Type**: {{SPEC_MANQUANTE/SPEC_AMBIGUE/REGRESSION/DONNEES/TECHNIQUE/INFRA}}

{{DESCRIPTION_CAUSE}}

### 4.2 Impact
- **Utilisateurs affectés**: {{NOMBRE/POURCENTAGE}}
- **Fréquence**: {{FREQUENCE}}
- **Contournement possible**: {{OUI/NON}} - {{DESCRIPTION_CONTOURNEMENT}}

### 4.3 Composants impactés
| Composant | Type | Fichier probable |
|-----------|------|------------------|
| {{COMPOSANT}} | {{ENTITE/API/UI}} | {{FICHIER}} |

---

## 5. Spécification de la correction

### 5.1 Comportement correct attendu
{{DESCRIPTION_COMPORTEMENT_CORRECT}}

### 5.2 Règles métier concernées
| ID | Règle | Clarification |
|----|-------|---------------|
| BR-{{XXX}} | {{REGLE}} | {{CLARIFICATION}} |

### 5.3 Critères d'acceptation de la correction

```gherkin
Scenario: Correction BUG-{{NNN}}
  Given {{PRECONDITION}}
  When {{ACTION}}
  Then {{RESULTAT_ATTENDU}}
  And le bug BUG-{{NNN}} ne se reproduit plus
```

### 5.4 Tests de non-régression suggérés
- [ ] {{TEST_1}}
- [ ] {{TEST_2}}

---

## 6. Mise à jour des specs (si nécessaire)

### 6.1 Documents à modifier
| Document | Section | Modification |
|----------|---------|--------------|
| {{FRD}} | {{SECTION}} | {{MODIFICATION}} |

### 6.2 Clarifications ajoutées
{{CLARIFICATIONS_SPECS}}

---

## 7. Historique

| Date | Action | Auteur |
|------|--------|--------|
| {{DATE}} | Bug reporté | {{USER}} |
| {{DATE}} | Analyse BA | Claude BA |

---

## 8. Résolution (à compléter par le dev)

### 8.1 Fix appliqué
_À compléter après correction_

### 8.2 Fichiers modifiés
_À compléter après correction_

### 8.3 Tests ajoutés
_À compléter après correction_

### 8.4 Date de résolution
_À compléter après correction_

---

*Généré par Business Analyse - {{DATE}}*
```

### Étape 6 : Mise à jour des specs (si nécessaire)

Si le bug révèle une spec manquante ou ambiguë :

1. Ouvrir le FRD concerné
2. Ajouter/Clarifier la spécification
3. Incrémenter la version du document
4. Référencer le bug comme source de modification

### Résumé

```
BUG DOCUMENTÉ
═══════════════════════════════════════════════════════════
Bug:         BUG-{{NNN}} - {{TITRE}}
Feature:     {{FEAT-XXX}}
Sévérité:    {{SEVERITE}}
═══════════════════════════════════════════════════════════
Analyse:
  • Cause:            {{TYPE_CAUSE}}
  • Impact:           {{IMPACT}}
  • Contournement:    {{OUI/NON}}

Specs modifiées:      {{OUI/NON}}
═══════════════════════════════════════════════════════════
Document: .../tracking/bugs/BUG-{{NNN}}.md

PROCHAINE ÉTAPE:
  Transmettre au développeur pour correction.
  Utiliser le document comme spec de correction.
═══════════════════════════════════════════════════════════
```

## Règles

1. **Documentation complète** - Toutes les infos pour reproduire
2. **Cause analysée** - Identifier le type de problème
3. **Specs clarifiées** - Mettre à jour si nécessaire
4. **Critères testables** - Gherkin pour valider la correction
5. **Aucun code** - Le BA spécifie, le dev corrige
6. **Traçabilité** - Lien bug → spec → test
