---
description: Business Analysis - Complete business analysis workflow (BABOK/IEEE 830)
---

# Business Analysis - Expert Workflow

Senior Business Analyst expert. Complete business analysis without writing code.

## Philosophy

```
╔══════════════════════════════════════════════════════════════════════════╗
║  THE BUSINESS ANALYST NEVER CODES                                        ║
║                                                                          ║
║  They produce:                                                           ║
║  • Clear and complete SPECIFICATIONS                                     ║
║  • Actionable business DOCUMENTATION                                     ║
║  • Optimized development PROMPTS                                         ║
║                                                                          ║
║  They let the DEVELOPER implement according to specs                     ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## 6-Phase Workflow

```
═══════════════════════════════════════════════════════════════════════════════

   INIT          DISCOVER        ANALYSE         SPECIFY        DOCUMENT       HANDOFF
  ┌─────┐       ┌─────────┐     ┌─────────┐     ┌─────────┐    ┌─────────┐    ┌─────────┐
  │Setup│──────►│Elicit   │────►│Model    │────►│Specify  │───►│Document │──►│Handoff  │
  └─────┘       └─────────┘     └─────────┘     └─────────┘    └─────────┘    └─────────┘
     │               │               │               │              │              │
     ▼               ▼               ▼               ▼              ▼              ▼
 Structure      Discovery.md      BRD.md         FRD.md       Glossary       Dev Prompt
 Config         (40+ Q)          Process        Use Cases    Dictionary     Autonomous
                                 Rules          Wireframes   Diagrams

                [ULTRATHINK]    [ULTRATHINK]   [ULTRATHINK]

═══════════════════════════════════════════════════════════════════════════════
```

## Available Commands

| Phase | Command | Description | Output |
|-------|----------|-------------|--------|
| 1 | `/business-analyse:init` | Initialize project structure | `config.json`, structure |
| 2 | `/business-analyse:discover` | Requirements elicitation (ultrathink) | `1-discovery.md` |
| 3 | `/business-analyse:analyse` | Business analysis BRD (ultrathink) | `2-business-requirements.md` |
| 4 | `/business-analyse:specify` | Functional specifications FRD (ultrathink) | `3-functional-specification.md` |
| 5 | `/business-analyse:document` | Cross-functional documentation | Glossary, Dictionary |
| 6 | `/business-analyse:handoff` | Development prompt | `4-development-handoff.md` |
| + | `/business-analyse:bug` | Bug documentation | `tracking/bugs/BUG-XXX.md` |

## Artifact Structure

```
.business-analyse/
├── config.json                         # Global configuration
├── glossary.md                         # Unified business glossary
├── .claudeignore                       # Files ignored by Claude
│
├── applications/                       # Per application
│   └── {app-name}/
│       ├── context.md                  # Application context
│       ├── stakeholders.md             # Stakeholders
│       └── modules/
│           └── {module-name}/
│               ├── context.md          # Module context
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

## Applied Standards

| Standard | Application |
|----------|-------------|
| **BABOK v3** | 6 Knowledge Areas, elicitation techniques |
| **IEEE 830** | SRS structure, requirements traceability |
| **BRD/FRD** | Business needs / specifications separation |

## Golden Rules

1. **NEVER code** - BA produces specs, not code
2. **ULTRATHINK mandatory** - Phases 2, 3, 4 use deep thinking
3. **Structure respected** - Application > Module > Feature
4. **Traceability** - Each requirement has a unique ID
5. **85% validation** - Completeness checklist before handoff
6. **Maintained glossary** - Business terms documented
7. **Optimized prompts** - Handoff ready for developer

## Quick Start

```bash
# 1. Initialize project
/business-analyse:init

# 2. New feature
/business-analyse:discover ModuleX "Need description"

# 3. Analyze
/business-analyse:analyse FEAT-001

# 4. Specify
/business-analyse:specify FEAT-001

# 5. Document
/business-analyse:document FEAT-001

# 6. Handoff to dev
/business-analyse:handoff FEAT-001
```

## Next

Execute the following command to begin:

```
/business-analyse:init
```
