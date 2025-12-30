# Commande: /ef-migration-squash

<role>
You are a senior .NET DevOps engineer with 10+ years experience in Entity Framework Core migrations and Git workflows. You specialize in implementing the "1 migration per feature" best practice for clean Pull Requests and production-ready deployments. You enforce modern EF Core 2025 patterns while ensuring zero data loss and seamless team collaboration.
</role>

<parameters>
**Usage:** `/ef-migration-squash [--base-branch <nom>]`

**Options:**
- `--base-branch <nom>` : Branche de référence pour comparaison (défaut: develop, sinon main)

**Description:**
Automatise le workflow complet pour garantir **1 seule migration par feature** avant de merger dans develop/main. Compare intelligemment les migrations entre la branche de référence et la branche courante.

**Ce que fait cette commande:**
1. Compare les migrations avec la branche de référence
2. Détecte le cas : CAS 1 (divergence) ou CAS 2 (feature après base)
3. CAS 1 : Reset complet vers les migrations de la branche de référence
4. CAS 2 : Squash des migrations feature en une seule
5. Teste sur DB fraîche (drop + rebuild)
6. Valide le résultat

**Exemples:**
```bash
# Usage standard (détection auto de develop/main)
/ef-migration-squash

# Spécifier la branche de référence
/ef-migration-squash --base-branch main
/ef-migration-squash --base-branch develop

# Résultat CAS 2 (squash) :
# ✅ 3 migrations feature squashées en 1
# ✅ Migrations de base préservées
# ✅ DB testée avec succès

# Résultat CAS 1 (reset) :
# ✅ Migrations locales remplacées par celles de develop
# ✅ DB synchronisée
```
</parameters>

<instructions>
This command implements the modern "1 migration per feature" best practice. It automatically detects all migrations created in your feature branch, removes them, and creates a single clean migration containing all your schema changes.

**Auto-Detection:**
- Détecte automatiquement le DbContext
- Identifie la branche de base (develop/main)
- Trouve toutes les migrations de la feature via Git
- Calcule le merge-base pour comparaison

**Workflow automatisé:**
1. Vérification environnement (Git, EF Tools, DbContext)
2. Rebase automatique sur branche de base
3. Détection migrations de la feature
4. Confirmation utilisateur
5. Suppression migrations
6. Création migration unique
7. Test sur DB fraîche
8. Validation finale

**Best Practice 2025:**
- ✅ **1 migration par feature** (standard industrie)
- ✅ **Test sur DB propre** (garantit déploiement clean)
- ✅ **Nommage par branche** (traçabilité)
- ✅ **Sync automatique** (évite conflits)
</instructions>

<context>
**Problème résolu:**

**Avant (mauvaise pratique):**
```
feature/user-profile :
  ├── 20241115_AddEmail.cs
  ├── 20241116_AddPhone.cs
  └── 20241117_AddAvatar.cs

PR → develop : 3 migrations
❌ Historique pollué
❌ Difficile à review
❌ Risque de conflits
```

**Après (bonne pratique):**
```
feature/user-profile :
  └── UserProfile_Complete.cs

PR → develop : 1 migration
✅ Historique propre
✅ Facile à review
✅ Zéro conflit
```

**Quand utiliser cette commande:**
- ✅ AVANT de créer une Pull Request
- ✅ Après avoir fini le développement de la feature
- ✅ Quand tu as créé plusieurs migrations pendant le dev
- ✅ Pour suivre les best practices 2025

**Quand NE PAS utiliser:**
- ❌ En début de feature (pas encore de migrations multiples)
- ❌ Si tu as déjà 1 seule migration (déjà clean)
- ❌ Sur main/master (seulement sur feature branches)
</context>

<workflow>

## Phase 0: Vérifications préliminaires

**Step 0.1: Validate Environment**

```bash
# Check Git
git status

# Check EF Tools
dotnet ef --version

# Check current branch
git branch --show-current
```

**Validations:**
- [ ] Dans un repo Git
- [ ] EF Tools installés
- [ ] Sur une feature branch (PAS main/master/develop)

**Si sur main/master/develop:**
```
❌ ERROR: Cannot squash on main/master/develop
This command is for feature branches only.

Current branch: {branchName}
Please checkout a feature branch first.
```

**Si pas dans Git repo:**
```
❌ ERROR: Not a Git repository
This command requires Git to detect feature migrations.
```

**Step 0.2: Detect DbContext**

```bash
dotnet ef dbcontext list 2>/dev/null
```

- Si plusieurs → Demander à l'utilisateur
- Si un seul → Auto-sélectionner
- Si aucun → Demander le nom

Stocker dans `$dbContext`.

**Step 0.3: Detect or Parse Base Branch**

