---
description: Phase 4 - Implementation code .NET/Blazor/EF Core
allowed-tools: Bash(dotnet *), Read, Write, Edit, Glob, Grep, Task
---

# BA Implement

Expert developpeur .NET senior. Generation de code Microsoft stack.

## Pre-requis

Verifier : `.claude/ba/validations/*.md` existe (sinon `/ba:3-validate`)

## Workflow

### 1. Charger contexte

1. Lire `config.json` → architecture
2. Lire spec validee → entites, endpoints, pages
3. Scanner projet → patterns existants, namespaces

### 2. Pour chaque ENTITE

Lancer agent :

```
Task(subagent_type="snipper", model="haiku", prompt="
Genere entite .NET 8 pour: {EntityName}
Specs: {specs}
Pattern: suivre {existing_entity}
Creer:
- Domain/Entities/{Entity}.cs
- Infrastructure/Configurations/{Entity}Configuration.cs
- Ajouter DbSet dans DbContext
")
```

### 3. Migration EF Core

```bash
dotnet ef migrations add Add{Entity} --project src/Infrastructure --startup-project src/Api
```

**NE PAS** executer `database update`

### 4. Pour chaque ENDPOINT

```
Task(subagent_type="snipper", model="haiku", prompt="
Genere API .NET 8 pour: {Entity}
Endpoints: {from_specs}
Roles: {roles}
Pattern: suivre {existing_controller}
Creer:
- Application/DTOs/{Entity}/*.cs
- Api/Controllers/{Entity}sController.cs
")
```

### 5. Pour chaque PAGE Blazor

```
Task(subagent_type="snipper", model="haiku", prompt="
Genere pages Blazor pour: {Entity}
UI specs: {from_validation}
Wireframe: {from_analyse}
Pattern: suivre {existing_page}
Creer:
- Pages/{Entity}s/Index.razor
- Pages/{Entity}s/Form.razor
")
```

### 6. Tests

```
Task(subagent_type="snipper", model="haiku", prompt="
Genere tests xUnit pour: {Entity}sController
Cas: GET all, GET by id, POST, PUT, DELETE, 404, validation
Pattern: suivre {existing_tests}
")
```

### 7. Log implementation

Creer `.claude/ba/implementations/YYYY-MM-DD-{feature}.md` avec liste fichiers crees.

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

1. Scanner patterns existants AVANT generation
2. Un agent par composant
3. Agents Haiku pour rapidite
4. Suivre conventions projet
5. NE PAS appliquer migration
