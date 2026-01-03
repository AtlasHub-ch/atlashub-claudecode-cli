---
description: Phase 6 - Development prompt generation
model: opus
---

# Business Analyse - Handoff

Senior BA expert. Autonomous development prompt generation.

## Arguments

```
/business-analyse:handoff [feature-id]
```

- `feature-id`: Feature identifier (e.g., FEAT-001)

## Prerequisites

```bash
# Verify that FRD exists and is validated
test -f ".business-analyse/applications/*/modules/*/features/$ARGUMENTS/3-functional-specification.md" || \
  echo "Execute /business-analyse:specify first"
```

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

## 2. Implementation scope

### 2.1 Included (to implement)
- [ ] {{ITEM_1}}
- [ ] {{ITEM_2}}
- [ ] {{ITEM_3}}

### 2.2 Excluded (out of scope)
- {{EXCLUSION_1}}
- {{EXCLUSION_2}}

### 2.3 Dependencies
| Dependency | Type | Status |
|------------|------|--------|
| {{DEP}} | Technical/Data | Resolved/Pending |

---

## 3. Data model

### 3.1 Entities to create/modify

#### {{ENTITY_NAME}}

```
Attributes:
  - id: UUID (PK, auto-generated)
  - name: string (2-100 chars, required, unique)
  - description: string? (max 500 chars, optional)
  - status: enum [active, inactive, archived] (default: active)
  - created_at: datetime (auto, immutable)
  - updated_at: datetime (auto)
  - created_by: UUID (FK → User)

Relations:
  - belongs_to: User (created_by)
  - has_many: {{RELATED_ENTITY}}

Suggested indexes:
  - (name) UNIQUE
  - (status, created_at)

Constraints:
  - name NOT NULL
  - status IN ('active', 'inactive', 'archived')
```

#### {{ENTITY_NAME_2}}
...

### 3.2 ER Diagram

```mermaid
erDiagram
    {{ER_DIAGRAM}}
```

### 3.3 Suggested migration
- Name: `Add{{FeatureName}}`
- Tables: {{LIST}}
- Order: {{ORDER}}

---

## 4. API Endpoints

### 4.1 Overview

| Method | Route | Description | Auth | Roles |
|--------|-------|-------------|------|-------|
| GET | /api/v2/{{resource}} | Paginated list | Yes | User, Admin |
| GET | /api/v2/{{resource}}/:id | Detail | Yes | User, Admin |
| POST | /api/v2/{{resource}} | Creation | Yes | Admin |
| PUT | /api/v2/{{resource}}/:id | Modification | Yes | Admin |
| DELETE | /api/v2/{{resource}}/:id | Deletion | Yes | Admin |

### 4.2 Endpoint details

#### GET /api/v2/{{resource}}

**Description**: Returns paginated list of {{resource}}

**Query Parameters**:
- `page` (int, default: 1): Page number
- `limit` (int, default: 20, max: 100): Items per page
- `status` (string, optional): Filter by status
- `search` (string, optional): Search on name

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Business rules**:
- BR-001: Only items with status != 'archived' are returned by default
- BR-002: Search is case-insensitive

#### POST /api/v2/{{resource}}

**Description**: Creates a new {{resource}}

**Request Body**:
```json
{
  "name": "string (required, 2-100)",
  "description": "string (optional, max 500)"
}
```

**Validations**:
- `name`: Required, 2-100 chars, unique
- `description`: Optional, max 500 chars

**Response 201**:
```json
{
  "id": "uuid",
  "name": "string",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Errors**:
- 400: Validation failed
- 409: Name already exists

---

## 5. User interface

### 5.1 Pages to create

| Page | URL | Description | Roles |
|------|-----|-------------|-------|
| List | /{{module}}/{{resource}} | List with filters | User, Admin |
| Form | /{{module}}/{{resource}}/new | Creation | Admin |
| Detail | /{{module}}/{{resource}}/:id | Detailed view | User, Admin |
| Edit | /{{module}}/{{resource}}/:id/edit | Modification | Admin |

### 5.2 Wireframes

#### List Page

```
┌─────────────────────────────────────────────────────────────────┐
│ {{APP_NAME}}                                    [User ▼] [Exit] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  {{RESOURCE_PLURAL}}                           [+ New]          │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Search: [________________________] [🔍]                        │
│  Filters:   [Status ▼]                                          │
│                                                                 │
│  ┌─────┬─────────────┬──────────┬──────────┬─────────────┐      │
│  │ ☐   │ Name        │ Status   │ Created  │ Actions     │      │
│  ├─────┼─────────────┼──────────┼──────────┼─────────────┤      │
│  │ ☐   │ Item 1      │ ● Active │ 01/15/24 │ [✎] [🗑]   │      │
│  │ ☐   │ Item 2      │ ○ Inactive│ 01/16/24│ [✎] [🗑]   │      │
│  └─────┴─────────────┴──────────┴──────────┴─────────────┘      │
│                                                                 │
│  [◀ Previous]  Page 1/5  [Next ▶]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Behaviors**:
- Search: Real-time filter after 300ms debounce
- [+ New]: Visible only if Admin role
- [✎][🗑]: Visible only if Admin role
- [🗑]: Confirmation before deletion

