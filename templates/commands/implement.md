---
description: Implement a feature from its BA handoff (skip explore phase)
argument-hint: <FEAT-XXX> [--phase=1|2|3|4] [--dry-run]
---

# Implement from Handoff

Implement a feature directly from its validated Business Analyst handoff.

**You need to always ULTRA THINK.**

```
+==============================================================================+
|  IMPLEMENT: Skip Exploration - Handoff Already Contains Everything          |
+==============================================================================+
|                                                                              |
|  This command is for features that have:                                     |
|  1. Completed BA workflow (discover → analyse → specify → validate)          |
|  2. APPROVED validation status                                               |
|  3. Generated 4-development-handoff.md                                       |
|                                                                              |
|  DO NOT USE FOR:                                                             |
|  - Quick fixes (use /oneshot or /business-analyse:10-change-request)          |
|  - Features without handoff (use /epct)                                      |
|  - Exploration tasks (use /explore)                                          |
|                                                                              |
+==============================================================================+
```

## Arguments

```
/implement FEAT-XXX [--phase=N] [--dry-run]
```

| Argument | Description |
|----------|-------------|
| `FEAT-XXX` | Feature ID (required) - e.g., FEAT-001 |
| `--phase=1` | Data Layer only (Entities, DbContext, Migration) |
| `--phase=2` | API Layer only (DTOs, CQRS, Controllers) |
| `--phase=3` | UI Layer only (Services, Components, Pages) |
| `--phase=4` | Tests only |
| `--dry-run` | Show implementation plan without executing |

## Workflow

### STEP 1: Validate Prerequisites

```bash
# Find handoff file
HANDOFF=$(find .business-analyse -name "4-development-handoff.md" -path "*/$FEATURE_ID/*" 2>/dev/null)

if [ -z "$HANDOFF" ]; then
  echo "ERROR: No handoff found for $FEATURE_ID"
  echo "Run the BA workflow first:"
  echo "  /business-analyse:2-discover → ... → /business-analyse:6-handoff"
  exit 1
fi

# Check validation status
VALIDATION=$(dirname "$HANDOFF")/validation.json
if ! grep -q '"status": "APPROVED"' "$VALIDATION" 2>/dev/null; then
  echo "ERROR: Feature not validated. Run /business-analyse:5-validate first"
  exit 1
fi
```

### STEP 2: Parse Handoff (OPUS)

Read and extract structured information from the handoff:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PARSE HANDOFF - Extract Implementation Requirements                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Read the handoff file and extract:                                      ║
║                                                                          ║
║  1. METADATA                                                             ║
║     • Feature ID, Module, Application                                    ║
║     • Version, Validation Date                                           ║
║                                                                          ║
║  2. ENTITIES (Section 3)                                                 ║
║     • Entity names and attributes                                        ║
║     • Relationships                                                      ║
║     • Validation rules                                                   ║
║                                                                          ║
║  3. ENDPOINTS (Section 4)                                                ║
║     • HTTP methods, paths                                                ║
║     • Request/Response DTOs                                              ║
║     • Permission requirements (CRITICAL)                                 ║
║                                                                          ║
║  4. UI PAGES (Section 5)                                                 ║
║     • Routes, components                                                 ║
║     • Permission-based visibility                                        ║
║                                                                          ║
║  5. BUSINESS RULES (BR-XXX)                                              ║
║     • All BR-XXX identifiers                                             ║
║     • Implementation requirements                                        ║
║                                                                          ║
║  6. GHERKIN SCENARIOS (Section 9)                                        ║
║     • Acceptance criteria                                                ║
║     • Permission test scenarios                                          ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### STEP 3: Discover Project Patterns (OPUS)

