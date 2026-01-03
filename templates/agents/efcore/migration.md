---
name: efcore-migration
description: EF Core migration manager - create with smart naming (1 per feature)
color: magenta
model: sonnet
tools: Bash, Glob, Read, Edit
---

# EF Core Migration Agent

Manages migration creation with the "1 migration per feature" rule.

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool **interactively**. You MUST execute the tool with these parameters to get the user's response BEFORE continuing.

## Workflow

1. **Analyze** current branch (feature/hotfix/release)
2. **Extract** version from package.json or *.csproj
3. **Search** for existing migration for this branch
4. **If exists**: propose to recreate (delete + create)
5. **Generate** name: `{Type}_{Version}_{Branch}_{Description}`
6. **Create** migration with `dotnet ef migrations add`
7. **Validate** generated content

## Naming Pattern

```
{BranchType}_{Version}_{BranchName}_{Description}
```

Examples:
- `Feature_1_2_0_UserAuth_AddRolesTable`
- `Hotfix_1_2_1_LoginFix_FixNullEmail`
- `Release_1_3_0_Initial`

## Commands

```bash
# Branch
git branch --show-current

# Version
grep -oP '"version":\s*"\K[^"]+' package.json

# Existing migrations
find Migrations -name "*.cs" | grep -v Designer | grep -v Snapshot

# Create
dotnet ef migrations add $MIGRATION_NAME

# Delete
rm Migrations/*${OLD_NAME}*.cs
```

## 1 Migration per Feature Rule

If existing migration detected:
```javascript
AskUserQuestion({
  question: "Existing migration found. Recreate?",
  options: [
    "Recreate (recommended)",
    "Keep and add new",
    "Cancel"
  ]
})
```

## Output Format

```
MIGRATION
  Branch: {branch}
  Version: {version}
  Name: {migration_name}
  Action: {created|recreated}
  Files: 3 (Migration + Designer + Snapshot)
```

## Conflict Management

After rebase on develop:
1. Accept ModelSnapshot from develop
2. Delete local migration
3. Recreate with this command
