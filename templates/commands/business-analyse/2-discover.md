---
description: Phase 2 - Discovery and requirements elicitation (ULTRATHINK)
---

# Business Analyse - Discover

Senior BA expert in elicitation. ULTRATHINK mode mandatory.

## Model Requirement

```
╔══════════════════════════════════════════════════════════════════════════╗
║  THIS PHASE REQUIRES OPUS MODEL                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Discovery is the MOST CRITICAL phase in the BA workflow.                ║
║  It requires OPUS to guarantee:                                          ║
║  • Exhaustive elicitation                                                ║
║  • Aggressive challenging of user assumptions                            ║
║  • Deep thinking for edge cases                                          ║
║  • Proactive feature suggestions                                         ║
║                                                                          ║
║  If running on a different model, inform the user that results           ║
║  may be less thorough.                                                   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool **interactively**. You MUST execute the tool with these parameters to get the user's response BEFORE continuing.

## Arguments

```
/business-analyse:discover [module] "needs description"
```

- `module`: Name of the concerned module
- `description`: Initial description of the need

## Prerequisites

```bash
# Verify initialization
test -f .business-analyse/config.json || echo "Execute /business-analyse:init first"
```

## ULTRATHINK Mode

**IMPORTANT**: This phase uses deep thinking for comprehensive elicitation.

Approach to adopt:
- Question each hypothesis
- Look for contradictions
- Identify what's left unsaid
- Explore edge cases
- Validate priorities
- **PROACTIVELY suggest related features**
- **PROPOSE interface mockups (ASCII wireframes)**
- **CHALLENGE user assumptions aggressively**

## BA Proactive Role

```
╔══════════════════════════════════════════════════════════════════════════╗
║  THE BA IS PROACTIVE - NOT JUST A NOTE-TAKER                             ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  MUST DO:                                                                ║
║  ✓ Suggest related features the user may not have thought of             ║
║  ✓ Propose interface sketches (ASCII wireframes) during discovery        ║
║  ✓ Challenge incomplete or vague requirements aggressively               ║
║  ✓ Identify potential UX improvements                                    ║
║  ✓ Warn about edge cases and potential issues                            ║
║  ✓ Suggest optimizations based on similar patterns                       ║
║                                                                          ║
║  NEVER:                                                                  ║
║  ✗ Accept vague answers without follow-up                                ║
║  ✗ Skip proposing alternatives                                           ║
║  ✗ Miss obvious related features                                         ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Workflow

### Step 1: Initial context

Read project context:

```bash
cat .business-analyse/config.json
cat .business-analyse/applications/*/context.md
```

### Step 2: Complexity evaluation

**BEFORE asking questions, evaluate the feature's complexity.**

```
AskUserQuestion({
  questions: [
    {
      question: "What is the nature of this feature?",
      header: "Type",
      options: [
        { label: "Simple CRUD", description: "Basic Create/Read/Update/Delete of an entity" },
        { label: "Standard feature", description: "Moderate business logic, a few rules" },
        { label: "Complex feature", description: "Complex business rules, workflows, integrations" },
        { label: "Critical feature", description: "Security, finance, legal, sensitive data" }
      ],
      multiSelect: false
    }
  ]
})
```

### Step 3: Adaptive questions based on complexity

**The number of questions depends on complexity:**

| Complexity | Questions | Priority areas |
|------------|-----------|----------------|
| Simple CRUD | 6-8 | Context, Data, Permissions |
| Standard | 12-15 | + Business rules, UI |
| Complex | 20-25 | + Edge cases, Integrations |
| Critical | 30+ | All areas |

### ESSENTIAL questions (always asked - 6 questions)

These questions are **MANDATORY** regardless of complexity:

1. **What problem** does this feature solve? (1 sentence)
2. **Who** uses it? (main roles)
3. **What data** is manipulated? (CRUD entities)
4. **What permissions**? (who can do what)
5. **Scope**: what is IN and OUT?
6. **Are there specific business rules**?

### CONDITIONAL questions (based on complexity and context)

#### If complexity >= Standard, add:

7. What is the **main flow**? (happy path)
8. Are there particular **validations**?
9. What **messages** to display (success/error)?
10. Is an **audit trail** required?