**CRITICAL**: Understand existing patterns BEFORE generating code.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  DISCOVER PATTERNS - Adapt to Existing Codebase                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  1. READ CLAUDE.md                                                       ║
║     • Project conventions                                                ║
║     • Architecture rules                                                 ║
║     • Coding standards                                                   ║
║                                                                          ║
║  2. FIND BASE CLASSES                                                    ║
║     Grep("class.*Entity|BaseEntity|AuditableEntity")                     ║
║     → Use as base for new entities                                       ║
║                                                                          ║
║  3. FIND REPOSITORY PATTERNS                                             ║
║     Grep("IRepository|IGenericRepository")                               ║
║     → Match existing data access patterns                                ║
║                                                                          ║
║  4. FIND CONTROLLER PATTERNS                                             ║
║     Grep("ControllerBase|ApiController")                                 ║
║     → Inherit from project's base controller                             ║
║                                                                          ║
║  5. FIND PERMISSION PATTERNS (from handoff Section 7.1)                  ║
║     Grep("Authorize|HasPermission|RequirePermission")                    ║
║     → Use EXACT same pattern for new endpoints                           ║
║                                                                          ║
║  6. FIND NAMING CONVENTIONS                                              ║
║     • Method names: GetXxxAsync vs FindXxx vs GetXxxById                 ║
║     • File structure: Features/ vs Controllers/                          ║
║     • Folder organization                                                ║
║                                                                          ║
║  OUTPUT: List of patterns to follow for each layer                       ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### STEP 4: Implement by Phase (OPUS)

Execute phases sequentially. Each phase must pass validation before proceeding.

#### Phase 1: Data Layer

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PHASE 1: DATA LAYER                                                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  1. CREATE ENTITIES (Shared project)                                     ║
║     • Follow handoff Section 3 attribute tables                          ║
║     • Inherit from discovered BaseEntity                                 ║
║     • Add navigation properties                                          ║
║     • Add validation attributes                                          ║
║                                                                          ║
║  2. UPDATE DBCONTEXT                                                     ║
║     • Add DbSet<Entity> properties                                       ║
║     • Configure relationships in OnModelCreating if needed               ║
║                                                                          ║
║  3. CREATE MIGRATION                                                     ║
║     dotnet ef migrations add Add{FeatureName} --context ApplicationDb   ║
║                                                                          ║
║  4. SEED DATA (if specified in handoff)                                  ║
║     • Add seed data in migration Up() method                             ║
║                                                                          ║
║  VALIDATION:                                                             ║
║     dotnet build                                                         ║
║     → Must compile without errors                                        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

#### Phase 2: API Layer

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PHASE 2: API LAYER                                                      ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  1. CREATE DTOs (Shared project)                                         ║
║     • Request DTOs with validation                                       ║
║     • Response DTOs (records preferred)                                  ║
║     • Mapping extensions if needed                                       ║
║                                                                          ║
║  2. CREATE CQRS (Api/Features/)                                          ║
║     • Queries: GetXxxQuery, GetXxxListQuery                              ║
║     • Commands: CreateXxxCommand, UpdateXxxCommand, DeleteXxxCommand     ║
║     • Handlers with proper error handling                                ║
║                                                                          ║
║  3. CREATE CONTROLLER                                                    ║
║     • Inherit from project's base controller                             ║
║     • Add endpoints from handoff Section 4                               ║
║     • CRITICAL: Apply permissions from handoff Section 7.4               ║
║       [Authorize(Policy = "Module.Permission")]                          ║
║                                                                          ║
║  VALIDATION:                                                             ║
║     dotnet build                                                         ║
║     → Must compile without errors                                        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

#### Phase 3: UI Layer

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PHASE 3: UI LAYER                                                       ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  1. CREATE SERVICES (Web/Services/)                                      ║
║     • Inherit from BaseAuthenticatedApiClient                            ║
║     • Implement interface                                                ║
║     • Register in DI (Program.cs)                                        ║
║                                                                          ║
║  2. CREATE COMPONENTS (Web/Components/)                                  ║
║     • Follow existing component patterns                                 ║
║     • Use MudBlazor/existing UI library                                  ║
║                                                                          ║
║  3. CREATE PAGES (Web/Components/Modules/.../Pages/)                     ║
║     • Add @page directive with route from handoff                        ║
║     • Inject required services                                           ║
║     • CRITICAL: Apply permissions from handoff Section 7.5               ║
║       - Hide buttons based on PermissionService.HasPermissionAsync()     ║
║       - Redirect unauthorized users                                      ║
║                                                                          ║
║  VALIDATION:                                                             ║
║     dotnet build                                                         ║
║     → Must compile without errors                                        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

