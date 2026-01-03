---
description: Change Request - Formal specification change during development
---

# Business Analyse - Change Request

Formal change request process for when specifications need to change AFTER development has started.

## Arguments

```
/business-analyse:change-request [feature-id] "[change-description]"
```

- `feature-id`: Feature identifier (e.g., FEAT-001)
- `change-description`: Brief description of the change needed

## When to Use This Command

```
+==============================================================================+
|  USE THIS COMMAND WHEN:                                                      |
+==============================================================================+
|                                                                              |
|  During implementation, the developer discovers:                             |
|  - Missing requirement not covered in specs                                  |
|  - Technical constraint that affects design                                  |
|  - Business priority shift                                                   |
|  - Security/compliance issue                                                 |
|  - Stakeholder requests modification                                         |
|                                                                              |
|  DO NOT USE FOR:                                                             |
|  - Clarification questions (use Implementation Questions section)            |
|  - Bug fixes in existing code                                                |
|  - Implementation details (developer decides HOW)                            |
|                                                                              |
+==============================================================================+
```

## Workflow

### Step 1: Validate feature exists

```bash
test -f ".business-analyse/applications/*/modules/*/features/$FEATURE_ID/4-development-handoff.md" || \
  echo "ERROR: Feature $FEATURE_ID not in development. Use this command only for active implementations."
```

### Step 2: Collect change information

```
AskUserQuestion({
  questions: [
    {
      question: "What type of change is this?",
      header: "Change Type",
      options: [
        { label: "Addition", description: "New requirement not in original specs" },
        { label: "Modification", description: "Existing requirement needs to change" },
        { label: "Removal", description: "Requirement should be removed from scope" },
        { label: "Clarification", description: "Ambiguous spec needs clarification" }
      ],
      multiSelect: false
    },
    {
      question: "What is the priority of this change?",
      header: "Priority",
      options: [
        { label: "Critical", description: "Blocks development, must resolve immediately" },
        { label: "High", description: "Important, should resolve before feature completion" },
        { label: "Medium", description: "Desirable, can be deferred if needed" },
        { label: "Low", description: "Nice to have, can be a follow-up" }
      ],
      multiSelect: false
    },
    {
      question: "What areas are impacted?",
      header: "Impact",
      options: [
        { label: "Data Model", description: "Entity changes, migrations" },
        { label: "API", description: "Endpoint changes, contracts" },
        { label: "UI", description: "Screen changes, flows" },
        { label: "Business Rules", description: "Logic changes" }
      ],
      multiSelect: true
    }
  ]
})
```

### Step 3: Create Change Request document

Create `tracking/changes/CR-{{FEAT-ID}}-{{NUMBER}}.md`:

```markdown
# Change Request: CR-{{FEAT-ID}}-{{NUMBER}}

**Created**: {{DATE}}
**Requested by**: {{ROLE}} (Developer/BA/PO/User)
**Status**: PENDING

---

## Change Summary

**Type**: {{ADDITION/MODIFICATION/REMOVAL/CLARIFICATION}}
**Priority**: {{CRITICAL/HIGH/MEDIUM/LOW}}
**Feature**: {{FEAT-ID}} - {{FEATURE_NAME}}

### Description

{{CHANGE_DESCRIPTION}}

### Current Specification

{{WHAT_SPEC_SAYS_NOW}}

### Proposed Change

{{WHAT_IT_SHOULD_BE}}

### Reason for Change

{{WHY_CHANGE_NEEDED}}

---

## Impact Assessment

| Area | Impact | Effort Estimate |
|------|--------|-----------------|
| Data Model | {{NONE/MINOR/MAJOR}} | {{HOURS}} |
| API | {{NONE/MINOR/MAJOR}} | {{HOURS}} |
| UI | {{NONE/MINOR/MAJOR}} | {{HOURS}} |
| Tests | {{NONE/MINOR/MAJOR}} | {{HOURS}} |
| Other Features | {{LIST}} | {{HOURS}} |
| **Total** | | **{{TOTAL}}h** |

### Affected Documents

- [ ] 3-functional-specification.md
- [ ] 4-development-handoff.md
- [ ] Other: {{SPECIFY}}

---

## Decision

**Decision Matrix Applied**:

```
Priority: {{PRIORITY}} + Impact: {{IMPACT}} = {{DECISION}}
```

| Decision | Action |
|----------|--------|
| Approve | Update specs, continue development |
| Assess | Need more information before deciding |
| Defer | Add to backlog for future iteration |
| Reject | Change not approved, document reason |
| Escalate | Requires stakeholder/PO decision |

**Final Decision**: {{PENDING}}
**Decided by**: {{PENDING}}
**Decision date**: {{PENDING}}

---

## Resolution

### If APPROVED:

Updated documents:
- [ ] FRD updated (section X.Y)
- [ ] Handoff updated (section X.Y)
- [ ] Developer notified
- [ ] Traceability updated

### If REJECTED:

Reason: {{REJECTION_REASON}}
Alternative: {{ALTERNATIVE_APPROACH}}

---

*Change Request created on {{DATE}}*
```

