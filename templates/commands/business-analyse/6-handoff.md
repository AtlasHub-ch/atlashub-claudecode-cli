---
description: Phase 6 - Development prompt generation (ULTRATHINK)
---

# Business Analyse - Handoff

Senior BA expert. Autonomous development prompt generation. ULTRATHINK mode mandatory.

## ULTRATHINK Mode

**IMPORTANT**: This phase uses deep thinking for generating a complete, autonomous development prompt.

Approach to adopt:
- Ensure EVERY piece of information needed is included
- Validate prompt completeness for ONE-SHOT implementation
- No ambiguity - developer should NEVER need to ask questions
- Optimize for Claude Code best practices
- Generate prompt that can be directly piped to Claude

## Context Loading Order (FOR CLAUDE CODE)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  READING ORDER: Execute in this exact sequence for optimal results       ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  STEP 1: Project Context (BEFORE anything else)                          ║
║  ────────────────────────────────────────────────                        ║
║  • Read CLAUDE.md → Project constraints, conventions, tech stack         ║
║  • Read .gitignore, package.json/*.csproj → Understand project type      ║
║                                                                          ║
║  STEP 2: Feature Specifications (This document)                          ║
║  ───────────────────────────────────────────────                         ║
║  • Read Level 1 (Summary) → Understand scope                             ║
║  • Read Level 2 (Core Specs) → Implementation details                    ║
║  • Reference Level 3 (Appendix) → Only when needed                       ║
║                                                                          ║
║  STEP 3: Explore Existing Patterns (BEFORE writing code)                 ║
║  ────────────────────────────────────────────────────────                ║
║  • Use Glob/Grep to find similar entities, controllers, pages            ║
║  • Identify naming conventions, folder structure                         ║
║  • Match existing patterns in new implementation                         ║
║                                                                          ║
║  STEP 4: Implement (Following specs + patterns)                          ║
║  ───────────────────────────────────────────────                         ║
║  • Data layer first → API → UI → Tests                                   ║
║  • Validate each phase before proceeding                                 ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Why this order matters:**
- CLAUDE.md may contain constraints that affect implementation choices
- Exploring patterns ensures consistency with existing codebase
- Reading specs before exploring prevents bias from existing (possibly bad) patterns

## Template Structure (3 Levels - Progressive Disclosure)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  HANDOFF STRUCTURE: Not all features need all sections                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  LEVEL 1 - EXECUTIVE SUMMARY (Always required, ~1 page)                  ║
║  ────────────────────────────────────────────────────────                ║
║  Quick overview for anyone. Read in 2 minutes.                           ║
║  • Objective (1 sentence)                                                ║
║  • Scope (MUST/SHOULD/WON'T)                                             ║
║  • Entities summary (names only)                                         ║
║  • Endpoints count                                                       ║
║  • Definition of Done checklist                                          ║
║                                                                          ║
║  LEVEL 2 - CORE SPECIFICATIONS (Required for most features)              ║
║  ────────────────────────────────────────────────────────────            ║
║  What Claude/developer needs to implement. Read in 15 minutes.           ║
║  • Data model (entity tables)                                            ║
║  • API endpoints (specs)                                                 ║
║  • UI wireframes                                                         ║
║  • Business rules                                                        ║
║  • Acceptance criteria (Gherkin)                                         ║
║                                                                          ║
║  LEVEL 3 - APPENDIX (Conditional - only if applicable)                   ║
║  ────────────────────────────────────────────────────────────            ║
║  Advanced topics. Reference when needed.                                 ║
║  • NFRs (if performance-critical)                                        ║
║  • GDPR/Privacy (if user data)                                           ║
║  • Rollback strategy (if migration)                                      ║
║  • Success metrics (if business-critical)                                ║
║  • Phased delivery (if complex)                                          ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Section Applicability Matrix

> ⚠️ **NOT ALL SECTIONS ARE REQUIRED FOR ALL FEATURES.** Use this matrix.

| Section | CRUD Simple | Complex Feature | UI-Only Change | API-Only | Hotfix |
|---------|-------------|-----------------|----------------|----------|--------|
| **LEVEL 1 - SUMMARY** |
| Objective | ✓ | ✓ | ✓ | ✓ | ✓ |
| Scope (MoSCoW) | ✓ | ✓ | Optional | Optional | ✗ |
| Definition of Done | ✓ | ✓ | ✓ | ✓ | ✓ |
| **LEVEL 2 - CORE** |
| Data Model | ✓ | ✓ | ✗ | ✓ | If needed |
| API Endpoints | ✓ | ✓ | ✗ | ✓ | If needed |
| UI Wireframes | ✓ | ✓ | ✓ | ✗ | If needed |
| Business Rules | ✓ | ✓ | Optional | ✓ | If needed |
| Gherkin Scenarios | ✓ | ✓ | ✓ | ✓ | 1-2 only |
| **LEVEL 3 - APPENDIX** |
| NFRs | Optional | ✓ | ✗ | ✓ | ✗ |
| GDPR/Privacy | If PII | ✓ | ✗ | If PII | ✗ |
| Rollback Strategy | If migration | ✓ | ✗ | If migration | ✓ |
| Success Metrics | Optional | ✓ | ✗ | Optional | ✗ |
| Feature Dependencies | If exists | ✓ | ✗ | If exists | ✗ |
| Phased Delivery | ✗ | If > 5 entities | ✗ | ✗ | ✗ |
| **Test Strategy (9.7)** | ✓ | ✓ | ✓ | ✓ | ✓ |

**How to use:**
1. Identify your feature type (column)
2. Include only sections marked ✓ or "If [condition]"
3. Skip sections marked ✗ or Optional (unless specifically needed)

## Self-Validation Checklist (Claude fills before output)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  SELF-CHECK: Claude MUST verify before outputting the handoff            ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  CONTENT VALIDATION:                                                     ║
║  [ ] No source code (C#, JS, SQL, Razor) in document                     ║
║  [ ] All {{PLACEHOLDERS}} replaced with actual values                    ║
║  [ ] Entities described with tables, not classes                         ║
║  [ ] All business rules have unique IDs (BR-XXX)                         ║
║                                                                          ║
║  PERMISSIONS (CRITICAL):                                                 ║
║  [ ] Section 7 has explicit permission KEYS (e.g., "Module.View")        ║
║  [ ] Endpoint-Permission mapping table is complete                       ║
║  [ ] UI elements have permission-hide rules                              ║
║  [ ] Explore patterns for existing permission implementation included    ║
║  [ ] At least 1 Gherkin scenario tests permission denial                 ║
║                                                                          ║
║  COMPLETENESS:                                                           ║
║  [ ] At least 5 Gherkin scenarios (2 happy, 1 validation, 1 perm, 1 edge)║
║  [ ] All BR-XXX mapped to test scenarios                                 ║
║  [ ] MoSCoW priorities assigned to all scope items                       ║
║  [ ] Explore-First search patterns included                              ║
║  [ ] Test Strategy section 9.7 completed with test mappings              ║
║                                                                          ║
║  STRUCTURE:                                                              ║
║  [ ] Used Section Applicability Matrix to include only relevant sections ║
║  [ ] Level 1 Summary is < 1 page                                         ║
║  [ ] Document is readable in < 30 minutes                                ║
║                                                                          ║
║  IF ANY CHECK FAILS → FIX BEFORE OUTPUT                                  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Arguments

```
/business-analyse:6-handoff [feature-id]
```

- `feature-id`: Feature identifier (e.g., FEAT-001)

## Prerequisites

```bash
# Verify that FRD exists
test -f ".business-analyse/applications/*/modules/*/features/$ARGUMENTS/3-functional-specification.md" || \
  echo "ERROR: FRD not found. Execute /business-analyse:4-specify $ARGUMENTS first"

# Verify that validation is complete (status must be APPROVED)
grep -q '"status": "approved"' ".business-analyse/applications/*/modules/*/features/$ARGUMENTS/validation.json" || \
  echo "ERROR: FRD not validated. Execute /business-analyse:5-validate $ARGUMENTS first"
```

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PREREQUISITE ERRORS - What to do                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  "FRD not found"                                                         ║
║  → Run: /business-analyse:4-specify {{FEAT-XXX}}                         ║
║                                                                          ║
║  "FRD not validated"                                                     ║
║  → Run: /business-analyse:5-validate {{FEAT-XXX}}                        ║
║  → If previously rejected, run /business-analyse:3-analyse first         ║
║                                                                          ║
║  "Validation rejected"                                                   ║
║  → Review feedback in revision-N.md                                      ║
║  → Run: /business-analyse:3-analyse {{FEAT-XXX}} to address issues       ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Important**: This phase can only be executed after user validation (phase 5). If the FRD was rejected, execute `/business-analyse:3-analyse` to revise based on feedback.

## Handoff Philosophy

```
╔══════════════════════════════════════════════════════════════════════════╗
║  THE HANDOFF IS AN AUTONOMOUS PROMPT                                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  This document MUST contain EVERYTHING a developer needs                 ║
║  to implement the functionality WITHOUT having to consult                ║
║  other documents.                                                        ║
║                                                                          ║
║  It can be used directly as a prompt for Claude Code                    ║
║  or any other development assistant.                                     ║
║                                                                          ║
║  ⚠️  THE BA NEVER CODES - They provide specs, not code                  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Dual Audience: Human Developer & Claude Code

```
╔══════════════════════════════════════════════════════════════════════════╗
║  THIS HANDOFF SERVES TWO AUDIENCES                                       ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  👤 HUMAN DEVELOPER needs:                                               ║
║     • Context and rationale (WHY decisions were made)                    ║
║     • Business background and stakeholder expectations                   ║
║     • Flexibility to make judgment calls                                 ║
║                                                                          ║
║  🤖 CLAUDE CODE needs:                                                   ║
║     • Precise, structured specifications                                 ║
║     • Explicit search patterns (Glob, Grep)                              ║
║     • Clear validation criteria                                          ║
║                                                                          ║
║  SECTIONS MARKED:                                                        ║
║  • [CONTEXT] → For understanding (human-friendly)                        ║
║  • [SPEC] → For implementation (machine-parseable)                       ║
║  • [EXPLORE] → Search instructions (Claude Code actions)                 ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**How to read this document:**

| Marker | Audience | Purpose |
|--------|----------|---------|
| `[CONTEXT]` | Human | Background, rationale, "why" |
| `[SPEC]` | Both | Precise specifications |
| `[EXPLORE]` | Claude | Search patterns, commands |
| `[VALIDATE]` | Both | Verification criteria |

## Language Requirements (CRITICAL)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  LANGUAGE RULES FOR BUSINESS ANALYSE                                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ANALYSIS DOCUMENTS (Discovery, BRD, FRD):                               ║
║  → Written in USER'S LANGUAGE (the language they use)                    ║
║  → These are for stakeholder communication                               ║
║                                                                          ║
║  DEVELOPMENT PROMPT (DEV-PROMPT.md / 4-development-handoff.md):          ║
║  → ALWAYS IN ENGLISH                                                     ║
║  → Optimized for Claude Code consumption                                 ║
║  → Reduces token count (~20-30% savings)                                 ║
║  → Better compatibility with AI models                                   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## One-Shot Implementation Optimization

The generated DEV-PROMPT must enable **ONE-SHOT implementation**:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ONE-SHOT REQUIREMENTS                                                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  The developer (human or AI) should be able to:                          ║
║                                                                          ║
║  1. READ the prompt once                                                 ║
║  2. IMPLEMENT without asking questions                                   ║
║  3. VALIDATE against included acceptance criteria                        ║
║                                                                          ║
║  CHECKLIST before generating:                                            ║
║  ☐ All entities with EXACT attributes and types                          ║
║  ☐ All API endpoints with request/response schemas                       ║
║  ☐ All UI screens with wireframes                                        ║
║  ☐ All business rules with conditions/actions                            ║
║  ☐ All validation rules (front + back)                                   ║
║  ☐ All error messages                                                    ║
║  ☐ Gherkin acceptance criteria for testing                               ║
║  ☐ Implementation order (phases if complex)                              ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Claude Code Best Practices for DEV-PROMPT

The generated prompt should follow Claude Code optimization patterns:

1. **Clear objective statement** at the top
2. **Structured sections** with headers
3. **No code generation** - describe WHAT, not HOW
4. **Explicit constraints** and boundaries
5. **Testable acceptance criteria**
6. **Definition of Done** checklist

## Critical Anti-Pattern: Pre-Written Code

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ⛔ THE #1 MISTAKE: WRITING CODE IN THE HANDOFF                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  The DEV-PROMPT is NOT a copy-paste code guide.                          ║
║  It is an INSTRUCTION PROMPT for Claude Code to implement.               ║
║                                                                          ║
║  WHY NO CODE?                                                            ║
║  • Claude Code has access to the codebase                                ║
║  • Claude can adapt to existing patterns automatically                   ║
║  • Pre-written code may conflict with project architecture               ║
║  • Claude is smarter when given goals, not solutions                     ║
║                                                                          ║
║  THE BA's JOB: Describe WHAT to build                                    ║
║  CLAUDE's JOB: Figure out HOW to build it                                ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### FORBIDDEN in DEV-PROMPT ✗

| Content Type | Why Forbidden | Correct Alternative |
|--------------|---------------|---------------------|
| C#/JS/Python classes | Forces implementation | Attribute tables |
| Controller code | Bypasses existing patterns | Endpoint specifications |
| Razor/React components | Ignores UI framework | ASCII wireframes |
| SQL/Migrations | Database-specific | Entity relationship tables |
| Service implementations | Prevents adaptation | Business rule descriptions |

### ALLOWED in DEV-PROMPT ✓

| Content Type | Purpose | Example |
|--------------|---------|---------|
| Entity attribute tables | Define data structure | `name \| string \| max 100` |
| API endpoint specs | Define contracts | `POST /api/v2/resource` |
| Response structure (fields only) | Show expected shape | `data[]: id, name, status` |
| ASCII wireframes | Visualize UI | Box diagrams |
| Business rules | Define behavior | "BR-001: Name must be unique" |
| Gherkin scenarios | Define acceptance | `Given/When/Then` |
| Implementation tasks | Guide order | `[ ] Create entity X`|

### Right Format for Right Content

```
╔══════════════════════════════════════════════════════════════════════════╗
║  FORMAT SELECTION: Use the right format for the content type             ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  NOT EVERYTHING SHOULD BE A TABLE                                        ║
║                                                                          ║
║  • TABLES: Best for structured, comparable data                          ║
║    → Attributes with types/constraints                                   ║
║    → Endpoints with params/responses                                     ║
║    → Field specifications                                                ║
║                                                                          ║
║  • FLOWCHARTS (Mermaid): Best for sequential processes                   ║
║    → User journeys                                                       ║
║    → State transitions                                                   ║
║    → Decision trees                                                      ║
║                                                                          ║
║  • ER DIAGRAMS (Mermaid): Best for relationships                         ║
║    → Entity relationships                                                ║
║    → Data model overview                                                 ║
║                                                                          ║
║  • PROSE PARAGRAPHS: Best for narrative explanations                     ║
║    → Business context and rationale                                      ║
║    → Edge case descriptions                                              ║
║    → Complex conditional logic                                           ║
║                                                                          ║
║  • ASCII WIREFRAMES: Best for visual layouts                             ║
║    → Page structure                                                      ║
║    → Component placement                                                 ║
║                                                                          ║
║  • BULLET LISTS: Best for enumerations                                   ║
║    → Feature lists                                                       ║
║    → Requirements                                                        ║
║    → Step-by-step instructions                                           ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Format selection guide:**

| Content Type | Best Format | Why | Example |
|--------------|-------------|-----|---------|
| Entity attributes | Table | Comparable structure | `name \| string \| max 100` |
| Entity relationships | ER Diagram | Visual connections | `User --o{ Order : places` |
| User workflow | Flowchart | Sequential flow | `Start → Login → Dashboard` |
| Business rationale | Prose | Needs nuance | "This design was chosen because..." |
| State machine | State diagram | Clear transitions | `Draft → Published → Archived` |
| UI layout | ASCII wireframe | Visual placement | Box diagrams |
| Conditions | Bullet list or table | Easy scanning | `If X then Y` |

### JSON Guidelines

```
╔══════════════════════════════════════════════════════════════════════════╗
║  JSON IN DEV-PROMPT: STRUCTURE ONLY, NO FAKE DATA                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ✓ ALLOWED: Describe structure with field names and types                ║
║    "Response contains: data[] (id, name, status), pagination (page,      ║
║     limit, total)"                                                       ║
║                                                                          ║
║  ✗ FORBIDDEN: Complete JSON with fake values                             ║
║    { "id": "abc-123", "name": "Test Item", "status": "active" }         ║
║                                                                          ║
║  WHY? Fake data can mislead. Field descriptions are clearer.             ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Explore-First Philosophy

```
╔══════════════════════════════════════════════════════════════════════════╗
║  EXPLORE-FIRST: Let Claude Code Adapt to Existing Patterns               ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  The DEV-PROMPT should INSTRUCT Claude to:                               ║
║                                                                          ║
║  1. EXPLORE the existing codebase first                                  ║
║     → Find similar entities, services, components                        ║
║     → Identify naming conventions and patterns                           ║
║                                                                          ║
║  2. ADAPT specifications to existing architecture                        ║
║     → Follow the same folder structure                                   ║
║     → Use the same base classes and interfaces                           ║
║     → Match existing coding style                                        ║
║                                                                          ║
║  3. IMPLEMENT following project conventions                              ║
║     → Respect CLAUDE.md constraints                                      ║
║     → Use established patterns (CQRS, Repository, etc.)                  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Workflow

### Step 1: Information compilation

Load all feature documents:

```bash
cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/1-discovery.md"
cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/2-business-requirements.md"
cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/3-functional-specification.md"
cat .business-analyse/config.json
cat .business-analyse/glossary.md
```

### Step 2: Technical stack analysis

Identify the project stack to adapt the prompt:

| Stack | Adaptations |
|-------|-------------|
| .NET/C# | Entity, DbContext, Controller, Blazor |
| Node.js | Model, Service, Route, React/Vue |
| Python | Model, Service, API, Template |
| Other | Adapt according to conventions |

### Step 3: Development prompt generation

Create `4-development-handoff.md`:

```markdown
# Development Handoff - {{FEATURE_NAME}}

> **This document is an autonomous development prompt.**
> It contains all the information necessary to implement this functionality.

---

## Metadata

| Property | Value |
|----------|-------|
| **Feature ID** | {{FEAT-XXX}} |
| **Module** | {{MODULE}} |
| **Priority** | {{PRIORITY}} |
| **Estimated complexity** | {{LOW/MEDIUM/HIGH}} |
| **Creation date** | {{DATE}} |
| **Specs validated** | {{YES/NO}} ({{SCORE}}%) |

---

## 1. Context

### 1.1 Business objective
{{OBJECTIVE_1_2_SENTENCES}}

### 1.2 Target users
{{USERS_ROLES}}

### 1.3 Value delivered
{{BUSINESS_VALUE}}

---

## 1.5 Implementation philosophy (FOR DEVELOPER/CLAUDE CODE)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  EXPLORE-FIRST APPROACH                                                  ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Before implementing ANY code, you MUST:                                 ║
║                                                                          ║
║  1. READ the project's CLAUDE.md for constraints and patterns            ║
║  2. EXPLORE similar entities/components in the codebase                  ║
║  3. IDENTIFY naming conventions and folder structure                     ║
║  4. ADAPT these specifications to match existing patterns                ║
║                                                                          ║
║  This document describes WHAT to build, not HOW to build it.             ║
║  YOU decide the implementation details based on the codebase.            ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Exploration checklist (MANDATORY before coding):**

| Step | Action | Search Method | What to Learn |
|------|--------|---------------|---------------|
| 1 | Find CLAUDE.md | `Glob("**/CLAUDE.md")` | Project constraints, conventions |
| 2 | Find similar entities | `Grep("class.*Entity")` or `Grep("public class.*Model")` | Base classes, attributes pattern |
| 3 | Find controllers | `Glob("**/*Controller*.cs")` or `Glob("**/controllers/**")` | Routing, response format, DI |
| 4 | Find existing pages | `Glob("**/*.razor")` or `Glob("**/*.tsx")` | Layout, component structure |
| 5 | Find validators | `Grep("Validator")` or `Grep("validation")` | Validation approach |

