---
description: Business Analyse - Workflow complet d'analyse métier (BABOK/IEEE 830)
---

# Business Analyse - Workflow Expert

Expert Business Analyst senior. Analyse métier complète sans écriture de code.

## Philosophie

```
╔══════════════════════════════════════════════════════════════════════════╗
║  LE BUSINESS ANALYST NE CODE JAMAIS                                      ║
║                                                                          ║
║  Il produit:                                                             ║
║  • Des SPÉCIFICATIONS claires et complètes                               ║
║  • Des DOCUMENTATIONS métier exploitables                                ║
║  • Des PROMPTS de développement optimisés                                ║
║                                                                          ║
║  Il laisse le DÉVELOPPEUR implémenter selon les specs                    ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Workflow en 6 Phases

```
═══════════════════════════════════════════════════════════════════════════════

   INIT          DISCOVER        ANALYSE         SPECIFY        DOCUMENT       HANDOFF
  ┌─────┐       ┌─────────┐     ┌─────────┐     ┌─────────┐    ┌─────────┐    ┌─────────┐
  │Setup│──────►│Éliciter │────►│Modéliser│────►│Spécifier│───►│Documenter│──►│Transmettre│
  └─────┘       └─────────┘     └─────────┘     └─────────┘    └─────────┘    └─────────┘
     │               │               │               │              │              │
     ▼               ▼               ▼               ▼              ▼              ▼
 Structure      Discovery.md      BRD.md         FRD.md       Glossaire      Prompt Dev
 Config         (40+ Q)          Processus      Use Cases    Dictionnaire   Autonome
                                 Règles         Wireframes   Diagrammes

                [ULTRATHINK]    [ULTRATHINK]   [ULTRATHINK]

═══════════════════════════════════════════════════════════════════════════════
```

## Commandes Disponibles

| Phase | Commande | Description | Output |
|-------|----------|-------------|--------|
| 1 | `/business-analyse:init` | Initialisation structure projet | `config.json`, structure |
| 2 | `/business-analyse:discover` | Élicitation besoins (ultrathink) | `1-discovery.md` |
| 3 | `/business-analyse:analyse` | Analyse métier BRD (ultrathink) | `2-business-requirements.md` |
| 4 | `/business-analyse:specify` | Spécifications FRD (ultrathink) | `3-functional-specification.md` |
| 5 | `/business-analyse:document` | Documentation transverse | Glossaire, Dictionnaire |
| 6 | `/business-analyse:handoff` | Prompt développement | `4-development-handoff.md` |
| + | `/business-analyse:bug` | Documentation bug | `tracking/bugs/BUG-XXX.md` |

## Structure des Artefacts

```
.business-analyse/
├── config.json                         # Configuration globale
├── glossary.md                         # Glossaire métier unifié
├── .claudeignore                       # Fichiers ignorés par Claude
│
├── applications/                       # Par application
│   └── {app-name}/
│       ├── context.md                  # Contexte applicatif
│       ├── stakeholders.md             # Parties prenantes
│       └── modules/
│           └── {module-name}/
│               ├── context.md          # Contexte module
│               └── features/
│                   └── {FEAT-XXX-name}/
│                       ├── 1-discovery.md
│                       ├── 2-business-requirements.md
│                       ├── 3-functional-specification.md
│                       ├── 4-development-handoff.md
│                       └── tracking/
│                           ├── changes.md
│                           └── bugs/
│
├── documentation/
│   ├── data-dictionary/
│   ├── process-flows/
│   └── architecture-decisions/
│
└── templates/
    ├── discovery.md
    ├── business-requirements.md
    ├── functional-specification.md
    ├── development-handoff.md
    └── bug-report.md
```

## Standards Appliqués

| Standard | Application |
|----------|-------------|
| **BABOK v3** | 6 Knowledge Areas, techniques d'élicitation |
| **IEEE 830** | Structure SRS, traçabilité des exigences |
| **BRD/FRD** | Séparation besoins métier / spécifications |

## Règles d'Or

1. **JAMAIS de code** - Le BA produit des specs, pas du code
2. **ULTRATHINK obligatoire** - Phases 2, 3, 4 utilisent la réflexion profonde
3. **Structure respectée** - Application > Module > Feature
4. **Traçabilité** - Chaque exigence a un ID unique
5. **Validation 85%** - Checklist de complétude avant handoff
6. **Glossaire maintenu** - Termes métier documentés
7. **Prompts optimisés** - Handoff prêt pour le développeur

## Démarrage Rapide

```bash
# 1. Initialiser le projet
/business-analyse:init

# 2. Nouvelle fonctionnalité
/business-analyse:discover ModuleX "Description du besoin"

# 3. Analyser
/business-analyse:analyse FEAT-001

# 4. Spécifier
/business-analyse:specify FEAT-001

# 5. Documenter
/business-analyse:document FEAT-001

# 6. Transmettre au dev
/business-analyse:handoff FEAT-001
```

## Prochain

Exécutez `/business-analyse:init` pour commencer.
