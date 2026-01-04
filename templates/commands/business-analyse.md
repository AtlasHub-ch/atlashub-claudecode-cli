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

| Phase | Command | Model | Description | Output |
|-------|----------|-------|-------------|--------|
| 1 | `/business-analyse:1-init` | haiku | Initialize project structure + code scan | `config.json`, structure |
| 2 | `/business-analyse:2-discover` | **opus** | Requirements elicitation (ultrathink) | `1-discovery.md` |
| 3 | `/business-analyse:3-analyse` | sonnet | Business analysis BRD + doc scan (ultrathink) | `2-business-requirements.md` |
| 4 | `/business-analyse:4-specify` | sonnet | Functional specifications FRD (ultrathink) | `3-functional-specification.md` |
| 5 | `/business-analyse:5-validate` | haiku | User validation gate | `validation.json` |
| 6 | `/business-analyse:6-handoff` | **opus** | Development prompt (ultrathink) | `4-development-handoff.md` |
| → | **`/implement FEAT-XXX`** | **opus** | **Implement from handoff (skip explore)** | Code files |
| 7 | `/business-analyse:7-document` | haiku | User-readable documentation (post-handoff) | Glossary, Dictionary, Diagrams |
| + | `/business-analyse:bug` | sonnet | Bug documentation | `tracking/bugs/BUG-XXX.md` |
| ⚡ | `/business-analyse:9-hotfix` | haiku | Urgent fix (lightweight template) | `tracking/bugs/{{BUG-ID}}.md` |
| 🔄 | `/business-analyse:10-change-request` | sonnet | Formal spec change during dev | `tracking/changes/CR-XXX.md` |

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

## Model Strategy

```
╔══════════════════════════════════════════════════════════════════════════╗
║  MODEL REQUIREMENTS: Quality First, Then Cost Optimization               ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  OPUS (Critical phases - deep reasoning required):                       ║
║  • 2-discover: Exhaustive elicitation, challenge assumptions             ║
║  • 6-handoff: One-shot prompt generation, zero ambiguity                 ║
║  • /implement: Production code generation                                ║
║                                                                          ║
║  SONNET (Analysis phases - balanced reasoning):                          ║
║  • 3-analyse: Business modeling, process documentation                   ║
║  • 4-specify: Technical specifications, edge cases                       ║
║  • 10-change-request: Impact analysis, decision matrix                   ║
║  • bug: Root cause analysis                                              ║
║                                                                          ║
║  HAIKU (Simple phases - template execution):                             ║
║  • 1-init: Structure setup, no decisions                                 ║
║  • 5-validate: Approval gate, yes/no                                     ║
║  • 7-document: Generate from existing specs                              ║
║  • 9-hotfix: Lightweight urgent fix                                      ║
║                                                                          ║
║  PRINCIPLE: Never sacrifice quality for cost savings.                    ║
║  Each model is the MINIMUM capable of delivering quality output.         ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Permission Specifications

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PERMISSIONS IN HANDOFF: Must be EXPLICIT and IMPLEMENTABLE              ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  The 6-handoff includes a dedicated Section 7 for permissions:           ║
║                                                                          ║
║  7.1 [EXPLORE] - Discover existing permission patterns                   ║
║  7.2 Permission Keys - Exact string codes (e.g., "Module.View")          ║
║  7.3 Role-Permission Matrix - Who can do what                            ║
║  7.4 Endpoint-Permission Mapping - API protection                        ║
║  7.5 UI Permission Checks - Button visibility rules                      ║
║  7.6 Implementation Checklist - Step-by-step                             ║
║                                                                          ║
║  MANDATORY in 9-gherkin-scenarios:                                       ║
║  • At least 1 permission denial scenario                                 ║
║  • API 403 response test                                                 ║
║  • UI element visibility test                                            ║
║                                                                          ║
║  "Admin can create" is NOT enough.                                       ║
║  "POST /api/v2/domains requires Domains.Create permission" IS enough.    ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Golden Rules

1. **NEVER code** - BA produces specs, not code. NO C#, JS, SQL, Razor in any document.
2. **ULTRATHINK mandatory** - Phases 2, 3, 4, 6 use deep thinking
3. **Model per phase** - Use correct model (opus/sonnet/haiku) per phase complexity
4. **Structure respected** - Application > Module > Feature
5. **Traceability** - Each requirement has a unique ID
6. **User validation** - Phase 5 MUST be approved before handoff
7. **NOK → Revise** - Rejected specs return to ANALYSE phase
8. **Maintained glossary** - Business terms documented
9. **Optimized prompts** - Handoff ready for one-shot implementation
10. **Tables over code** - Use attribute tables, not class definitions
11. **Explore-First** - Handoff instructs developer to explore existing patterns
12. **Explicit permissions** - Permission keys, endpoint mapping, Gherkin tests mandatory

## Quick Start

```bash
# 1. Initialize project (scans code structure)
/business-analyse:1-init

# 2. New feature - Discovery
/business-analyse:2-discover ModuleX "Need description"

# 3. Analyze (scans existing docs for consistency)
/business-analyse:3-analyse FEAT-001

# 4. Specify functional requirements
/business-analyse:4-specify FEAT-001

# 5. User validates (REQUIRED before handoff)
/business-analyse:5-validate FEAT-001
#    → If NOK: Return to /business-analyse:3-analyse with feedback

# 6. Generate dev prompt (after approval)
/business-analyse:6-handoff FEAT-001

# 7. IMPLEMENT the feature from handoff (RECOMMENDED)
/implement FEAT-001
#    → Reads handoff, discovers patterns, generates code
#    → Skips exploration (already done by BA)
#    → Options: --phase=1|2|3|4 for partial implementation

# 8. Optional: User-readable documentation (after implementation)
/business-analyse:7-document FEAT-001
```

## Post-Implementation Changes

```bash
# If changes needed after implementation:
/business-analyse:10-change-request FEAT-001 "Add preview feature to page X"
#    → Documents change, generates implementation prompt
#    → For small changes: offers immediate implementation
```

## Next

Execute the following command to begin:

```
/business-analyse:1-init
```