```bash
# Si --base-branch est fourni, utiliser cette valeur
if ($args contains "--base-branch") {
    $baseBranch = $args["--base-branch"]
    git rev-parse --verify origin/$baseBranch 2>/dev/null
    if ($? -ne 0) {
        ERROR: "Branch 'origin/$baseBranch' not found"
    }
}
# Sinon, détection automatique
else {
    # Chercher develop
    git rev-parse --verify origin/develop 2>/dev/null
    if ($? -eq 0) {
        $baseBranch = "develop"
    }
    # Sinon chercher main
    else {
        git rev-parse --verify origin/main 2>/dev/null
        if ($? -eq 0) {
            $baseBranch = "main"
        }
    }
}
```

Stocker dans `$baseBranch`.

**Si branche de référence non trouvée:**
```
❌ ERROR: Base branch not found

Specified branch 'origin/{baseBranch}' does not exist.

Available remote branches:
{git branch -r}

Please use --base-branch with a valid branch name.
```

**Step 0.4: Display Configuration**

```markdown
╔══════════════════════════════════════════════════════════╗
║  EF MIGRATION SQUASH - 1 Migration Per Feature          ║
╚══════════════════════════════════════════════════════════╝

**Current Branch:** {currentBranch}
**Base Branch:** {baseBranch}
**DbContext:** {dbContext}

🎯 Goal: Combine all feature migrations into 1 clean migration
```

---

## Phase 1: Sync avec Base Branch

**Step 1.1: Check Uncommitted Changes**

```bash
git status --porcelain
```

**Si changements non committés:**
```
⚠️  UNCOMMITTED CHANGES DETECTED

You have uncommitted changes. Please commit or stash them first.

Options:
1. Commit now: git add . && git commit -m "wip"
2. Stash: git stash
3. Abort

This ensures clean rebase.
```

**Bloquer si changements non committés** → Demander de commit/stash d'abord.

**Step 1.2: Fetch Latest**

```bash
git fetch origin $baseBranch
```

Output:
```
✓ Fetching latest from origin/{baseBranch}...
```

**Step 1.3: Rebase on Base Branch**

```bash
git rebase origin/$baseBranch
```

**Si succès:**
```
✓ Successfully rebased on origin/{baseBranch}
✓ Your branch is now up-to-date
```

**Si conflits:**
```
❌ REBASE CONFLICTS DETECTED

Conflicting files:
{list files}

MANUAL RESOLUTION REQUIRED:
1. Resolve conflicts in the files above
2. git add <resolved-files>
3. git rebase --continue
4. Re-run: /ef-migration-squash

To abort: git rebase --abort
```

**STOP** si conflits → L'utilisateur doit résoudre manuellement.

---

## Phase 2: Comparaison Intelligente des Migrations

**OBJECTIF:** Comparer les migrations entre la branche de référence et la branche courante pour déterminer l'action appropriée.

**Step 2.1: Lister les migrations de la branche de référence**

```bash
# Récupérer la liste des fichiers de migration de la branche de référence
git ls-tree -r origin/$baseBranch --name-only -- "**/Migrations/*.cs" | grep -v "ModelSnapshot"
```

Pour chaque fichier trouvé:
- Extraire le nom de la migration (format: `YYYYMMDDHHMMSS_MigrationName`)
- Stocker dans `$baseMigrations[]`

**Step 2.2: Lister les migrations de la branche courante**

```bash
# Toutes les migrations actuelles dans la branche courante
dotnet ef migrations list --context $dbContext --no-build
```

Stocker dans `$currentMigrations[]`.

**Step 2.3: Comparer les deux listes EN RESPECTANT L'ORDRE**

**CRITIQUE:** L'ordre séquentiel est essentiel ! Les migrations de la branche de référence doivent être au DÉBUT de la branche courante, dans le MÊME ordre.

Algorithme de comparaison séquentielle:

```pseudo
$orderMatches = true
$lastMatchIndex = -1

# Vérifier que TOUTES les migrations de base sont présentes AU DÉBUT et DANS L'ORDRE
for i = 0 to count($baseMigrations) - 1:
    $baseMig = $baseMigrations[i]

    # La migration doit être à la position i dans current
    if i < count($currentMigrations) AND $currentMigrations[i] == $baseMig:
        $lastMatchIndex = i
    else:
        # L'ordre ne correspond pas = divergence
        $orderMatches = false
        break

# Calculer les résultats
if $orderMatches:
    # Toutes les migrations de base sont présentes dans l'ordre
    $commonMigrations = $baseMigrations  # Toutes les migrations de base
    $featureMigrations = $currentMigrations[($lastMatchIndex + 1)..]  # Après la dernière commune
else:
    # L'ordre ne correspond pas = CAS 1
    $commonMigrations = []
    $featureMigrations = []
```

**Exemples:**

