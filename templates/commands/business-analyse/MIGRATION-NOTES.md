# Notes de Migration - BA → Business Analyse

**Date**: 2026-01-01
**Version**: 2.0.0

---

## Résumé des changements

### Renommage
- `ba` → `business-analyse`
- Toutes les commandes renommées en conséquence

### Nouvelles phases (6 au lieu de 5)

| Ancienne | Nouvelle | Changement |
|----------|----------|------------|
| 1-init | 1-init | Amélioré - structure .business-analyse/ |
| 2-analyse | 2-discover | Renommé - focus élicitation + **ULTRATHINK** |
| - | 3-analyse | **NOUVEAU** - BRD complet + **ULTRATHINK** |
| 3-validate | 4-specify | Renommé - FRD + **ULTRATHINK** |
| ~~4-implement~~ | 5-document | **REMPLACÉ** - Documentation (plus de code!) |
| ~~5-verify~~ | 6-handoff | **REMPLACÉ** - Prompt dev (plus de code!) |
| - | bug | **NOUVEAU** - Documentation bugs |

### Suppression de l'écriture de code

**CRITIQUE**: Les phases 4-implement et 5-verify de l'ancienne version généraient du code.

C'est maintenant **INTERDIT**. Le Business Analyst ne code jamais.

Le nouveau workflow produit :
- Des spécifications (BRD, FRD)
- Des prompts de développement (handoff)
- De la documentation

Le développeur utilise le handoff comme prompt pour implémenter.

### Nouvelle structure de fichiers

```
.business-analyse/                    # Nouveau répertoire racine
├── config.json
├── glossary.md
├── .claudeignore                     # NOUVEAU - fichiers ignorés par Claude
├── applications/
│   └── {app}/
│       └── modules/
│           └── {module}/
│               └── features/
│                   └── {FEAT-XXX}/
│                       ├── 1-discovery.md
│                       ├── 2-business-requirements.md
│                       ├── 3-functional-specification.md
│                       ├── 4-development-handoff.md
│                       └── tracking/
│                           └── bugs/
├── documentation/
└── templates/
```

### Utilisation de ULTRATHINK

Les phases 2, 3 et 4 utilisent maintenant le mode `ultrathink` pour une réflexion approfondie obligatoire.

### Questionnaire d'élicitation

Passage de 16 questions à **44 questions** structurées en 8 domaines (BABOK).

### Standards appliqués

- BABOK v3 (6 Knowledge Areas)
- IEEE 830 (structure SRS)
- BRD/FRD (séparation métier/fonctionnel)

---

## Fichiers archivés

Les anciennes commandes sont conservées dans :
- `.claude/commands/_deprecated/ba-old/`
- `templates/commands/_deprecated/ba-old/`
- `.claude/agents/_deprecated/ba-old/`

---

## Commandes de migration

Si vous avez des analyses existantes dans `.claude/ba/`, vous pouvez les migrer manuellement vers la nouvelle structure `.business-analyse/`.

---

*Migration effectuée le 2026-01-01*
