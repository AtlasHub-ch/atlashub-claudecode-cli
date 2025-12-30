---
description: Phase 4 - Implementation code .NET/Blazor/EF Core
allowed-tools: Bash(dotnet *), Read, Write, Edit, Glob, Grep, Task
---

# BA Implement

Expert developpeur .NET senior. Generation de code Microsoft stack.

## Pre-requis

Verifier : `.claude/ba/validations/*.md` existe (sinon `/ba:3-validate`)

## Strategie Agents

| Tache | Model | Raison |
|-------|-------|--------|
| Exploration | haiku | Lecture seule, low cost |
| Generation code | opus | Qualite maximale |

## Workflow

### 1. Charger contexte

1. Lire `config.json` → architecture
2. Lire spec validee → entites, endpoints, pages

### 2. Explorer patterns existants (HAIKU)

```
Task(subagent_type="explore-codebase", model="haiku", prompt="
Trouve les patterns .NET existants:
- Entite EF Core (Domain/Entities/)
- Configuration EF (Infrastructure/Configurations/)
- Controller API (Api/Controllers/)
- Page Blazor (Pages/)
- Test xUnit (Tests/)
Retourne chemins + code modele.
")
```

### 3. Pour chaque ENTITE (OPUS)

```
Task(subagent_type="snipper", model="opus", prompt="
Genere entite .NET 8: {EntityName}
Specs: {specs}
Pattern: {existing_entity}
Creer:
- Domain/Entities/{Entity}.cs
- Infrastructure/Configurations/{Entity}Configuration.cs
- Ajouter DbSet dans DbContext
")
```

### 4. Migration EF Core

```bash
dotnet ef migrations add Add{Entity} --project src/Infrastructure --startup-project src/Api
```

**NE PAS** executer `database update`

### 5. Pour chaque ENDPOINT (OPUS)

```
Task(subagent_type="snipper", model="opus", prompt="
Genere API .NET 8: {Entity}
Endpoints: {from_specs}
Roles: {roles}
Pattern: {existing_controller}
Creer:
- Application/DTOs/{Entity}/*.cs
- Api/Controllers/{Entity}sController.cs
")
```

### 6. Pour chaque PAGE Blazor (OPUS)

```
Task(subagent_type="snipper", model="opus", prompt="
Genere pages Blazor: {Entity}
UI specs: {from_validation}
Wireframe: {from_analyse}
Pattern: {existing_page}
Creer:
- Pages/{Entity}s/Index.razor
- Pages/{Entity}s/Form.razor
")
```

### 7. Tests (OPUS)

```
Task(subagent_type="snipper", model="opus", prompt="
Genere tests xUnit: {Entity}sController
Cas: GET all, GET by id, POST, PUT, DELETE, 404, validation
Pattern: {existing_tests}
")
```

### 8. Log implementation

Creer `.claude/ba/implementations/YYYY-MM-DD-{feature}.md`

## Resume

```
IMPLEMENTATION
────────────────────────────────
Feature:  {NAME}
Backend:  {X} entites, {X} endpoints
Frontend: {X} pages
Tests:    {X} fichiers
Migration: Add{Entity}
────────────────────────────────
Prochain: /ba:5-verify
```

## Regles

1. Explorer patterns (haiku) AVANT generation
2. Generer code avec opus (qualite maximale)
3. Un agent par composant
4. Suivre conventions projet
5. NE PAS appliquer migration