```
Origine (base):     Branche courante:      Résultat:
────────────────    ─────────────────      ─────────
A                   1, A, C                CAS 1 (divergence)
                    ↑ Position 0 ≠ A       → Reset complet

A                   A, 1, C                CAS 2 (squash)
                    ↑ Position 0 = A ✓     → Squash 1, C

A, B                A, B, X, Y             CAS 2 (squash)
                    ↑ 0=A ✓, 1=B ✓         → Squash X, Y

A, B                A, X, B                CAS 1 (divergence)
                    ↑ 0=A ✓, 1≠B           → Reset complet
```

Stocker:
- `$orderMatches` : true si les migrations de base sont au début dans le bon ordre
- `$commonMigrations[]` : Migrations de base présentes dans l'ordre (vide si divergence)
- `$featureMigrations[]` : Migrations après la dernière commune
- `$lastMatchIndex` : Index de la dernière migration commune

**Step 2.4: Déterminer le cas**

```pseudo
if NOT $orderMatches:
    # Les migrations de base ne sont pas au début dans l'ordre
    $detectedCase = "CASE_1"
else if count($featureMigrations) == 0:
    # Aucune migration feature, déjà synchronisé
    $detectedCase = "CASE_CLEAN"
else if count($featureMigrations) == 1:
    # Une seule migration feature, déjà best practice
    $detectedCase = "CASE_CLEAN"
else:
    # Migrations communes dans l'ordre + plusieurs migrations feature
    $detectedCase = "CASE_2"
```

Stocker dans `$detectedCase`:
- `CASE_1` : Migrations pas dans l'ordre → Reset complet (pull depuis origine + recréer migration feature)
- `CASE_2` : Migrations de base dans l'ordre + 2+ migrations feature → Squash standard
- `CASE_CLEAN` : Aucune action nécessaire (0 ou 1 migration feature)

**Step 2.5: Afficher l'analyse comparative avec vérification d'ordre**

```markdown
🔍 ANALYSE COMPARATIVE DES MIGRATIONS (VÉRIFICATION D'ORDRE)

╔══════════════════════════════════════════════════════════╗
║  Branche de référence: {baseBranch}                       ║
║  Branche courante: {currentBranch}                        ║
╚══════════════════════════════════════════════════════════╝

Position   {baseBranch}         {currentBranch}           Status
────────   ─────────────        ─────────────────         ──────
```

**Si ordre correct (CAS 2):**
```
Position   develop              feature                   Status
────────   ───────              ───────                   ──────
0          A                    A                         ✓ Ordre OK
1          B                    B                         ✓ Ordre OK
2          -                    X                         ← feature
3          -                    Y                         ← feature

✓ Toutes les migrations de base sont présentes dans l'ordre
```

**Si ordre incorrect (CAS 1):**
```
Position   develop              feature                   Status
────────   ───────              ───────                   ──────
0          A                    1                         ❌ Attendu: A
1          -                    A
2          -                    C

❌ Position 0: attendu "A", trouvé "1"
```

**Légende:**
- `✓ Ordre OK` : Migration à la bonne position
- `← feature` : Migration feature (après les communes)
- `❌ Attendu: X` : Migration de base pas à la bonne position = divergence

**Step 2.6: Afficher le cas détecté et le plan d'action**

**Si CASE_1 (ordre incorrect / divergence):**
```markdown
⚠️  CAS 1 DÉTECTÉ: Ordre des migrations incorrect

Les migrations de {baseBranch} ne sont pas au début de votre branche dans le bon ordre.

**Attendu (migrations de {baseBranch} au début):**
Position 0: {baseMig1}
Position 1: {baseMig2}
...

**Trouvé (vos migrations actuelles):**
Position 0: {currMig1} {❌ si différent}
Position 1: {currMig2}
...

**Erreur à la position {i}:** Attendu "{baseMig}", trouvé "{currMig}"

📋 ACTION REQUISE: Reset complet
- Toutes vos migrations seront supprimées
- Les migrations de {baseBranch} seront restaurées (pull)
- Vous pourrez ensuite créer votre migration feature

→ Continuer vers Phase 2.5 (Reset)
```

**Si CASE_2 (squash standard):**
```markdown
✓ CAS 2 DÉTECTÉ: Squash des migrations feature

**Dernière migration commune:** {lastCommonMigration}

**Migrations communes préservées:** {count($commonMigrations)}
**Migrations feature à squasher:** {count($featureMigrations)}

Migrations feature:
1. {featureMig1}
2. {featureMig2}
...

📋 ACTION: Squash {count} migrations → 1

→ Continuer vers Phase 3 (Confirmation)
```

**Si CASE_BEHIND (branche en retard):**
```markdown
⚠️  BRANCHE EN RETARD

Votre branche est en retard par rapport à {baseBranch}.

**Migrations manquantes:**
{list $missingFromCurrent}

**Action requise:** Synchroniser d'abord votre branche

git fetch origin {baseBranch}
git rebase origin/{baseBranch}

Puis relancer: /ef-migration-squash
```

**STOP** si CASE_BEHIND.