#### Phase 4: Tests

```
╔══════════════════════════════════════════════════════════════════════════╗
║  PHASE 4: TESTS                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  1. RUN EXISTING TESTS                                                   ║
║     dotnet test                                                          ║
║     → Ensure no regressions                                              ║
║                                                                          ║
║  2. VALIDATE GHERKIN SCENARIOS                                           ║
║     • Check each scenario from handoff Section 9                         ║
║     • Verify permission scenarios work                                   ║
║                                                                          ║
║  3. CREATE UNIT TESTS (if test project exists)                           ║
║     • Test business rules (BR-XXX)                                       ║
║     • Test validation logic                                              ║
║                                                                          ║
║  VALIDATION:                                                             ║
║     dotnet test --filter "Category=Feature_XXXX"                         ║
║     → All tests pass                                                     ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### STEP 5: Final Validation

```
╔══════════════════════════════════════════════════════════════════════════╗
║  FINAL VALIDATION                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  1. BUILD CHECK                                                          ║
║     dotnet build --no-restore                                            ║
║     → Zero errors, zero warnings (or only pre-existing warnings)         ║
║                                                                          ║
║  2. TEST CHECK                                                           ║
║     dotnet test                                                          ║
║     → All tests pass                                                     ║
║                                                                          ║
║  3. GHERKIN VERIFICATION                                                 ║
║     • Each scenario from handoff Section 9 is implementable              ║
║     • Permission scenarios validated                                     ║
║                                                                          ║
║  4. CHECKLIST                                                            ║
║     [ ] All entities created per handoff Section 3                       ║
║     [ ] All endpoints created per handoff Section 4                      ║
║     [ ] All UI pages created per handoff Section 5                       ║
║     [ ] Permissions applied per handoff Section 7                        ║
║     [ ] Business rules implemented per BR-XXX list                       ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Error Handling

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ERROR HANDLING - OPUS DEBUG MODE                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  If build fails:                                                         ║
║  1. Analyze error messages with OPUS                                     ║
║  2. Identify root cause                                                  ║
║  3. Fix the issue                                                        ║
║  4. Retry build (max 3 attempts)                                         ║
║  5. If still failing: STOP and report to user                            ║
║                                                                          ║
║  If pattern not found:                                                   ║
║  1. Check CLAUDE.md for guidance                                         ║
║  2. Use sensible defaults                                                ║
║  3. Document assumption in code comment                                  ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Output

```
================================================================================
                    IMPLEMENTATION COMPLETE
================================================================================

FEATURE: FEAT-XXX - {Feature Name}

PHASES COMPLETED:
  [✓] Phase 1: Data Layer
      • Created: 3 entities
      • Migration: AddDataGovernanceRoles

  [✓] Phase 2: API Layer
      • Created: 5 DTOs
      • Created: 4 CQRS handlers
      • Created: 1 controller with 5 endpoints

  [✓] Phase 3: UI Layer
      • Created: 2 services
      • Created: 3 components
      • Created: 1 page

  [✓] Phase 4: Tests
      • Build: PASSED
      • Tests: 42 passed, 0 failed

PERMISSIONS APPLIED:
  • ApplicationDomains.View → GET /api/v2/domains/{id}/focus
  • ApplicationDomains.Update → POST /api/v2/domains/{id}/governance

FILES CREATED:
  AtlasHub.Shared/Models/Governance/DataGovernanceRole.cs
  AtlasHub.Api/Features/Domains/Queries/GetDomainFocus/...
  AtlasHub.Web/Components/Modules/DataCatalogue/Pages/DomainFocus.razor
  ... (full list)

NEXT STEPS:
  1. Review changes: git diff
  2. Test manually in browser
  3. Commit: /gitflow:3-commit

================================================================================
```

## Rules

1. **Handoff is source of truth** - Follow handoff specifications exactly
2. **Patterns first** - Always discover existing patterns before coding
3. **Permissions are critical** - Apply from handoff Section 7, test with Section 9
4. **Phase isolation** - Each phase must pass build before proceeding
5. **No assumptions** - If unclear, check CLAUDE.md or ask user
6. **Quality over speed** - Use OPUS for all code generation decisions