**Do NOT assume paths like `Models/` or `Services/` exist. SEARCH first.**

```
╔══════════════════════════════════════════════════════════════════════════╗
║  EXPLORE-FIRST: SEARCH, DON'T ASSUME                                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  WRONG: "Look in Models/ folder"                                         ║
║  → Assumes folder exists, may not match project structure                ║
║                                                                          ║
║  CORRECT: "Search for entity patterns: Grep('class.*:.*Entity')"         ║
║  → Works on ANY project, finds actual patterns                           ║
║                                                                          ║
║  The developer/Claude MUST explore the codebase before implementing.     ║
║  Specifications describe WHAT, the codebase shows HOW.                   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 1.6 Project context adaptation

> ⚠️ This handoff is PROJECT-AGNOSTIC. The developer MUST adapt to the actual project.

| Project Type | Adaptation Required |
|--------------|---------------------|
| **Existing codebase** | Explore patterns, match conventions, use existing base classes |
| **Greenfield (new)** | Establish patterns, document decisions in CLAUDE.md |
| **Legacy (no clear patterns)** | Identify best existing code as reference, propose improvements |
| **Non-.NET** | Translate concepts (Entity→Model, Controller→Route, etc.) |

**If CLAUDE.md exists:** Follow its constraints strictly.
**If CLAUDE.md missing:** Create one with discovered patterns after exploration.

### 1.6.1 Explore-First Fallback Patterns

> ⚠️ What to do when searches find NOTHING or CONFLICTING patterns.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  FALLBACK: When exploration yields no clear patterns                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  SCENARIO 1: Greenfield project (no existing code)                       ║
║  → Use recommended defaults below                                        ║
║  → Document chosen patterns in CLAUDE.md                                 ║
║                                                                          ║
║  SCENARIO 2: Legacy code with BAD patterns                               ║
║  → Identify the BEST existing code as reference                          ║
║  → Propose improvements in PR description                                ║
║  → Don't perpetuate anti-patterns                                        ║
║                                                                          ║
║  SCENARIO 3: Conflicting patterns in codebase                            ║
║  → Ask developer/BA which pattern to follow                              ║
║  → Document decision for future reference                                ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Recommended defaults (when no patterns exist):**

| Aspect | .NET Default | Node.js Default | General Default |
|--------|--------------|-----------------|-----------------|
| **Entities** | `Domain/Entities/` | `src/models/` | `domain/` or `models/` |
| **Controllers** | `Controllers/` | `src/routes/` | `api/` or `controllers/` |
| **Services** | `Services/` | `src/services/` | `services/` |
| **DTOs** | `DTOs/` or `Contracts/` | `src/dtos/` | `dtos/` |
| **Validation** | FluentValidation | Joi/Zod | Framework standard |
| **Naming** | PascalCase | camelCase | Language convention |

**Decision tree:**

```
Search found patterns?
├── YES → Follow them exactly
└── NO → Is this greenfield?
    ├── YES → Use defaults above, document in CLAUDE.md
    └── NO → Is existing code quality good?
        ├── YES → Find best example, use as template
        └── NO → Use defaults, note "improving on legacy"
