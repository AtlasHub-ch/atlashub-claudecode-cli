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
| 5 | `/business-analyse:validate` | User validation gate | `validation.json` |
| 6 | `/business-analyse:handoff` | Development prompt (ultrathink) | `4-development-handoff.md` |
| 7 | `/business-analyse:document` | User-readable documentation (post-handoff) | Glossary, Dictionary, Diagrams |
| + | `/business-analyse:bug` | Bug documentation | `tracking/bugs/BUG-XXX.md` |
| ⚡ | `/business-analyse:hotfix` | Urgent fix (lightweight template) | `tracking/bugs/{{BUG-ID}}.md` |
| 🔄 | `/business-analyse:change-request` | Formal spec change during dev | `tracking/changes/CR-XXX.md` |

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
│                       ├── validation.json
│                       └── tracking/
│                           ├── changes/
│                           │   └── CR-FEAT-XXX-001.md
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

## Feature ID Standards

```
╔══════════════════════════════════════════════════════════════════════════╗
║  FEATURE ID FORMAT: FEAT-XXX (where XXX is 3-digit number)               ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Format:    FEAT-001, FEAT-002, ..., FEAT-999                            ║
║  Regex:     ^FEAT-\d{3}$                                                 ║
║                                                                          ║
║  RELATED IDs:                                                            ║
║  • Business Rules:  BR-XXX       (e.g., BR-001)                          ║
║  • Functional Reqs: FR-XXX       (e.g., FR-001)                          ║
║  • Bugs:            BUG-XXX      (e.g., BUG-001)                         ║
║  • Change Requests: CR-FEAT-XXX-N (e.g., CR-FEAT-001-001)                ║
║                                                                          ║
║  VALIDATION: Each command validates ID format before proceeding.         ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Document Versioning

```
╔══════════════════════════════════════════════════════════════════════════╗
║  SPECIFICATION VERSIONING: Track changes to documents                    ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  VERSION FORMAT: Major.Minor (e.g., 1.0, 1.1, 2.0)                       ║
║                                                                          ║
║  Major version (X.0):                                                    ║
║  • Significant scope change                                              ║
║  • Major revision after validation rejection                             ║
║  • Breaking changes to previously approved specs                         ║
║                                                                          ║
║  Minor version (X.Y):                                                    ║
║  • Clarifications, typo fixes                                            ║
║  • Minor additions within scope                                          ║
║  • Change request implementations                                        ║
║                                                                          ║
║  VERSION HISTORY: Each document maintains a changelog                    ║
║  LOCKED AT HANDOFF: Version is locked when handoff is generated          ║
║  POST-HANDOFF CHANGES: Require Change Request (CR) process               ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## ULTRATHINK Mode Definition

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ULTRATHINK: Deep Thinking Mode for Complex Analysis                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ULTRATHINK is a BEHAVIORAL MODE, not a tool or skill to invoke.         ║
║                                                                          ║
║  WHEN TO USE:                                                            ║
║  Phases marked with (ultrathink): discover, analyse, specify, handoff    ║
║                                                                          ║
║  HOW IT WORKS:                                                           ║
║  Claude activates extended thinking to:                                  ║
║  • Consider all edge cases before responding                             ║
║  • Challenge assumptions aggressively                                    ║
║  • Generate comprehensive outputs                                        ║
║  • Validate completeness before outputting                               ║
║                                                                          ║
║  MODEL REQUIREMENT:                                                      ║
║  ULTRATHINK phases require OPUS model for best results.                  ║
║  Other models may produce less thorough analysis.                        ║
║                                                                          ║
║  NOT A SKILL INVOCATION:                                                 ║
║  Do NOT call Skill("ultrathink"). It is a behavioral instruction.        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Golden Rules

1. **NEVER code** - BA produces specs, not code. NO C#, JS, SQL, Razor in any document.
2. **ULTRATHINK mandatory** - Phases 2, 3, 4, 6 use deep thinking
3. **Structure respected** - Application > Module > Feature
4. **Traceability** - Each requirement has a unique ID
5. **User validation** - Phase 5 MUST be approved before handoff
6. **NOK → Revise** - Rejected specs return to ANALYSE phase
7. **Maintained glossary** - Business terms documented
8. **Optimized prompts** - Handoff ready for one-shot implementation
9. **Tables over code** - Use attribute tables, not class definitions
10. **Explore-First** - Handoff instructs developer to explore existing patterns

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