**Basic NFRs (ALWAYS ask for Standard+):**
11. **Expected response time**: < 1s / < 3s / < 10s / Not critical?
12. **Expected concurrent users**: 1-10 / 10-100 / 100+ ?
13. **Data sensitivity**: Public / Internal / Confidential / Regulated (GDPR/HIPAA)?

#### If complexity >= Complex, add:

14. What **integrations** with other systems?
15. What happens in case of **concurrency** (2 users)?
16. What **volume** is expected? (records, requests/sec)
17. Are there **alternative flows**?
18. What **edge cases** to anticipate?

#### If complexity = Critical, add:

19. What **legal constraints** apply?
20. Are there **irreversible operations**?
21. How to **rollback** in case of problem?
22. What **SLA** is expected? (uptime, response time P95)
23. Is there **data migration** needed?

#### OPTIONAL questions (offer to deepen)

After mandatory questions, offer:

```
AskUserQuestion({
  questions: [
    {
      question: "Do you want to deepen certain aspects?",
      header: "Details",
      options: [
        { label: "No, this is sufficient", description: "Move to synthesis" },
        { label: "Future evolution", description: "How will it evolve?" },
        { label: "Edge cases", description: "Edge cases and errors" },
        { label: "Performance", description: "Volume, SLAs" }
      ],
      multiSelect: true
    }
  ]
})
```

### Step 3bis: Proactive Feature Suggestions (MANDATORY)

**BEFORE moving to synthesis**, the BA MUST:

1. **Propose related features** the user may have forgotten:
```
Based on your feature "{{FEATURE}}", I suggest considering:

RELATED FEATURES (potential additions):
┌────────────────────────────────────────────────────────────────────┐
│ 1. {{SUGGESTED_FEATURE_1}}                                         │
│    Why: {{JUSTIFICATION}}                                          │
│    Complexity: {{LOW|MEDIUM|HIGH}}                                 │
│                                                                    │
│ 2. {{SUGGESTED_FEATURE_2}}                                         │
│    Why: {{JUSTIFICATION}}                                          │
│    Complexity: {{LOW|MEDIUM|HIGH}}                                 │
└────────────────────────────────────────────────────────────────────┘
```

2. **Propose early interface sketch** (ASCII wireframe):
```
PROPOSED INTERFACE SKETCH:

┌─────────────────────────────────────────────────────────────────┐
│ {{SCREEN_TITLE}}                              [Actions]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Search: _______________]  [Filter ▼]  [+ New]                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ List/Table/Form structure here                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Does this layout match your vision?                           │
│  What would you change?                                         │
└─────────────────────────────────────────────────────────────────┘
```

3. **Ask user validation**:
```
AskUserQuestion({
  questions: [
    {
      question: "I've proposed some related features and an interface sketch. What would you like to do?",
      header: "Suggestions",
      options: [
        { label: "Add suggested features to scope", description: "Include them in this analysis" },
        { label: "Note for later", description: "Track as future improvements" },
        { label: "Reject suggestions", description: "Not relevant for this project" },
        { label: "Modify interface sketch", description: "I have different ideas" }
      ],
      multiSelect: true
    }
  ]
})
```

### Step 4: Create feature structure

Increment counter and create structure:

```
FEAT-{NNN}-{slug}
```

```bash
mkdir -p ".business-analyse/applications/<app>/modules/<module>/features/FEAT-XXX-<slug>/tracking/bugs"
```

### Step 5: Critical synthesis

After responses, produce critical analysis:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  CRITICAL ANALYSIS - ELICITATION                                         ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ATTENTION POINTS                                                        ║
║  ────────────────                                                        ║
║  • <point_1>                                                             ║
║  • <point_2>                                                             ║
║                                                                          ║
║  IDENTIFIED HYPOTHESES                                                   ║
║  ────────────────────                                                    ║
║  • <hypothesis_1> → TO VALIDATE with <who>                               ║
║  • <hypothesis_2> → TO VALIDATE with <who>                               ║
║                                                                          ║
║  POSSIBLE ALTERNATIVES                                                   ║
║  ────────────────────                                                    ║
║  1. <alternative_1>                                                      ║
║     ✓ Advantage: ...                                                     ║
║     ✗ Disadvantage: ...                                                  ║
║                                                                          ║
║  IDENTIFIED RISKS                                                        ║
║  ───────────────                                                         ║
║  • <risk> (Impact: HIGH/MEDIUM/LOW)                                      ║
║    → Mitigation: <solution>                                              ║
║                                                                          ║
║  BLOCKING QUESTIONS                                                      ║
║  ──────────────────                                                      ║
║  ❓ <decisive_question_1>                                                 ║
║  ❓ <decisive_question_2>                                                 ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Step 6: Generate Discovery document

