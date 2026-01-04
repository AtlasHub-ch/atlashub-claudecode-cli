# Plan d'Integration des Tests de Non-Regression dans le Workflow BA

**Date:** 2026-01-03
**Auteur:** Claude (Expert Prompt IA + Expert Developpeur)
**Mode:** ULTRATHINK

---

## 1. Analyse du Probleme

### 1.1 Contexte Actuel

Le workflow Business Analyse comporte 7 phases:

```
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐
│ 1-Init  │───▶│2-Discover│───▶│3-Analyse│───▶│4-Specify│───▶│5-Validate│───▶│6-Handoff│───▶│7-Document│
└─────────┘    └──────────┘    └─────────┘    └─────────┘    └──────────┘    └─────────┘    └──────────┘
                                                   │              │              │
                                                   │              │              │
                                              Genere FRD     Gate User      Genere DEV-PROMPT
                                                              Approval
```

### 1.2 Problemes Identifies

| Probleme | Impact | Severite |
|----------|--------|----------|
| Pas de validation automatique du contenu FRD | Code peut se glisser dans les specs | CRITIQUE |
| Pas de validation du Handoff | Handoff peut contenir du code pre-ecrit | CRITIQUE |
| Validation Gherkin insuffisante | Scenarios incomplets | HAUTE |
| Pas de tests de non-regression | Regressions possibles lors des mises a jour | HAUTE |
| Structure des documents non validee | Sections manquantes | MOYENNE |

### 1.3 Objectifs

1. **Validation automatique** des documents generes (FRD, Handoff)
2. **Tests de non-regression** pour le workflow lui-meme
3. **Agents specialises** pour les validations (modeles adaptes)
4. **Integration transparente** dans le flow existant

---

## 2. Architecture Proposee

### 2.1 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           WORKFLOW BUSINESS ANALYSE AMELIORE                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐    ┌──────────────────────┐  │
│  │ 1-Init  │───▶│2-Discover│───▶│3-Analyse│───▶│4-Specify│───▶│ 4bis-VALIDATE-FRD   │  │
│  └─────────┘    └──────────┘    └─────────┘    └─────────┘    │  (Agent: haiku)      │  │
│                                                               └──────────┬───────────┘  │
│                                                                          │              │
│                                                                    ┌─────▼─────┐        │
│                                                                    │ PASS/FAIL │        │
│                                                                    └─────┬─────┘        │
│                                                                          │              │
│  ┌──────────────────────┐    ┌─────────┐    ┌──────────────────────┐    │              │
│  │ 6bis-VALIDATE-HANDOFF│◀───│6-Handoff│◀───│    5-Validate       │◀───┘              │
│  │   (Agent: haiku)     │    └─────────┘    │   (User Approval)    │                   │
│  └──────────┬───────────┘                   └──────────────────────┘                   │
│             │                                                                           │
│       ┌─────▼─────┐                                                                     │
│       │ PASS/FAIL │                                                                     │
│       └─────┬─────┘                                                                     │
│             │                                                                           │
│  ┌──────────▼───────────┐    ┌──────────────────────┐                                  │
│  │    7-Document        │───▶│  7bis-GENERATE-TESTS │                                  │
│  │                      │    │   (Agent: sonnet)    │                                  │
│  └──────────────────────┘    └──────────────────────┘                                  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Points d'Injection

| Point | Phase | Agent | Modele | Fonction |
|-------|-------|-------|--------|----------|
| **4bis** | Apres Specify | `ba-validate-frd` | haiku | Validation FRD |
| **6bis** | Apres Handoff | `ba-validate-handoff` | haiku | Validation Handoff |
| **7bis** | Apres Document | `ba-generate-tests` | sonnet | Generation tests |

---

## 3. Agents Specialises

### 3.1 Agent: ba-validate-frd

**Fichier:** `templates/agents/ba-validate-frd.md`

```yaml
---
description: Validates FRD document for code violations and structure compliance
model: haiku
---
```

