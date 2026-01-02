---
description: Phase 3 - Smart commit with EF Core migration validation
agent: gitflow-commit
model: sonnet
args: [message]
---

# Phase 3: COMMIT - Migration-aware commits

Tu es expert GitFlow et EF Core. Gere les commits avec validation des migrations .NET.

> **INSTRUCTION CLAUDE:** Les blocs `AskUserQuestion({...})` ci-dessous sont des instructions pour utiliser le tool `AskUserQuestion` de maniere **interactive**. Tu DOIS executer le tool avec ces parametres pour obtenir la reponse de l'utilisateur AVANT de continuer. NE PAS afficher ce code - ATTENDRE la reponse.

**Argument:** `$ARGUMENTS` = message commit (optionnel, genere si absent)

---

## Workflow

### 1. Analyser les fichiers

- Fichiers stages
- Fichiers modifies non stages
- Fichiers non suivis
- Detecter les fichiers migration dans chaque categorie

### 2. Valider les migrations

Une migration EF Core valide = **3 fichiers** :
- `{Timestamp}_{Name}.cs` - Migration principale
- `{Timestamp}_{Name}.Designer.cs` - Metadonnees
- `{Context}ModelSnapshot.cs` - Etat du modele

**Verifications:**
- Les 3 fichiers sont presents
- Le build compile (`dotnet build`)
- Pas de conflit ModelSnapshot avec develop

### 3. ⚠️ SAFETY CHECK - Operations destructives

**BLOQUANT** - Scanner les migrations pour operations dangereuses :

```bash
# Patterns a detecter dans les fichiers .cs de migration
grep -n "DropTable\|DropColumn\|DropIndex\|DropForeignKey\|DeleteData" {migration}.cs
grep -n "migrationBuilder.Sql" {migration}.cs | grep -i "DELETE\|DROP\|TRUNCATE"
```

**Si detecte :**

```
╔══════════════════════════════════════════════════════════╗
║  ⛔ OPERATIONS DESTRUCTIVES DETECTEES                     ║
╠══════════════════════════════════════════════════════════╣
║  Fichier: {migration}.cs                                 ║
║  Ligne {X}: DropTable("Users")                           ║
║  Ligne {Y}: DropColumn("Email", "Customers")             ║
╠══════════════════════════════════════════════════════════╣
║  RISQUES:                                                ║
║  - Perte de donnees irreversible                         ║
║  - Verifiez que vous avez un BACKUP                      ║
╚══════════════════════════════════════════════════════════╝
```

**Actions:**
1. Afficher alerte detaillee (fichier, ligne, operation)
2. Demander confirmation explicite : "Confirmez-vous? (oui/non)"
3. Si "non" → Annuler commit
4. Si "oui" → Logger dans `.claude/gitflow/logs/dangerous-migrations.json`
5. Continuer le commit

**Patterns dangereux:**

| Pattern | Risque | Niveau |
|---------|--------|--------|
| `DropTable` | Suppression table entiere | CRITICAL |
| `DropColumn` | Perte donnees colonne | CRITICAL |
| `DeleteData` | Suppression lignes | CRITICAL |
| `DropForeignKey` | Casse integrite | HIGH |
| `DropIndex` | Impact performance | MEDIUM |
| `Sql("DELETE...")` | SQL brut destructif | CRITICAL |
| `Sql("DROP...")` | SQL brut destructif | CRITICAL |
| `Sql("TRUNCATE...")` | Vidage table | CRITICAL |

### 4. Classifier le commit

| Fichiers | Type | Prefix |
|----------|------|--------|
| Migrations seules | migration | `db(migrations):` |
| Migrations + code | mixed | `feat:` ou `fix:` |
| Code sans migration | code | Selon type branche |
| Config/docs | chore | `chore:` |

### 5. Generer message (si absent)

**Migration:**
```
db(migrations): {action} {description}

Migration: {NomMigration}
Tables: {CREATE|ALTER|DROP} {tables}
Context: {DbContext}
```

**Mixed:**
```
feat({scope}): {description}

- {changements}
Migrations: {liste}
```

### 6. Executer commit

- Ajouter fichiers migration manquants si necessaire
- Verifier une derniere fois
- Commit avec message

### 7. Post-commit

- Verifier qu'il ne reste pas de fichiers migration non commites
- Afficher resume

### 8. Push automatique (selon config)

Lire la config : `.claude/gitflow/config.json` → `workflow.push.afterCommit`

**Detection worktree:**
```bash
# Si git-common-dir != .git → c'est un worktree
COMMON_DIR=$(git rev-parse --git-common-dir 2>/dev/null)
if [[ "$COMMON_DIR" != ".git" && "$COMMON_DIR" != "." ]]; then
  IS_WORKTREE=true
fi
```

**Logique de push:**

| Config `afterCommit` | Worktree | Action |
|---------------------|----------|--------|
| `worktree` | Oui | Push automatique |
| `worktree` | Non | Demander à l'utilisateur |
| `always` | - | Push automatique |
| `ask` | - | Demander à l'utilisateur |
| `never` | - | Ne pas push |

**Si demande utilisateur:**
```
AskUserQuestion({
  questions: [{
    question: "Voulez-vous pusher ce commit ?",
    header: "Push",
    options: [
      { label: "Oui, push maintenant", description: "git push origin <branch>" },
      { label: "Non, plus tard", description: "Commit local uniquement" }
    ],
    multiSelect: false
  }]
})
```

**Execution push:**
```bash
git push origin $(git branch --show-current)
```

**Gestion erreurs push:**
- Si remote non configure → Skip avec message
- Si rebase necessaire → Avertir et proposer `/gitflow:4-plan rebase`
- Si branche protegee → Avertir (PR requise)

---

## Erreurs courantes

| Erreur | Solution |
|--------|----------|
| ModelSnapshot manquant | Ajouter le fichier |
| Designer manquant | Ajouter le fichier |
| Build echoue | `dotnet ef migrations remove` + corriger |
| Conflit detecte | Rebase d'abord |
| **Operation destructive** | Confirmer ou modifier la migration |

## Modes

| Commande | Action |
|----------|--------|
| `/gitflow:3-commit {msg}` | Commit avec message |
| `/gitflow:3-commit` | Genere message auto |
| `/gitflow:3-commit --validate` | Valide sans commit |
| `/gitflow:3-commit --dry-run` | Simulation |
