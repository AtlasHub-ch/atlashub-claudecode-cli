---
description: Bug resolution documentation and specification
---

# Business Analyse - Bug

Senior BA expert. Bug documentation and resolution specification.

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool **interactively**. You MUST execute the tool with these parameters to get the user's response BEFORE continuing.

## Arguments

```
/business-analyse:bug [feature-id] "bug description"
```

- `feature-id`: Concerned feature identifier (e.g., FEAT-001)
- `description`: Encountered bug description

## Prerequisites

```bash
# Verify that feature exists
test -d ".business-analyse/applications/*/modules/*/features/$FEATURE_ID" || \
  echo "Feature not found"
```

## Philosophy

```
╔══════════════════════════════════════════════════════════════════════════╗
║  THE BA DOCUMENTS THE BUG, DOESN'T FIX IT                                ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  The Business Analyst:                                                   ║
║  ✓ Documents the bug (reproduction, impact)                              ║
║  ✓ Analyzes probable cause                                               ║
║  ✓ Specifies expected behavior                                           ║
║  ✓ Updates specs if needed                                               ║
║                                                                          ║
║  The Developer:                                                          ║
║  ✓ Implements the fix                                                    ║
║  ✓ Writes non-regression tests                                           ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Workflow

### Step 1: Information gathering

Ask questions to document the bug:

```
AskUserQuestion({
  questions: [
    {
      question: "What is the bug severity?",
      header: "Severity",
      options: [
        { label: "Critical", description: "Blocks usage, data loss" },
        { label: "Major", description: "Main functionality impacted" },
        { label: "Minor", description: "Secondary functionality, workaround possible" },
        { label: "Cosmetic", description: "Display, UX, no functional impact" }
      ],
      multiSelect: false
    },
    {
      question: "Is the bug reproducible?",
      header: "Repro",
      options: [
        { label: "Always", description: "100% reproducible" },
        { label: "Often", description: "~75% of attempts" },
        { label: "Sometimes", description: "~25% of attempts" },
        { label: "Rarely", description: "Hard to reproduce" }
      ],
      multiSelect: false
    }
  ]
})
```

### Step 2: Detailed documentation

Questions to ask the user:

1. **Reproduction steps** - Exactly which actions lead to the bug?
2. **Observed behavior** - What happens?
3. **Expected behavior** - What should happen?
4. **Environment** - Browser, OS, version, data?
5. **Screenshots/Logs** - Visual or technical evidence?
6. **User impact** - How many users affected?

### Step 3: Cause analysis

Identify probable cause:

| Cause type | Description | Example |
|------------|-------------|---------|
| **Missing spec** | Case wasn't specified | Unpredicted edge case |
| **Ambiguous spec** | Spec open to confusion | Different interpretation |
| **Regression** | Worked before, not anymore | Side effect |
| **Data** | Invalid or corrupted data | Unexpected format |
| **Technical** | Implementation bug | Incorrect code |
| **Infrastructure** | Environment/config | Timeout, memory |

### Step 4: Bug ID generation

Increment counter in config.json:

```
BUG-{NNN}
```

### Step 5: Bug report creation

Create `.business-analyse/.../features/{{FEAT-XXX}}/tracking/bugs/BUG-{{NNN}}.md`:

```markdown
# BUG-{{NNN}} - {{SHORT_TITLE}}

## Metadata

| Property | Value |
|----------|-------|
| **ID** | BUG-{{NNN}} |
| **Feature** | {{FEAT-XXX}} |
| **Severity** | {{CRITICAL/MAJOR/MINOR/COSMETIC}} |
| **Reproducibility** | {{ALWAYS/OFTEN/SOMETIMES/RARELY}} |
| **Status** | Open |
| **Discovered date** | {{DATE}} |
| **Reported by** | {{USER}} |
| **Assigned to** | Unassigned |

---

## 1. Description

### 1.1 Summary
{{SUMMARY_1_SENTENCE}}

### 1.2 Observed behavior
{{WHAT_HAPPENS}}

### 1.3 Expected behavior
{{WHAT_SHOULD_HAPPEN}}

---

## 2. Reproduction

