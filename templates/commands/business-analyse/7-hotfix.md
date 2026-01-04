---
description: Hotfix/Bugfix - Lightweight urgent fix documentation
---

# Business Analyse - Hotfix

Lightweight template for urgent bug fixes. Use when full BA workflow is too heavy.

## When to Use This Template

```
╔══════════════════════════════════════════════════════════════════════════╗
║  HOTFIX vs FULL BA WORKFLOW                                              ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  USE HOTFIX TEMPLATE when:                                               ║
║  • Production is DOWN or severely impacted                               ║
║  • Fix is urgent (< 4 hours to deploy)                                   ║
║  • Scope is LIMITED (1-2 files, no new features)                         ║
║  • No new entities or migrations needed                                  ║
║                                                                          ║
║  USE FULL BA WORKFLOW when:                                              ║
║  • New feature or significant enhancement                                ║
║  • Multiple stakeholders need input                                      ║
║  • Schema changes required                                               ║
║  • Complex business logic involved                                       ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Arguments

```
/business-analyse:hotfix [bug-id] "[brief-description]"
```

- `bug-id`: Bug identifier (e.g., BUG-001, JIRA-123)
- `brief-description`: One-line description of the issue

## Hotfix Template

Create `tracking/bugs/{{BUG-ID}}.md`:

```markdown
# Hotfix: {{BUG-ID}} - {{BRIEF_DESCRIPTION}}

**Reported:** {{DATE}}
**Severity:** CRITICAL / HIGH / MEDIUM
**Status:** INVESTIGATING / IN_PROGRESS / DEPLOYED / VERIFIED

---

## 1. Problem Statement

### What's happening?
{{DESCRIBE_OBSERVED_BEHAVIOR}}

### What should happen?
{{DESCRIBE_EXPECTED_BEHAVIOR}}

### Impact
- **Users affected:** {{NUMBER}} or {{PERCENTAGE}}
- **Business impact:** {{DESCRIBE_BUSINESS_IMPACT}}
- **Workaround available:** Yes/No - {{WORKAROUND_IF_YES}}

---

## 2. Root Cause Analysis

### Investigation summary
{{WHAT_WAS_FOUND}}

### Root cause
{{WHY_IT_HAPPENED}}

### Files involved
| File | Issue |
|------|-------|
| {{FILE_PATH}} | {{WHAT_IS_WRONG}} |

---

## 3. Fix Specification

### Proposed fix
{{DESCRIBE_THE_FIX_WITHOUT_CODE}}

### Business rules affected
| Rule | Change |
|------|--------|
| {{BR-XXX}} | {{HOW_IT_CHANGES}} |

### Validation criteria
- [ ] Bug is no longer reproducible
- [ ] Existing functionality still works
- [ ] No regression in related areas

---

## 4. Minimal Test Plan

### Reproduction steps (before fix)
1. {{STEP_1}}
2. {{STEP_2}}
3. **RESULT:** {{BUG_MANIFESTS}}

### Verification steps (after fix)
1. {{STEP_1}}
2. {{STEP_2}}
3. **EXPECTED:** {{CORRECT_BEHAVIOR}}

### Regression check
- [ ] {{RELATED_FEATURE_1}} still works
- [ ] {{RELATED_FEATURE_2}} still works

---

## 5. Rollback Plan

**Can this fix be rolled back safely?** Yes / No

**If rollback needed:**
1. [ ] Revert commit {{COMMIT_HASH}}
2. [ ] {{ADDITIONAL_STEPS}}

**Data impact of rollback:** None / {{DESCRIBE_IMPACT}}

---

## 6. Post-Mortem (fill after resolution)

### Timeline
| Time | Event |
|------|-------|
| {{TIME}} | Bug reported |
| {{TIME}} | Investigation started |
| {{TIME}} | Root cause identified |
| {{TIME}} | Fix deployed |
| {{TIME}} | Verified in production |

### Lessons learned
- {{WHAT_COULD_PREVENT_THIS}}

### Follow-up actions
- [ ] Add test to prevent regression
- [ ] Update documentation if needed
- [ ] Create FEAT if enhancement needed

---

*Hotfix documented on {{DATE}}*
```

## Quick Handoff for Developer

When urgent, generate a minimal dev prompt:

```markdown
# HOTFIX: {{BUG-ID}}

## Problem
{{ONE_SENTENCE_PROBLEM}}

## Root Cause
{{ONE_SENTENCE_CAUSE}}

## Fix Required
{{DESCRIBE_FIX_WITHOUT_CODE}}

## Files to Modify
- {{FILE_1}}: {{CHANGE_NEEDED}}

## Verification
After fix, confirm:
- [ ] {{BUG_NO_LONGER_OCCURS}}
- [ ] {{RELATED_FEATURE_WORKS}}

## Rollback
If issues: `git revert HEAD`
```

## Rules for Hotfixes

1. **NO new features** - Fix the bug, nothing more
2. **Minimal scope** - Touch only what's necessary
3. **Document for future** - Post-mortem is mandatory
4. **Regression tests** - Add tests to prevent recurrence
5. **Communicate** - Notify stakeholders of fix and impact

## Severity Levels

| Severity | Definition | Response Time |
|----------|------------|---------------|
| CRITICAL | Production down, data loss risk | Immediate (< 1h) |
| HIGH | Major feature broken, no workaround | Same day (< 4h) |
| MEDIUM | Feature impaired, workaround exists | Next business day |
| LOW | Minor issue, cosmetic | Next sprint |

## Summary

```
HOTFIX DOCUMENTED
═══════════════════════════════════════════════════════════
Bug:         {{BUG-ID}} - {{BRIEF_DESCRIPTION}}
Severity:    {{SEVERITY}}
Root Cause:  {{ONE_LINE_CAUSE}}
Fix:         {{ONE_LINE_FIX}}
═══════════════════════════════════════════════════════════
Document: tracking/bugs/{{BUG-ID}}.md

⚠️  This is a HOTFIX template - minimal documentation for urgent fixes.
    For new features, use the full BA workflow.
═══════════════════════════════════════════════════════════
```