#### Form Page

```
┌─────────────────────────────────────────────────────────────────┐
│ {{APP_NAME}}                                    [User ▼] [Exit] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ◀ Back to list                                                 │
│                                                                 │
│  New {{RESOURCE}}                                               │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │  Name *                                                 │    │
│  │  [_____________________________________________]        │    │
│  │  ⚠️ 2 to 100 characters                                 │    │
│  │                                                         │    │
│  │  Description                                            │    │
│  │  [                                                 ]    │    │
│  │  [                                                 ]    │    │
│  │  [_________________________________________________]    │    │
│  │  0/500 characters                                       │    │
│  │                                                         │    │
│  │                          [Cancel] [Create]              │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Front-end validations**:
- Name: Required, 2-100 chars
- Description: Max 500 chars
- Create button: Disabled if form invalid

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

| ID | Rule | Implementation |
|----|------|----------------|
| BR-001 | Name must be unique | DB constraint + API validation |
| BR-002 | Only Admin can create/modify | Auth middleware + [Authorize] |
| BR-003 | Soft delete (archiving) | status = 'archived', no real DELETE |
| BR-004 | Audit trail | created_by, created_at, updated_at auto |

---

## 7. Permissions

| Action | Admin | User | Anonymous |
|--------|-------|------|-----------|
| View list | ✓ | ✓ | ✗ |
| View detail | ✓ | ✓ | ✗ |
| Create | ✓ | ✗ | ✗ |
| Modify | ✓ | ✗ | ✗ |
| Delete | ✓ | ✗ | ✗ |

---

## 8. Suggested implementation order

### Phase 1: Backend Core
1. [ ] Create entity {{Entity}}
2. [ ] Configure DbContext
3. [ ] Create migration `Add{{Feature}}`
4. [ ] Create DTOs (Request/Response)
5. [ ] Implement {{Entity}}Controller

### Phase 2: Backend Validation
6. [ ] Add FluentValidation validations
7. [ ] Implement business rules (BR-001 to BR-004)
8. [ ] Add error handling

### Phase 3: Frontend
9. [ ] Create List page
10. [ ] Create Form page (Create/Edit)
11. [ ] Implement front-end validations
12. [ ] Add toast messages

### Phase 4: Finalization
13. [ ] Write unit tests (Controller)
14. [ ] Write integration tests
15. [ ] Verify permissions
16. [ ] Code review

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
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code review completed

---

*Generated by Business Analyse - {{DATE}}*
*This prompt can be used directly with Claude Code or any development assistant.*
```

### Summary

```
HANDOFF GENERATED
═══════════════════════════════════════════════════════════
Feature:     {{FEAT-XXX}} - {{NAME}}
═══════════════════════════════════════════════════════════
Development prompt created:
  • Entities:     {{X}} specified
  • Endpoints:    {{Y}} documented
  • Pages:        {{Z}} wireframed
  • Rules:        {{W}} to implement
  • Steps:        {{N}} implementation steps
═══════════════════════════════════════════════════════════
Document: .../{{FEAT-XXX}}/4-development-handoff.md

USAGE:
  1. Copy handoff content
  2. Use it as a prompt for the developer
  3. Or execute it with Claude Code

⚠️  THE BA HAS FINISHED THEIR WORK
    The developer takes over for implementation.
═══════════════════════════════════════════════════════════
```

## Rules

1. **Autonomous prompt** - All context included
2. **Logical order** - Backend → Frontend → Tests
3. **Clear DoD** - Explicit validation criteria
4. **No code** - Specs only, dev codes
5. **References** - Links to detailed docs
6. **Ready to use** - Directly usable
