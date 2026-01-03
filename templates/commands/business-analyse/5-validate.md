---
description: Phase 5 - User validation of specifications
---

# Business Analyse - Validate

Senior BA expert. User validation of functional specifications (FRD).

## Arguments

```
/business-analyse:validate [feature-id]
```

- `feature-id`: Feature identifier (e.g., FEAT-001)

## Prerequisites

```bash
# Verify that FRD exists
test -f ".business-analyse/applications/*/modules/*/features/$ARGUMENTS/3-functional-specification.md" || \
  echo "Execute /business-analyse:specify first"
```

## Purpose

```
+==============================================================================+
|  USER VALIDATION - GATE BEFORE DEVELOPMENT                                  |
+==============================================================================+
|                                                                              |
|  This phase is a MANDATORY checkpoint before generating the dev prompt.     |
|                                                                              |
|  The user MUST review and approve the FRD before proceeding.                |
|  If rejected, feedback is collected and we return to ANALYSE phase.         |
|                                                                              |
+==============================================================================+
```

## Workflow

### Step 1: Load FRD for review

```bash
cat ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/3-functional-specification.md"
```

### Step 2: Present summary to user

Display a concise summary of the FRD:

```
+==============================================================================+
|  SPECIFICATION REVIEW - {{FEAT-XXX}}                                        |
+==============================================================================+

FEATURE: {{FEATURE_NAME}}
STATUS:  Pending validation

+------------------------------------------------------------------------------+
|  SUMMARY                                                                     |
+------------------------------------------------------------------------------+

SCOPE:
  - Included: {{IN_SCOPE_ITEMS}}
  - Excluded: {{OUT_SCOPE_ITEMS}}

ENTITIES: {{X}} entities
  {{LIST_ENTITIES}}

ENDPOINTS: {{Y}} APIs
  {{LIST_ENDPOINTS}}

SCREENS: {{Z}} pages
  {{LIST_SCREENS}}

BUSINESS RULES: {{W}} rules
  {{LIST_RULES}}

COMPLETENESS SCORE: {{SCORE}}%

+------------------------------------------------------------------------------+
|  DOCUMENTS TO REVIEW                                                         |
+------------------------------------------------------------------------------+

  1. BRD: .../2-business-requirements.md
  2. FRD: .../3-functional-specification.md (MAIN DOCUMENT)

+==============================================================================+
```

### Step 3: Ask for validation

```
AskUserQuestion({
  questions: [
    {
      question: "Do you approve this specification for development?",
      header: "Validation",
      options: [
        { label: "Approved", description: "Specification is complete and correct - proceed to handoff" },
        { label: "Minor changes", description: "Small adjustments needed - I'll provide feedback" },
        { label: "Major revision", description: "Significant issues - return to analysis phase" },
        { label: "Rejected", description: "Specification does not meet requirements" }
      ],
      multiSelect: false
    }
  ]
})
```

### Step 4: Handle response

#### If APPROVED:

```markdown
Update FRD status:
- Status: **Validated**
- Validated by: {{USER}}
- Validation date: {{DATE}}

Create validation record in `.business-analyse/applications/.../features/{{FEAT-XXX}}/validation.json`:

{
  "feature_id": "{{FEAT-XXX}}",
  "status": "approved",
  "validated_at": "{{ISO_DATE}}",
  "validated_by": "user",
  "comments": "",
  "iteration": 1
}
```

**Output:**
```
+==============================================================================+
|  VALIDATION APPROVED                                                         |
+==============================================================================+

Feature:     {{FEAT-XXX}} - {{NAME}}
Status:      VALIDATED
Date:        {{DATE}}

Next step:   /business-analyse:handoff {{FEAT-XXX}}

+==============================================================================+
```

#### If MINOR CHANGES:

Ask for specific feedback:

```
AskUserQuestion({
  questions: [
    {
      question: "What changes are needed?",
      header: "Feedback",
      options: [
        { label: "Entity attributes", description: "Missing or incorrect attributes" },
        { label: "Business rules", description: "Rules need adjustment" },
        { label: "API design", description: "Endpoints need modification" },
        { label: "UI/UX", description: "Screen designs need changes" }
      ],
      multiSelect: true
    }
  ]
})
```

