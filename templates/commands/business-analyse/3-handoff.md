---
description: Business Analysis Phase 3 - Concise implementation brief for Claude Code oneshot
---

# Business Analysis - PHASE 3: HANDOFF

**You need to always ULTRA THINK.**

**Audience: CLAUDE CODE**
**Purpose: ONESHOT implementation**

## Format Rules

1. **Diff-like syntax** - CREATE/MODIFY/DELETE with exact paths
2. **Line references** - Always include line numbers for modifications
3. **Copy patterns** - Point to template files, don't describe
4. **Ordered steps** - Dependencies must be clear
5. **Commands included** - CLI commands to run

## Implementation Brief Template

```markdown
# IMPL: [Feature Name]

## Prerequisites
- Branch: [branch name] from develop
- Dependencies: none | [list]

---

## Files

### Backend

CREATE `src/Domain/Entities/[Entity].cs`
  COPY: `src/Domain/Entities/[ExistingEntity].cs`
  CHANGE: class name, properties as specified
  KEEP: audit fields (lines X-Y)

CREATE `src/Infrastructure/Data/Configurations/[Entity]Configuration.cs`
  COPY: `src/Infrastructure/Data/Configurations/[Existing]Configuration.cs`
  CHANGE: table name, column configs

MODIFY `src/Infrastructure/Data/AppDbContext.cs`
  AT: line [X] (after DbSet<[Previous]>)
  ADD: `public DbSet<[Entity]> [Entities] => Set<[Entity]>();`

CREATE `src/Application/Services/[Entity]Service.cs`
  COPY: `src/Application/Services/[Existing]Service.cs`
  CHANGE: entity type, method names

CREATE `src/Api/Controllers/[Entity]Controller.cs`
  COPY: `src/Api/Controllers/[Existing]Controller.cs`
  CHANGE: route, service injection, method names
  PERMISSIONS:
    - GET: [entity].view
    - POST: [entity].create
    - PUT: [entity].edit
    - DELETE: [entity].delete

### Frontend

CREATE `src/app/[module]/[component]/[component].component.ts`
  RUN FIRST: `ng generate component [module]/[component] --skip-tests`
  COPY PATTERN: `src/app/[existing]/[existing].component.ts`
  CHANGE: [specific changes]

CREATE `src/app/[module]/[component]/[component].component.html`
  COPY PATTERN: `src/app/[existing]/[existing].component.html`
  CHANGE: [specific changes]

CREATE `src/app/[module]/[service].service.ts`
  RUN FIRST: `ng generate service [module]/[service]`
  COPY PATTERN: `src/app/[existing]/[existing].service.ts`
  ENDPOINTS:
    - getAll() → GET /api/[entities]
    - getById(id) → GET /api/[entities]/{id}
    - create(dto) → POST /api/[entities]
    - update(id, dto) → PUT /api/[entities]/{id}
    - delete(id) → DELETE /api/[entities]/{id}

MODIFY `src/app/[module]/[module]-routing.module.ts`
  AT: line [X]
  ADD:
  ```typescript
  {
    path: '[path]',
    component: [Component],
    canActivate: [PermissionGuard],
    data: { permission: '[entity].view' }
  }
  ```

### Database

MIGRATION: `dotnet ef migrations add Add[Entity]Table -p src/Infrastructure -s src/Api`

EXPECTED SQL:
```sql
CREATE TABLE [dbo].[[Entities]] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    -- other columns
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [IsDeleted] BIT NOT NULL DEFAULT 0
);
```

### Permissions

INSERT SQL:
```sql
INSERT INTO Permissions (Key, Name, Module) VALUES
('[entity].view', 'View [Entity]', '[module]'),
('[entity].create', 'Create [Entity]', '[module]'),
('[entity].edit', 'Edit [Entity]', '[module]'),
('[entity].delete', 'Delete [Entity]', '[module]');
```

---

## Commands (execute in order)

```bash
# 1. Backend
dotnet build src/Api
dotnet ef migrations add Add[Entity]Table -p src/Infrastructure -s src/Api
dotnet ef database update -p src/Infrastructure -s src/Api

# 2. Frontend
ng generate component [module]/[component] --skip-tests
ng generate service [module]/[service]
npm run build
npm run lint
```

---

## Verify

```bash
# Build checks
dotnet build     # 0 errors
npm run build    # 0 errors
npm run lint     # 0 warnings

# Runtime checks
# - Navigate to /[path]
# - Create new item → appears in table
# - Edit item → changes saved
# - Delete item → removed from table
# - Test without permission → access denied
```

---

## Constraints

**DO NOT:**
- Modify files not listed above
- Change existing entity properties
- Remove existing permissions
- Skip permission checks

**MUST:**
- Follow existing naming conventions
- Include audit fields
- Apply soft-delete pattern
- Add proper error handling
```

## Compact Format (QUICK Track)

```markdown
# IMPL: [Feature Name]

## Files

MODIFY `[file path]`
  AT: line [X]
  ADD/CHANGE: [what to add or change]
  PATTERN: see `[reference file]:[lines]`

## Commands
```bash
[commands to run]
```

## Verify
- [ ] [check 1]
- [ ] [check 2]
```

## Critical Rules

1. **EXACT PATHS** - No placeholders like "src/..."
2. **LINE NUMBERS** - Always specify where to modify
3. **COPY PATTERNS** - Reference existing code
4. **ORDERED STEPS** - Backend before frontend, generate before modify
5. **RUNNABLE COMMANDS** - Include all CLI commands

---

User: $ARGUMENTS
