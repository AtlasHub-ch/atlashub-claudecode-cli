---
description: Phase 1 - Initialize Business Analysis structure (ULTRATHINK)
model: haiku
---

# Business Analysis - Init

Senior BA expert. Initialize business analysis structure. ULTRATHINK mode mandatory.

## ULTRATHINK Mode

**IMPORTANT**: This phase uses deep thinking for comprehensive project analysis.

Approach to adopt:
- Thoroughly analyze existing codebase structure
- Identify patterns and conventions
- Detect technical stack accurately
- Anticipate module organization
- Challenge assumptions about architecture

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool **interactively**. You MUST execute the tool with these parameters to get the user's response BEFORE continuing.

## Arguments

```
/business-analyse:1-init [app-name]
```

- `app-name` (optional): Application name. If absent, ask.

## Workflow

### Step 1: Information Gathering

If `$ARGUMENTS` is empty, ask these questions:

```
AskUserQuestion({
  questions: [
    {
      question: "What is the name of the application to analyze?",
      header: "Application",
      options: [
        { label: "New application", description: "Create a new application structure" },
        { label: "Existing", description: "Analyze an existing application in the project" }
      ],
      multiSelect: false
    }
  ]
})
```

If "Existing" → Scan the project to detect the technical stack.

### Step 2: Technical Scan (if existing project)

Use the explore agent to scan:

```
Task(subagent_type="Explore", model="haiku", prompt="
Scan the project to identify:

ARCHITECTURE:
- Project type (solution .sln, package.json, etc.)
- Technical stack (frameworks, languages)
- Main folder structure

DATA (if applicable):
- ORM used (EF Core, Prisma, etc.)
- Existing Entities/Models (count per domain)

API (if applicable):
- API type (REST, GraphQL, etc.)
- Estimated endpoint count

UI (if applicable):
- Frontend framework
- Estimated page/component count

Return a compact JSON with this information.
")
```

### Step 3: Structure Creation

Create the `.business-analyse/` structure:

```bash
mkdir -p .business-analyse/{applications,documentation/{data-dictionary,process-flows,architecture-decisions},templates}
```

### Step 4: Create config.json

```json
{
  "version": "2.0.0",
  "initialized": "<ISO_DATE>",
  "application": {
    "name": "<APP_NAME>",
    "description": "<DESCRIPTION>",
    "type": "<STACK_TYPE>",
    "status": "active"
  },
  "structure": {
    "naming": {
      "features": "FEAT-{NNN}-{slug}",
      "bugs": "BUG-{NNN}"
    },
    "paths": {
      "applications": ".business-analyse/applications",
      "documentation": ".business-analyse/documentation",
      "templates": ".business-analyse/templates"
    }
  },
  "settings": {
    "validationThreshold": 85,
    "ultrathinkPhases": ["discover", "analyse", "specify"],
    "diagramFormats": ["mermaid", "ascii"]
  },
  "technical": {
    "stack": "<DETECTED_STACK>",
    "frameworks": ["<FRAMEWORKS>"],
    "database": "<DB_TYPE_IF_DETECTED>"
  },
  "counters": {
    "features": 0,
    "bugs": 0
  }
}
```

### Step 5: Create Glossary

Create `.business-analyse/glossary.md`:

```markdown
# Business Glossary - {{APP_NAME}}

> Dictionary of business terms used in the application.
> Maintained and updated during each analysis phase.

## Usage Instructions

- Each term must have a clear and unambiguous definition
- Indicate usage context if necessary
- Use the terms defined here in all BA documents

---

## Business Terms

| Term | Definition | Context | Added on |
|------|------------|---------|----------|
| *To be completed during analysis* | | | |

---

## Acronyms

| Acronym | Meaning | Definition |
|---------|---------|------------|
| BA | Business Analysis | Business requirements analysis process |
| BRD | Business Requirements Document | Business requirements document |
| FRD | Functional Requirements Document | Functional specifications document |

---

*Last updated: {{DATE}}*
```

### Step 6: Create .claudeignore

Create `.business-analyse/.claudeignore`:

```
# Business Analysis - Files to exclude from Claude context
# These files are for business documentation only

# Exclude discovery and analysis phases (too verbose)
applications/**/1-discovery.md
applications/**/2-business-requirements.md

# Exclude cross-functional documentation
documentation/**

# Exclude templates (only used by BA commands)
templates/**

# Exclude resolved bug tracking
applications/**/tracking/bugs/*_RESOLVED.md

# KEEP for dev context:
# - 3-functional-specification.md (technical specs)
# - 4-development-handoff.md (dev prompt)
# - glossary.md (business terms)
# - config.json (configuration)
```

### Step 7: Create Application Structure

Create `.business-analyse/applications/<app-name>/`:

```bash
mkdir -p ".business-analyse/applications/<app-name>/modules"
```

Create `context.md`:

```markdown
# Application Context - {{APP_NAME}}

## General Information

| Property | Value |
|----------|-------|
| **Name** | {{APP_NAME}} |
| **Type** | {{STACK_TYPE}} |
| **BA creation date** | {{DATE}} |
| **Status** | Active |

## Description

{{DESCRIPTION}}

## Technical Stack

{{STACK_DETAILS}}

## Stakeholders

| Role | Responsibility |
|------|---------------|
| Product Owner | Priority definition and business validation |
| Business Analyst | Requirements analysis and specification |
| Tech Lead | Technical validation and architecture |
| Developers | Implementation according to specs |

## Modules

| Module | Description | Status |
|--------|-------------|--------|
| *To be defined during analysis* | | |

---

*Initialized on {{DATE}}*
```

### Step 8: Copy Templates

Copy templates to `.business-analyse/templates/` from resources.

### Summary

```
BUSINESS ANALYSIS - INITIALIZED
═══════════════════════════════════════════════════════════
Application:    {{APP_NAME}}
Type:           {{STACK_TYPE}}
═══════════════════════════════════════════════════════════
Structure created:
  ✓ .business-analyse/config.json
  ✓ .business-analyse/glossary.md
  ✓ .business-analyse/.claudeignore
  ✓ .business-analyse/applications/{{APP_NAME}}/
  ✓ .business-analyse/templates/
  ✓ .business-analyse/documentation/
═══════════════════════════════════════════════════════════
Next: /business-analyse:2-discover <module> "description"
```

## Error Handling

| Problem | Action |
|---------|--------|
| Structure already exists | Ask for reset confirmation |
| No write permissions | Inform user |
| Project scan fails | Continue with manual configuration |