```

---

## 1.7 Design decisions & rationale

> ⚠️ Understanding WHY decisions were made helps the developer make consistent choices.

### Why this solution was chosen

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| {{DECISION_1}} | {{WHY_CHOSEN}} | {{REJECTED_ALTERNATIVES}} |
| {{DECISION_2}} | {{WHY_CHOSEN}} | {{REJECTED_ALTERNATIVES}} |

### Trade-offs accepted

| Trade-off | Benefit | Cost | Why Acceptable |
|-----------|---------|------|----------------|
| {{TRADEOFF_1}} | {{BENEFIT}} | {{COST}} | {{JUSTIFICATION}} |

### Long-term vision

```
This feature is part of a larger goal: {{LONG_TERM_VISION}}

Future considerations:
- {{FUTURE_1}}: May need {{EXTENSION_1}}
- {{FUTURE_2}}: Could evolve into {{EXTENSION_2}}

When implementing, prefer solutions that:
- Align with this vision
- Don't close doors for future extensions
- Follow existing patterns even if specs could be interpreted differently
```

---

## 2. Implementation scope

### 2.1 Scope with MoSCoW prioritization

> ⚠️ If time runs short, implement in priority order: MUST → SHOULD → COULD

```
╔══════════════════════════════════════════════════════════════════════════╗
║  MoSCoW PRIORITIZATION - What to implement first if constrained          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  MUST HAVE (MVP - Non-negotiable)                                        ║
║  ─────────────────────────────────                                       ║
║  Without these, the feature is unusable. Implement FIRST.                ║
║                                                                          ║
║  SHOULD HAVE (Expected - High value)                                     ║
║  ───────────────────────────────────                                     ║
║  Important but feature works without. Implement if time permits.         ║
║                                                                          ║
║  COULD HAVE (Nice to have - Low priority)                                ║
║  ────────────────────────────────────────                                ║
║  Enhancements. Only if all MUST/SHOULD are done.                         ║
║                                                                          ║
║  WON'T HAVE (Out of scope - Explicitly excluded)                         ║
║  ───────────────────────────────────────────────                         ║
║  Not in this iteration. Document to avoid scope creep.                   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

| Priority | Item | Justification |
|----------|------|---------------|
| **MUST** | {{MUST_ITEM_1}} | {{WHY_MUST}} |
| **MUST** | {{MUST_ITEM_2}} | {{WHY_MUST}} |
| **SHOULD** | {{SHOULD_ITEM_1}} | {{WHY_SHOULD}} |
| **SHOULD** | {{SHOULD_ITEM_2}} | {{WHY_SHOULD}} |
| **COULD** | {{COULD_ITEM_1}} | {{WHY_COULD}} |
| **WON'T** | {{WONT_ITEM_1}} | {{WHY_EXCLUDED}} |

### 2.2 Excluded (out of scope)
- {{EXCLUSION_1}}
- {{EXCLUSION_2}}

### 2.3 Dependencies
| Dependency | Type | Status |
|------------|------|--------|
| {{DEP}} | Technical/Data | Resolved/Pending |

### 2.4 Feature Dependencies (Inter-Feature)

> ⚠️ Features rarely exist in isolation. Document relationships with other features.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  FEATURE DEPENDENCIES: Coordination with other features                  ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  BLOCKING: This feature CANNOT start until X is complete                 ║
║  BLOCKED-BY: Feature Y is waiting for this feature                       ║
║  SHARED: Both features use/modify the same entities                      ║
║                                                                          ║
║  Identify dependencies BEFORE implementation to avoid conflicts.         ║
║                                                                          ║
║  ⚠️ VALIDATION: BLOCKING dependencies must be RESOLVED before handoff.  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