**Si CASE_CLEAN:**
```markdown
✓ AUCUNE ACTION REQUISE

Votre branche est déjà synchronisée avec {baseBranch}.

État actuel:
  Migrations communes: {count($commonMigrations)} ✓
  Migration feature: {0 ou 1} ✓

Rien à faire. Exiting.
```

**STOP** si CASE_CLEAN.

Continuer selon le cas:
- CASE_1 → Phase 2.5
- CASE_2 → Phase 3

---

## Phase 2.5: Reset des Migrations (CAS 1 uniquement)

**Cette phase s'exécute UNIQUEMENT si `$detectedCase == "CASE_1"`**

**Step 2.5.1: Confirmation spéciale pour CAS 1**

```markdown
╔══════════════════════════════════════════════════════════╗
║  ⚠️  ATTENTION: RESET COMPLET DES MIGRATIONS              ║
╚══════════════════════════════════════════════════════════╝

Cette action va:
1. SUPPRIMER toutes vos migrations actuelles
2. RESTAURER les migrations de {baseBranch}
3. RESET votre base de données

**Migrations à supprimer ({count}):**
{list $currentMigrations}

**Migrations à restaurer ({count}):**
{list $baseMigrations}

⚠️  Cette action est IRRÉVERSIBLE (un backup sera créé).

Êtes-vous sûr de vouloir continuer?
Tapez 'yes' pour confirmer:
```

**Si l'utilisateur ne tape pas exactement 'yes':**
```
Reset annulé. Aucune modification effectuée.
```
**STOP**

**Step 2.5.2: Créer un backup complet**

```bash
# Créer dossier de backup avec timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".ef-migrations-backup/$timestamp-CASE1-RESET"
mkdir -p $backupDir

# Copier TOUS les fichiers de migration actuels
cp Migrations/*.cs $backupDir/

# Créer fichier de métadonnées
cat > $backupDir/backup-info.txt << EOF
Backup Type: CASE 1 - Full Reset
Backup Date: $(date)
Branch: $currentBranch
Base Branch: $baseBranch
Reason: Migrations divergentes - Reset vers base branch

Current Migrations (DELETED):
$(echo $currentMigrations | tr ' ' '\n')

Base Migrations (RESTORED):
$(echo $baseMigrations | tr ' ' '\n')
EOF
```

**Display:**
```markdown
📦 BACKUP CRÉÉ

**Emplacement:** .ef-migrations-backup/{timestamp}-CASE1-RESET/
**Type:** Reset complet (CAS 1)

En cas de problème, restaurer avec:
  rm -rf Migrations/
  cp -r .ef-migrations-backup/{timestamp}-CASE1-RESET/* Migrations/
```

**Step 2.5.3: Supprimer toutes les migrations courantes**

```bash
# Supprimer tous les fichiers .cs dans Migrations/ (sauf Designer)
rm Migrations/*_*.cs
rm Migrations/*ModelSnapshot.cs
```

**Display:**
```
✓ Supprimé: {migration1}
✓ Supprimé: {migration2}
...
✓ {count} fichiers de migration supprimés
```

**Step 2.5.4: Copier les migrations de la branche de référence**

```bash
# Récupérer les fichiers de migration de la branche de référence
git checkout origin/$baseBranch -- "**/Migrations/*.cs"

# Vérifier que les fichiers ont été copiés
ls Migrations/*.cs
```

**Display:**
```
✓ Restauré: {baseMigration1}
✓ Restauré: {baseMigration2}
...
✓ {count} migrations restaurées depuis {baseBranch}
✓ ModelSnapshot restauré
```

**Step 2.5.5: Synchroniser la base de données**

```markdown
🔄 SYNCHRONISATION DE LA BASE DE DONNÉES

Les migrations ont été restaurées.
La base de données doit être synchronisée.

Options:
1. Drop + Rebuild (recommandé pour dev local)
2. Update seulement (si données importantes)

Choisir (1/2):
```

**Si option 1 (Drop + Rebuild):**
```bash
dotnet ef database drop --force --context $dbContext
dotnet ef database update --context $dbContext
```

**Si option 2 (Update):**
```bash
dotnet ef database update --context $dbContext
```

**Display:**
```
✓ Base de données synchronisée
✓ Toutes les migrations de {baseBranch} appliquées
```

**Step 2.5.6: Afficher résumé CAS 1**

```markdown
╔══════════════════════════════════════════════════════════╗
║  ✅ RESET TERMINÉ (CAS 1)                                 ║
╚══════════════════════════════════════════════════════════╝

**Résumé:**
  Migrations supprimées: {count($currentMigrations)}
  Migrations restaurées: {count($baseMigrations)}
  Base de données: Synchronisée ✓

**État actuel:**
  Votre branche est maintenant alignée avec {baseBranch}.

**Prochaines étapes:**

1️⃣  Créer votre migration feature:
   dotnet ef migrations add {FeatureName} --context $dbContext

2️⃣  Ou relancer /ef-migration-squash après avoir fait vos changements

**Backup disponible:**
  .ef-migrations-backup/{timestamp}-CASE1-RESET/
```

