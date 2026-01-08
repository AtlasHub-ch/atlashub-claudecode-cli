---
description: Business Analysis Phase 1 - Conditional exploration with selected agents
---

# Business Analysis - PHASE 1: EXPLORE

**You need to always ULTRA THINK.**

## Mission

Launch ONLY relevant agents based on feature type. Minimize token usage.

## Agent Selection Matrix

| Feature Type | Agents | Tokens |
|--------------|--------|--------|
| UI only (button, form) | `explore-theme`, `explore-api` | ~2,400 |
| Data feature | `explore-schema`, `explore-api` | ~2,700 |
| New page | `explore-navigation`, `explore-theme`, `explore-api` | ~3,600 |
| Security feature | `explore-permissions`, `explore-api` | ~2,200 |
| Full module | `explore-schema`, `explore-permissions`, `explore-api` | ~3,700 |

**NEVER launch more than 3 agents.**

## Execution

### Step 1: Confirm Agent Selection

```markdown
## Exploration Plan

**Feature**: [feature name]
**Type**: UI | Data | Page | Security | Module

**Agents to Launch**:
1. explore-api (always)
2. [agent if needed]
3. [agent if needed]

**Skipping**: [agents not needed and why]
```

### Step 2: Launch Agents in Parallel

Launch selected agents simultaneously with Task tool.

### Step 3: Consolidate Output

Merge agent results into compact format:

```markdown
## Exploration Results

### API Context
- Existing endpoints: [list]
- Patterns: [controller pattern file:line]
- Service layer: [service pattern file:line]

### [Other Agent] Context
- Key findings: [bullet points]
- Files to modify: [paths]
- Patterns to follow: [file:line references]

### Summary
- Files to CREATE: [list with paths]
- Files to MODIFY: [list with paths]
- Patterns to COPY: [file:line references]
```

## Output Rules

1. **No JSON blobs** - Use markdown tables and bullets
2. **File:line references** - Always include line numbers
3. **Compact format** - Max 100 lines output
4. **Actionable only** - Skip theoretical analysis

## Next Phase

After exploration:
```
/business-analyse:2-spec [--mockup] [--plantuml]
```

---

User: $ARGUMENTS
