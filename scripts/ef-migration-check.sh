#!/bin/bash
# EF Core Migration Safety Check - Bash
# Detecte les operations destructives dans les migrations

set -e

FORCE=0
PATH_DIR="."

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --force|-f)
      FORCE=1
      shift
      ;;
    --path|-p)
      PATH_DIR="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

echo ""
echo "🔍 EF Core Migration Safety Check"
echo "─────────────────────────────────────"

# Trouver les migrations modifiees
MIGRATIONS=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null | grep -E "Migrations/.*\.cs$" | grep -v "Designer\.cs$" | grep -v "Snapshot\.cs$" || true)

if [ -z "$MIGRATIONS" ]; then
  echo "✓ Aucune migration detectee"
  exit 0
fi

echo "Migrations trouvees:"
echo "$MIGRATIONS" | while read -r file; do echo "  - $file"; done
echo ""

DANGEROUS_FOUND=0
DANGEROUS_DETAILS=""

# Patterns EF Core dangereux
EF_PATTERNS="DropTable|DropColumn|DropIndex|DropForeignKey|DropPrimaryKey|DropSchema|DeleteData"

for file in $MIGRATIONS; do
  echo "Analyse: $file"

  if [ ! -f "$file" ]; then
    echo "  ⚠ Fichier non trouve"
    continue
  fi

  # Check patterns EF Core
  DROPS=$(grep -n -E "$EF_PATTERNS" "$file" 2>/dev/null || true)

  # Check SQL brut dangereux
  SQL_DANGEROUS=$(grep -n "migrationBuilder.Sql" "$file" 2>/dev/null | grep -i -E "DELETE|DROP|TRUNCATE" || true)

  if [ -n "$DROPS" ] || [ -n "$SQL_DANGEROUS" ]; then
    DANGEROUS_FOUND=1

    echo ""
    echo "  ⚠️  OPERATIONS DESTRUCTIVES:"

    if [ -n "$DROPS" ]; then
      echo "$DROPS" | while read -r line; do
        LINENUM=$(echo "$line" | cut -d: -f1)
        CONTENT=$(echo "$line" | cut -d: -f2-)
        echo "  L$LINENUM: $CONTENT"
      done
    fi

    if [ -n "$SQL_DANGEROUS" ]; then
      echo "$SQL_DANGEROUS" | while read -r line; do
        LINENUM=$(echo "$line" | cut -d: -f1)
        CONTENT=$(echo "$line" | cut -d: -f2-)
        echo "  L$LINENUM: [SQL] $CONTENT"
      done
    fi

    DANGEROUS_DETAILS="$DANGEROUS_DETAILS\n$file"
  else
    echo "  ✓ OK"
  fi
done

echo ""

if [ $DANGEROUS_FOUND -eq 1 ]; then
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║  ⛔ OPERATIONS DESTRUCTIVES DETECTEES                     ║"
  echo "╠══════════════════════════════════════════════════════════╣"
  echo "║                                                          ║"
  echo "║  RISQUES :                                               ║"
  echo "║  - Perte de donnees irreversible                         ║"
  echo "║  - Corruption integrite referentielle                    ║"
  echo "║                                                          ║"
  echo "║  AVANT DE CONTINUER :                                    ║"
  echo "║  1. Verifiez que vous avez un BACKUP                     ║"
  echo "║  2. Confirmez que c'est intentionnel                     ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""

  if [ $FORCE -eq 1 ]; then
    echo "⚠️  Mode FORCE active - Bypass du check"
    exit 0
  fi

  # Demander confirmation
  read -p "Confirmez-vous ces operations destructives? (oui/non): " response

  if [ "$response" = "oui" ]; then
    echo "✓ Confirme par l'utilisateur"

    # Logger la confirmation
    LOG_DIR=".claude/gitflow/logs"
    mkdir -p "$LOG_DIR"

    LOG_FILE="$LOG_DIR/dangerous-migrations.log"
    echo "[$(date -Iseconds)] CONFIRMED: $DANGEROUS_DETAILS" >> "$LOG_FILE"

    exit 0
  else
    echo "❌ Commit annule"
    exit 1
  fi
fi

echo "✓ Migrations OK - Aucune operation destructive"
exit 0
