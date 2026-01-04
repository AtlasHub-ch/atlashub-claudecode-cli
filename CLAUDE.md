# CLAUDE.md - @atlashub/claude-tools

## Repository

| Information | Valeur |
|-------------|--------|
| **Nom** | @atlashub/claude-tools |
| **Type** | Node.js/TypeScript CLI Tool |
| **Version** | 1.0.0 |
| **Description** | Claude Code automation toolkit - GitFlow, APEX, EF Core migrations, prompts and more |
| **Remote** | https://github.com/SIMON-Atlashub/atlashub-claudecode-cli.git |
| **Branche principale** | main |
| **Branche de développement** | develop |

### Structure du projet

Ce projet est un outil CLI (Command Line Interface) développé en TypeScript qui fournit des commandes et workflows pour automatiser diverses tâches dans Claude Code :

- **GitFlow** : Gestion du workflow GitFlow avec versioning SemVer
- **APEX** : Méthodologie Analyze-Plan-Execute-eXamine pour l'implémentation systématique
- **EF Core Migrations** : Outils pour gérer les migrations Entity Framework Core dans les projets .NET
- **Prompts** : Création et optimisation de prompts pour agents et commandes

### Workflow GitFlow

Ce repository utilise GitFlow avec la configuration suivante :

- **Strategy de versioning** : SemVer (Semantic Versioning)
- **Source de version** : package.json
- **Préfixe des tags** : `v`
- **Auto-increment** :
  - feature → minor (1.0.0 → 1.1.0)
  - hotfix → patch (1.0.0 → 1.0.1)
  - release → manual
- **Merge strategy** : `--no-ff` (preserve history)
- **Branches protégées** : main, develop

### Configuration GitFlow

La configuration complète se trouve dans [.claude/gitflow/config.json](.claude/gitflow/config.json)

### Versioning des Hotfixes

Le versioning des hotfixes est **automatique** lors du finish :

**Workflow complet :**
1. `/gitflow:10-start hotfix fix-xxx` - Crée la branche depuis `main`
2. Modifications et commits normaux
3. `/gitflow:7-pull-request` - Crée la PR vers `main`
4. Merge de la PR (GitHub/GitLab)
5. `/gitflow:11-finish` - Finalise automatiquement :
   - Lit la version actuelle (`1.7.1`)
   - Incrémente le PATCH (`1.7.2`)
   - Met à jour `package.json`
   - Crée le commit de bump
   - Crée le tag `v1.7.2`
   - Push `main` + tag
   - Merge back vers `develop`
   - Cleanup de la branche

**Point clé :** Pas besoin de faire `npm version patch` manuellement - c'est géré par le finish.

### Note sur EF Core

Bien que ce projet contienne des outils pour gérer EF Core dans d'autres projets .NET, il n'utilise pas lui-même Entity Framework Core car il s'agit d'un projet Node.js/TypeScript.

---

## Working Rules

### Git Operations

**NEVER execute git commands.** The user has their own GitFlow commands:
- `/gitflow:3-commit` - For commits
- `/gitflow:7-pull-request` - For PRs
- `/gitflow:11-finish` - For finishing branches

**Claude's role:**
1. Make changes to files
2. Show summary of changes
3. **STOP** - User will commit with their own commands

### Code Quality

- **Quality over speed** - Use OPUS for all code generation
- **Explore first** - Always discover existing patterns before generating code
- **No assumptions** - If unclear, ask user instead of guessing

---

## Writing Guidelines

### Templates Language

**All templates in the `templates/` folder MUST be written in English.**

This includes:
- `templates/commands/**/*.md` - Command templates
- `templates/agents/**/*.md` - Agent templates
- `templates/hooks/**/*.md` - Hook templates (if any)

**Reasons:**
- Reduces token consumption (~20-30% savings vs French)
- Better compatibility with Claude models (trained primarily on English)
- Consistent codebase language

**Template Structure:**
```yaml
---
description: English description here
agent: agent-name
model: haiku|sonnet|opus
---

# Template Title in English

English content...
```

### Documentation Rules

**All project documentation MUST be in `.documentation/` folder in HTML format.**

```
.documentation/
├── index.html              # Documentation home
├── guides/                 # User guides
│   └── *.html
├── reference/              # API/Command reference
│   └── *.html
└── assets/                 # CSS, images, etc.
    ├── styles.css
    └── images/
```

**FORBIDDEN:**
- ❌ Creating `.md` files for documentation
- ❌ README.md files (except root CLAUDE.md)
- ❌ Documentation outside `.documentation/` folder

**ALLOWED:**
- ✅ HTML files in `.documentation/`
- ✅ CLAUDE.md (project memory file - this file)
- ✅ Template `.md` files in `templates/` (these are prompts, not docs)

**Reasons:**
- HTML provides better formatting and navigation
- Consistent documentation structure
- Easier to publish as static site
- Separates documentation from code/templates

---

*Initialisé le 2025-12-30*
