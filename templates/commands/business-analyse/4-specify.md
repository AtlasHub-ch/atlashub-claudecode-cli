---
description: Phase 4 - Functional specifications FRD (ULTRATHINK)
---

# Business Analyse - Specify

Senior BA expert in specifications. ULTRATHINK mode mandatory.

## Arguments

```
/business-analyse:specify [feature-id]
```

- `feature-id`: Feature identifier (e.g., FEAT-001)

## Prerequisites

```bash
# Verify that BRD exists
test -f ".business-analyse/applications/*/modules/*/features/$ARGUMENTS/2-business-requirements.md" || \
  echo "Execute /business-analyse:analyse first"
```

## ULTRATHINK Mode

**IMPORTANT**: This phase uses the `ultrathink` skill for precise specifications.

```
Skill(skill="ultrathink", args="Detailed functional specifications FRD")
```

Approach to adopt:
- Specify with surgical precision
- No ambiguity tolerated
- Complete use cases
- Verifiable acceptance criteria

## Workflow

### Step 1: Load context

```bash
cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/2-business-requirements.md"
cat .business-analyse/config.json
```

### Step 2: Detailed use cases

For each feature, create a complete use case:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ USE CASE: UC-{{XXX}} - {{NAME}}                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ Primary actor: {{ACTOR}}                                                │
│ Secondary actors: {{SECONDARY_ACTORS}}                                  │
│ Preconditions: {{PRECONDITIONS}}                                        │
│ Postconditions (success): {{SUCCESS_POSTCONDITIONS}}                    │
│ Postconditions (failure): {{FAILURE_POSTCONDITIONS}}                    │
├─────────────────────────────────────────────────────────────────────────┤
│ MAIN SCENARIO (Happy Path)                                              │
│ ──────────────────────────                                              │
│ 1. {{ACTOR}} {{ACTION_1}}                                               │
│ 2. The system {{REACTION_1}}                                            │
│ 3. {{ACTOR}} {{ACTION_2}}                                               │
│ 4. The system {{REACTION_2}}                                            │
│ 5. ...                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ EXTENSIONS (Alternative flows)                                          │
│ ──────────────────────────────                                          │
│ 2a. If {{CONDITION}}:                                                   │
│     2a.1. The system {{ALTERNATIVE_ACTION}}                             │
│     2a.2. Return to step 3                                              │
│                                                                         │
│ 4a. If {{ERROR}}:                                                       │
│     4a.1. The system displays "{{ERROR_MESSAGE}}"                       │
│     4a.2. The use case ends                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ APPLICABLE BUSINESS RULES                                               │
│ ─────────────────────────                                               │
│ • BR-001: {{RULE}}                                                      │
│ • BR-002: {{RULE}}                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Step 3: Interface specifications (ASCII Wireframes)

