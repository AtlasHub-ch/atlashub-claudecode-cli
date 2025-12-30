# Rapport Comparatif : APEX vs BA

## Resume Executif

| Aspect | APEX | BA (CORRIGE) | Verdict |
|--------|------|--------------|---------|
| Phases | 5 (Analyze-Plan-Execute-eXamine-Tasks) | 5 (Init-Analyse-Validate-Implement-Verify) | OK |
| Methodologie EPCT | Complet | Complet | OK |
| Execution successive | Oui | Oui | OK |
| Production de code | Oui (Execute) | Oui (Implement) | OK |
| Validation technique | Oui (Examine) | Oui (Verify) | OK |
| Cible | Generique | Microsoft .NET/Blazor/EF Core | Specialise |

---

## 1. Mapping EPCT

### Methodologie EPCT Complete

| Phase EPCT | Description | APEX | BA |
|------------|-------------|------|-----|
| **E**xplore | Analyser le contexte, codebase, besoins | `/apex:1-analyze` | `/ba:1-init` + `/ba:2-analyse` |
| **P**lan | Creer un plan d'implementation | `/apex:2-plan` + `/apex:5-tasks` | `/ba:3-validate` (partiel) |
| **C**ode | Implementer le code | `/apex:3-execute` | **MANQUANT** |
| **T**est | Valider, tester, examiner | `/apex:4-examine` | **MANQUANT** |

### Constat

**BA couvre seulement 50% du cycle EPCT** :
- Explore : Oui (init + analyse)
- Plan : Partiel (validation des specs, pas de plan technique)
- Code : **NON**
- Test : **NON**

---

## 2. Analyse Detaillee des Phases

### APEX : 5 Phases Completes

