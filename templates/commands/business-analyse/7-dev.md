---
description: Phase 7 - Phased implementation with user validation
model: opus
args: [feature-id, phase]
---

# Business Analyse - DEV (Implementation)

Senior developer expert. Phased implementation with mandatory validation.

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool **interactively**. You MUST execute the tool with these parameters to get the user's response BEFORE continuing.

## Arguments

```
/business-analyse:7-dev [feature-id] [phase]
```

- `feature-id`: Feature identifier (e.g., FEAT-001)
- `phase`: Phase to execute (optional: data|api|ui|integration|all)

## Philosophy

```
╔══════════════════════════════════════════════════════════════════════════╗
║  MANDATORY USER VALIDATION                                               ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  NO phase executes automatically.                                       ║
║  The user MUST explicitly validate before each phase.                   ║
║                                                                          ║
║  Workflow:                                                               ║
║    1. Display implementation plan                                       ║
║    2. Request user validation                                           ║
║    3. Execute ONLY if validated                                         ║
║    4. Validate results before next phase                                ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Prerequisites

```bash
# Verify that handoff exists
test -f ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/4-development-handoff.md" || \
  echo "Execute /business-analyse:6-handoff first"
```

## Workflow

### Step 1: Loading context

Load the handoff and FRD:

```bash
HANDOFF=$(cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/4-development-handoff.md")
FRD=$(cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/3-functional-specification.md")
```

Extract the implementation plan (section 9 of FRD).

### Step 2: Plan display

```
╔══════════════════════════════════════════════════════════════════════════╗
║  IMPLEMENTATION PLAN - {{FEATURE_NAME}}                                  ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Detected complexity: {{COMPLEXITY}}                                     ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────────┐  ║
║  │ PHASE │ SCOPE                    │ VALIDATION      │ STATUS       │  ║
║  ├───────┼──────────────────────────┼─────────────────┼──────────────┤  ║
║  │ 1     │ Data Layer (Entities)    │ EF OK           │ ⏳ Pending   │  ║
║  │ 2     │ API Layer (Endpoints)    │ Swagger OK      │ ⏳ Pending   │  ║
║  │ 3     │ UI Layer (Components)    │ Gherkin OK      │ ⏳ Pending   │  ║
║  │ 4     │ Integration              │ UAT OK          │ ⏳ Pending   │  ║
║  └────────────────────────────────────────────────────────────────────┘  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Step 3: User validation request

**MANDATORY** - Use AskUserQuestion:

```
AskUserQuestion({
  questions: [{
    question: "Which phase do you want to execute?",
    header: "Phase",
    options: [
      { label: "1. Data Layer", description: "Entities, migrations, repositories" },
      { label: "2. API Layer", description: "Endpoints, services, DTOs" },
      { label: "3. UI Layer", description: "Components, forms, state" },
      { label: "4. Integration", description: "Complete wiring, E2E tests" },
      { label: "View detailed plan", description: "Show plan without executing" }
    ],
    multiSelect: false
  }]
})
```

**IF user chooses "View detailed plan"** → Show details and ask again

**IF user chooses a phase** → Proceed to step 4

### Step 4: Confirmation before execution

**MANDATORY** - Double confirmation:

```
AskUserQuestion({
  questions: [{
    question: "Confirm execution of Phase {{N}}?",
    header: "Confirm",
    options: [
      { label: "Yes, execute now", description: "Start implementation" },
      { label: "No, cancel", description: "Return to menu" }
    ],
    multiSelect: false
  }]
})
```

**IF "No"** → Return to step 3
**IF "Yes"** → Proceed to step 5

---

## Step 5: Phase execution

### Phase 1: DATA LAYER

**Scope:**
- Create/modify entities (C# classes, TypeScript models, etc.)
- Configure DbContext / ORM
- Generate migrations
- Create repositories (if pattern used)
- Add test seed data

**Actions:**

```
1. Read data model from handoff (section 3)
2. Create entity files according to stack:
   - .NET: Models/*.cs
   - Node: models/*.ts
   - Python: models/*.py
3. Configure relations
4. Generate migration
```

**Validation:**
```bash
# .NET
dotnet ef migrations add Add{{FeatureName}} --project {{PROJECT}}
dotnet ef database update --project {{PROJECT}}

# Node/Prisma
npx prisma migrate dev --name add_{{feature}}

# Node/TypeORM
npm run migration:generate -- Add{{FeatureName}}
npm run migration:run
```

**Success criteria:** Migration applied without error

**After execution - Request validation:**

```
AskUserQuestion({
  questions: [{
    question: "Phase 1 (Data Layer) completed. Did the migration apply correctly?",
    header: "Validate P1",
    options: [
      { label: "Yes, proceed to Phase 2", description: "Data Layer validated" },
      { label: "No, there are errors", description: "Fix before continuing" },
      { label: "Stop here", description: "Don't continue with other phases" }
    ],
    multiSelect: false
  }]
})
```

---

### Phase 2: API LAYER

**Prerequisites:** Phase 1 validated

**Scope:**
- Create Controllers/Routes
- Implement Services
- Create DTOs (Request/Response)
- Add validations
- Configure authentication/authorization

**Actions:**

```
1. Read endpoints from handoff (section 4)
2. Create files according to stack:
   - .NET: Controllers/*Controller.cs, Services/*Service.cs
   - Node: routes/*.ts, services/*.ts
   - Python: routes/*.py, services/*.py
3. Implement each endpoint
4. Add validations
```

**Validation:**
```bash
# Start API and test via Swagger/Postman
# Verify all endpoints respond correctly
```

**Success criteria:** All endpoints testable via Swagger/Postman

**After execution - Request validation:**

```
AskUserQuestion({
  questions: [{
    question: "Phase 2 (API Layer) completed. Are all endpoints working correctly?",
    header: "Validate P2",
    options: [
      { label: "Yes, proceed to Phase 3", description: "API Layer validated" },
      { label: "No, there are errors", description: "Fix before continuing" },
      { label: "Stop here", description: "Don't continue with other phases" }
    ],
    multiSelect: false
  }]
})
```

---

### Phase 3: UI LAYER

**Prerequisites:** Phase 2 validated

**Scope:**
- Create pages/components
- Implement state management
- Create forms with validations
- Integrate API calls
- Add messages/notifications

**Actions:**

```
1. Read wireframes from handoff (section 5)
2. Create components according to stack:
   - React: components/*.tsx, pages/*.tsx
   - Angular: *.component.ts
   - Vue: *.vue
   - Blazor: *.razor
3. Implement forms
4. Connect to API
```

**Validation:**
```bash
# Run E2E tests
npm run test:e2e
# Or
dotnet test --filter Category=E2E
```

**Success criteria:** Gherkin scenarios pass in E2E

**After execution - Request validation:**

```
AskUserQuestion({
  questions: [{
    question: "Phase 3 (UI Layer) completed. Is the interface working correctly?",
    header: "Validate P3",
    options: [
      { label: "Yes, proceed to Phase 4", description: "UI Layer validated" },
      { label: "No, there are errors", description: "Fix before continuing" },
      { label: "Stop here", description: "Don't continue with integration" }
    ],
    multiSelect: false
  }]
})
```

---

### Phase 4: INTEGRATION

**Prerequisites:** Phases 1, 2, 3 validated

**Scope:**
- Verify complete front ↔ back wiring
- Execute full test suite
- Optimize performance if needed
- Finalize technical documentation

**Actions:**

```
1. Complete E2E tests
2. Permission verification
3. Load testing (if applicable)
4. Technical documentation
```

**Validation:**
```bash
# Full suite
npm run test
npm run test:e2e
npm run lint

# Or .NET
dotnet test
dotnet build --configuration Release
```

**Success criteria:** UAT (User Acceptance Testing) OK

**After execution - Final confirmation:**

```
AskUserQuestion({
  questions: [{
    question: "Phase 4 (Integration) completed. Is the feature ready for delivery?",
    header: "Validate P4",
    options: [
      { label: "Yes, feature complete", description: "Ready for merge/PR" },
      { label: "No, corrections needed", description: "Adjustments to make" }
    ],
    multiSelect: false
  }]
})
```

---

## End summary

```
IMPLEMENTATION COMPLETED
═══════════════════════════════════════════════════════════
Feature:     {{FEAT-XXX}} - {{NAME}}
═══════════════════════════════════════════════════════════
Executed phases:
  • Phase 1 - Data Layer:    ✅ Validated
  • Phase 2 - API Layer:     ✅ Validated
  • Phase 3 - UI Layer:      ✅ Validated
  • Phase 4 - Integration:   ✅ Validated
═══════════════════════════════════════════════════════════
Files created:
  • Entities:     {{X}} files
  • Migrations:   {{Y}} files
  • Endpoints:    {{Z}} files
  • Components:   {{W}} files
  • Tests:        {{N}} files
═══════════════════════════════════════════════════════════

NEXT STEPS:
  1. Create a PR: /gitflow:7-pull-request
  2. Or commit: /gitflow:3-commit
═══════════════════════════════════════════════════════════
```

---

## Usage modes

| Command | Action |
|---------|--------|
| `/business-analyse:7-dev FEAT-001` | Shows plan and asks which phase |
| `/business-analyse:7-dev FEAT-001 data` | Requests confirmation then executes Phase 1 |
| `/business-analyse:7-dev FEAT-001 api` | Requests confirmation then executes Phase 2 |
| `/business-analyse:7-dev FEAT-001 ui` | Requests confirmation then executes Phase 3 |
| `/business-analyse:7-dev FEAT-001 integration` | Requests confirmation then executes Phase 4 |
| `/business-analyse:7-dev FEAT-001 all` | Executes all phases with validation between each |

---

## Rules

1. **Mandatory validation** - NEVER automatic execution
2. **Double confirmation** - Show plan + confirm before action
3. **Phase by phase** - Validate each phase before next
4. **Rollback possible** - User can stop at any time
5. **FRD context** - Always based on handoff specs
6. **Tests after each phase** - Validation through automated tests
7. **Stack-agnostic** - Adapt to detected project stack