For each screen, create an ASCII wireframe:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SCREEN: {{SCREEN_NAME}}                                                 │
│ URL: {{URL_PATTERN}}                                                    │
│ Authorized roles: {{ROLES}}                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ {{APP_NAME}}                              [User ▼] [Logout]     │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │ [Menu1] [Menu2] [Menu3]                                         │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                 │    │
│  │  {{PAGE_TITLE}}                           [+ New]               │    │
│  │  ─────────────────────────────────────────────────────────      │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │ Search: [________________________] [🔍]                  │    │    │
│  │  │ Filters:   [Status ▼] [Date ▼]                          │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  │                                                                 │    │
│  │  ┌──────┬─────────────┬──────────┬─────────┬─────────────┐     │    │
│  │  │ ☐    │ Name        │ Status   │ Date    │ Actions     │     │    │
│  │  ├──────┼─────────────┼──────────┼─────────┼─────────────┤     │    │
│  │  │ ☐    │ Item 1      │ ● Active │ 01/01   │ [✎] [🗑]    │     │    │
│  │  │ ☐    │ Item 2      │ ○ Inactive│ 02/01  │ [✎] [🗑]    │     │    │
│  │  └──────┴─────────────┴──────────┴─────────┴─────────────┘     │    │
│  │                                                                 │    │
│  │  [◀ Previous]  Page 1 of 5  [Next ▶]                           │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ INTERACTIVE ELEMENTS                                                    │
│ ───────────────────                                                     │
│ • [+ New]: Opens creation form (see screen FORM-001)                    │
│ • [✎]: Opens edit form with pre-filled data                            │
│ • [🗑]: Confirmation then deletion (soft delete if applicable)          │
│ • Search: Real-time filter on name                                      │
│ • Pagination: 20 items per page                                         │
│                                                                         │
│ FRONT-END VALIDATIONS                                                   │
│ ─────────────────────                                                   │
│ • Minimum 1 item selected for bulk actions                              │
│ • Confirmation required before deletion                                 │
│                                                                         │
│ MESSAGES                                                                │
│ ────────                                                                │
│ • Creation success: "{{ENTITY}} created successfully"                   │
│ • Deletion success: "{{ENTITY}} deleted"                                │
│ • Error: "An error occurred. Please try again."                         │
│ • Empty: "No results found. Create your first {{ENTITY}}."              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Step 3bis: Navigation Matrix (Hierarchical Access)

