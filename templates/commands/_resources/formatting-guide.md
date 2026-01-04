# Formatting Guide - Clickable References & Copyable Commands

This guide defines formatting standards for all command templates.

## File References (clickable)

### Standard format

```markdown
<!-- Simple file -->
[filename.ts](path/to/filename.ts)

<!-- File with line -->
[filename.ts:42](path/to/filename.ts#L42)

<!-- File with line range -->
[filename.ts:42-51](path/to/filename.ts#L42-L51)

<!-- Folder -->
[src/components/](src/components/)
```

### Concrete examples

| Context | Format | Result |
|---------|--------|--------|
| GitFlow Config | `[config.json](.claude/gitflow/config.json)` | [config.json](.claude/gitflow/config.json) |
| Specific line | `[installer.ts:45](src/lib/installer.ts#L45)` | [installer.ts:45](src/lib/installer.ts#L45) |
| Range | `[utils.ts:10-25](src/utils.ts#L10-L25)` | [utils.ts:10-25](src/utils.ts#L10-L25) |
| Folder | `[templates/](templates/)` | [templates/](templates/) |

### Avoid

```markdown
<!-- INCORRECT -->
`config.json`
`.claude/gitflow/config.json`
The config.json file
```

## Commands (copyable)

### Claude Code Commands

Always in simple code block:

```markdown
```
/gitflow:1-init --exec
```
```

### Bash/Shell Commands

With language specified:

```markdown
```bash
npm run build
dotnet ef migrations add Initial
```
```

### Multiple commands

```markdown
```bash
# Step 1: Build
npm run build

# Step 2: Test
npm test
```
```

### Avoid

```markdown
<!-- INCORRECT -->
Execute `/gitflow:1-init`
Run the command `npm run build`
```

## Command Tables

Recommended format for listing commands:

```markdown
| Command | Description |
|---------|-------------|
| `/test-web --quick` | Quick tests |
| `/test-web --chrome` | E2E tests |
```

## Paths in Instructions

### Good example

```markdown
1. Create file [config.json](.claude/test-web/config.json)
2. Execute:
   ```
   /test-web --quick
   ```
3. Check report in [reports/](.claude/test-web/reports/)
```

### Bad example

```markdown
1. Create file `.claude/test-web/config.json`
2. Execute `/test-web --quick`
3. Check report in `.claude/test-web/reports/`
```

## Summary

| Element | Format | Example |
|---------|--------|---------|
| File | `[name](path)` | `[config.json](.claude/config.json)` |
| File:line | `[name:L](path#LX)` | `[utils.ts:42](src/utils.ts#L42)` |
| Folder | `[name/](path/)` | `[templates/](templates/)` |
| Claude Command | ` ``` code ``` ` | `/command --flag` |
| Bash Command | ` ```bash code ``` ` | `npm run build` |
