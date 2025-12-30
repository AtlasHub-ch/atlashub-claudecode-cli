# Guide de formatage - Références cliquables & Commandes copiables

Ce guide définit les standards de formatage pour tous les templates de commandes.

## Références de fichiers (cliquables)

### Format standard

```markdown
<!-- Fichier simple -->
[filename.ts](path/to/filename.ts)

<!-- Fichier avec ligne -->
[filename.ts:42](path/to/filename.ts#L42)

<!-- Fichier avec range de lignes -->
[filename.ts:42-51](path/to/filename.ts#L42-L51)

<!-- Dossier -->
[src/components/](src/components/)
```

### Exemples concrets

| Contexte | Format | Résultat |
|----------|--------|----------|
| Config GitFlow | `[config.json](.claude/gitflow/config.json)` | [config.json](.claude/gitflow/config.json) |
| Ligne spécifique | `[installer.ts:45](src/lib/installer.ts#L45)` | [installer.ts:45](src/lib/installer.ts#L45) |
| Range | `[utils.ts:10-25](src/utils.ts#L10-L25)` | [utils.ts:10-25](src/utils.ts#L10-L25) |
| Dossier | `[templates/](templates/)` | [templates/](templates/) |

### À éviter

```markdown
<!-- INCORRECT -->
`config.json`
`.claude/gitflow/config.json`
Le fichier config.json
```

## Commandes (copiables)

### Commandes Claude Code

Toujours dans un bloc de code simple :

```markdown
```
/gitflow:1-init --exec
```
```

### Commandes Bash/Shell

Avec le langage spécifié :

```markdown
```bash
npm run build
dotnet ef migrations add Initial
```
```

### Commandes multiples

```markdown
```bash
# Étape 1 : Build
npm run build

# Étape 2 : Test
npm test
```
```

### À éviter

```markdown
<!-- INCORRECT -->
Exécutez `/gitflow:1-init`
Lancez la commande `npm run build`
```

## Tableaux de commandes

Format recommandé pour lister des commandes :

```markdown
| Commande | Description |
|----------|-------------|
| `/test-web --quick` | Tests rapides |
| `/test-web --chrome` | Tests E2E |
```

## Chemins dans les instructions

### Bon exemple

```markdown
1. Créer le fichier [config.json](.claude/test-web/config.json)
2. Exécuter :
   ```
   /test-web --quick
   ```
3. Vérifier le rapport dans [reports/](.claude/test-web/reports/)
```

### Mauvais exemple

```markdown
1. Créer le fichier `.claude/test-web/config.json`
2. Exécuter `/test-web --quick`
3. Vérifier le rapport dans `.claude/test-web/reports/`
```

## Résumé

| Élément | Format | Exemple |
|---------|--------|---------|
| Fichier | `[name](path)` | `[config.json](.claude/config.json)` |
| Fichier:ligne | `[name:L](path#LX)` | `[utils.ts:42](src/utils.ts#L42)` |
| Dossier | `[name/](path/)` | `[templates/](templates/)` |
| Commande Claude | ` ``` code ``` ` | `/command --flag` |
| Commande Bash | ` ```bash code ``` ` | `npm run build` |