| Related Feature | Relationship | Status | Impact | Coordination Needed |
|-----------------|--------------|--------|--------|---------------------|
| {{FEAT-XXX}} | BLOCKING | ✓ Resolved / ⚠️ Pending | {{IMPACT}} | {{ACTION}} |
| {{FEAT-YYY}} | BLOCKED-BY | N/A (other waits for us) | {{IMPACT}} | {{ACTION}} |
| {{FEAT-ZZZ}} | SHARED | ⚠️ Coordinate | {{IMPACT}} | {{ACTION}} |

### Dependency Validation (MANDATORY)

Before generating the handoff, Claude MUST verify:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  DEPENDENCY CHECK: Validate before proceeding                            ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  For each BLOCKING dependency:                                           ║
║  1. Check if blocking feature has completed handoff                      ║
║     → Glob(".../features/{{FEAT-XXX}}/4-development-handoff.md")         ║
║                                                                          ║
║  2. If handoff exists, check validation status                           ║
║     → grep "status.*approved" ".../{{FEAT-XXX}}/validation.json"         ║
║                                                                          ║
║  3. If BLOCKING dependency not resolved:                                 ║
║     → STOP: Cannot generate handoff                                      ║
║     → Output: "BLOCKED: Feature {{FEAT-XXX}} must complete first"        ║
║     → Suggest: Wait or remove dependency                                 ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Dependency status legend:**
- ✓ **Resolved**: Blocking feature is validated and handed off
- ⚠️ **Pending**: Blocking feature not yet complete - CANNOT proceed
- 🔄 **In Progress**: Blocking feature in development - coordinate timing

**Shared entities:**
- `{{EntityName}}`: Modified by both features → Coordinate schema changes

**API contracts:**
- If other features depend on this API, changes require coordination

**Migration order:**
- If features share migrations, define execution order

---

## 3. Data model

> ⚠️ **NO CODE HERE** - Describe entities with tables. Claude Code will create classes following existing patterns.

### 3.1 Entities to create/modify

#### {{ENTITY_NAME}}

| Attribute | Type | Constraints | Default | Business Purpose |
|-----------|------|-------------|---------|------------------|
| Id | int/UUID | PK, auto | - | Unique identifier |
| Name | string | max 100, required, unique | - | Display name |
| Description | string | max 500, optional | null | Detailed description |
| Status | enum | [Active, Inactive, Archived] | Active | Lifecycle state |
| CreatedAt | datetime | auto, immutable | now | Audit trail |
| UpdatedAt | datetime | auto | now | Audit trail |
| CreatedBy | UUID | FK → User | current user | Audit trail |

**Relations:**
- `belongs_to` User (via CreatedBy)
- `has_many` {{RELATED_ENTITY}}

**Indexes needed:**
- Unique on Name
- Composite on (Status, CreatedAt) for filtering

**Developer instructions:**
- Explore existing entities in project (e.g., `Domain.cs`, `Project.cs`)
- Follow the same attribute naming conventions
- Use same base class if applicable
- Apply same validation attributes pattern

#### {{ENTITY_NAME_2}}

_(Same table format)_

### 3.2 ER Diagram

```mermaid
erDiagram
    {{ER_DIAGRAM}}
```

### 3.3 Migration guidance

| Migration | Tables | Order | Notes |
|-----------|--------|-------|-------|
| Add{{FeatureName}} | {{LIST}} | 1 | Create main entities |

**Developer instructions:**
- Use project's migration tool (EF Core, Prisma, etc.)
- Follow existing migration naming convention
- Include seed data if specified in section below

---

## 4. API Endpoints

> ⚠️ **NO CONTROLLER CODE** - Describe endpoints. Claude Code will implement following existing API patterns.

### 4.1 Overview

| Method | Route | Description | Auth | Roles |
|--------|-------|-------------|------|-------|
| GET | /api/v2/{{resource}} | Paginated list | Yes | User, Admin |
| GET | /api/v2/{{resource}}/:id | Detail | Yes | User, Admin |
| POST | /api/v2/{{resource}} | Creation | Yes | Admin |
| PUT | /api/v2/{{resource}}/:id | Modification | Yes | Admin |
| DELETE | /api/v2/{{resource}}/:id | Deletion | Yes | Admin |

### 4.2 Endpoint specifications

#### GET /api/v2/{{resource}} - List

| Aspect | Specification |
|--------|---------------|
| **Description** | Returns paginated list of {{resource}} |
| **Query params** | `page` (int, default 1), `limit` (int, default 20, max 100), `status` (optional), `search` (optional) |
| **Response 200** | Array of {{resource}} with pagination metadata |
| **Business rules** | BR-001: Exclude archived by default, BR-002: Case-insensitive search |

**Response structure:**
- `data[]`: Array of {{resource}} items (id, name, status, createdAt)
- `pagination`: page, limit, total, totalPages

#### POST /api/v2/{{resource}} - Create

| Aspect | Specification |
|--------|---------------|
| **Description** | Creates a new {{resource}} |
| **Request body** | `name` (required, 2-100), `description` (optional, max 500) |
| **Response 201** | Created {{resource}} with id |
| **Validations** | Name unique, length validated |
| **Errors** | 400 (validation), 409 (duplicate name) |

#### PUT /api/v2/{{resource}}/:id - Update

| Aspect | Specification |
|--------|---------------|
| **Description** | Updates existing {{resource}} |
| **Path param** | `id` (required) |
| **Request body** | Same as POST |
| **Response 200** | Updated {{resource}} |
| **Errors** | 400, 404, 409 |

#### DELETE /api/v2/{{resource}}/:id - Delete

| Aspect | Specification |
|--------|---------------|
| **Description** | Soft-deletes (archives) {{resource}} |
| **Path param** | `id` (required) |
| **Response 204** | No content |
| **Errors** | 404 |

**Developer instructions:**
- Explore existing controllers (e.g., `DomainsController.cs`)
- Follow same response wrapper pattern
- Use same validation approach (FluentValidation, DataAnnotations, etc.)
- Apply same error handling pattern

---

## 5. User interface

> ⚠️ **NO COMPONENT CODE** - Use ASCII wireframes only. Claude Code will create components following existing UI patterns.

### 5.1 Pages to create

| Page | URL | Description | Roles |
|------|-----|-------------|-------|
| List | /{{module}}/{{resource}} | List with filters | User, Admin |
| Form | /{{module}}/{{resource}}/new | Creation | Admin |
| Detail | /{{module}}/{{resource}}/:id | Detailed view | User, Admin |
| Edit | /{{module}}/{{resource}}/:id/edit | Modification | Admin |

**Developer instructions:**
- Explore existing pages (e.g., `DomainsList.razor`, `ProjectDetail.razor`)
- Follow same component structure and layout
- Use same CSS classes and styling approach
- Reuse existing shared components

### 5.2 Wireframes