For applications with hierarchical data structures (Master-Detail patterns), document the navigation matrix:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ NAVIGATION MATRIX - Hierarchical Data Access                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ENTRY POINT: {{MODULE_ROUTE}} (e.g., /domains)                          │
│                                                                         │
│ From: {{MASTER_ENTITY}} (e.g., Domain)                                  │
│ ├── Direct Access: {{CHILD_1}} (e.g., Users → /domains/{id}/users)      │
│ ├── Direct Access: {{CHILD_2}} (e.g., Projects → /domains/{id}/projects)│
│ ├── Direct Access: {{CHILD_3}} (e.g., Sources → /domains/{id}/sources)  │
│ └── Context preserved: Domain context visible in all child views        │
│                                                                         │
│ NAVIGATION PATTERN:                                                     │
│ ┌──────────┐    ┌──────────────┐    ┌────────────────┐                  │
│ │  Module  │───►│ Master List  │───►│ Master Detail  │                  │
│ │  Route   │    │  (domains)   │    │  (domain/123)  │                  │
│ └──────────┘    └──────────────┘    └───────┬────────┘                  │
│                                             │                           │
│                 ┌───────────────────────────┼───────────────────────┐   │
│                 ▼                           ▼                       ▼   │
│         ┌──────────────┐          ┌──────────────┐          ┌──────────┐│
│         │ Child View 1 │          │ Child View 2 │          │ Child N  ││
│         │   (users)    │          │  (projects)  │          │ (sources)││
│         └──────────────┘          └──────────────┘          └──────────┘│
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ CONTEXT RULES                                                           │
│ ─────────────                                                           │
│ • Parent context always visible in breadcrumb                           │
│ • Child operations scoped to parent (no orphan creation)                │
│ • Cross-reference links to related entities                             │
│ • Back navigation preserves filter state                                │
└─────────────────────────────────────────────────────────────────────────┘
```

**Navigation Matrix Table:**

| From Entity | To Entity | Route Pattern | Relationship | Context Preserved |
|-------------|-----------|---------------|--------------|-------------------|
| {{MASTER}} | {{CHILD_1}} | /{{master}}/{id}/{{child1}} | 1:N | Master ID, Name |
| {{MASTER}} | {{CHILD_2}} | /{{master}}/{id}/{{child2}} | 1:N | Master ID, Name |
| {{CHILD_1}} | {{GRANDCHILD}} | /{{child1}}/{id}/{{grandchild}} | 1:N | Child + Master context |

### Step 3ter: Data Access Patterns

Document how users access related data from a given context:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DATA ACCESS PATTERNS - Cross-Entity Navigation                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ SCENARIO: User is on {{MASTER_DETAIL}} page                             │
│ ──────────────────────────────────────                                  │
│                                                                         │
│ ACCESSIBLE DATA:                                                        │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ Current Entity: {{MASTER}}                                        │   │
│ │ ─────────────────────────                                         │   │
│ │ • All {{MASTER}} attributes displayed                             │   │
│ │ • Edit/Delete actions available (based on permissions)            │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ Related Entities (tabs or sections):                              │   │
│ │ ──────────────────────────────────                                │   │
│ │ [TAB 1: {{CHILD_1}}]   Count: {{N}} | Quick actions: View, Add    │   │
│ │ [TAB 2: {{CHILD_2}}]   Count: {{N}} | Quick actions: View, Add    │   │
│ │ [TAB 3: {{CHILD_3}}]   Count: {{N}} | Quick actions: View, Add    │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ Cross-References (links to other masters):                        │   │
│ │ ────────────────────────────────────────                          │   │
│ │ • Owner → User profile (view only)                                │   │
│ │ • Category → Category detail (view only)                          │   │
│ │ • Parent → Parent entity (navigate up)                            │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ ACCESS CONTROL PER RELATIONSHIP                                         │
│ ───────────────────────────────                                         │
│                                                                         │
│ | Relationship | View | Add | Edit | Delete | Filter |                  │
│ |--------------|------|-----|------|--------|--------|                  │
│ | {{CHILD_1}}  | ✓    | ✓   | ✓    | ✓      | ✓      |                  │
│ | {{CHILD_2}}  | ✓    | ✓   | ✗    | ✗      | ✓      |                  │
│ | {{REF}}      | ✓    | ✗   | ✗    | ✗      | ✗      |                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Data Access Summary Table:**

| From Context | Data Accessible | Access Type | Actions Available |
|--------------|-----------------|-------------|-------------------|
| {{MASTER}} Detail | {{CHILD_1}} list | Owned | CRUD, Filter, Export |
| {{MASTER}} Detail | {{CHILD_2}} list | Owned | CRUD, Filter |
| {{MASTER}} Detail | {{REF_ENTITY}} | Reference | View only |
| {{CHILD}} Detail | Parent {{MASTER}} | Parent | View, Navigate up |

### Step 4: Field specifications

For each form, precisely document the fields:

| Field | Label | Type | Mandatory | Validation | Default | Help |
|-------|-------|------|-----------|------------|---------|------|
| `name` | Name | text | Yes | 2-100 chars, alphanum | - | "Unique name" |
| `email` | Email | email | Yes | Valid email format | - | - |
| `status` | Status | select | Yes | [active, inactive] | active | - |
| `date` | Date | date | No | >= today | today | - |

### Step 5: API specifications (if applicable)

For each endpoint, document:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ENDPOINT: {{METHOD}} {{ROUTE}}                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Description: {{DESCRIPTION}}                                            │
│ Authentication: {{AUTH_REQUIRED}}                                       │
│ Authorized roles: {{ROLES}}                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ REQUEST                                                                 │
│ ───────                                                                 │
│ Headers:                                                                │
│   Authorization: Bearer {{token}}                                       │
│   Content-Type: application/json                                        │
│                                                                         │
│ Path params:                                                            │
│   {{param}}: {{type}} - {{description}}                                 │
│                                                                         │
│ Query params:                                                           │
│   page: int (default: 1) - Page number                                  │
│   limit: int (default: 20, max: 100) - Items per page                   │
│                                                                         │
│ Body (JSON):                                                            │
│   {                                                                     │
│     "field1": "string (required, 2-100)",                               │
│     "field2": "number (optional)"                                       │
│   }                                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ RESPONSES                                                               │
│ ─────────                                                               │
│ 200 OK:                                                                 │
│   {                                                                     │
│     "data": [...],                                                      │
│     "pagination": { "page": 1, "total": 100 }                           │
│   }                                                                     │
│                                                                         │
│ 400 Bad Request:                                                        │
│   { "error": "Validation failed", "details": [...] }                    │
│                                                                         │
│ 401 Unauthorized:                                                       │
│   { "error": "Authentication required" }                                │
│                                                                         │
│ 403 Forbidden:                                                          │
│   { "error": "Insufficient permissions" }                               │
│                                                                         │
│ 404 Not Found:                                                          │
│   { "error": "Resource not found" }                                     │
│                                                                         │
│ 500 Internal Server Error:                                              │
│   { "error": "An unexpected error occurred" }                           │
├─────────────────────────────────────────────────────────────────────────┤
│ APPLICABLE BUSINESS RULES                                               │
│ ─────────────────────────                                               │
│ • BR-001: {{RULE}}                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Step 6: Acceptance criteria (Gherkin)

For each requirement, write testable criteria:

```gherkin
Feature: {{FEATURE_NAME}}

  Background:
    Given the user is logged in with role "{{ROLE}}"
    And they are on page "{{PAGE}}"

  @{{TAG}}
  Scenario: {{SCENARIO_NAME}} - Happy path
    Given {{PRECONDITION}}
    When the user {{ACTION}}
    Then the system {{EXPECTED_RESULT}}
    And {{ADDITIONAL_VERIFICATION}}

  @{{TAG}}
  Scenario: {{SCENARIO_NAME}} - Error case
    Given {{PRECONDITION}}
    When the user {{INVALID_ACTION}}
    Then the system displays message "{{ERROR_MESSAGE}}"
    And {{PRESERVED_STATE}}

  @{{TAG}}
  Scenario Outline: {{SCENARIO_NAME}} - Validation
    Given the user enters "<value>" in field "{{FIELD}}"
    When they submit the form
    Then the result is "<result>"

    Examples:
      | value         | result      |
      | valid_value   | success     |
      | empty_value   | error       |
      | too_long      | error       |
