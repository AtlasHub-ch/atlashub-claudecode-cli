---
description: Test web accessibility and content validation
argument-hint: --quick|--chrome|--report|<url>
allowed-tools: WebFetch, WebSearch, Read, Write, Bash
model: sonnet
---

# /test-web - Web testing agent

Tests accessibility and content of project web resources.

## Execution Modes

| Mode | Flag | Description |
|------|------|-------------|
| Quick | `--quick` | WebFetch only (HTTP 200 + text content) |
| Chrome | `--chrome` | E2E tests with Claude for Chrome (requires `claude --chrome`) |
| Report | `--report` | Generates detailed report in reports/ |
| Full | (default) | Quick + Chrome if available |

## Configuration

Reads configuration from: [.claude/test-web/config.json](.claude/test-web/config.json)

## Workflow

### Quick Mode (--quick)

1. **Load configuration**
   ```bash
   cat .claude/test-web/config.json
   ```

2. **For each target type "fetch"**:
   - `WebFetch(url, "Verify that the page is accessible and contains: {expects.contains}")`
   - Check HTTP status (200 expected)
   - Verify expected content presence

3. **For each target type "search"**:
   - `WebSearch(query)`
   - Verify results exist

4. **Report**: Display results in console

### Chrome Mode (--chrome)

**Prerequisites**:
- "Claude for Chrome" extension installed
- Max/Pro/Team/Enterprise plan
- Claude Code launched with: `claude --chrome`

1. **Verify Chrome mode is active**
2. **For each chrome target**:
   - Navigate to URL
   - Execute actions (click, verify, etc.)
   - Capture screenshots if requested

3. **Report**: Generate report with captures

### Report Mode (--report)

Generates markdown file in [.claude/test-web/reports/](.claude/test-web/reports/):

```markdown
# Test Web Report - YYYY-MM-DD HH:mm

## Summary
| Target | Status | Time |
|--------|--------|------|
| ... | PASS/FAIL | Xms |

## Details
### Target Name
- URL: ...
- Expected: ...
- Result: ...
- Screenshot: (if chrome mode)
```

## Examples

### Quick test of all configured URLs

```
/test-web --quick
```

### E2E test with browser

```bash
# First launch Claude Code with Chrome
claude --chrome

# Then execute tests
/test-web --chrome
```

### Test specific URL

```
/test-web https://github.com/SIMON-Atlashub/atlashub-claudecode-cli
```

### Generate detailed report

```
/test-web --report
```

## Output Format

### Success

```
TEST WEB RESULTS
────────────────────────────────
✅ GitHub Repository     200 OK    "README" found
✅ npm Package           200 OK    "claude-tools" found
✅ Google Indexation     Results   Found in search

Status: 3/3 PASS
────────────────────────────────
```

### Failure

```
TEST WEB RESULTS
────────────────────────────────
✅ GitHub Repository     200 OK    "README" found
❌ npm Package           404       Package not found
⚠️ Google Indexation     Results   No relevant results

Status: 1/3 PASS, 1 FAIL, 1 WARNING
────────────────────────────────
```

## BA/EPCT Integration

This command can be called automatically in:
- Phase T (Test) of BA workflow: `/ba:5-verify`
- Phase T of EPCT workflow

## Sources

- [Anthropic - Claude for Chrome](https://www.anthropic.com/news/claude-for-chrome)
- [Claude Help Center](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome)

---

User: $ARGUMENTS
