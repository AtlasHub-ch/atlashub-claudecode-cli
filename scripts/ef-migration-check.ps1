# EF Core Migration Safety Check - PowerShell
# Detecte les operations destructives dans les migrations

param(
    [switch]$Force,
    [string]$Path = "."
)

$ErrorActionPreference = "Stop"

# Patterns dangereux
$DangerousPatterns = @(
    @{ Pattern = "DropTable"; Description = "Suppression table entiere" },
    @{ Pattern = "DropColumn"; Description = "Suppression colonne (perte donnees)" },
    @{ Pattern = "DropIndex"; Description = "Suppression index" },
    @{ Pattern = "DropForeignKey"; Description = "Suppression cle etrangere" },
    @{ Pattern = "DropPrimaryKey"; Description = "Suppression cle primaire" },
    @{ Pattern = "DropSchema"; Description = "Suppression schema" },
    @{ Pattern = "DeleteData"; Description = "Suppression donnees" }
)

$SqlDangerousPatterns = @("DELETE", "DROP", "TRUNCATE")

Write-Host ""
Write-Host "🔍 EF Core Migration Safety Check" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

# Trouver les migrations modifiees
$stagedFiles = git diff --cached --name-only --diff-filter=ACMR 2>$null
$migrations = $stagedFiles | Where-Object {
    $_ -match "Migrations[\\/].*\.cs$" -and
    $_ -notmatch "Designer\.cs$" -and
    $_ -notmatch "Snapshot\.cs$"
}

if (-not $migrations) {
    Write-Host "✓ Aucune migration detectee" -ForegroundColor Green
    exit 0
}

Write-Host "Migrations trouvees: $($migrations.Count)" -ForegroundColor Yellow
Write-Host ""

$dangerousFound = @()

foreach ($file in $migrations) {
    Write-Host "Analyse: $file" -ForegroundColor White

    if (-not (Test-Path $file)) {
        Write-Host "  ⚠ Fichier non trouve (nouveau?)" -ForegroundColor Yellow
        continue
    }

    $content = Get-Content $file -Raw
    $lines = Get-Content $file
    $findings = @()

    # Check EF Core patterns
    foreach ($pattern in $DangerousPatterns) {
        $lineNum = 0
        foreach ($line in $lines) {
            $lineNum++
            if ($line -match $pattern.Pattern) {
                $findings += @{
                    Line = $lineNum
                    Pattern = $pattern.Pattern
                    Description = $pattern.Description
                    Code = $line.Trim()
                }
            }
        }
    }

    # Check SQL brut
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match "migrationBuilder\.Sql") {
            foreach ($sqlPattern in $SqlDangerousPatterns) {
                if ($line -match $sqlPattern) {
                    $findings += @{
                        Line = $lineNum
                        Pattern = "SQL:$sqlPattern"
                        Description = "SQL brut avec $sqlPattern"
                        Code = $line.Trim()
                    }
                }
            }
        }
    }

    if ($findings.Count -gt 0) {
        $dangerousFound += @{
            File = $file
            Findings = $findings
        }

        Write-Host ""
        Write-Host "  ⚠️  OPERATIONS DESTRUCTIVES:" -ForegroundColor Red
        foreach ($finding in $findings) {
            Write-Host "  L$($finding.Line): $($finding.Pattern)" -ForegroundColor Yellow
            Write-Host "       $($finding.Description)" -ForegroundColor Gray
            Write-Host "       $($finding.Code)" -ForegroundColor DarkGray
        }
    }
    else {
        Write-Host "  ✓ OK" -ForegroundColor Green
    }
}

Write-Host ""

if ($dangerousFound.Count -gt 0) {
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  ⛔ OPERATIONS DESTRUCTIVES DETECTEES                     ║" -ForegroundColor Red
    Write-Host "╠══════════════════════════════════════════════════════════╣" -ForegroundColor Red
    Write-Host "║  $($dangerousFound.Count) fichier(s) avec operations dangereuses           ║" -ForegroundColor Red
    Write-Host "║                                                          ║" -ForegroundColor Red
    Write-Host "║  RISQUES :                                               ║" -ForegroundColor Red
    Write-Host "║  - Perte de donnees irreversible                         ║" -ForegroundColor Red
    Write-Host "║  - Corruption integrite referentielle                    ║" -ForegroundColor Red
    Write-Host "║                                                          ║" -ForegroundColor Red
    Write-Host "║  AVANT DE CONTINUER :                                    ║" -ForegroundColor Yellow
    Write-Host "║  1. Verifiez que vous avez un BACKUP                     ║" -ForegroundColor Yellow
    Write-Host "║  2. Confirmez que c'est intentionnel                     ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""

    if ($Force) {
        Write-Host "⚠️  Mode FORCE active - Bypass du check" -ForegroundColor Yellow
        exit 0
    }

    # Demander confirmation
    $response = Read-Host "Confirmez-vous ces operations destructives? (oui/non)"

    if ($response -eq "oui") {
        Write-Host "✓ Confirme par l'utilisateur" -ForegroundColor Green

        # Logger la confirmation
        $logDir = ".claude/gitflow/logs"
        if (-not (Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }

        $logEntry = @{
            timestamp = (Get-Date -Format "o")
            migrations = $dangerousFound | ForEach-Object {
                @{
                    file = $_.File
                    operations = $_.Findings | ForEach-Object { "$($_.Pattern):L$($_.Line)" }
                }
            }
            confirmedBy = "user"
        }

        $logFile = "$logDir/dangerous-migrations.json"
        $existingLog = @()
        if (Test-Path $logFile) {
            $existingLog = Get-Content $logFile | ConvertFrom-Json
        }
        $existingLog += $logEntry
        $existingLog | ConvertTo-Json -Depth 10 | Set-Content $logFile

        exit 0
    }
    else {
        Write-Host "❌ Commit annule" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Migrations OK - Aucune operation destructive" -ForegroundColor Green
exit 0