**Responsabilites:**
- Scan des patterns de code interdits (C#, JS, SQL, Python)
- Verification de la structure du document
- Validation du score de completude (>= 85%)
- Verification des scenarios Gherkin (min 5)

**Input:** Chemin vers le FRD genere
**Output:** Rapport de validation (PASS/FAIL + details)

**Pourquoi haiku?**
- Tache deterministe (regex, comptage)
- Pas de raisonnement complexe requis
- Execution rapide et economique
- Peut etre execute plusieurs fois sans cout significatif

### 3.2 Agent: ba-validate-handoff

**Fichier:** `templates/agents/ba-validate-handoff.md`

```yaml
---
description: Validates Handoff document for pre-written code and structure compliance
model: haiku
---
```

**Responsabilites:**
- Scan des patterns de code pre-ecrit
- Verification des sections obligatoires (Explore-First, MoSCoW, etc.)
- Validation JSON (structure only, no fake data)
- Verification du format des wireframes (ASCII)

**Input:** Chemin vers le Handoff genere
**Output:** Rapport de validation (PASS/FAIL + details)

**Pourquoi haiku?**
- Meme justification que ba-validate-frd
- Validation par pattern matching principalement

### 3.3 Agent: ba-generate-tests

**Fichier:** `templates/agents/ba-generate-tests.md`

```yaml
---
description: Generates non-regression tests from FRD and Handoff specifications
model: sonnet
---
```

**Responsabilites:**
- Analyse des scenarios Gherkin → Tests E2E
- Analyse des endpoints API → Tests d'integration
- Analyse des entites → Tests unitaires
- Generation du fichier de tests

**Input:** FRD + Handoff
**Output:** Fichiers de tests generes

**Pourquoi sonnet?**
- Necessite comprehension semantique
- Generation de code de test
- Raisonnement sur la couverture des tests

### 3.4 Agent: ba-validate-quality (Optionnel - Phase 2)

**Fichier:** `templates/agents/ba-validate-quality.md`

```yaml
---
description: Deep quality analysis of BA documents
model: sonnet
---
```

**Responsabilites:**
- Coherence entre BRD, FRD, Handoff
- Qualite des descriptions (clarte, completude)
- Detection des ambiguites
- Suggestions d'amelioration

**Pourquoi sonnet?**
- Analyse semantique approfondie
- Comprehension contextuelle requise

---

## 4. Structure des Fichiers

### 4.1 Nouveaux Fichiers a Creer

```
templates/
├── agents/
│   ├── ba-validate-frd.md           # NEW - Agent validation FRD
│   ├── ba-validate-handoff.md       # NEW - Agent validation Handoff
│   ├── ba-generate-tests.md         # NEW - Agent generation tests
│   └── ba-validate-quality.md       # NEW (Phase 2) - Agent qualite
│
├── commands/
│   └── business-analyse/
│       ├── 4bis-validate-frd.md     # NEW - Commande validation FRD
│       ├── 6bis-validate-handoff.md # NEW - Commande validation Handoff
│       └── 7bis-generate-tests.md   # NEW - Commande generation tests
│
└── _resources/
    └── business-analyse/
        ├── patterns-code-forbidden.json   # NEW - Patterns regex
        ├── patterns-business-whitelist.json # NEW - Whitelist business terms
        └── validation-schemas/
            ├── frd-schema.json            # NEW - Schema FRD
            └── handoff-schema.json        # NEW - Schema Handoff
```

### 4.2 Fichiers a Modifier

| Fichier | Modification |
|---------|--------------|
| `business-analyse.md` | Ajouter les nouvelles phases 4bis, 6bis, 7bis |
| `4-specify.md` | Ajouter appel automatique a 4bis-validate-frd |
| `6-handoff.md` | Ajouter appel automatique a 6bis-validate-handoff |

---

## 5. Patterns de Validation

### 5.1 Patterns Code Interdits (patterns-code-forbidden.json)

```json
{
  "version": "1.0",
  "patterns": {
    "csharp": {
      "strict": [
        "public\\s+(void|int|string|async|class|static|private|protected)",
        "\\[Required\\]|\\[MaxLength|\\[StringLength",
        "namespace\\s+\\w+",
        "using\\s+System",
        "get;\\s*set;",
        "=>\\s*\\{",
        "new\\s+\\w+\\s*\\("
      ],
      "description": "C# code patterns - always forbidden"
    },
    "javascript": {
      "strict": [
        "function\\s+\\w+\\s*\\(",
        "const\\s+\\w+\\s*=\\s*\\(",
        "=>\\s*\\{",
        "export\\s+(default|const|function)",
        "import\\s+\\{.*\\}\\s+from"
      ],
      "description": "JavaScript/TypeScript patterns - always forbidden"
    },
    "python": {
      "strict": [
        "def\\s+\\w+\\s*\\(",
        "class\\s+\\w+\\s*:",
        "import\\s+\\w+",
        "from\\s+\\w+\\s+import"
      ],
      "description": "Python patterns - always forbidden"
    },
    "sql": {
      "strict": [
        "INSERT\\s+INTO",
        "CREATE\\s+TABLE",
        "ALTER\\s+TABLE",
        "DROP\\s+TABLE",
        "SELECT\\s+.*\\s+FROM",
        "UPDATE\\s+\\w+\\s+SET"
      ],
      "description": "SQL DDL/DML - always forbidden"
    },
    "razor": {
      "strict": [
        "@code\\s*\\{",
        "<Mud\\w+",
        "@inject\\s+",
        "@page\\s+\""
      ],
      "description": "Razor/Blazor patterns - always forbidden"
    }
  }
}
```

### 5.2 Whitelist Business Terms (patterns-business-whitelist.json)

```json
{
  "version": "1.0",
  "whitelist": {
    "class_related": [
      "user classification",
      "classification system",
      "class of objects",
      "first-class citizen",
      "classification category"
    ],
    "function_related": [
      "business function",
      "function of the system",
      "main function",
      "function description"
    ],
    "select_related": [
      "user can select",
      "selection criteria",
      "select an option",
      "selection mode"
    ],
    "import_related": [
      "data import",
      "import process",
      "import functionality"
    ]
  },
  "context_rules": [
    {
      "pattern": "class",
      "allowed_if": "preceded or followed by business context words",
      "examples": ["user class", "data classification"]
    }
  ]
}
```

---

## 6. Integration dans les Commandes Existantes

### 6.1 Modification de 4-specify.md

Ajouter a la fin du workflow:

```markdown
### Step 9: Automatic FRD Validation

After generating the FRD, **automatically** run validation:

\`\`\`
Task(
  subagent_type="ba-validate-frd",
  prompt="Validate FRD at: {{FRD_PATH}}",
  model="haiku"
)
\`\`\`

**If validation FAILS:**
- Review the validation report
- Fix identified issues
- Re-run validation until PASS

**If validation PASSES:**
- Proceed to phase 5 (Validate)
```

### 6.2 Modification de 6-handoff.md

Ajouter apres "Definition of Done":

```markdown
### Automatic Handoff Validation

Before finalizing, **automatically** run validation:

\`\`\`
Task(
  subagent_type="ba-validate-handoff",
  prompt="Validate Handoff at: {{HANDOFF_PATH}}",
  model="haiku"
)
\`\`\`

**Validation checks:**
- [ ] No pre-written code detected
- [ ] All required sections present
- [ ] JSON guidelines respected
- [ ] ASCII wireframes only (no component code)
- [ ] Explore-First instructions included
- [ ] MoSCoW prioritization present
- [ ] Minimum 5 Gherkin scenarios
```

### 6.3 Nouvelle Commande: 7bis-generate-tests.md

```markdown
---
description: Phase 7bis - Generate non-regression tests from BA specifications
---

# Business Analyse - Generate Tests

Generate comprehensive test suite from FRD and Handoff specifications.

## Arguments

\`\`\`
/business-analyse:generate-tests [feature-id]
\`\`\`

## Prerequisites

- FRD validated (4bis passed)
- Handoff validated (6bis passed)

## Workflow

### Step 1: Analyze Gherkin Scenarios

Extract all Gherkin scenarios from FRD and convert to test cases:

| Scenario Type | Test Type | Framework |
|---------------|-----------|-----------|
| Happy Path | E2E | Playwright/Cypress |
| Validation Errors | Integration | xUnit/Jest |
| Permission Errors | Integration | xUnit/Jest |
| Edge Cases | Unit + Integration | xUnit/Jest |

### Step 2: Analyze API Endpoints

Generate API integration tests from endpoint specifications:

| Endpoint | Tests Generated |
|----------|-----------------|
| GET /resource | List, Pagination, Filtering |
| POST /resource | Create, Validation, Duplicate |
| PUT /resource/:id | Update, NotFound, Validation |
| DELETE /resource/:id | Delete, NotFound, Cascade |

### Step 3: Generate Test Files

Output structure:

\`\`\`
.business-analyse/features/{{FEAT-XXX}}/tests/
├── e2e/
│   └── {{feature}}.spec.ts        # Playwright/Cypress E2E tests
├── integration/
│   └── {{feature}}.api.test.ts    # API integration tests
└── unit/
    └── {{feature}}.unit.test.ts   # Unit tests for business rules
\`\`\`
```

---

## 7. Flux d'Execution

### 7.1 Flux Normal (Happy Path)

```
1. /business-analyse:init
   ↓
2. /business-analyse:discover
   ↓
3. /business-analyse:analyse
   ↓
4. /business-analyse:specify
   ↓
   ┌─────────────────────────────────┐
   │ 4bis: ba-validate-frd (auto)   │ ← HAIKU
   │ - Scan patterns code           │
   │ - Check structure              │
   │ - Validate Gherkin min 5       │
   └─────────────┬───────────────────┘
                 │
           ┌─────▼─────┐
           │   PASS?   │
           └─────┬─────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
      PASS              FAIL
        │                 │
        │                 ▼
        │         ┌──────────────┐
        │         │ Fix issues   │
        │         │ Re-run 4bis  │
        │         └──────────────┘
        │
        ▼
5. /business-analyse:validate (User Gate)
   ↓
6. /business-analyse:handoff
   ↓
   ┌─────────────────────────────────┐
   │ 6bis: ba-validate-handoff (auto)│ ← HAIKU
   │ - Scan pre-written code        │
   │ - Check sections               │
   │ - Validate JSON guidelines     │
   └─────────────┬───────────────────┘
                 │
           ┌─────▼─────┐
           │   PASS?   │
           └─────┬─────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
      PASS              FAIL
        │                 │
        │                 ▼
        │         ┌──────────────┐
        │         │ Fix issues   │
        │         │ Re-run 6bis  │
        │         └──────────────┘
        │
        ▼
7. /business-analyse:document (Optional)
   ↓
   ┌─────────────────────────────────┐
   │ 7bis: ba-generate-tests (opt)  │ ← SONNET
   │ - Generate E2E tests           │
   │ - Generate integration tests   │
   │ - Generate unit tests          │
   └─────────────────────────────────┘
```

### 7.2 Flux de Validation Detaille (4bis)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ba-validate-frd (HAIKU)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  INPUT: FRD document path                                               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ STEP 1: Load validation patterns                                │    │
│  │   - patterns-code-forbidden.json                                │    │
│  │   - patterns-business-whitelist.json                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                           │                                             │
│                           ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ STEP 2: Scan for forbidden patterns                             │    │
│  │   FOR EACH pattern in forbidden:                                │    │
│  │     IF match found:                                             │    │
│  │       IF NOT in whitelist context:                              │    │
│  │         ADD to violations                                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                           │                                             │
│                           ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ STEP 3: Check document structure                                │    │
│  │   - Required sections present?                                  │    │
│  │   - Frontmatter valid?                                          │    │
│  │   - Use cases documented?                                       │    │
│  │   - Wireframes in ASCII format?                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                           │                                             │
│                           ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ STEP 4: Count and validate Gherkin scenarios                    │    │
│  │   - Minimum 5 scenarios?                                        │    │
│  │   - Categories covered? (Happy, Validation, Permission, Edge)   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                           │                                             │
│                           ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ STEP 5: Calculate completeness score                            │    │
│  │   - Score >= 85%? (26/30)                                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                           │                                             │
│                           ▼                                             │
│  OUTPUT: Validation Report                                              │
│  {                                                                      │
│    "status": "PASS" | "FAIL",                                          │
│    "score": 28/30 (93%),                                               │
│    "violations": [...],                                                │
│    "warnings": [...],                                                  │
│    "suggestions": [...]                                                │
│  }                                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Ordre d'Implementation

### Phase 1: Fondations (Priorite HAUTE)

| # | Tache | Fichier | Effort |
|---|-------|---------|--------|
| 1.1 | Creer patterns-code-forbidden.json | `templates/_resources/business-analyse/` | 1h |
| 1.2 | Creer patterns-business-whitelist.json | `templates/_resources/business-analyse/` | 30min |
| 1.3 | Creer agent ba-validate-frd.md | `templates/agents/` | 2h |
| 1.4 | Creer agent ba-validate-handoff.md | `templates/agents/` | 2h |

### Phase 2: Integration (Priorite HAUTE)

| # | Tache | Fichier | Effort |
|---|-------|---------|--------|
| 2.1 | Modifier 4-specify.md (ajouter Step 9) | `templates/commands/business-analyse/` | 1h |
| 2.2 | Modifier 6-handoff.md (ajouter validation) | `templates/commands/business-analyse/` | 1h |
| 2.3 | Modifier business-analyse.md (documenter nouvelles phases) | `templates/commands/` | 30min |

### Phase 3: Generation de Tests (Priorite MOYENNE)

| # | Tache | Fichier | Effort |
|---|-------|---------|--------|
| 3.1 | Creer agent ba-generate-tests.md | `templates/agents/` | 3h |
| 3.2 | Creer commande 7bis-generate-tests.md | `templates/commands/business-analyse/` | 2h |

### Phase 4: Validation Qualite (Priorite BASSE - Future)

| # | Tache | Fichier | Effort |
|---|-------|---------|--------|
| 4.1 | Creer agent ba-validate-quality.md | `templates/agents/` | 3h |
| 4.2 | Integrer dans le flow | Various | 2h |

---

## 9. Choix des Modeles - Justification

### 9.1 Matrice de Decision

| Agent | Tache | Complexite | Modele | Justification |
|-------|-------|------------|--------|---------------|
| ba-validate-frd | Pattern matching, comptage | Faible | **haiku** | Tache deterministe, pas de raisonnement |
| ba-validate-handoff | Pattern matching, structure | Faible | **haiku** | Meme justification |
| ba-generate-tests | Comprehension semantique, generation code | Elevee | **sonnet** | Necessite raisonnement et generation |
| ba-validate-quality | Analyse coherence, suggestions | Moyenne | **sonnet** | Comprehension contextuelle |

### 9.2 Cout Estimatif

| Agent | Executions/Feature | Tokens/Execution | Modele | Cout/Feature |
|-------|-------------------|------------------|--------|--------------|
| ba-validate-frd | 1-3 | ~2K | haiku | $0.001-0.003 |
| ba-validate-handoff | 1-3 | ~2K | haiku | $0.001-0.003 |
| ba-generate-tests | 1 | ~10K | sonnet | $0.03-0.05 |

**Total par feature:** ~$0.035 (negligeable)

---

## 10. Questions pour Validation

### 10.1 Architecture

- [ ] Approuver l'ajout des phases 4bis, 6bis, 7bis?
- [ ] Approuver les agents proposes (haiku/sonnet)?

### 10.2 Implementation

- [ ] Validation automatique obligatoire ou optionnelle?
- [ ] Generation de tests obligatoire ou optionnelle?

### 10.3 Priorites

- [ ] Commencer par Phase 1 (Fondations) maintenant?
- [ ] Reporter Phase 3 (Generation tests) a plus tard?

---

## 11. Risques et Mitigations

| Risque | Impact | Probabilite | Mitigation |
|--------|--------|-------------|------------|
| Faux positifs des regex | Friction utilisateur | Moyenne | Whitelist business terms |
| Validation trop stricte | Blocage du flow | Faible | Mode warning vs error |
| Cout API eleve | Budget | Tres faible | haiku pour validations |
| Complexite accrue | Adoption | Moyenne | Documentation claire |

---

## 12. Resume Executif

### Proposition

Integrer des **validations automatiques** dans le workflow BA via des **agents specialises**:

1. **ba-validate-frd** (haiku) - Valide le FRD apres phase 4
2. **ba-validate-handoff** (haiku) - Valide le Handoff apres phase 6
3. **ba-generate-tests** (sonnet) - Genere les tests apres phase 7

### Benefices

- **Qualite garantie** - Plus de code dans les specs
- **Non-regression** - Tests generes automatiquement
- **Cout optimise** - haiku pour les validations simples
- **Integration fluide** - Ajout au flow existant

### Prochaine Etape

Validation du plan par l'utilisateur, puis implementation en 4 phases.

---

*Plan genere le 2026-01-03*
*Mode ULTRATHINK active*