```

### Step 7: Completeness checklist (85% minimum)

Evaluate with the checklist:

```bash
cat .claude/commands/business-analyse/_resources/checklist-specification.md
```

| Category | Criterion | Status |
|----------|-----------|--------|
| **Context (4/4)** | | |
| | Objective documented | ✓/✗ |
| | Scope defined | ✓/✗ |
| | Stakeholders identified | ✓/✗ |
| | Priority established | ✓/✗ |
| **Use Cases (6/6)** | | |
| | Complete happy path | ✓/✗ |
| | Extensions documented | ✓/✗ |
| | Preconditions | ✓/✗ |
| | Postconditions | ✓/✗ |
| | Actors identified | ✓/✗ |
| | Linked business rules | ✓/✗ |
| **Interface (6/6)** | | |
| | Wireframes present | ✓/✗ |
| | URLs defined | ✓/✗ |
| | Roles per screen | ✓/✗ |
| | Interactive elements | ✓/✗ |
| | Messages defined | ✓/✗ |
| | Front validations | ✓/✗ |
| **Data (5/5)** | | |
| | Fields specified | ✓/✗ |
| | Data types | ✓/✗ |
| | Validations | ✓/✗ |
| | Default values | ✓/✗ |
| | Mandatory/optional | ✓/✗ |
| **API (5/5)** | | |
| | Endpoints documented | ✓/✗ |
| | Request/Response | ✓/✗ |
| | Error codes | ✓/✗ |
| | Auth/Permissions | ✓/✗ |
| | Back validations | ✓/✗ |
| **Tests (4/4)** | | |
| | Acceptance criteria | ✓/✗ |
| | Gherkin scenarios | ✓/✗ |
| | Nominal cases | ✓/✗ |
| | Error cases | ✓/✗ |
| **Navigation (4/4)** | _(if hierarchical data)_ | |
| | Navigation Matrix defined | ✓/✗/N/A |
| | Data Access Patterns documented | ✓/✗/N/A |
| | Context preservation rules | ✓/✗/N/A |
| | Breadcrumb structure | ✓/✗/N/A |

**Score**: {{X}}/30 ({{PERCENT}}%) _(+4 if hierarchical: {{X}}/34)_
**Threshold**: 85% (26/30 or 29/34 if hierarchical)

### Step 7bis: Implementation plan (if complexity > Standard)

**Trigger**: If complexity detected in phase 2-Discover is "Complex" or "Critical", breakdown into testable phases is **mandatory**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ IMPLEMENTATION PLAN - Breakdown into testable phases                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Detected complexity: {{COMPLEXITY}}                                     │
│ Breakdown: {{MANDATORY if Complex/Critical | OPTIONAL if Standard}}     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ PHASE 1: DATA LAYER (Backend - Testable in isolation)                   │
│ ─────────────────────────────────────────────                           │
│ Scope:                                                                  │
│   • Entities / Data models                                              │
│   • EF Core migrations / SQL                                            │
│   • Repository pattern (if applicable)                                  │
│   • Seed data (test data)                                               │
│                                                                         │
│ Deliverable: Functional data model                                      │
│ Tests: Repository unit tests + Migration tests                          │
│ Validation criterion: `dotnet ef database update` OK                    │
│ Complexity estimate: {{LOW|MEDIUM|HIGH}}                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ PHASE 2: API LAYER (Backend - Testable in isolation)                    │
│ ─────────────────────────────────────────────────                       │
│ Scope:                                                                  │
│   • Controllers / REST Endpoints                                        │
│   • Services / Business logic                                           │
│   • Backend validations                                                 │
│   • DTOs / Mapping                                                      │
│                                                                         │
│ Deliverable: Functional API (Swagger/Postman testable)                  │
│ Tests: API integration tests + Service unit tests                       │
│ Validation criterion: All endpoints respond correctly                   │
│ Dependencies: Phase 1 complete                                          │
│ Complexity estimate: {{LOW|MEDIUM|HIGH}}                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ PHASE 3: UI LAYER (Frontend - Testable in isolation)                    │
│ ─────────────────────────────────────────────────                       │
│ Scope:                                                                  │
│   • UI Components (React/Angular/Vue/Blazor)                            │
│   • State management                                                    │
│   • Forms and front-end validations                                     │
│   • API integration (HTTP calls)                                        │
│                                                                         │
│ Deliverable: Functional user interface                                  │
│ Tests: Component tests + E2E tests (Cypress/Playwright)                 │
│ Validation criterion: Gherkin scenarios pass in E2E                     │
│ Dependencies: Phase 2 complete (API available)                          │
│ Complexity estimate: {{LOW|MEDIUM|HIGH}}                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ PHASE 4: INTEGRATION & FINALIZATION                                     │
│ ─────────────────────────────────                                       │
│ Scope:                                                                  │
│   • Complete wiring (front ↔ back)                                      │
│   • Complete end-to-end tests                                           │
│   • Performance / Optimization                                          │
│   • Technical documentation                                             │
│                                                                         │
│ Deliverable: Complete and validated feature                             │
│ Tests: Complete E2E suite + Load tests (if applicable)                  │
│ Validation criterion: UAT (User Acceptance Testing) OK                  │
│ Dependencies: Phases 1, 2, 3 complete                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Phase summary table:**

| Phase | Scope | Deliverable | Tests | Validation | Deps |
|-------|-------|-------------|-------|------------|------|
| 1. Data | Entities, Migrations | DB Schema | Unit + Migration | EF OK | - |
| 2. API | Endpoints, Services | REST API | Integration | Swagger OK | P1 |
| 3. UI | Components, Forms | Interface | E2E | Gherkin OK | P2 |
| 4. Integration | Wiring, Perf | Feature | Full E2E | UAT OK | P1-3 |

**Breakdown rule:**

| Complexity | Required phases | Justification |
|------------|-----------------|---------------|
| Simple CRUD | No breakdown | Direct implementation possible |
| Standard | Optional | Recommended if > 3 endpoints |
| Complex | **Mandatory** | Too many risks without breakdown |
| Critical | **Mandatory + Reviews** | Each phase requires validation |

### Step 8: Generate FRD

Create `3-functional-specification.md`:

```markdown
# Functional Requirements Document - {{FEATURE_NAME}}