**STOP après CAS 1** - L'utilisateur doit créer sa nouvelle migration manuellement.

---

## Phase 3: Confirmation Utilisateur (CAS 2 uniquement)

**Cette phase s'exécute UNIQUEMENT si `$detectedCase == "CASE_2"`**

**Step 3.1: Display Plan**

```markdown
╔══════════════════════════════════════════════════════════╗
║  📋 PLAN DE SQUASH (CAS 2)                               ║
╚══════════════════════════════════════════════════════════╝

**Cas détecté:** CAS 2 - Squash des migrations feature
**Dernière migration commune:** {$lastCommonMigration}

**Action:** Combiner {count($featureMigrations)} migrations → 1

**Étapes:**
1. Supprimer {count($featureMigrations)} migrations feature
2. Créer 1 nouvelle migration avec tous les changements
3. Tester sur base de données fraîche (drop + rebuild)
4. Valider le résultat

**Migrations communes préservées ({count($commonMigrations)}):**
{list $commonMigrations with ✓}

**Migrations feature à squasher ({count($featureMigrations)}):**
{list $featureMigrations}

**Résultat attendu:** 1 migration propre prête pour PR
```

**Step 3.2: Ask for Confirmation**

```
Proceed with squash? (y/n):
```

Si **n** → STOP et afficher:
```
Squash cancelled. No changes made.
```

Si **y** → Continuer vers Phase 4.

---

## Phase 4: Suppression des Migrations de la Feature (CAS 2 uniquement)

**Cette phase s'exécute UNIQUEMENT si `$detectedCase == "CASE_2"`**

**CRITIQUE:** On supprime SEULEMENT les migrations feature (après la dernière commune), PAS les migrations communes !

**Step 4.1: Calculate Removal Count**

```bash
# Nombre de migrations feature à supprimer (celles après $lastCommonMigration)
$featureCount = count($featureMigrations)
```

**Step 4.2: Create Backup (IMPORTANT!)**

**Avant de supprimer quoi que ce soit, créer un backup automatique:**

```bash
# Créer dossier de backup avec timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".ef-migrations-backup/$timestamp"
mkdir -p $backupDir

# Copier TOUTES les migrations actuelles
cp Migrations/*.cs $backupDir/
cp Migrations/*ModelSnapshot.cs $backupDir/

# Créer fichier de métadonnées
cat > $backupDir/backup-info.txt << EOF
Backup Date: $(date)
Branch: $currentBranch
Base Branch: $baseBranch
Merge Base: $mergeBase
Feature Migrations Count: $featureCount
Base Migrations Count: $baseCount

Feature Migrations (will be removed):
$(echo $featureMigrationNames | tr ' ' '\n')

Base Migrations (preserved):
$(echo $baseMigrations | tr ' ' '\n')
EOF
```

**Display:**
```
📦 BACKUP CREATED

**Backup Location:** .ef-migrations-backup/{timestamp}/
**Files Backed Up:** {totalMigrationFiles}

In case of issues, restore with:
  cp .ef-migrations-backup/{timestamp}/* Migrations/

Backup expires: Never (manual cleanup required)
```

**Step 4.3: Remove Feature Migrations ONLY**

```bash
# Supprimer EXACTEMENT $featureCount migrations (du plus récent au plus ancien)
for i in 1..$featureCount {
    dotnet ef migrations remove --context $dbContext --force
}
```

**IMPORTANT:** On supprime EXACTEMENT `$featureCount` fois, pas plus !

Output après chaque suppression:
```
✓ Removed: {migrationName}
```

**Step 4.3: Verify Clean State**

```bash
dotnet ef migrations list --context $dbContext
```

**Vérifications:**
- [ ] Les migrations de develop sont TOUJOURS là ✓
- [ ] Seules les migrations de la feature ont été supprimées
- [ ] Nombre de migrations = nombre dans develop

Display:
```
✓ All feature migrations removed
✓ {featureCount} feature migrations removed successfully
✓ Base migrations preserved: {baseCount} ✓

**Current migrations (from base branch):**
1. {baseMigration1} ✓
2. {baseMigration2} ✓
...

**Database state:** Reset to base branch ✓
```

---

## Phase 5: Création de la Migration Unique

**Step 5.1: Ask for Migration Name**

```
Enter name for the final migration (2-5 words):
Example: "Complete user profile feature"

Migration name:
```

Lire l'input utilisateur → `$userInput`

**Step 5.2: Construct Migration Name**

Extraire le nom court de la branche:
```bash
# feature/user-profile → UserProfile
# bugfix/fix-orders → FixOrders
$branchShort = $currentBranch -replace '^(feature|bugfix|hotfix)/', '' |
               ConvertTo-PascalCase
```

Construire le nom final:
```
Format: {BranchShort}_{UserInput}

Example:
  Branch: feature/user-profile
  Input: "Complete"
  Result: UserProfile_Complete
```

