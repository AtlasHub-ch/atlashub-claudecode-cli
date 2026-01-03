---
description: Phase 3 - Smart commit with EF Core migration validation
agent: gitflow-commit
model: sonnet
args: [message]
---

# Phase 3: COMMIT - Migration-aware commits

You are an expert in GitFlow and EF Core. Manage commits with validation of .NET migrations.

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks below are instructions for using the `AskUserQuestion` tool **interactively**. You MUST execute the tool with these parameters to get the user's response BEFORE continuing. DO NOT display this code - WAIT for the response.

**Argument:** `$ARGUMENTS` = commit message (optional, generated if absent)

---

## Workflow

### 1. Analyze files

- Staged files
- Modified files not staged
- Untracked files
- Detect migration files in each category

### 2. Validate migrations

A valid EF Core migration = **3 files** :
- `{Timestamp}_{Name}.cs` - Main migration
- `{Timestamp}_{Name}.Designer.cs` - Metadata
- `{Context}ModelSnapshot.cs` - Model state

**Checks:**
- All 3 files are present
- Build compiles (`dotnet build`)
- No ModelSnapshot conflicts with develop

### 3. ⚠️ SAFETY CHECK - Destructive operations

**BLOCKING** - Scan migrations for dangerous operations :

```bash
# Patterns to detect in migration .cs files
grep -n "DropTable\|DropColumn\|DropIndex\|DropForeignKey\|DeleteData" {migration}.cs
grep -n "migrationBuilder.Sql" {migration}.cs | grep -i "DELETE\|DROP\|TRUNCATE"
```

**If detected :**

```
╔══════════════════════════════════════════════════════════╗
║  ⛔ DESTRUCTIVE OPERATIONS DETECTED                       ║
╠══════════════════════════════════════════════════════════╣
║  File: {migration}.cs                                    ║
║  Line {X}: DropTable("Users")                            ║
║  Line {Y}: DropColumn("Email", "Customers")              ║
╠══════════════════════════════════════════════════════════╣
║  RISKS:                                                  ║
║  - Irreversible data loss                                ║
║  - Verify that you have a BACKUP                         ║
╚══════════════════════════════════════════════════════════╝
```

**Actions:**
1. Display detailed alert (file, line, operation)
2. Request explicit confirmation: "Do you confirm? (yes/no)"
3. If "no" → Cancel commit
4. If "yes" → Log in `.claude/gitflow/logs/dangerous-migrations.json`
5. Continue commit

**Dangerous patterns:**

| Pattern | Risk | Level |
|---------|------|-------|
| `DropTable` | Delete entire table | CRITICAL |
| `DropColumn` | Data loss in column | CRITICAL |
| `DeleteData` | Delete rows | CRITICAL |
| `DropForeignKey` | Break integrity | HIGH |
| `DropIndex` | Performance impact | MEDIUM |
| `Sql("DELETE...")` | Raw destructive SQL | CRITICAL |
| `Sql("DROP...")` | Raw destructive SQL | CRITICAL |
| `Sql("TRUNCATE...")` | Empty table | CRITICAL |

### 4. Classify commit

| Files | Type | Prefix |
|-------|------|--------|
| Migrations only | migration | `db(migrations):` |
| Migrations + code | mixed | `feat:` or `fix:` |
| Code without migration | code | Based on branch type |
| Config/docs | chore | `chore:` |

### 5. Generate message (if absent)

**Migration:**
```
db(migrations): {action} {description}

Migration: {MigrationName}
Tables: {CREATE|ALTER|DROP} {tables}
Context: {DbContext}
```

**Mixed:**
```
feat({scope}): {description}

- {changes}
Migrations: {list}
```

### 6. Execute commit

- Add missing migration files if necessary
- Verify one last time
- Commit with message

### 7. Post-commit

- Verify no migration files are left uncommitted
- Display summary

### 8. Automatic push (based on config)

Read config: `.claude/gitflow/config.json` → `workflow.push.afterCommit`

**Worktree detection:**
```bash
# If git-common-dir != .git → it's a worktree
COMMON_DIR=$(git rev-parse --git-common-dir 2>/dev/null)
if [[ "$COMMON_DIR" != ".git" && "$COMMON_DIR" != "." ]]; then
  IS_WORKTREE=true
fi
```

**Push logic:**

| Config `afterCommit` | Worktree | Action |
|---------------------|----------|--------|
| `worktree` | Yes | Automatic push |
| `worktree` | No | Ask user |
| `always` | - | Automatic push |
| `ask` | - | Ask user |
| `never` | - | Do not push |

**If user is asked:**
```
AskUserQuestion({
  questions: [{
    question: "Do you want to push this commit?",
    header: "Push",
    options: [
      { label: "Yes, push now", description: "git push origin <branch>" },
      { label: "No, later", description: "Local commit only" }
    ],
    multiSelect: false
  }]
})
```

**Execute push:**
```bash
git push origin $(git branch --show-current)
```

**Push error handling:**
- If remote not configured → Skip with message
- If rebase necessary → Warn and suggest:
  ```
  /gitflow:4-plan rebase
  ```
- If branch protected → Warn (PR required)

---

## Common errors

| Error | Solution |
|-------|----------|
| ModelSnapshot missing | Add the file |
| Designer missing | Add the file |
| Build fails | `dotnet ef migrations remove` + fix |
| Conflict detected | Rebase first |
| **Destructive operation** | Confirm or modify migration |

## Modes

| Command | Action |
|---------|--------|
| `/gitflow:3-commit {msg}` | Commit with message |
| `/gitflow:3-commit` | Auto generate message |
| `/gitflow:3-commit --validate` | Validate without commit |
| `/gitflow:3-commit --dry-run` | Simulation |