Create `1-discovery.md` in the feature folder:

```markdown
# Discovery - {{FEATURE_NAME}}

**ID**: {{FEAT-XXX}}
**Module**: {{MODULE}}
**Date**: {{DATE}}
**Status**: Draft
**BA**: Claude (Business Analyse)

---

## Executive Summary

{{SUMMARY_2_3_SENTENCES}}

---

## Strategic Context

### Addressed Problem
{{PROBLEM}}

### Trigger
{{TRIGGER}}

### Business Value
{{VALUE}}

### Success Metrics
| KPI | Target | Measurement method |
|-----|--------|-------------------|
| {{KPI}} | {{TARGET}} | {{METHOD}} |

### Priority
{{PRIORITY}} - {{JUSTIFICATION}}

---

## Users

### Main Personas
| Persona | Role | Usage context | Frequency |
|---------|------|---------------|-----------|
| {{PERSONA}} | {{ROLE}} | {{CONTEXT}} | {{FREQ}} |

### Needs and Frustrations
{{NEEDS}}

---

## Scope

### Included
- {{IN_SCOPE_1}}
- {{IN_SCOPE_2}}

### Excluded
- {{OUT_SCOPE_1}}
- {{OUT_SCOPE_2}}

### Constraints
- Technical: {{TECH_CONSTRAINTS}}
- Legal: {{LEGAL_CONSTRAINTS}}
- Time: {{TIME_CONSTRAINTS}}

### Dependencies
| Dependency | Type | Impact |
|------------|------|--------|
| {{DEP}} | {{TYPE}} | {{IMPACT}} |

---

## Data

### Concerned Entities
{{ENTITIES}}

### Volume
| Metric | Current | 1 year | 3 years |
|--------|---------|--------|---------|
| {{METRIC}} | {{CURRENT}} | {{1YEAR}} | {{3YEARS}} |

### Sensitivity
{{SENSITIVE_DATA}}

---

## Business Flows

### Happy Path
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

### Alternative Flows
{{ALT_FLOWS}}

---

## Business Rules

| ID | Rule | Condition | Action |
|----|------|-----------|--------|
| RM-001 | {{RULE}} | {{CONDITION}} | {{ACTION}} |

---

## Security

### Permissions
| Role | Access |
|------|--------|
| {{ROLE}} | {{ACCESS}} |

### Audit
{{AUDIT_REQUIRED}}

---

## Risks

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-001 | {{RISK}} | {{PROBA}} | {{IMPACT}} | {{MITIGATION}} |

---

## Open Questions

- [ ] {{QUESTION_1}}
- [ ] {{QUESTION_2}}

---

## Next Steps

1. Validate with {{STAKEHOLDER}}
2. Execute `/business-analyse:analyse {{FEAT-XXX}}`

---

*Generated by Business Analyse - {{DATE}}*
```

### Summary

```
DISCOVERY COMPLETE
═══════════════════════════════════════════════════════════
Feature:     {{FEAT-XXX}} - {{NAME}}
Module:      {{MODULE}}
Complexity:  {{LOW|MEDIUM|HIGH}}
═══════════════════════════════════════════════════════════
Questions:   44/44 asked
Risks:       {{X}} identified
Open questions: {{Y}}
═══════════════════════════════════════════════════════════
Document: .business-analyse/.../{{FEAT-XXX}}/1-discovery.md
═══════════════════════════════════════════════════════════
Next: /business-analyse:analyse {{FEAT-XXX}}
```

## Rules

1. **ULTRATHINK mandatory** - Deep thinking on each response
2. **All questions** - Do not skip questions
3. **No vague answers** - Rephrase until getting a clear answer
4. **Critical synthesis** - Challenge the answers
5. **No code** - This document is purely business