```
╔══════════════════════════════════════════════════════════════════════════╗
║  WIREFRAMES: Reference FRD - Do NOT duplicate here                       ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Full wireframes are in the FRD (3-functional-specification.md):         ║
║  → Used for HUMAN validation (user needs visuals to approve)             ║
║                                                                          ║
║  This handoff provides IMPLEMENTATION NOTES only:                        ║
║  → Claude Code understands declarative specs, doesn't need ASCII art     ║
║  → Avoids duplication and drift between documents                        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Reference**: See [FRD Section 6 - Wireframes](./3-functional-specification.md#6-wireframes) for visual layouts.

#### Implementation Notes per Page Type

| Page Type | Key Implementation Points |
|-----------|---------------------------|
| **List Page** | Paginated table, search with 300ms debounce, role-based action visibility |
| **Form Page** | Inline validation, submit disabled until valid, character counters |
| **Detail Page** | Master-detail pattern with tabs, breadcrumb navigation, cross-references |

#### Behaviors Summary (from FRD)

| Behavior | Specification |
|----------|---------------|
| Search debounce | 300ms delay before API call |
| Role-based visibility | Admin-only: [+ New], [Edit], [Delete] |
| Delete confirmation | Modal required before soft-delete |
| Form validation | Real-time on blur/change per field config |
| Pagination | Client-side state preserved on back navigation |

#### Navigation Patterns

| Pattern | Route Convention | Notes |
|---------|------------------|-------|
| List → Detail | `/{resource}/{id}` | Preserve list filters in state |
| List → Create | `/{resource}/new` | Back returns to list |
| Detail → Edit | `/{resource}/{id}/edit` | Pre-populate from detail |
| Master → Child | `/{master}/{id}/{child}` | Tab navigation, master context preserved |
| Cross-reference | `/{entity}/{id}` | Opens new context |

**Developer instruction**: Explore existing pages for exact patterns: `Glob("**/*.razor")` or `Glob("**/*.tsx")`

### 5.3 Messages

| Context | Message |
|---------|---------|
| Creation success | "{{Resource}} created successfully" |
| Modification success | "{{Resource}} modified successfully" |
| Deletion success | "{{Resource}} deleted" |
| Deletion confirmation | "Are you sure you want to delete this {{resource}}?" |
| Validation error | "Please correct form errors" |
| Server error | "An error occurred. Please try again." |
| Empty list | "No {{resource}} found. Create the first one!" |

---

## 6. Business rules

### 6.1 Constraint Hierarchy (by enforcement level)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  CONSTRAINT HIERARCHY: Not all rules are equal                           ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  MUST (Validation BLOCKS action - non-negotiable)                        ║
║  ────────────────────────────────────────────────                        ║
║  • Hard constraints enforced at API level                                ║
║  • User cannot proceed without fixing                                    ║
║  • Results in 4xx error codes                                            ║
║                                                                          ║
║  SHOULD (Warning but allows proceed - strong recommendation)             ║
║  ───────────────────────────────────────────────────────────             ║
║  • Soft constraints with confirmation                                    ║
║  • "Are you sure?" prompt, user can override                             ║
║  • Logged for audit but not blocked                                      ║
║                                                                          ║
║  MAY (Suggestion only - best practice hint)                              ║
║  ────────────────────────────────────────────                            ║
║  • Advisory information shown to user                                    ║
║  • No blocking, no confirmation required                                 ║
║  • Improves quality but not mandatory                                    ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### 6.2 Rules by priority

**MUST (validation will BLOCK submit):**

| ID | Rule | HTTP Code | Error Message |
|----|------|-----------|---------------|
| BR-001 | Name must be unique | 409 | "'{name}' already exists" |
| BR-002 | Only Admin can create/modify | 403 | "Insufficient permissions" |

**SHOULD (warning but allows proceed):**

| ID | Rule | Warning Message | Override Action |
|----|------|-----------------|-----------------|
| BR-003 | Description recommended | "Consider adding a description" | [Skip] button |

**MAY (suggestion only):**

| ID | Rule | Hint Location | Display |
|----|------|---------------|---------|
| BR-004 | Add tags for discoverability | Below tags field | Tooltip icon |

### 6.3 Implementation summary

| ID | Rule | Level | Implementation |
|----|------|-------|----------------|
| BR-001 | Name must be unique | MUST | DB constraint + API validation |
| BR-002 | Only Admin can create/modify | MUST | Auth middleware + [Authorize] |
| BR-003 | Description recommended | SHOULD | Front-end warning, no API block |
| BR-004 | Soft delete (archiving) | MUST | status = 'archived', no real DELETE |
| BR-005 | Audit trail | MUST | created_by, created_at, updated_at auto |

---

## 6.5 Data Privacy & Compliance

> ⚠️ **MANDATORY for features handling user data.** Skip only if feature has NO user data.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  DATA PRIVACY: Legal requirements MUST be considered                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Before implementing features with user data, consider:                  ║
║                                                                          ║
║  • GDPR (EU): Right to access, rectification, erasure, portability       ║
║  • CCPA (California): Similar rights for CA residents                    ║
║  • HIPAA (US Healthcare): PHI protection requirements                    ║
║  • PCI-DSS (Payments): Card data handling requirements                   ║
║                                                                          ║
║  THE BA IDENTIFIES data concerns. The DEV implements protections.        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Data classification

| Field/Entity | Data Type | Sensitivity | Protection Required |
|--------------|-----------|-------------|---------------------|
| {{FIELD_1}} | PII / Non-PII | High/Medium/Low | Encryption/Masking/None |
| Email | PII | High | Encrypt at rest, mask in logs |
| Name | PII | Medium | Access control |
| CreatedAt | Non-PII | Low | None |

### Privacy requirements

| Requirement | Applicable? | Implementation Notes |
|-------------|-------------|---------------------|
| **Right to Access** | Yes/No | User can export their data |
| **Right to Erasure** | Yes/No | Hard delete or anonymization |
| **Data Minimization** | Yes/No | Only collect necessary data |
| **Consent Required** | Yes/No | Explicit opt-in needed |
| **Retention Policy** | Yes/No | Auto-delete after {{X}} months |

### Security considerations

| Concern | Mitigation |
|---------|------------|
| Data in transit | HTTPS only, TLS 1.2+ |
| Data at rest | Encryption (AES-256) |
| Logging | No PII in logs, mask sensitive data |
| Access control | Role-based, least privilege |

> If this feature handles sensitive data, consult with Security team before implementation.

---

## 6.6 Non-Functional Requirements (NFRs)

> ⚠️ **Beyond functionality.** These define HOW WELL the feature should work.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  NFRs: Quality attributes that affect user experience                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Functional: "User can create a record"                                  ║
║  Non-Functional: "Creation completes in < 500ms for 95% of requests"     ║
║                                                                          ║
║  NFRs are often forgotten but critical for production success.           ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Performance

| Aspect | Requirement | Rationale |
|--------|-------------|-----------|
| Response time (P95) | < {{X}}ms | User experience |
| Throughput | {{Y}} requests/sec | Expected load |
| Database queries | < {{Z}} per request | Prevent N+1 |
| Page size | < {{W}} KB | Mobile users |

### Scalability

| Aspect | Requirement | Notes |
|--------|-------------|-------|
| Concurrent users | {{X}} simultaneous | Peak load estimate |
| Data volume | {{Y}} records | Growth projection |
| Horizontal scaling | Yes/No | Stateless design required |

### Availability & Reliability

| Aspect | Requirement | Notes |
|--------|-------------|-------|
| Uptime SLA | {{X}}% | e.g., 99.9% = 8.76h downtime/year |
| Recovery time | < {{Y}} minutes | Time to restore service |
| Data backup | Every {{Z}} hours | Recovery point objective |

### Security (OWASP considerations)

| Risk | Mitigation Required |
|------|---------------------|
| SQL Injection | Parameterized queries (ORM handles) |
| XSS | Output encoding, CSP headers |
| CSRF | Anti-forgery tokens |
| Broken Auth | Session management, MFA if applicable |

### Accessibility

| Requirement | Standard | Notes |
|-------------|----------|-------|
| WCAG Level | A / AA / AAA | Legal requirement in some jurisdictions |
| Keyboard navigation | Yes | All actions reachable |
| Screen reader | Yes | ARIA labels |

> Developer should prioritize NFRs based on project context. Not all apply to every feature.

---

## 7. Permissions

> ⚠️ **CRITICAL**: Permissions must be EXPLICIT and IMPLEMENTABLE, not just documented.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PERMISSIONS: Must be discoverable and implementable                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  A permission specification MUST include:                                ║
║  1. PERMISSION KEYS: Exact string codes (e.g., "Domains.View")           ║
║  2. MAPPING: Which endpoint/action requires which permission             ║
║  3. EXPLORE: Search patterns to find existing permission patterns        ║
║                                                                          ║
║  "Admin can create" is NOT enough.                                       ║
║  "POST /api/v2/domains requires Domains.Create permission" IS enough.    ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### 7.1 [EXPLORE] Discover Existing Permission Patterns

**MANDATORY before implementing any permission logic:**

| What to Find | Search Pattern | Why |
|--------------|----------------|-----|
| Permission keys | `Grep("Permission")` | Find existing permission constants |
| Authorization attributes | `Grep("Authorize")` | Find attribute patterns |
| Permission service | `Grep("HasPermission\|CheckPermission")` | Find service usage |
| Policy definitions | `Glob("**/*Authorization*.cs")` | Find policy configuration |
| Existing controllers | `Grep("\\[Authorize.*Policy")` | See how permissions are applied |

**Expected findings (to adapt to):**

| Pattern Type | Example | Your Adaptation |
|--------------|---------|-----------------|
| Attribute-based | `[Authorize(Policy = "X")]` | Use same pattern |
| Service-based | `_permissionService.HasPermissionAsync("X")` | Inject same service |
| Custom filter | `[RequirePermission("X")]` | Use same filter |

### 7.2 Permission Keys

> ⚠️ Use EXACT permission keys that exist in the project OR will be created.

| Permission Key | Description | Used By |
|----------------|-------------|---------|
| `{{Module}}.View` | View list and details | GET endpoints, list pages |
| `{{Module}}.Create` | Create new records | POST endpoints, create button |
| `{{Module}}.Update` | Modify existing records | PUT endpoints, edit button |
| `{{Module}}.Delete` | Delete/archive records | DELETE endpoints, delete button |

**If new permissions needed:**
- Document them here
- Specify where to add them (migration, seed data, admin config)

### 7.3 Role-Permission Matrix

| Action | Permission Key | Admin | User | Anonymous |
|--------|----------------|-------|------|-----------|
| View list | `{{Module}}.View` | ✓ | ✓ | ✗ |
| View detail | `{{Module}}.View` | ✓ | ✓ | ✗ |
| Create | `{{Module}}.Create` | ✓ | ✗ | ✗ |
| Modify | `{{Module}}.Update` | ✓ | ✗ | ✗ |
| Delete | `{{Module}}.Delete` | ✓ | ✗ | ✗ |

### 7.4 Endpoint-Permission Mapping

> ⚠️ Each endpoint MUST have explicit permission requirement.

| Endpoint | HTTP | Permission Required | Failure Response |
|----------|------|---------------------|------------------|
| `/api/v2/{{resource}}` | GET | `{{Module}}.View` | 403 Forbidden |
| `/api/v2/{{resource}}/:id` | GET | `{{Module}}.View` | 403 Forbidden |
| `/api/v2/{{resource}}` | POST | `{{Module}}.Create` | 403 Forbidden |
| `/api/v2/{{resource}}/:id` | PUT | `{{Module}}.Update` | 403 Forbidden |
| `/api/v2/{{resource}}/:id` | DELETE | `{{Module}}.Delete` | 403 Forbidden |

### 7.5 UI Permission Checks

| UI Element | Permission Required | Behavior When Denied |
|------------|---------------------|----------------------|
| [+ New] button | `{{Module}}.Create` | Hidden |
| [Edit] button | `{{Module}}.Update` | Hidden |
| [Delete] button | `{{Module}}.Delete` | Hidden |
| List page access | `{{Module}}.View` | Redirect to unauthorized |
| Detail page access | `{{Module}}.View` | Redirect to unauthorized |

### 7.6 Implementation Checklist

| Step | Action | Validation |
|------|--------|------------|
| 1 | Explore existing patterns | Know how project handles permissions |
| 2 | Verify permission keys exist | Check constants/enums/config |
| 3 | Apply to API endpoints | All endpoints protected |
| 4 | Apply to UI elements | Buttons hidden appropriately |
| 5 | Test unauthorized access | 403 response verified |

---

## 8. Implementation order

> ⚠️ Each phase should be **testable in isolation** before moving to the next.

### Suggested approach (ADAPT to project methodology)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PHASES ARE SUGGESTIONS - ADAPT TO YOUR CONTEXT                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  DEFAULT: Data → API → UI → Tests (backend-first)                        ║
║  Suitable for: Traditional web apps, CRUD features                       ║
║                                                                          ║
║  ALTERNATIVES (choose based on project/team):                            ║
║                                                                          ║
║  • UI-FIRST: Wireframes → Mocks → API → Data                             ║
║    When: UX-critical features, stakeholder demos needed                  ║
║                                                                          ║
║  • API-FIRST: OpenAPI spec → Stubs → Implementation                      ║
║    When: Multiple consumers, contract-driven development                 ║
║                                                                          ║
║  • DOMAIN-FIRST: Aggregates → Use Cases → Adapters                       ║
║    When: Complex business logic, DDD projects                            ║
║                                                                          ║
║  The developer should choose based on project conventions.               ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Phase 1: Data Layer (Backend)

**Goal:** Functional database schema

| Step | Task | Validation |
|------|------|------------|
| 1.1 | Explore existing entities, identify patterns | Know base classes, conventions |
| 1.2 | Create {{Entity}} entity (follow patterns) | Compiles without errors |
| 1.3 | Configure DbContext (add DbSet) | No config errors |
| 1.4 | Generate migration | `dotnet ef migrations add` succeeds |
| 1.5 | Apply migration + seed data | `dotnet ef database update` succeeds |

**Phase complete when:** Database has new tables, seed data present

### Phase 2: API Layer (Backend)

**Goal:** Functional REST API testable via Swagger/Postman

| Step | Task | Validation |
|------|------|------------|
| 2.1 | Explore existing controllers, identify patterns | Know response format, DI |
| 2.2 | Create DTOs (Request/Response) | Compiles |
| 2.3 | Implement controller endpoints | Routes registered |
| 2.4 | Add validations (follow existing pattern) | 400 errors on invalid input |
| 2.5 | Implement business rules | BR-XXX all enforced |

**Phase complete when:** All endpoints respond correctly in Swagger

### Phase 3: UI Layer (Frontend)

**Goal:** Functional user interface

| Step | Task | Validation |
|------|------|------------|
| 3.1 | Explore existing pages, identify patterns | Know layout, components |
| 3.2 | Create List page | Page loads, data displayed |
| 3.3 | Create Form page (Create/Edit) | Form submits correctly |
| 3.4 | Add front-end validations | Invalid inputs show errors |
| 3.5 | Add success/error messages | Toast notifications work |

**Phase complete when:** User can CRUD via UI

### Phase 4: Integration & Tests

**Goal:** Feature fully validated

| Step | Task | Validation |
|------|------|------------|
| 4.1 | Verify permissions work correctly | Unauthorized = 403 |
| 4.2 | Run Gherkin scenarios manually | All pass |
| 4.3 | Write unit tests (if required) | Tests pass |
| 4.4 | Final code review | Follows patterns |

**Phase complete when:** All acceptance criteria met

---

## 8.5 Phased delivery (for complex features)

> ⚠️ For large features, split into smaller deliverables. Each phase = one PR.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PHASED DELIVERY: Breaking down large features                           ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  WHEN TO SPLIT:                                                          ║
║  • Feature has > 5 entities OR > 10 endpoints OR > 5 pages               ║
║  • Estimated implementation > 2 days                                     ║
║  • Multiple independent sub-features                                     ║
║                                                                          ║
║  HOW TO SPLIT:                                                           ║
║  • Each phase delivers WORKING functionality                             ║
║  • Each phase can be tested independently                                ║
║  • Each phase = 1 PR with focused scope                                  ║
║                                                                          ║
║  BENEFITS:                                                               ║
║  • Easier code review                                                    ║
║  • Faster feedback                                                       ║
║  • Lower risk of merge conflicts                                         ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Sub-handoffs (if applicable)

| Phase | Scope | Deliverable | Dependencies |
|-------|-------|-------------|--------------|
| Phase A | {{SCOPE_A}} | {{DELIVERABLE_A}} | None |
| Phase B | {{SCOPE_B}} | {{DELIVERABLE_B}} | Phase A complete |
| Phase C | {{SCOPE_C}} | {{DELIVERABLE_C}} | Phase B complete |

**Phase A handoff:** [link or "see section below"]
**Phase B handoff:** [link or "see section below"]

> If splitting is NOT needed, delete this section.

---

## 9. Acceptance criteria

### Happy Path
```gherkin
Scenario: Creating a {{resource}}
  Given I am logged in as Admin
  And I am on the {{resource}} list page
  When I click on "New"
  And I fill the name with "Test {{Resource}}"
  And I click on "Create"
  Then I see the message "{{Resource}} created successfully"
  And the {{resource}} "Test {{Resource}}" appears in the list
