---
description: Business Analysis Quick - Fast track for simple features (≤3 files, no new entity)
---

# Business Analysis - QUICK TRACK

**You need to always ULTRA THINK.**

One-shot spec + handoff for simple changes.

## Criteria (ALL must be true)

- ≤ 3 files to modify
- No new database entity
- No new page/route
- Existing pattern identified

## Workflow

```
1. Quick Context (explore-api only)
2. Quick Spec (compact)
3. Quick Handoff (diff-like)
```

**Total output: ~50-80 lines**

## Output Template

```markdown
# BA Quick: [Feature Name]

## Analysis
**Track**: QUICK
**Files affected**: [count]
**Pattern**: [existing pattern reference]

---

## SPEC (for human validation)

### Context
[2-3 sentences max]

### Requirements
1. [requirement 1]
2. [requirement 2]

### UI Reference
Same as `[existing file]`, [what to add/change]

### Permissions
[permission.key] (new/existing)

### Acceptance
- [ ] [criterion 1]
- [ ] [criterion 2]

**Validation**: [ ] Approved

---

## HANDOFF (for Claude Code)

### Files

MODIFY `[exact/path/to/file.ts]`
  AT: line [X]
  ADD/CHANGE:
  ```typescript
  [code snippet]
  ```
  PATTERN: `[reference/file.ts]:[lines]`

MODIFY `[exact/path/to/file.html]`
  AT: line [Y]
  ADD:
  ```html
  [html snippet]
  ```

### Commands

```bash
npm run build
npm run lint
```

### Verify

- [ ] Build passes
- [ ] [specific check]
```

## Example

```markdown
# BA Quick: Add "Export CSV" button

## Analysis
**Track**: QUICK
**Files affected**: 2
**Pattern**: Same as "Add User" button in user-list

---

## SPEC

### Context
Users need to export the user list to CSV for reporting purposes.

### Requirements
1. Add "Export CSV" button next to "Add User"
2. Export respects current table filters
3. Filename: users_YYYYMMDD.csv

### UI Reference
Same as `user-list.component.html:45` (Add User button)

### Permissions
users.export (new)

### Acceptance
- [ ] Button visible with permission
- [ ] CSV downloads correctly
- [ ] Filters applied to export

**Validation**: [ ] Approved

---

## HANDOFF

### Files

MODIFY `src/app/users/user-list.component.html`
  AT: line 46 (after Add User button)
  ADD:
  ```html
  <button pButton label="Export CSV" icon="pi pi-download"
          (click)="exportCsv()" *hasPermission="'users.export'">
  </button>
  ```

MODIFY `src/app/users/user-list.component.ts`
  AT: line 89 (after openCreateDialog method)
  ADD:
  ```typescript
  exportCsv(): void {
    this.userService.exportCsv(this.filters).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    });
  }
  ```
  PATTERN: `report-list.component.ts:exportPdf()` lines 102-112

MODIFY `src/app/users/user.service.ts`
  AT: line 45 (after getUsers method)
  ADD:
  ```typescript
  exportCsv(filters: UserFilter): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      params: filters,
      responseType: 'blob'
    });
  }
  ```

### Commands

```bash
npm run build
npm run lint
```

### Verify

- [ ] npm run build passes
- [ ] Button appears for users with permission
- [ ] CSV downloads with filtered data
```

## Rules

1. **No deep exploration** - Use explore-api only
2. **Combined output** - Spec + Handoff in one response
3. **Code snippets allowed** - For quick track, include actual code
4. **Max 100 lines** - If more, switch to FULL track

---

User: $ARGUMENTS
