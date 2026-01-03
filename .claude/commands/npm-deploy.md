# Deploy to NPM

Deploy the package to npm registry with version bump and git tagging.

---

model: haiku

---

You are an expert in npm package deployment. Execute the deployment workflow for this Node.js/TypeScript package.

## Pre-flight Checks

Before deploying, verify:

```bash
# 1. Check npm login status
npm whoami

# 2. Check git status (must be clean)
git status --porcelain

# 3. Check current branch (should be main or a release branch)
git branch --show-current

# 4. Get current version
cat package.json | grep '"version"' | head -1
```

## Deployment Workflow

### Step 1: Verify Clean State

If working directory is dirty:
- STOP and inform the user
- Suggest: `/gitflow:3-commit` or `git stash`

If not on `main` or `release/*` branch:
- WARN the user but allow to continue if confirmed

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Tests (if available)

```bash
npm test 2>/dev/null || echo "No tests configured"
```

### Step 4: Build

```bash
npm run build
```

If build fails, STOP and report the error.

### Step 5: Publish

```bash
npm publish
```

This will automatically:
1. Run `prepublishOnly` script (sync docs + build)
2. Publish to npm registry
3. Run `postpublish` script (commit docs + push)

## Output Format

```
================================================================================
                         NPM DEPLOY COMPLETE
================================================================================

PACKAGE:  @atlashub/claude-tools@{version}
REGISTRY: https://registry.npmjs.org
STATUS:   Published

STEPS COMPLETED:
  [x] Dependencies installed
  [x] Tests passed (or skipped)
  [x] Build successful
  [x] Published to npm
  [x] Documentation synced

================================================================================
```

## Error Handling

| Error | Action |
|-------|--------|
| Not logged in to npm | Run `npm login` first |
| Dirty working directory | Commit or stash changes |
| Build failed | Fix build errors before retry |
| Version already exists | Bump version with `npm version patch/minor/major` |
| Network error | Retry or check npm status |

## Notes

- This command does NOT bump version automatically
- Use `/gitflow:11-finish` for full release workflow with version bump
- For hotfixes, use the GitFlow workflow instead