```

### Error cases
```gherkin
Scenario: Unique name validation
  Given a {{resource}} "Existing" already exists
  When I create a {{resource}} with name "Existing"
  Then I see the error "This name is already in use"
```

### Permission scenarios (MANDATORY)
```gherkin
Scenario: Unauthorized user cannot create {{resource}}
  Given I am logged in as User (without {{Module}}.Create permission)
  When I navigate to the {{resource}} list page
  Then I do NOT see the "New" button

Scenario: API rejects unauthorized create attempt
  Given I am authenticated as User (without {{Module}}.Create permission)
  When I send POST /api/v2/{{resource}} with valid data
  Then I receive HTTP 403 Forbidden
  And the response contains "Insufficient permissions"

Scenario: Unauthorized user cannot access restricted page
  Given I am NOT logged in
  When I navigate to /{{module}}/{{resource}}
  Then I am redirected to the login page
```

### Scenario categories (minimum 5 required)

| Category | Minimum | Purpose |
|----------|---------|---------|
| **Happy Path** | 2 | Core functionality works |
| **Validation Errors** | 1 | Input validation works |
| **Permission Errors** | 1 | Authorization works |
| **Edge Cases** | 1 | Boundary conditions handled |

### 9.4 Requirements → Tests Traceability Matrix

> ⚠️ Every requirement MUST be covered by at least one test scenario.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  TRACEABILITY: Link requirements to tests                                ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  WHY TRACEABILITY?                                                       ║
║  • Ensures no requirement is forgotten                                   ║
║  • Identifies under-tested areas                                         ║
║  • Helps prioritize test efforts                                         ║
║  • Supports regression testing                                           ║
║                                                                          ║
║  RULE: Each BR-XXX and FR-XXX must map to at least one scenario.         ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

| Requirement ID | Description | Test Scenario(s) | Coverage |
|----------------|-------------|------------------|----------|
| BR-001 | {{BUSINESS_RULE}} | Scenario 1, 2 | ✓ |
| BR-002 | {{BUSINESS_RULE}} | Scenario 3 | ✓ |
| FR-001 | {{FUNCTIONAL_REQ}} | Scenario 1 | ✓ |
| FR-002 | {{FUNCTIONAL_REQ}} | _(Missing)_ | ⚠️ |

**Coverage summary:**
- Total requirements: {{X}}
- Covered by tests: {{Y}}
- Coverage: {{PERCENT}}%
- **Target: 100%**

```
╔══════════════════════════════════════════════════════════════════════════╗
║  COVERAGE ENFORCEMENT: 100% coverage is MANDATORY before handoff         ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  IF COVERAGE < 100%:                                                     ║
║  1. STOP - Do not output handoff with gaps                               ║
║  2. IDENTIFY missing scenarios for each ⚠️ requirement                   ║
║  3. ADD scenarios to cover gaps                                          ║
║  4. VERIFY 100% coverage before proceeding                               ║
║                                                                          ║
║  EXCEPTION: If requirement is intentionally out of scope,                ║
║  move it to "Excluded (out of scope)" section with justification.        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Gaps to address (if any):**
- FR-002: Add scenario for {{MISSING_CASE}} → **REQUIRED before handoff**