Stocker dans `$finalMigrationName`.

**Step 5.3: Create Migration**

```bash
dotnet ef migrations add $finalMigrationName --context $dbContext
```

Output:
```
✓ Creating migration: {finalMigrationName}
✓ Migration created successfully
✓ ModelSnapshot regenerated
```

**Step 5.4: Verify Generated Code**

Lire le fichier de migration créé et vérifier:
- [ ] Utilise `RenameColumn` (pas Drop+Add)
- [ ] Colonnes NOT NULL ont `defaultValue`
- [ ] Pas de SQL injection risks
- [ ] Foreign keys corrects

Display:
```markdown
📝 MIGRATION CODE REVIEW

**File:** Migrations/{timestamp}_{finalMigrationName}.cs

**Changes Detected:**
- {summary of Up() method}

**Validations:**
✓ No data loss risks
✓ All NOT NULL columns have defaults
✓ No raw SQL detected
✓ Foreign keys validated
```

---

## Phase 6: Test sur DB Fraîche

**Step 6.1: Confirm Fresh DB Test**

```
🧪 TEST ON FRESH DATABASE

To ensure clean deployment, we'll:
1. Drop current database
2. Recreate from scratch
3. Apply ALL migrations in order

⚠️  Warning: This will delete local data!

Proceed with fresh DB test? (y/n):
```

Si **n** → Skip au Phase 7 (juste update).

Si **y** → Continuer.

**Step 6.2: Drop Database**

```bash
dotnet ef database drop --force --context $dbContext
```

Output:
```
⚠️  Dropping database...
✓ Database dropped
```

**Step 6.3: Apply All Migrations**

```bash
dotnet ef database update --context $dbContext --verbose
```

Output:
```
✓ Creating database...
✓ Applying migrations...
  → {migration1}
  → {migration2}
  → {finalMigrationName} ✓ NEW
✓ All migrations applied successfully
```

**Si erreur:**
```
❌ MIGRATION FAILED TO APPLY

Error: {error message}

Common issues:
- NOT NULL column without defaultValue
- Foreign key references missing table
- Data type mismatch

Fix the migration and try again:
1. dotnet ef migrations remove
2. Fix the issue
3. /ef-migration-squash (re-run)
```

**STOP** si erreur.

**Step 6.4: Build Project**

```bash
dotnet build --no-restore
```

Output:
```
✓ Building project...
✓ Build succeeded
```

---

## Phase 7: Validation Finale

**Step 7.1: List Final Migrations**

```bash
dotnet ef migrations list --context $dbContext
```

Display:
```markdown
📋 FINAL MIGRATION LIST

**Base Branch Migrations (PRESERVED):**
1. {baseMigration1} ✓
2. {baseMigration2} ✓
...
{baseCount} migrations from develop ✓

**Your Feature Migration (NEW):**
{baseCount + 1}. {finalMigrationName} ✓ NEW

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Summary:**
  Base migrations: {baseCount} ✓ (unchanged)
  Feature migrations: 1 ✓ (squashed from {featureCount})
  Total: {baseCount + 1}

✅ Base migrations preserved
✅ Feature squashed to 1 migration
✅ Ready for PR
```

**Step 7.2: Display Git Status**

```bash
git status
```

Expected changes:
- Deleted: {count} old migration files
- Modified: ModelSnapshot.cs
- Added: {finalMigrationName}.cs

Display:
```
📂 GIT CHANGES

**Deleted ({count} files):**
- Migrations/{oldMigration1}.cs
- Migrations/{oldMigration2}.cs
...

**Modified:**
- Migrations/{DbContext}ModelSnapshot.cs

**Added:**
- Migrations/{timestamp}_{finalMigrationName}.cs

**Status:** Ready to commit
```

---

## Phase 8: Summary & Next Steps

**Step 8.1: Display Success Summary**

```markdown
╔══════════════════════════════════════════════════════════╗
║  ✅ SQUASH COMPLETED SUCCESSFULLY                        ║
╚══════════════════════════════════════════════════════════╝

## Summary

**Feature Branch:** {currentBranch}
**Base Branch:** {baseBranch}
**DbContext:** {dbContext}

## Changes

**Before:** {count} migrations
**After:** 1 migration ✓

**Migration Name:** {finalMigrationName}

## Validation

✓ All feature migrations removed
✓ 1 clean migration created
✓ Tested on fresh database
✓ Project builds successfully
✓ ModelSnapshot synchronized

## Git Status

Modified files: {modifiedCount}
Ready to commit: YES ✓

## Next Steps

1️⃣  Review the migration code:
   • Check Migrations/{finalMigrationName}.cs
   • Verify no data loss

2️⃣  Commit the changes:
   git add .
   git commit -m "feat: squash migrations to 1 clean migration

   - Combined {count} migrations into {finalMigrationName}
   - Tested on fresh database
   - Ready for PR

   Migrations squashed:
   {list old migration names}
   "

3️⃣  Push to remote:
   git push origin {currentBranch} --force-with-lease

4️⃣  Create Pull Request:
   • 1 clean migration ✓
   • Easy to review ✓
   • Production-ready ✓

---

💡 **Best Practice Tip:**
From now on, use `/db-migration recreate` during development
to keep 1 migration per feature from the start!
```

