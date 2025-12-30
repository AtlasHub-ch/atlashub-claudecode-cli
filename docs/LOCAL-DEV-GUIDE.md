# Guide d'installation - Claude Tools

Installation du CLI claude-tools depuis GitHub.

## Prerequis

- Node.js 18+
- VS Code avec extension Claude Code
- Git

---

## Installation depuis GitHub (Recommande)

### Option 1: Installation globale directe

```bash
# Installer directement depuis GitHub
npm install -g github:atlashub/claude-tools

# Verifier
claude-tools --version

# Installer les commandes dans ~/.claude
claude-tools install --skip-license
```

### Option 2: Installation depuis une branche specifique

```bash
# Depuis develop
npm install -g github:atlashub/claude-tools#develop

# Depuis un tag
npm install -g github:atlashub/claude-tools#v1.0.0
```

### Option 3: Installation locale au projet

```bash
# Ajouter comme dependance de dev
npm install -D github:atlashub/claude-tools

# Utiliser via npx
npx claude-tools install --local --skip-license
```

---

## Installation pour developpement

### 1. Cloner et builder

```bash
# Cloner le repo
git clone https://github.com/atlashub/claude-tools.git
cd claude-tools

# Installer les dependances
npm install

# Builder
npm run build
```

### 2. Lier le CLI globalement (dev)

```bash
# Cree un lien symbolique global
npm link

# Verifier
claude-tools --version
```

### 3. Installer les commandes

```bash
# Global (~/.claude) - recommande
claude-tools install --skip-license

# Ou local (./.claude) dans un projet specifique
cd /chemin/vers/mon-projet
claude-tools install --local --skip-license
```

## Structure apres installation

```
mon-projet/
├── .claude/
│   ├── commands/
│   │   ├── gitflow.md
│   │   ├── gitflow/
│   │   │   ├── 1-init.md
│   │   │   ├── 2-status.md
│   │   │   └── ...
│   │   ├── apex.md
│   │   └── ...
│   ├── agents/
│   └── hooks/
└── ...
```

## Workflow de developpement

### Modifier une commande

1. Editer dans `templates/commands/`
2. Rebuild: `npm run build`
3. Reinstaller: `claude-tools install --local --force --skip-license`
4. Tester dans Claude Code: `/gitflow:1-init`

### Script de dev rapide

Creer `dev.ps1` (PowerShell):

```powershell
# dev.ps1 - Rebuild et reinstall
param(
    [string]$target = "."
)

Write-Host "Building..." -ForegroundColor Cyan
npm run build

Write-Host "Installing to $target..." -ForegroundColor Cyan
Push-Location $target
claude-tools install --local --force --skip-license
Pop-Location

Write-Host "Done!" -ForegroundColor Green
```

Usage:
```powershell
.\dev.ps1 -target "C:\Projects\mon-projet"
```

### Script bash (Git Bash/Linux/Mac)

```bash
#!/bin/bash
# dev.sh - Rebuild et reinstall

TARGET=${1:-.}

echo "Building..."
npm run build

echo "Installing to $TARGET..."
pushd "$TARGET" > /dev/null
claude-tools install --local --force --skip-license
popd > /dev/null

echo "Done!"
```

## VS Code Tasks

Ajouter dans `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build CLI",
      "type": "npm",
      "script": "build",
      "problemMatcher": []
    },
    {
      "label": "Install Local",
      "type": "shell",
      "command": "node dist/index.js install --local --force --skip-license",
      "problemMatcher": []
    },
    {
      "label": "Build & Install",
      "dependsOn": ["Build CLI", "Install Local"],
      "dependsOrder": "sequence",
      "problemMatcher": []
    },
    {
      "label": "Status",
      "type": "shell",
      "command": "node dist/index.js status --local",
      "problemMatcher": []
    }
  ]
}
```

Raccourcis:
- `Ctrl+Shift+B` -> Build CLI
- `Ctrl+Shift+P` -> Tasks: Run Task -> Build & Install

## VS Code Launch Config

Ajouter dans `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI - Install",
      "program": "${workspaceFolder}/dist/index.js",
      "args": ["install", "--local", "--skip-license"],
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI - Status",
      "program": "${workspaceFolder}/dist/index.js",
      "args": ["status", "--local"],
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI - Uninstall",
      "program": "${workspaceFolder}/dist/index.js",
      "args": ["uninstall", "--local", "--yes"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Tester les commandes Claude Code

### Dans le terminal VS Code

```bash
# Verifier l'installation
claude-tools status --local

# Lister les commandes installees
claude-tools status --local --verbose
```

### Dans Claude Code

1. Ouvrir Claude Code (`Ctrl+Shift+P` -> "Claude Code")
2. Taper une commande:
   - `/gitflow` - Workflow complet
   - `/gitflow:1-init` - Initialiser
   - `/apex` - Methodologie APEX

## Troubleshooting

### Commandes non reconnues dans Claude Code

```bash
# Verifier que .claude/commands existe
ls -la .claude/commands/

# Reinstaller
claude-tools install --local --force --skip-license
```

### Erreur "Cannot find module"

```bash
# Rebuild complet
npm run build

# Ou clean + build
rm -rf dist/
npm run build
```

### Permissions Windows

```powershell
# Executer en admin si erreur permissions
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### npm link ne fonctionne pas

```bash
# Alternative: executer directement
node dist/index.js install --local --skip-license
```

## Workflow recommande

1. **Developper** - Editer `templates/commands/*.md`
2. **Builder** - `npm run build`
3. **Installer** - `claude-tools install --local --force --skip-license`
4. **Tester** - Dans Claude Code: `/gitflow:1-init`
5. **Iterer** - Retour etape 1

## Commandes utiles

| Action | Commande |
|--------|----------|
| Build | `npm run build` |
| Install local | `claude-tools install --local --skip-license` |
| Reinstall | `claude-tools install --local --force --skip-license` |
| Status | `claude-tools status --local` |
| Uninstall | `claude-tools uninstall --local --yes` |
| Watch mode | `npm run dev` (si configure) |

## Ajouter watch mode

Dans `package.json`:

```json
{
  "scripts": {
    "dev": "tsup --watch",
    "dev:install": "nodemon --watch dist --exec \"node dist/index.js install --local --force --skip-license\""
  }
}
```

Installer nodemon:
```bash
npm install -D nodemon
```

Puis lancer:
```bash
# Terminal 1: Watch build
npm run dev

# Terminal 2: Watch install (dans le projet cible)
cd /chemin/projet && npm run dev:install
```