---

## 9.5 Implementation questions (Dev → BA feedback)

> ⚠️ If the developer encounters unclear specs, they should document questions here.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  FEEDBACK LOOP: When specs are unclear                                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  During implementation, the developer may discover:                      ║
║  • Edge cases not covered in specs                                       ║
║  • Ambiguous requirements                                                ║
║  • Technical constraints that affect design                              ║
║  • Simpler alternatives to proposed solution                             ║
║                                                                          ║
║  PROTOCOL:                                                               ║
║  1. Document the question below with context                             ║
║  2. Propose a solution if possible                                       ║
║  3. If blocking, STOP and consult BA before proceeding                   ║
║  4. If non-blocking, proceed with best judgment + document               ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Questions template (developer fills during implementation)

| # | Question | Context | Proposed Solution | Status |
|---|----------|---------|-------------------|--------|
| Q1 | _(Example: What happens if user deletes while another edits?)_ | _(Concurrent editing scenario)_ | _(Show error, refresh list)_ | PENDING |
| Q2 | | | | |
| Q3 | | | | |

### Discovered edge cases (add during implementation)

| Edge Case | Behavior Chosen | Rationale |
|-----------|-----------------|-----------|
| _(Example: Empty list on first load)_ | _(Show "Create first" message)_ | _(Better UX than blank screen)_ |

---

## 9.6 Change Request Protocol (Specs changing mid-development)

> ⚠️ **What to do when specifications need to change AFTER development has started.**

```
╔══════════════════════════════════════════════════════════════════════════╗
║  CHANGE REQUEST PROTOCOL: Managing spec changes during implementation    ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  CHANGES HAPPEN. The goal is to manage them, not prevent them.           ║
║                                                                          ║
║  TRIGGERS for change request:                                            ║
║  • User feedback reveals missing requirement                             ║
║  • Technical constraint discovered during implementation                 ║
║  • Business priority shift                                               ║
║  • Security/compliance issue identified                                  ║
║                                                                          ║
║  PROTOCOL:                                                               ║
║  1. STOP - Don't code based on outdated specs                            ║
║  2. DOCUMENT - Record the change request                                 ║
║  3. ASSESS - Evaluate impact                                             ║
║  4. DECIDE - Approve/reject/defer                                        ║
║  5. UPDATE - Revise specs if approved                                    ║
║  6. RESUME - Continue development                                        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Change request template

| Field | Value |
|-------|-------|
| **CR-ID** | CR-{{FEAT-ID}}-{{NUMBER}} |
| **Date** | {{DATE}} |
| **Requested by** | Dev / BA / PO / User |
| **Type** | Addition / Modification / Removal |
| **Priority** | Critical / High / Medium / Low |

### Change description

| Aspect | Details |
|--------|---------|
| **Current spec** | {{WHAT_SPEC_SAYS_NOW}} |
| **Proposed change** | {{WHAT_IT_SHOULD_BE}} |
| **Reason** | {{WHY_CHANGE_NEEDED}} |
| **Discovered during** | {{PHASE_OR_TASK}} |

### Impact assessment

| Impact Area | Assessment | Effort |
|-------------|------------|--------|
| Data model | None / Minor / Major | {{HOURS}} |
| API | None / Minor / Major | {{HOURS}} |
| UI | None / Minor / Major | {{HOURS}} |
| Tests | None / Minor / Major | {{HOURS}} |
| Other features | List affected | {{HOURS}} |
| **Total additional effort** | | {{TOTAL}} |

### Decision matrix

```
Change priority + Impact → Decision

                    LOW IMPACT    MEDIUM IMPACT    HIGH IMPACT
CRITICAL PRIORITY   Approve       Approve          Escalate
HIGH PRIORITY       Approve       Assess           Escalate
MEDIUM PRIORITY     Approve       Defer            Reject/Defer
LOW PRIORITY        Defer         Reject           Reject
```

### Change tracking log (append as changes occur)

| CR-ID | Date | Description | Decision | Updated Sections |
|-------|------|-------------|----------|------------------|
| CR-{{FEAT}}-001 | | | PENDING | |

### Rules for change requests

1. **Small changes** (< 2h impact): Dev can proceed, document after
2. **Medium changes** (2-8h impact): Notify BA, get approval before proceeding
3. **Large changes** (> 8h impact): Full impact assessment, may require re-planning
4. **Breaking changes** (API contracts, data model): Always escalate to BA + PO

---

## 9.7 Non-Regression Test Strategy

> ⚠️ **MANDATORY.** Every feature MUST have automated tests before deployment.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  TEST STRATEGY: Ensure feature works AND keeps working                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Non-regression tests verify that:                                       ║
║  • New functionality works as specified                                  ║
║  • Existing functionality is not broken                                  ║
║  • Edge cases are handled correctly                                      ║
║                                                                          ║
║  THE DEVELOPER MUST CREATE TESTS, NOT JUST IMPLEMENT CODE.               ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### [EXPLORE] Step 1: Check if test infrastructure exists

**Search patterns to detect existing test setup:**

| What to Find | Search Pattern | Indicates |
|--------------|----------------|-----------|
| Test files | `Glob("**/*.test.*")` OR `Glob("**/*.spec.*")` | Tests exist |
| Test folders | `Glob("**/tests/**")` OR `Glob("**/__tests__/**")` | Structure exists |
| Config files | `Glob("**/jest.config.*")` OR `Glob("**/*.runsettings")` | Framework configured |
| Test project | `Glob("**/*.Tests.csproj")` OR `Glob("**/test_*.py")` | Test project exists |

**Decision tree:**

```
Test infrastructure found?
├── YES → Proceed to Step 3 (create tests for this feature)
└── NO → Proceed to Step 2 (scaffold infrastructure first)
```

### [SPEC] Step 2: Create test infrastructure (if missing)

> **Invoke agent:** `ba-scaffold-tests` (model: sonnet)

If Step 1 finds NO test infrastructure, the developer/Claude MUST:

1. **Detect** the project's technology stack
2. **Create** appropriate test folder structure
3. **Configure** test framework (xUnit/.NET, Jest/Node, pytest/Python)
4. **Add** necessary dependencies

**Stack-specific setup:**

| Stack | Test Framework | Command | Folder Structure |
|-------|----------------|---------|------------------|
| .NET | xUnit | `dotnet new xunit -n {{Project}}.Tests` | `*.Tests/Unit/`, `Integration/`, `E2E/` |
| Node.js | Jest/Vitest | `npm install --save-dev jest` | `tests/unit/`, `integration/`, `e2e/` |
| Python | pytest | `pip install pytest pytest-cov` | `tests/unit/`, `integration/`, `e2e/` |

### [SPEC] Step 3: Tests to create for this feature

**Mapping Gherkin → Automated Tests:**

| Gherkin Scenario | Test Type | File Pattern | Priority |
|------------------|-----------|--------------|----------|
| Happy path scenarios | E2E / Integration | `{{Feature}}.e2e.test.*` | MUST |
| Validation scenarios | Integration | `{{Feature}}.validation.test.*` | MUST |
| Permission scenarios | Integration | `{{Feature}}.auth.test.*` | MUST |
| Edge case scenarios | Unit / Integration | `{{Feature}}.edge.test.*` | SHOULD |

**Mapping Business Rules → Unit Tests:**

| Business Rule | Test Type | What to Test |
|---------------|-----------|--------------|
| BR-XXX (validation) | Unit | Validator methods in isolation |
| BR-XXX (calculation) | Unit | Service methods with mock data |
| BR-XXX (authorization) | Integration | API endpoints with different roles |

**Mapping Endpoints → Integration Tests:**

| Endpoint | Test Scenarios |
|----------|----------------|
| `GET /api/{{resource}}` | Empty list, paginated results, filtered results |
| `POST /api/{{resource}}` | Valid creation, validation errors, duplicate handling |
| `PUT /api/{{resource}}/:id` | Valid update, not found, validation errors |
| `DELETE /api/{{resource}}/:id` | Valid deletion, not found, cascade behavior |

### Test Requirements (Minimum Coverage)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  MINIMUM TEST REQUIREMENTS: Before feature can be considered DONE        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  UNIT TESTS:                                                             ║
║  • One test per business rule (BR-XXX)                                   ║
║  • Validator coverage for all entity validations                         ║
║  • Service methods with edge cases                                       ║
║                                                                          ║
║  INTEGRATION TESTS:                                                      ║
║  • One test per API endpoint                                             ║
║  • Authentication/authorization scenarios                                ║
║  • Database constraints validation                                       ║
║                                                                          ║
║  E2E TESTS (minimum 5):                                                  ║
║  • 2 happy path scenarios                                                ║
║  • 1 validation error scenario                                           ║
║  • 1 permission denied scenario                                          ║
║  • 1 edge case scenario                                                  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### [VALIDATE] Test Checklist

Before marking the feature as DONE, verify:

| Category | Check | Status |
|----------|-------|--------|
| **Infrastructure** | Test project/folder exists | ☐ |
| **Infrastructure** | Test framework configured | ☐ |
| **Unit** | All BR-XXX have corresponding tests | ☐ |
| **Unit** | Validators tested | ☐ |
| **Integration** | All endpoints tested | ☐ |
| **Integration** | Auth scenarios covered | ☐ |
| **E2E** | Happy paths tested | ☐ |
| **E2E** | Error paths tested | ☐ |
| **Coverage** | Minimum 80% code coverage (if measured) | ☐ |
| **CI** | Tests pass in CI pipeline | ☐ |

### Test Execution Commands

**Include in handoff:**

| Stack | Run Tests | Coverage Report |
|-------|-----------|-----------------|
| .NET | `dotnet test` | `dotnet test --collect:"XPlat Code Coverage"` |
| Node.js | `npm test` | `npm test -- --coverage` |
| Python | `pytest` | `pytest --cov=src --cov-report=html` |

---

## 10. References

| Document | Description |
|----------|-------------|
| [Discovery](./1-discovery.md) | Needs elicitation |
| [BRD](./2-business-requirements.md) | Business requirements |
| [FRD](./3-functional-specification.md) | Complete specifications |
| [Glossary](../../../glossary.md) | Business terms |

---

## Definition of Done

- [ ] Entities created and configured
- [ ] Migration generated (NOT applied in prod)
- [ ] Endpoints functional and documented
- [ ] UI pages functional
- [ ] Front + back validations
- [ ] Permissions implemented
- [ ] **Test infrastructure exists** (Section 9.7 Step 1-2)
- [ ] Unit tests for all BR-XXX passing
- [ ] Integration tests for all endpoints passing
- [ ] E2E tests for Gherkin scenarios passing
- [ ] Code coverage >= 80% (if measured)
- [ ] Code review completed

---

## Rollback Strategy

> ⚠️ Every feature MUST have a rollback plan before deployment.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ROLLBACK PLANNING: What if something goes wrong?                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  BEFORE DEPLOYING, answer these questions:                               ║
║                                                                          ║
║  1. Is the migration REVERSIBLE?                                         ║
║     → Can we rollback without data loss?                                 ║
║     → What data would be lost if we rollback?                            ║
║                                                                          ║
║  2. What is the POINT OF NO RETURN?                                      ║
║     → After which step can we no longer rollback?                        ║
║     → What triggers this point? (data migration, user adoption)          ║
║                                                                          ║
║  3. What are the GO/NO-GO criteria?                                      ║
║     → Error rate threshold to trigger rollback                           ║
║     → Performance degradation threshold                                  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Migration reversibility

| Migration | Reversible? | Data Loss Risk | Rollback Method |
|-----------|-------------|----------------|-----------------|
| {{MIGRATION_1}} | Yes/No | None/Partial/Total | `dotnet ef database update {{PREVIOUS}}` |

### Go/No-Go criteria

| Metric | Threshold | Action if Exceeded |
|--------|-----------|-------------------|
| Error rate | > 1% | Rollback immediately |
| Response time | > 2x baseline | Investigate, consider rollback |
| User complaints | > 5 in first hour | Pause rollout, investigate |

### Rollback steps (if needed)

1. [ ] **STOP** new deployments
2. [ ] **REVERT** code to previous version
3. [ ] **ROLLBACK** database migration (if reversible)
4. [ ] **NOTIFY** stakeholders
5. [ ] **DOCUMENT** what went wrong

### Data preservation

| Data Type | Preservation Strategy | Recovery Method |
|-----------|----------------------|-----------------|
| User-created data | Backup before migration | Restore from backup |
| Configuration | Version-controlled | Git revert |

---

## Success Metrics

> ⚠️ How do we know the feature is SUCCESSFUL, not just "done"?

```
╔══════════════════════════════════════════════════════════════════════════╗
║  SUCCESS METRICS: Measurable outcomes, not just checkboxes               ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  "Definition of Done" = feature is IMPLEMENTED                           ║
║  "Success Metrics" = feature is WORKING and VALUABLE                     ║
║                                                                          ║
║  Define QUANTITATIVE targets before implementation.                      ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Performance targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API response time (P95) | < {{X}}ms | APM monitoring |
| Page load time | < {{Y}}s | Browser DevTools |
| Database query time | < {{Z}}ms | Query profiling |