### Step 4: Apply decision matrix

```
╔══════════════════════════════════════════════════════════════════════════╗
║  DECISION MATRIX                                                         ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║                    LOW IMPACT    MEDIUM IMPACT    HIGH IMPACT            ║
║  CRITICAL         Approve       Approve          Escalate                ║
║  HIGH             Approve       Assess           Escalate                ║
║  MEDIUM           Approve       Defer            Reject/Defer            ║
║  LOW              Defer         Reject           Reject                  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Step 5: Route based on impact

#### Small changes (< 2h impact)

Developer can proceed immediately:

```
+==============================================================================+
|  SMALL CHANGE - DEVELOPER CAN PROCEED                                        |
+==============================================================================+

Change Request: CR-{{FEAT-ID}}-{{NUMBER}}
Impact: < 2 hours
Decision: AUTO-APPROVED

Action: Implement the change and update handoff after completion.
Document the change in the tracking log.

+==============================================================================+
```

#### Medium changes (2-8h impact)

Notify BA, get approval:

```
+==============================================================================+
|  MEDIUM CHANGE - BA APPROVAL REQUIRED                                        |
+==============================================================================+

Change Request: CR-{{FEAT-ID}}-{{NUMBER}}
Impact: 2-8 hours
Status: AWAITING BA APPROVAL

The BA has been notified and will review this change request.
Development should PAUSE on affected areas until decision is made.

+==============================================================================+
```

#### Large changes (> 8h impact)

Full assessment required:

```
+==============================================================================+
|  LARGE CHANGE - FULL ASSESSMENT REQUIRED                                     |
+==============================================================================+

Change Request: CR-{{FEAT-ID}}-{{NUMBER}}
Impact: > 8 hours
Status: REQUIRES PLANNING

This change requires:
1. Full impact assessment
2. Stakeholder review
3. Possible re-planning of feature delivery

Development should STOP on affected areas.
Schedule review meeting with BA and PO.

+==============================================================================+
```

### Step 6: Update tracking

Add to feature's change log:

```markdown
## Change History

| CR-ID | Date | Type | Priority | Decision | Impact |
|-------|------|------|----------|----------|--------|
| CR-{{FEAT}}-001 | {{DATE}} | {{TYPE}} | {{PRIORITY}} | {{DECISION}} | {{HOURS}}h |
```

## Rules

1. **Document first** - Always create CR before implementing changes
2. **Impact assessment** - Estimate effort before deciding
3. **Decision matrix** - Apply consistently
4. **Traceability** - Update affected documents
5. **Communication** - Notify relevant stakeholders

## Summary

```
CHANGE REQUEST CREATED
+==============================================================================+
CR-ID:       CR-{{FEAT-ID}}-{{NUMBER}}
Feature:     {{FEAT-ID}} - {{NAME}}
Type:        {{TYPE}}
Priority:    {{PRIORITY}}
Impact:      {{IMPACT_LEVEL}} ({{HOURS}}h estimate)
+==============================================================================+

Decision: {{DECISION}}

{{IF APPROVED}}
  Action: Update specs and continue development
{{ELSE IF PENDING}}
  Action: Await BA/PO decision
{{ELSE}}
  Action: {{ALTERNATIVE}}
{{END}}

Document: .../tracking/changes/CR-{{FEAT-ID}}-{{NUMBER}}.md

+==============================================================================+
```
