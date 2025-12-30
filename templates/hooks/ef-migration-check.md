---
description: Hook pre-commit - Detecte les operations destructives dans les migrations EF Core
trigger: pre-commit
blocking: true
---

# EF Core Migration Safety Check

Scan les migrations EF Core pour detecter les operations destructives.

## Patterns BLOQUANTS

```
CRITICAL - Operations destructives :
├── DropTable(...)           → Suppression table entiere
├── DropColumn(...)          → Suppression colonne (perte donnees)
├── DeleteData(...)          → Suppression donnees
├── DropForeignKey(...)      → Casse integrite referentielle
├── DropIndex(...)           → Impact performance
├── DropPrimaryKey(...)      → Casse structure table
├── DropSchema(...)          → Suppression schema entier
└── migrationBuilder.Sql(...) contenant :
    ├── DELETE
    ├── DROP
    ├── TRUNCATE
    └── ALTER TABLE ... DROP
```

## Script de detection

```bash
# Trouver les migrations modifiees dans ce commit
MIGRATIONS=$(git diff --cached --name-only --diff-filter=ACMR | grep -E "Migrations/.*\.cs$" | grep -v "Designer\.cs$" | grep -v "Snapshot\.cs$")

if [ -z "$MIGRATIONS" ]; then
  echo "✓ Aucune migration detectee"
  exit 0
fi

echo "🔍 Scan des migrations EF Core..."
echo ""

DANGEROUS_FOUND=0
DANGEROUS_FILES=""

for file in $MIGRATIONS; do
  echo "Analyse: $file"

  # Patterns destructifs EF Core
  DROPS=$(grep -n "DropTable\|DropColumn\|DropIndex\|DropForeignKey\|DropPrimaryKey\|DropSchema\|DeleteData" "$file" 2>/dev/null)

  # SQL brut dangereux
  SQL_DANGEROUS=$(grep -n "migrationBuilder.Sql" "$file" 2>/dev/null | grep -i "DELETE\|DROP\|TRUNCATE")

  if [ -n "$DROPS" ] || [ -n "$SQL_DANGEROUS" ]; then
    DANGEROUS_FOUND=1
    DANGEROUS_FILES="$DANGEROUS_FILES\n$file"

    echo ""
    echo "⚠️  OPERATIONS DESTRUCTIVES DETECTEES dans $file:"
    echo "────────────────────────────────────────────────"

    if [ -n "$DROPS" ]; then
      echo "$DROPS"
    fi

    if [ -n "$SQL_DANGEROUS" ]; then
      echo "$SQL_DANGEROUS"
    fi

    echo "────────────────────────────────────────────────"
    echo ""
  fi
done

if [ $DANGEROUS_FOUND -eq 1 ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║  ⛔ COMMIT BLOQUE - OPERATIONS DESTRUCTIVES DETECTEES    ║"
  echo "╠══════════════════════════════════════════════════════════╣"
  echo "║  Ces operations peuvent causer une PERTE DE DONNEES :    ║"
  echo "║  - DropTable    : Supprime une table entiere             ║"
  echo "║  - DropColumn   : Supprime une colonne et ses donnees    ║"
  echo "║  - DeleteData   : Supprime des lignes                    ║"
  echo "║  - SQL DELETE/DROP/TRUNCATE : Operations SQL directes    ║"
  echo "╠══════════════════════════════════════════════════════════╣"
  echo "║  ACTIONS REQUISES :                                      ║"
  echo "║  1. Verifier que vous avez un BACKUP des donnees         ║"
  echo "║  2. Confirmer que cette suppression est intentionnelle   ║"
  echo "║  3. Utiliser --force pour bypasser ce check              ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  exit 1
fi

echo "✓ Migrations OK - Aucune operation destructive"
exit 0
```

## Integration Claude Code

Dans le workflow `/gitflow:3-commit`, avant le commit :

```
1. Detecter migrations modifiees
2. Scanner patterns dangereux
3. Si trouve :
   → Afficher alerte detaillee
   → Demander confirmation explicite
   → Logger dans .claude/gitflow/logs/
4. Si confirme ou rien trouve :
   → Continuer commit
```

## Bypass (si vraiment necessaire)

```bash
# Option 1 : Flag force
git commit --no-verify -m "message"

# Option 2 : Variable environnement
EF_MIGRATION_FORCE=1 git commit -m "message"
```

## Log des validations

Quand l'utilisateur confirme une operation dangereuse, logger :

```json
{
  "timestamp": "<ISO_DATE>",
  "migration": "<FILENAME>",
  "operations": ["DropTable:Users", "DropColumn:Email"],
  "confirmedBy": "user",
  "commitHash": "<HASH>"
}
```

Fichier : `.claude/gitflow/logs/dangerous-migrations.json`