**ID**: {{FEAT-XXX}}
**Version**: 1.0
**Date**: {{DATE}}
**Status**: Draft
**Author**: Claude (Business Analyse)
**Source**: BRD v1.0

---

## 1. Overview

### 1.1 Objective
{{OBJECTIVE}}

### 1.2 References
| Document | Version | Link |
|----------|---------|------|
| BRD | 1.0 | [2-business-requirements.md](./2-business-requirements.md) |
| Discovery | 1.0 | [1-discovery.md](./1-discovery.md) |

### 1.3 Terminology
See [glossary.md](../../../glossary.md)

---

## 2. Use Cases

### 2.1 Use case diagram

```mermaid
graph LR
    subgraph Actors
        A1[{{ACTOR_1}}]
        A2[{{ACTOR_2}}]
    end
    subgraph "Feature: {{NAME}}"
        UC1((UC-001))
        UC2((UC-002))
    end
    A1 --> UC1
    A1 --> UC2
    A2 --> UC1
```

### 2.2 UC-001: {{NAME}}

{{COMPLETE_USE_CASE}}

### 2.3 UC-002: {{NAME}}

{{COMPLETE_USE_CASE}}

---

## 3. Interface Specifications

### 3.1 Navigation plan

```mermaid
flowchart TD
    {{NAVIGATION_FLOW}}
```