### 2.1 Prerequisites
- {{PREREQUISITE_1}}
- {{PREREQUISITE_2}}

### 2.2 Steps
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}
4. Observe: {{OBSERVATION}}

### 2.3 Environment
| Property | Value |
|----------|-------|
| Browser | {{BROWSER}} |
| OS | {{OS}} |
| App version | {{VERSION}} |
| Data | {{DATA_CONTEXT}} |

---

## 3. Evidence

### 3.1 Screenshots
{{SCREENSHOTS_OR_DESCRIPTIONS}}

### 3.2 Logs
```
{{RELEVANT_LOGS}}
```

### 3.3 Test data
{{TEST_DATA}}

---

## 4. Analysis

### 4.1 Probable cause
**Type**: {{MISSING_SPEC/AMBIGUOUS_SPEC/REGRESSION/DATA/TECHNICAL/INFRA}}

{{CAUSE_DESCRIPTION}}

### 4.2 Impact
- **Affected users**: {{NUMBER/PERCENTAGE}}
- **Frequency**: {{FREQUENCY}}
- **Workaround possible**: {{YES/NO}} - {{WORKAROUND_DESCRIPTION}}

### 4.3 Impacted components
| Component | Type | Probable file |
|-----------|------|---------------|
| {{COMPONENT}} | {{ENTITY/API/UI}} | {{FILE}} |

---

## 5. Fix specification

### 5.1 Expected correct behavior
{{CORRECT_BEHAVIOR_DESCRIPTION}}

### 5.2 Concerned business rules
| ID | Rule | Clarification |
|----|------|---------------|
| BR-{{XXX}} | {{RULE}} | {{CLARIFICATION}} |

### 5.3 Fix acceptance criteria

```gherkin
Scenario: Fix BUG-{{NNN}}
  Given {{PRECONDITION}}
  When {{ACTION}}
  Then {{EXPECTED_RESULT}}
  And bug BUG-{{NNN}} no longer reproduces
```

### 5.4 Suggested non-regression tests
- [ ] {{TEST_1}}
- [ ] {{TEST_2}}

---

## 6. Specs update (if needed)

### 6.1 Documents to modify
| Document | Section | Modification |
|----------|---------|--------------|
| {{FRD}} | {{SECTION}} | {{MODIFICATION}} |

### 6.2 Added clarifications
{{SPECS_CLARIFICATIONS}}

---

## 7. History

| Date | Action | Author |
|------|--------|--------|
| {{DATE}} | Bug reported | {{USER}} |
| {{DATE}} | BA analysis | Claude BA |

---

## 8. Resolution (to be completed by dev)

### 8.1 Applied fix
_To be completed after fix_

### 8.2 Modified files
_To be completed after fix_

### 8.3 Added tests
_To be completed after fix_

### 8.4 Resolution date
_To be completed after fix_

---

*Generated by Business Analyse - {{DATE}}*
```

### Step 6: Specs update (if needed)

If the bug reveals a missing or ambiguous spec:

1. Open concerned FRD
2. Add/Clarify specification
3. Increment document version
4. Reference bug as source of modification

### Summary

```
BUG DOCUMENTED
═══════════════════════════════════════════════════════════
Bug:         BUG-{{NNN}} - {{TITLE}}
Feature:     {{FEAT-XXX}}
Severity:    {{SEVERITY}}
═══════════════════════════════════════════════════════════
Analysis:
  • Cause:            {{CAUSE_TYPE}}
  • Impact:           {{IMPACT}}
  • Workaround:       {{YES/NO}}

Specs modified:      {{YES/NO}}
═══════════════════════════════════════════════════════════
Document: .../tracking/bugs/BUG-{{NNN}}.md

NEXT STEP:
  Forward to developer for fix.
  Use document as fix specification.
═══════════════════════════════════════════════════════════
```

## Rules

1. **Complete documentation** - All info to reproduce
2. **Analyzed cause** - Identify problem type
3. **Clarified specs** - Update if needed
4. **Testable criteria** - Gherkin to validate fix
5. **No code** - BA specifies, dev fixes
6. **Traceability** - Bug → spec → test link