### Quality targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Test coverage | > {{X}}% | Code coverage tool |
| Error rate | < {{Y}}% | Error tracking (Sentry, etc.) |
| Code review issues | < {{Z}} critical | PR review |

### Business targets (post-launch)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| User adoption | {{X}}% of target users | First 2 weeks |
| Task completion rate | > {{Y}}% | First month |
| Support tickets related | < {{Z}} per week | First month |

---

*Generated by Business Analyse - {{DATE}}*
*This prompt can be used directly with Claude Code or any development assistant.*
```

### Summary

```
HANDOFF GENERATED
═══════════════════════════════════════════════════════════
Feature:     {{FEAT-XXX}} - {{NAME}}
Language:    ENGLISH (optimized for AI consumption)
═══════════════════════════════════════════════════════════
Development prompt created:
  • Entities:     {{X}} specified
  • Endpoints:    {{Y}} documented
  • Pages:        {{Z}} wireframed
  • Rules:        {{W}} to implement
  • Steps:        {{N}} implementation steps
═══════════════════════════════════════════════════════════
Document: .../{{FEAT-XXX}}/4-development-handoff.md

USAGE (One-Shot Implementation):
  1. Open new Claude Code session
  2. Paste the DEV-PROMPT content directly
  3. Let Claude implement autonomously

  Or via CLI:
  cat 4-development-handoff.md | claude

⚠️  THE BA HAS FINISHED THEIR WORK
    The developer takes over for implementation.
    NO FURTHER QUESTIONS should be needed.
═══════════════════════════════════════════════════════════
Optional: /business-analyse:7-document {{FEAT-XXX}}
  (Generate user-readable documentation after implementation)
```

## Rules

1. **Autonomous prompt** - All context included, no need to consult other docs
2. **Logical order** - Data → API → UI → Tests (each phase testable)
3. **Clear DoD** - Explicit validation criteria for each phase
4. **NO CODE** - Describe WHAT, never HOW. Tables, not classes.
5. **Explore-First** - Developer must explore existing patterns first
6. **References** - Links to detailed docs for deep dive
7. **Ready to use** - Can be piped directly to Claude Code

## Content Validation (ACTIVE - MANDATORY)

Before outputting the handoff, Claude MUST perform these validations:

### Self-Scan for Code Violations

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ACTIVE VALIDATION: Scan for code patterns (with context awareness)      ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  STRICT CODE PATTERNS (always forbidden):                                ║
║  • public\s+(void|int|string|async|class)  → C# code                     ║
║  • \[Required\]|\[MaxLength  → C# attribute                              ║
║  • function\s+\w+\s*\(       → JS function with params                   ║
║  • def\s+\w+\s*\(            → Python function with params               ║
║  • @code\s*\{                → Razor code block                          ║
║  • <MudButton|<MudCard       → MudBlazor component                       ║
║  • INSERT INTO|CREATE TABLE  → SQL DDL/DML                               ║
║                                                                          ║
║  CONTEXT-AWARE (allowed in business text):                               ║
║  • "class" alone → OK in "user classification", "class of objects"       ║
║  • "function" alone → OK in "business function", "function of"           ║
║  • "select" alone → OK in "user can select", "selection"                 ║
║                                                                          ║
║  IF STRICT PATTERN FOUND → Rewrite as table/description                  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Business terms whitelist (allowed even if matching patterns)

| Term | Context | Why Allowed |
|------|---------|-------------|
| "user class" | Business concept | Not C# class definition |
| "object classification" | Categorization | Business terminology |
| "function" (standalone) | Business function | Not JS function |
| "select an option" | UI action | Not SQL SELECT |
| "first-class citizen" | Priority concept | Idiomatic expression |

### Checklist (verify each item)

| Check | Validation Method | Pass? |
|-------|-------------------|-------|
| No source code | Scan for code patterns above | ☐ |
| Entities as tables | Each entity has attribute table | ☐ |
| Endpoints as specs | Each endpoint has spec table | ☐ |
| UI as wireframes | ASCII boxes, no component code | ☐ |
| Business rules as text | BR-XXX format, no implementation | ☐ |
| Tasks as checklist | `[ ]` format, not code steps | ☐ |
| Explore-First included | Search methods provided | ☐ |
| Gherkin present | At least 2 scenarios | ☐ |

**If ANY check fails, FIX before outputting.**