### 3.2 Navigation Matrix (if hierarchical data)

> **Note**: Include this section if the feature involves Master-Detail relationships or hierarchical data access.

**Entry Point**: {{MODULE_ROUTE}}

| From Entity | To Entity | Route Pattern | Relationship | Context Preserved |
|-------------|-----------|---------------|--------------|-------------------|
| {{MASTER}} | {{CHILD_1}} | /{{master}}/{id}/{{child1}} | 1:N | Master ID, Name |
| {{MASTER}} | {{CHILD_2}} | /{{master}}/{id}/{{child2}} | 1:N | Master ID, Name |

**Context Rules:**
- Parent context visible in breadcrumb
- Child operations scoped to parent
- Back navigation preserves filter state

### 3.3 Data Access Patterns (if hierarchical data)

> **Note**: Include this section if users need to access related data from a parent context.

| From Context | Data Accessible | Access Type | Actions Available |
|--------------|-----------------|-------------|-------------------|
| {{MASTER}} Detail | {{CHILD_1}} list | Owned | CRUD, Filter, Export |
| {{MASTER}} Detail | {{CHILD_2}} list | Owned | CRUD, Filter |
| {{MASTER}} Detail | {{REF_ENTITY}} | Reference | View only |

### 3.4 Screens

#### 3.4.1 {{SCREEN_NAME}}

{{ASCII_WIREFRAME}}

#### 3.4.2 {{SCREEN_NAME}}

{{ASCII_WIREFRAME}}

---

## 4. Data Specifications

### 4.1 Forms

#### {{FORM_NAME}}

| Field | Label | Type | Mandatory | Validation | Default | Help |
|-------|-------|------|-----------|------------|---------|------|
{{FIELDS_TABLE}}

---

## 5. API Specifications

### 5.1 Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
{{ENDPOINTS_TABLE}}

### 5.2 Endpoint details

{{ENDPOINT_DETAILS}}

---

## 6. Validation Rules

### 6.1 Front-end Validations

| Field | Rule | Error message |
|-------|------|---------------|
{{FRONT_VALIDATION}}

### 6.2 Back-end Validations

| Endpoint | Rule | Code | Message |
|----------|------|------|---------|
{{BACK_VALIDATION}}

---

## 7. Messages and Notifications

### 7.1 Success messages

| Action | Message |
|--------|---------|
{{SUCCESS_MESSAGES}}

### 7.2 Error messages

| Error | Message | User action |
|-------|---------|-------------|
{{ERROR_MESSAGES}}

---

## 8. Acceptance Criteria

### 8.1 Test scenarios

