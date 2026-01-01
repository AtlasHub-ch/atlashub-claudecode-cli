---
description: Phase 1 - Initialize GitFlow structure with versioning and EF Core configuration
agent: gitflow-init
model: haiku
---

# Phase 1: INIT - Project Initialization

Tu es expert GitFlow et EF Core. Initialise le projet .NET pour le workflow GitFlow.

**Workflow:** Analyse → Genere plan → Utilisateur valide → Execute avec `--exec`

---

## Mode par defaut : Generer le plan

### 1. Analyse

Analyse le repository et detecte :

**Git:**
- Verifier si c'est un repo Git
- Lister les branches existantes (main/master, develop)
- Recuperer l'URL du remote origin

**Version (.NET - ordre de priorite):**
1. `*.csproj` → balise `<Version>`
2. `Directory.Build.props` → balise `<Version>`
3. `AssemblyInfo.cs` → attribut `[AssemblyVersion]`
4. Fichier `VERSION` → contenu brut
5. Dernier tag git → format `vX.Y.Z`
6. Aucune → proposer `0.1.0` avec fichier `VERSION`

**EF Core:**
- Detecter si EF Core est reference dans les csproj
- Lister les DbContext existants

### 2. Generer le fichier plan

Cree `.claude/gitflow/plans/init_<YYYYMMDD>.md` contenant :

```markdown
# Plan d'initialisation GitFlow

> Lisez ce fichier puis executez: `/gitflow:1-init --exec`

## Repository
| Info | Valeur |
|------|--------|
| Nom | {nom_repo} |
| Remote | {url_ou_local} |

## Version
| Source | Fichier | Version |
|--------|---------|---------|
| {type} | {chemin} | {version} |

## Actions prevues
- [ ] Branches: main ({creer|existe}), develop ({creer|existe})
- [ ] Structure: .claude/gitflow/{config.json, plans/, logs/, migrations/}
- [ ] CLAUDE.md: section Repository
- [ ] EF Core: {actif|inactif} - Contexts: {liste}

## Configuration
- Versioning: SemVer
- Tag prefix: v
- Auto-increment: feature→minor, hotfix→patch, release→manual

## Modifier?
Editez ce fichier avant d'executer.

## Executer
`/gitflow:1-init --exec`
```

### 3. Afficher message

```
Plan genere: .claude/gitflow/plans/init_<DATE>.md

1. Lisez le fichier
2. Modifiez si necessaire
3. Executez: /gitflow:1-init --exec
```

---

## Mode --exec : Executer le plan

### Prerequis
- Plan init existe dans `.claude/gitflow/plans/`

### Actions
1. **Branches**: Creer main et develop si absentes, checkout develop
2. **Structure**: Creer `.claude/gitflow/{plans,logs,migrations}`
3. **Config**: Creer `config.json` avec la configuration du plan
4. **CLAUDE.md**: Ajouter section Repository si branches existaient
5. **VERSION**: Creer fichier si aucune source detectee
6. **Commit** (demander): `chore(gitflow): initialisation v{VERSION}`

### Config.json structure
```json
{
  "version": "1.0.0",
  "repository": { "name", "defaultBranch", "remoteUrl" },
  "versioning": { "strategy", "current", "source", "sourceFile", "tagPrefix", "autoIncrement" },
  "git": { "branches", "mergeStrategy", "protectedBranches" },
  "efcore": { "enabled", "contexts", "generateScript", "scriptOutputPath" },
  "workflow": { "requireConfirmation", "createCheckpoints", "commitConventions" }
}
```

### Archiver plan
Renommer en `init_<DATE>_DONE_<TIMESTAMP>.md`

---

## Modes

| Commande | Action |
|----------|--------|
| `/gitflow:1-init` | Genere plan |
| `/gitflow:1-init --exec` | Execute plan existant |
| `/gitflow:1-init --yes` | Genere + execute sans fichier intermediaire |