Then ask for details in free text.

**Action:** Update FRD with minor changes, then re-validate.

#### If MAJOR REVISION:

```
+==============================================================================+
|  MAJOR REVISION REQUIRED                                                     |
+==============================================================================+

The specification requires significant changes.

Please provide your feedback:
- What is incorrect or missing?
- What needs to be re-analyzed?
- Any new requirements discovered?

+==============================================================================+
```

Ask for detailed feedback, then:

```markdown
Create revision request in `.business-analyse/applications/.../features/{{FEAT-XXX}}/revision-{{N}}.md`:

# Revision Request #{{N}} - {{FEAT-XXX}}

**Date**: {{DATE}}
**Status**: Major revision required

## User Feedback

{{USER_FEEDBACK}}

## Changes Required

- [ ] {{CHANGE_1}}
- [ ] {{CHANGE_2}}
- [ ] {{CHANGE_3}}

## Next Action

Return to: `/business-analyse:analyse {{FEAT-XXX}}`
```

**Output:**
```
+==============================================================================+
|  RETURNING TO ANALYSIS                                                       |
+==============================================================================+

Feature:     {{FEAT-XXX}} - {{NAME}}
Reason:      Major revision required
Iteration:   {{N + 1}}

Feedback saved to: .../revision-{{N}}.md

Next step:   /business-analyse:analyse {{FEAT-XXX}}

The analysis phase will incorporate your feedback.

+==============================================================================+
```

#### If REJECTED:

```
+==============================================================================+
|  SPECIFICATION REJECTED                                                      |
+==============================================================================+

Feature:     {{FEAT-XXX}} - {{NAME}}
Status:      REJECTED

Please provide the reason for rejection.
The feature will be marked as rejected and archived.

+==============================================================================+
```

Update status to rejected and archive.

### Step 5: Update tracking

Update `.business-analyse/applications/.../features/{{FEAT-XXX}}/README.md`:

```markdown
| Phase | Document | Status | Date |
|-------|----------|--------|------|
| Discovery | 1-discovery.md | Done | {{DATE}} |
| Analysis | 2-business-requirements.md | Done | {{DATE}} |
| Specification | 3-functional-specification.md | Done | {{DATE}} |
| **Validation** | validation.json | **{{STATUS}}** | **{{DATE}}** |
| Handoff | 4-development-handoff.md | Pending | - |
```

## Validation Criteria

The FRD should be validated against these criteria:

| Criterion | Weight | Check |
|-----------|--------|-------|
| Scope is clear | 20% | In/Out scope defined |
| Entities complete | 20% | All attributes, relations |
| APIs documented | 20% | All endpoints, payloads |
| Rules defined | 20% | All BR-XXX documented |
| UI specified | 10% | Wireframes, behaviors |
| Acceptance criteria | 10% | Testable criteria |

**Minimum score for approval: 85%**

## Summary

```
VALIDATION PHASE COMPLETE
+==============================================================================+
Feature:     {{FEAT-XXX}} - {{NAME}}
+==============================================================================+

Result:      {{APPROVED / MINOR_CHANGES / MAJOR_REVISION / REJECTED}}
Iteration:   {{N}}
Score:       {{SCORE}}%

{{IF APPROVED}}
  Next: /business-analyse:handoff {{FEAT-XXX}}
{{ELSE IF MINOR_CHANGES}}
  Action: Updating FRD, then re-validate
{{ELSE IF MAJOR_REVISION}}
  Next: /business-analyse:analyse {{FEAT-XXX}}
  Feedback saved for analysis phase
{{ELSE}}
  Feature archived
{{END}}

+==============================================================================+
```

## Rules

1. **User decides** - Only the user can approve/reject
2. **Feedback captured** - All feedback is documented
3. **Iteration tracked** - Number of revision cycles logged
4. **No skip** - Cannot proceed to handoff without validation
5. **Traceability** - Validation record kept for audit