```gherkin
{{GHERKIN_SCENARIOS}}
```

### 8.2 Coverage matrix

| Requirement | Use Case | Scenario | Status |
|-------------|----------|----------|--------|
{{COVERAGE_MATRIX}}

---

## 9. Implementation Plan

> **Note**: This section is mandatory if complexity = Complex or Critical

### 9.1 Phase breakdown

| Phase | Scope | Deliverable | Tests | Validation | Status |
|-------|-------|-------------|-------|------------|--------|
| 1. Data | {{DATA_SCOPE}} | DB Schema | Unit | EF OK | ⏳ |
| 2. API | {{API_SCOPE}} | REST API | Integration | Swagger OK | ⏳ |
| 3. UI | {{UI_SCOPE}} | Interface | E2E | Gherkin OK | ⏳ |
| 4. Integration | Wiring | Feature | Full E2E | UAT OK | ⏳ |

### 9.2 Phase 1 Detail: Data Layer

**Scope:**
{{DATA_LAYER_DETAILS}}

**Entities to create:**
- [ ] {{ENTITY_1}}
- [ ] {{ENTITY_2}}

**Migrations:**
- [ ] {{MIGRATION_NAME}}

**Validation criterion:** `dotnet ef database update` without errors

### 9.3 Phase 2 Detail: API Layer

**Scope:**
{{API_LAYER_DETAILS}}

**Endpoints to implement:**
- [ ] {{ENDPOINT_1}}
- [ ] {{ENDPOINT_2}}

**Validation criterion:** All endpoints testable via Swagger/Postman

### 9.4 Phase 3 Detail: UI Layer

**Scope:**
{{UI_LAYER_DETAILS}}

**Components to create:**
- [ ] {{COMPONENT_1}}
- [ ] {{COMPONENT_2}}

**Validation criterion:** Gherkin scenarios pass in E2E

### 9.5 Phase 4 Detail: Integration

**Scope:**
- Front ↔ back wiring
- Complete end-to-end tests
- Performance optimizations

**Validation criterion:** UAT (User Acceptance Testing) OK

---

## 10. Appendices

### 10.1 Completeness checklist

Score: {{SCORE}}/30 ({{PERCENT}}%) _(+4 if hierarchical data: {{SCORE}}/34)_

**Navigation criteria (if applicable):**
- [ ] Navigation Matrix defined
- [ ] Data Access Patterns documented
- [ ] Context preservation rules
- [ ] Breadcrumb structure

### 10.2 Resolved questions

{{RESOLVED_QUESTIONS}}

### 10.3 Decisions made

| Decision | Justification | Date |
|----------|---------------|------|
{{DECISIONS}}

---

## Modification History

| Version | Date | Author | Modifications |
|---------|------|--------|---------------|
| 1.0 | {{DATE}} | Claude BA | Initial creation |

---

*Generated by Business Analyse - {{DATE}}*
```

### Summary

```
SPECIFICATIONS COMPLETE
═══════════════════════════════════════════════════════════
Feature:     {{FEAT-XXX}} - {{NAME}}
═══════════════════════════════════════════════════════════
Content:
  • Use Cases:       {{X}} documented
  • Screens:         {{Y}} wireframed
  • Endpoints:       {{Z}} specified
  • Criteria:        {{W}} Gherkin scenarios

