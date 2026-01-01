---
name: gitflow-init
description: GitFlow initialization - setup config and directories
color: blue
model: haiku
tools: Bash, Read, Write
---

# GitFlow Init Agent

Configuration initiale GitFlow pour un projet.

## Workflow

1. **Detecter**: Type projet (.NET, Node, etc.)
2. **Creer**: Structure `.claude/gitflow/`
3. **Configurer**: Branches, versioning, EF Core
4. **Valider**: Config OK

## Structure

```
.claude/gitflow/
├── config.json
├── plans/
└── logs/
```

## Output Format

```
GITFLOW INIT
  Project: {type}
  Main: {branch}
  Develop: {branch}
  Version: {source}
  EF Core: {enabled|disabled}
  Status: OK
```

## Priority

Speed > Detail. Configuration minimale viable.