```
┌─────────────────────────────────────────────────────────────────┐
│  APEX WORKFLOW                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1-ANALYZE ──► 2-PLAN ──► 5-TASKS ──► 3-EXECUTE ──► 4-EXAMINE  │
│                                                                  │
│  [E]xplore     [P]lan     [P]lan      [C]ode        [T]est     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Phase | Input | Output | Agents utilises |
|-------|-------|--------|-----------------|
| 1-analyze | Description tache | `analyze.md` | explore-codebase, explore-docs, websearch |
| 2-plan | analyze.md | `plan.md` | - (reflexion directe) |
| 5-tasks | plan.md | `tasks/*.md` | - |
| 3-execute | plan.md + analyze.md | Code + `implementation.md` | snipper |
| 4-examine | Code | Build/Lint/Test results | snipper (fix) |

### BA : 3 Phases (Incomplet)

```
┌─────────────────────────────────────────────────────────────────┐
│  BA WORKFLOW                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1-INIT ──► 2-ANALYSE ──► 3-VALIDATE ──► ???                   │
│                                                                  │
│  [E]xplore   [E]xplore    [P]lan        [C]ode? [T]est?        │
│                           (partiel)      MANQUANT MANQUANT      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Phase | Input | Output | Agents utilises |
|-------|-------|--------|-----------------|
| 1-init | Projet | `config.json` | ba:scan (haiku) |
| 2-analyse | Besoin utilisateur | `analyses/*.md` | ba:entity-analyzer, ba:doc-generator (haiku) |
| 3-validate | analyse.md | `validations/*.md` + `specs/*.md` | - |
| ~~4-code~~ | - | - | **MANQUANT** |
| ~~5-test~~ | - | - | **MANQUANT** |

---

## 3. Points Forts de Chaque Approche

### APEX - Forces

1. **Cycle complet** : De l'analyse au code deploye et teste
2. **Artefacts structures** : `.claude/tasks/nn-task-name/` avec fichiers standardises
3. **Parallelisation** : Agents lances simultanement
4. **Todo tracking** : Suivi de progression en temps reel
5. **Validation automatique** : Build, lint, typecheck automatiques
6. **Divide & Conquer** : Tasks divisees en sous-taches executables

### BA - Forces

1. **Challenge agressif** : Questions profondes sur le besoin metier
2. **Documentation metier** : Template riche et structure
3. **Checklist validation** : Score 85% minimum (29 criteres)
4. **Focus .NET/Blazor** : Adapte specifiquement a cet ecosysteme
5. **Agents Haiku** : Utilisation de modeles legers pour sous-taches
6. **Multi-tenant** : Questions specifiques sur l'isolation

---

## 4. Lacunes Critiques de BA

### 4.1 Pas de Phase Code

BA s'arrete a la generation de specs techniques :

```markdown
## Tasks Backend
- [ ] Entites : <liste>
- [ ] Migration EF Core
- [ ] Endpoints : <liste>
- [ ] Tests

## Tasks Frontend
- [ ] Pages : <liste>
- [ ] Composants
- [ ] Permissions UI
```

**Ces tasks ne sont jamais executees automatiquement.**

### 4.2 Pas de Phase Test/Validation Technique

- Pas de `npm run build`
- Pas de `dotnet build`
- Pas de `dotnet test`
- Pas de validation lint/format

### 4.3 Pas d'Orchestrateur

APEX a `apex.md` qui orchestre tout le workflow. BA n'a pas de `ba.md`.

---

## 5. Recommandations

### Option A : Etendre BA avec 2 nouvelles phases

```
BA WORKFLOW COMPLET (PROPOSE)
────────────────────────────────────────────────────
1-init      → Scan projet, config
2-analyse   → Challenge besoin, modelisation
3-validate  → Validation specs (85% min)
4-implement → NOUVEAU : Generation code .NET/Blazor
5-verify    → NOUVEAU : Build, test, lint
────────────────────────────────────────────────────
```

### Option B : Faire pointer BA vers APEX apres validation

```
BA → APEX HANDOFF
────────────────────────────────────────────────────
/ba:1-init     → Setup context
/ba:2-analyse  → Business analysis
/ba:3-validate → Validation specs
    ↓
    Genere task description pour APEX
    ↓
/apex:1-analyze → Analyse technique
/apex:2-plan    → Plan implementation
/apex:3-execute → Code
/apex:4-examine → Test
────────────────────────────────────────────────────
```

### Option C : Creer des phases BA specifiques .NET

| Nouvelle Phase | Description | Agent |
|---------------|-------------|-------|
| `/ba:4-generate` | Generer entites, DTOs, endpoints | ba:code-generator |
| `/ba:5-test` | dotnet build + dotnet test | ba:validator |

---

## 6. Implementation Recommandee

Je recommande **Option A** : Etendre BA avec 4-implement et 5-verify.

### Fichiers a creer

```
templates/commands/ba/
├── ba.md                    # NOUVEAU: Orchestrateur
├── 1-init.md               # Existant
├── 2-analyse.md            # Existant
├── 3-validate.md           # Existant
├── 4-implement.md          # NOUVEAU: Generation code
├── 5-verify.md             # NOUVEAU: Build/test
└── _resources/
    ├── questions-challenge.md
    ├── template-analyse.md
    ├── checklist-validation.md
    └── template-entity.md    # NOUVEAU: Template entite C#
```

### Structure 4-implement.md

```markdown
---
description: Phase 4 - Implementation code .NET/Blazor
---

## Workflow

1. Lire specs validees (.claude/ba/validations/)
2. Pour chaque entite : generer classe C# + DbContext
3. Generer migration EF Core
4. Pour chaque endpoint : generer controller + DTOs
5. Pour chaque page : generer composant Blazor
6. Sauvegarder dans projet

## Agents

- ba:entity-generator (haiku) : Entites + DbContext
- ba:api-generator (haiku) : Controllers + DTOs
- ba:ui-generator (haiku) : Composants Blazor
```

### Structure 5-verify.md

```markdown
---
description: Phase 5 - Verification et tests
---

## Workflow

1. dotnet build → Fix erreurs
2. dotnet test → Rapport
3. dotnet format → Style
4. Resume final

## Agents

- snipper : Fix erreurs compilation
```

---

## 7. Conclusion

| Critere | APEX | BA Actuel | BA Propose |
|---------|------|-----------|------------|
| EPCT Complet | 100% | 50% | 100% |
| Produit du code | Oui | Non | Oui |
| Tests automatiques | Oui | Non | Oui |
| Workflow successif | Oui | Partiel | Oui |
| Specifique .NET | Non | Oui | Oui |

**Verdict** : BA a une excellente analyse metier mais doit etre etendu pour couvrir Code et Test. L'execution successive `/ba:1-init` → `/ba:2-analyse` → `/ba:3-validate` fonctionne, mais s'arrete trop tot dans le cycle EPCT.