Completeness score:  {{SCORE}}/30 ({{PERCENT}}%)
Threshold:           85% (26/30) ✓/✗
═══════════════════════════════════════════════════════════
Document: .../{{FEAT-XXX}}/3-functional-specification.md
═══════════════════════════════════════════════════════════
Next: /business-analyse:document {{FEAT-XXX}}
```

## Rules

1. **ULTRATHINK mandatory** - Maximum precision
2. **Zero ambiguity** - Each spec must be clear
3. **ASCII Wireframes** - Visualization without external tools
4. **Testable Gherkin** - Verifiable criteria
5. **85%+ Score** - Minimum to validate
6. **No code** - Functional specs, not technical
7. **Mandatory breakdown if Complex/Critical** - Testable API/UI/Integration phases

## Content Rules (CRITICAL)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  FRD IS A FUNCTIONAL DOCUMENT - NOT A TECHNICAL GUIDE                    ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  The FRD describes WHAT the system should do, not HOW to build it.       ║
║  It is written for stakeholders, product owners, and developers          ║
║  to UNDERSTAND requirements - not to copy-paste code.                    ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### ALLOWED in FRD ✓

| Category | Content Type | Example |
|----------|--------------|---------|
| **Use Cases** | Actor-based scenarios | "User clicks Save, system validates..." |
| **Wireframes** | ASCII mockups | Visual layout with `┌─────┐` boxes |
| **Fields** | Specification tables | `name \| string \| 2-100 chars \| required` |
| **API Specs** | Endpoint descriptions | `POST /api/resource` with response structure |
| **Business Rules** | Text descriptions | "BR-001: Name must be unique" |
| **Messages** | User-facing text | "Item created successfully" |
| **Gherkin** | Acceptance criteria | `Given/When/Then` scenarios |
| **ER Diagrams** | Mermaid relationships | Entity relationships |

### Rule Levels: Business vs Functional vs Technical

```
╔══════════════════════════════════════════════════════════════════════════╗
║  THREE LEVELS OF RULES - KNOW THE DIFFERENCE                             ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  BUSINESS RULE (BA writes, PO validates)                                 ║
║  ────────────────────────────────────────                                ║
║  "Each domain must have an identified owner"                             ║
║  → WHY something must happen (business value)                            ║
║                                                                          ║
║  FUNCTIONAL CONSTRAINT (BA writes)                                       ║
║  ─────────────────────────────────                                       ║
║  "Name field accepts 2-100 characters"                                   ║
║  → WHAT the system enforces (user-facing behavior)                       ║
║                                                                          ║
║  TECHNICAL IMPLEMENTATION (Developer decides)                            ║
║  ────────────────────────────────────────────                            ║
║  "VARCHAR(100) NOT NULL, FK constraint"                                  ║
║  → HOW it's built (code-level detail)                                    ║
║                                                                          ║
║  ⚠️ FRD contains BUSINESS + FUNCTIONAL only. Never TECHNICAL.            ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Rule writing examples:**

| Level | WRONG ❌ | CORRECT ✓ |
|-------|----------|-----------|
| Business | "Add FK to User table" | "Owner must be a registered user" |
| Functional | "VARCHAR(100)" | "Name: 2-100 characters" |
| Technical | _(not in FRD)_ | _(developer decides)_ |

### FORBIDDEN in FRD ✗

| Category | Why Forbidden | Instead Use |
|----------|---------------|-------------|
| **Source Code** (C#, JS, Python) | FRD is not implementation | Describe behavior in text |
| **Class Definitions** | Technical detail | Entity attribute tables |
| **SQL Scripts** | Database implementation | Seed data described in tables |
| **Razor/HTML Components** | UI implementation | ASCII wireframes |
| **Controller/Service Code** | Backend implementation | API endpoint descriptions |
| **Migration Code** | EF Core detail | Entity relationship descriptions |

### Examples

**WRONG** ❌ (Code in FRD):
```csharp
public class DataGovernanceRole
{
    public int Id { get; set; }
    public string Name { get; set; }
}
```

**CORRECT** ✓ (Functional description):
```
Entity: DataGovernanceRole
| Attribute | Type | Constraints | Business Purpose |
|-----------|------|-------------|------------------|
| Id | integer | PK, auto | Unique identifier |
| Name | string | max 100, required | Display name for UI |
```

**WRONG** ❌ (SQL in FRD):
```sql
INSERT INTO Roles VALUES ('DATA_OWNER', 'Data Owner');
```

**CORRECT** ✓ (Seed data description):
```
Initial Data (to be seeded):
| Code | Name | Description |
|------|------|-------------|
| DATA_OWNER | Data Owner | Business owner responsible for data value |
```