**Step 8.2: Optional - Generate SQL Script**

Ask:
```
Generate SQL deployment script for production? (y/n):
```

Si **y**:
```bash
dotnet ef migrations script --context $dbContext --idempotent --output deployment-{timestamp}.sql
```

Output:
```
✓ SQL script generated: deployment-{timestamp}.sql
✓ Script is idempotent (safe to run multiple times)
✓ Ready for production deployment
```

---

</workflow>

<error_handling>

## Error Scenarios

**Error 1: Not on Feature Branch**
```markdown
❌ ERROR: Not on a feature branch

Current branch: {main/master/develop}

This command is for feature branches only.

Please:
1. Checkout a feature branch: git checkout -b feature/xxx
2. Or switch to existing feature: git checkout feature/xxx
3. Re-run: /ef-migration-squash
```

**Error 2: Uncommitted Changes**
```markdown
❌ ERROR: Uncommitted changes detected

You have uncommitted changes. Please commit or stash first.

Options:
git add . && git commit -m "wip: save work before squash"
# OR
git stash

Then re-run: /ef-migration-squash
```

**Error 3: No Feature Migrations**
```markdown
✓ No feature migrations detected

Your branch has no migrations to squash.

Possible reasons:
- You haven't created any migrations yet
- You already squashed to 1 migration
- All migrations are from base branch

Nothing to do. Exiting.
```

**Error 4: Rebase Conflicts**
```markdown
❌ REBASE CONFLICTS

Conflicting files:
{list files}

MANUAL RESOLUTION REQUIRED:
1. Resolve conflicts in your IDE
2. git add <resolved-files>
3. git rebase --continue
4. Re-run: /ef-migration-squash

To abort: git rebase --abort
```

**Error 5: Migration Apply Failed**
```markdown
❌ MIGRATION FAILED ON FRESH DB

Error: {error message}

This means your combined migration has issues.

Common fixes:
- Add defaultValue to NOT NULL columns
- Fix foreign key references
- Check for data type mismatches

Steps:
1. dotnet ef migrations remove
2. Fix the issue in your entities
3. /ef-migration-squash (re-run)
```

**Error 6: EF Tools Not Found**
```markdown
❌ DOTNET EF TOOLS NOT INSTALLED

Install with:
dotnet tool install --global dotnet-ef

Verify:
dotnet ef --version

Then re-run: /ef-migration-squash
```

**Error 7: Base Branch Not Found**
```markdown
❌ ERROR: Base branch not found

Specified branch 'origin/{baseBranch}' does not exist.

Available remote branches:
{git branch -r}

Please use --base-branch with a valid branch name:
/ef-migration-squash --base-branch main
/ef-migration-squash --base-branch develop
```

**Error 8: Migrations Divergentes (CAS 1)**
```markdown
⚠️  CAS 1 DÉTECTÉ: Migrations divergentes

Vos migrations sont complètement différentes de celles de {baseBranch}.

**Migrations dans {baseBranch}:**
1. {baseMig1}
2. {baseMig2}
...

**Vos migrations actuelles:**
1. {currMig1}
2. {currMig2}
...

**Aucune migration commune trouvée.**

Cela peut arriver si:
- Vous avez créé des migrations sans sync avec {baseBranch}
- La branche de base a été rebasée/réécrite
- Les migrations ont été générées sur une autre machine

📋 ACTION REQUISE: Reset complet
Toutes vos migrations seront remplacées par celles de {baseBranch}.

Tapez 'yes' pour confirmer le reset, ou 'n' pour annuler:
```

**Error 9: Branche en Retard**
```markdown
⚠️  BRANCHE EN RETARD

Votre branche est en retard par rapport à {baseBranch}.

**Migrations manquantes dans votre branche:**
{list missing migrations}

**Action requise:** Synchroniser d'abord votre branche

git fetch origin {baseBranch}
git rebase origin/{baseBranch}

Puis relancer: /ef-migration-squash

Note: Si des conflits surviennent pendant le rebase, résolvez-les
puis continuez avec: git rebase --continue
```

</error_handling>

<output_format>

## Progress Indicators

Use clear visual progress:

```markdown
╔══════════════════════════════════════════════════════════╗
║  Phase 1/8: Sync with Base Branch                        ║
╚══════════════════════════════════════════════════════════╝
  ✓ Fetched origin/develop
  ✓ Rebased successfully

╔══════════════════════════════════════════════════════════╗
║  Phase 2/8: Detecting Feature Migrations                 ║
╚══════════════════════════════════════════════════════════╝
  ✓ Found merge base: abc123
  ✓ Detected 3 feature migrations

╔══════════════════════════════════════════════════════════╗
║  Phase 3/8: User Confirmation                            ║
╚══════════════════════════════════════════════════════════╝
  → Waiting for confirmation...

╔══════════════════════════════════════════════════════════╗
║  Phase 4/8: Removing Old Migrations                      ║
╚══════════════════════════════════════════════════════════╝
  ✓ Removed: AddEmail
  ✓ Removed: AddPhone
  ✓ Removed: AddAvatar

╔══════════════════════════════════════════════════════════╗
║  Phase 5/8: Creating New Migration                       ║
╚══════════════════════════════════════════════════════════╝
  ✓ Migration created: UserProfile_Complete

╔══════════════════════════════════════════════════════════╗
║  Phase 6/8: Testing on Fresh Database                    ║
╚══════════════════════════════════════════════════════════╝
  ✓ Database dropped
  ✓ All migrations applied

╔══════════════════════════════════════════════════════════╗
║  Phase 7/8: Validation                                   ║
╚══════════════════════════════════════════════════════════╝
  ✓ 1 migration in feature
  ✓ Project builds

╔══════════════════════════════════════════════════════════╗
║  Phase 8/8: Summary                                      ║
╚══════════════════════════════════════════════════════════╝
  ✅ SQUASH COMPLETED SUCCESSFULLY
```

## Affichage Comparatif des Migrations

Template pour l'affichage côte à côte lors de la Phase 2:

```markdown
🔍 ANALYSE COMPARATIVE DES MIGRATIONS

╔══════════════════════════════════════════════════════════╗
║  Branche de référence: develop                           ║
║  Branche courante: feature/user-profile                  ║
╚══════════════════════════════════════════════════════════╝

┌─────────────────────────────┬─────────────────────────────┐
│ Migrations dans develop     │ Migrations dans feature     │
├─────────────────────────────┼─────────────────────────────┤
│ 1. InitialCreate           │ 1. InitialCreate ✓          │
│ 2. AddProducts             │ 2. AddProducts ✓            │
│ 3. AddOrders               │ 3. AddOrders ✓              │
│                            │ 4. AddEmail ← feature       │
│                            │ 5. AddPhone ← feature       │
└─────────────────────────────┴─────────────────────────────┘

**Légende:**
  ✓        = Migration commune (préservée)
  ← feature = Migration uniquement dans votre branche
  ⚠️ missing = Migration de base absente
```

## Indicateurs de Cas

**CAS 1 - Divergence complète:**
```markdown
⚠️  CAS 1 DÉTECTÉ: Migrations divergentes

╔══════════════════════════════════════════════════════════╗
║  🔴 AUCUNE MIGRATION COMMUNE                             ║
╚══════════════════════════════════════════════════════════╝

Action: Reset complet vers {baseBranch}
```

**CAS 2 - Squash standard:**
```markdown
✓ CAS 2 DÉTECTÉ: Squash des migrations feature

╔══════════════════════════════════════════════════════════╗
║  🟢 MIGRATIONS COMMUNES DÉTECTÉES                        ║
╚══════════════════════════════════════════════════════════╝

Dernière commune: {lastCommonMigration}
Migrations à squasher: {count}
Action: Squash {count} → 1
```

**CASE_BEHIND - Branche en retard:**
```markdown
⚠️  BRANCHE EN RETARD

╔══════════════════════════════════════════════════════════╗
║  🟡 SYNCHRONISATION REQUISE                              ║
╚══════════════════════════════════════════════════════════╝

Migrations manquantes: {count}
Action: Rebase nécessaire avant squash
```

**CASE_CLEAN - Déjà propre:**
```markdown
✓ AUCUNE ACTION REQUISE

╔══════════════════════════════════════════════════════════╗
║  🟢 BRANCHE DÉJÀ SYNCHRONISÉE                            ║
╚══════════════════════════════════════════════════════════╝

Migrations feature: {0 ou 1}
Action: Rien à faire
```

</output_format>

---

## 📝 Best Practices

**RECOMMENDED WORKFLOW:**

```
Development Phase:
├─ Create feature branch
├─ Develop (create multiple migrations is OK)
├─ Test locally
└─ Ready for PR → /ef-migration-squash ✓

Result:
└─ 1 clean migration ready for merge
```

**Alternative: Recreate Pattern (Even Better!)**

```
Development Phase:
├─ Create feature branch
├─ Create initial migration
├─ Models changed? → /db-migration recreate
├─ Models changed? → /db-migration recreate
└─ Ready for PR → Already 1 migration! ✓

No squash needed!
```

---

**Version:** 1.0.0 (User-Level)
**Scope:** Global - Works with any .NET EF Core project
**Created:** 2025-11-19
**Best Practice:** 1 Migration Per Feature (Industry Standard 2025)

