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

## 7-Phase Workflow

```
════════════════════════════════════════════════════════════════════════════════════════════

   INIT       DISCOVER      ANALYSE       SPECIFY      VALIDATE      HANDOFF      DOCUMENT
  ┌─────┐    ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌────────┐   ┌─────────┐  ┌─────────┐
  │Setup│───►│Elicit   │──►│Model    │──►│Specify  │──►│Approve │──►│Prompt   │─►│User Doc │
  └─────┘    └─────────┘   └─────────┘   └─────────┘   └────────┘   └─────────┘  └─────────┘
     │            │             │             │             │             │            │
     ▼            ▼             ▼             ▼             ▼             ▼            ▼
 Structure   Discovery.md   BRD.md        FRD.md       Approval     Dev Prompt   Glossary
 Config      (40+ Q)        Process       Use Cases     Gate        Autonomous   Dictionary
 Code Scan                  Rules         Wireframes    ↓ NOK                    Diagrams
                            Doc Scan                    → ANALYSE
                                                        (revise)

             [ULTRATHINK]  [ULTRATHINK]  [ULTRATHINK]              [ULTRATHINK]

════════════════════════════════════════════════════════════════════════════════════════════
```

## Available Commands

| Phase | Command | Description | Output |
|-------|----------|-------------|--------|
| 1 | `/business-analyse:init` | Initialize project structure + code scan | `config.json`, structure |
| 2 | `/business-analyse:discover` | Requirements elicitation (ultrathink) | `1-discovery.md` |
| 3 | `/business-analyse:analyse` | Business analysis BRD + doc scan (ultrathink) | `2-business-requirements.md` |
| 4 | `/business-analyse:specify` | Functional specifications FRD (ultrathink) | `3-functional-specification.md` |
| 5 | `/business-analyse:validate` | User validation gate | `validation-status.json` |
| 6 | `/business-analyse:handoff` | Development prompt (ultrathink) | `4-development-handoff.md` |
| 7 | `/business-analyse:document` | User-readable documentation (post-handoff) | Glossary, Dictionary, Diagrams |
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
2. **ULTRATHINK mandatory** - Phases 2, 3, 4, 6 use deep thinking
3. **Structure respected** - Application > Module > Feature
4. **Traceability** - Each requirement has a unique ID
5. **User validation** - Phase 5 MUST be approved before handoff
6. **NOK → Revise** - Rejected specs return to ANALYSE phase
7. **Maintained glossary** - Business terms documented
8. **Optimized prompts** - Handoff ready for one-shot implementation

## Quick Start

```bash
# 1. Initialize project (scans code structure)
/business-analyse:init

# 2. New feature - Discovery
/business-analyse:discover ModuleX "Need description"

# 3. Analyze (scans existing docs for consistency)
/business-analyse:analyse FEAT-001

# 4. Specify functional requirements
/business-analyse:specify FEAT-001

# 5. User validates (REQUIRED before handoff)
/business-analyse:validate FEAT-001
#    → If NOK: Return to /business-analyse:analyse with feedback

# 6. Generate dev prompt (after approval)
/business-analyse:handoff FEAT-001

# 7. Optional: User-readable documentation (after implementation)
/business-analyse:document FEAT-001
```

## Next

Execute the following command to begin:

```
/business-analyse:init
```
