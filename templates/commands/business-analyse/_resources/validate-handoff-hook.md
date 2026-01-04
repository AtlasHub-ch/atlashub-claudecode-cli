# Handoff Validation Hook

This document describes how to set up an automatic validation hook for BA handoff documents.

## Purpose

Automatically validate that handoff documents (`4-development-handoff.md`) don't contain code before they are committed or used.

## Claude Code Hook Configuration

Add to your project's `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "condition": "path.includes('development-handoff.md')",
        "command": "node .claude/hooks/validate-handoff.js \"$PATH\""
      }
    ]
  }
}
```

## Validation Script

Create `.claude/hooks/validate-handoff.js`:

```javascript
#!/usr/bin/env node
/**
 * Validates BA handoff documents for code violations
 * Exit code 0 = valid, Exit code 1 = violations found
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath)) {
  console.error('Usage: validate-handoff.js <path-to-handoff.md>');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Strict code patterns (always forbidden)
const STRICT_PATTERNS = [
  { pattern: /public\s+(void|int|string|async|class|static)/g, name: 'C# method/class' },
  { pattern: /\[Required\]|\[MaxLength/g, name: 'C# attribute' },
  { pattern: /function\s+\w+\s*\(/g, name: 'JS function' },
  { pattern: /def\s+\w+\s*\(/g, name: 'Python function' },
  { pattern: /@code\s*\{/g, name: 'Razor code block' },
  { pattern: /<Mud\w+/g, name: 'MudBlazor component' },
  { pattern: /INSERT\s+INTO|CREATE\s+TABLE|ALTER\s+TABLE/gi, name: 'SQL DDL/DML' },
  { pattern: /namespace\s+\w+/g, name: 'C# namespace' },
  { pattern: /using\s+System\./g, name: 'C# using' },
  { pattern: /import\s+\{.*\}\s+from/g, name: 'JS import' },
  { pattern: /export\s+(default\s+)?(class|function|const)/g, name: 'JS export' }
];

// Context patterns to ignore (common in business text)
const WHITELIST = [
  /```mermaid[\s\S]*?```/g,  // Mermaid diagrams
  /```gherkin[\s\S]*?```/g,  // Gherkin scenarios
  /`[^`]+`/g,                 // Inline code (examples)
];

let violations = [];

// Remove whitelisted content temporarily
let contentToCheck = content;
WHITELIST.forEach(pattern => {
  contentToCheck = contentToCheck.replace(pattern, '');
});

// Check for violations
STRICT_PATTERNS.forEach(({ pattern, name }) => {
  const matches = contentToCheck.match(pattern);
  if (matches) {
    violations.push({
      type: name,
      count: matches.length,
      examples: matches.slice(0, 3)
    });
  }
});

if (violations.length > 0) {
  console.error('\n❌ HANDOFF VALIDATION FAILED\n');
  console.error('The following code patterns were detected:\n');

  violations.forEach(v => {
    console.error(`  • ${v.type}: ${v.count} occurrence(s)`);
    console.error(`    Examples: ${v.examples.join(', ')}\n`);
  });

  console.error('═══════════════════════════════════════════════════════════════');
  console.error('BA handoffs must NOT contain source code.');
  console.error('Rewrite as tables, descriptions, or wireframes.');
  console.error('═══════════════════════════════════════════════════════════════\n');

  process.exit(1);
}

console.log('✓ Handoff validation passed - no code violations detected');
process.exit(0);
```

## Shell Alternative (Bash)

For projects without Node.js, use this bash version:

```bash
#!/bin/bash
# .claude/hooks/validate-handoff.sh

FILE="$1"

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 1
fi

# Check for code patterns
VIOLATIONS=$(grep -E "(public\s+(void|int|string|async|class))|\[Required\]|\[MaxLength|function\s+\w+\s*\(|def\s+\w+\s*\(|@code\s*\{|INSERT\s+INTO|CREATE\s+TABLE" "$FILE" | head -10)

if [ -n "$VIOLATIONS" ]; then
  echo ""
  echo "❌ HANDOFF VALIDATION FAILED"
  echo ""
  echo "Code patterns detected:"
  echo "$VIOLATIONS"
  echo ""
  echo "Rewrite as tables or descriptions."
  exit 1
fi

echo "✓ Handoff validation passed"
exit 0
```

## Integration Options

### Option 1: Git Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

for file in $(git diff --cached --name-only | grep "development-handoff.md"); do
  if ! .claude/hooks/validate-handoff.sh "$file"; then
    echo "Commit blocked: Fix handoff document"
    exit 1
  fi
done
```

### Option 2: Claude Code PostToolUse Hook

Already shown above in the settings.json example.

### Option 3: CI/CD Pipeline

```yaml
# .github/workflows/validate-ba.yml
name: Validate BA Documents

on:
  pull_request:
    paths:
      - '**/*development-handoff.md'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate handoff documents
        run: |
          for file in $(find . -name "*development-handoff.md"); do
            node .claude/hooks/validate-handoff.js "$file"
          done
```

## Validation Rules Summary

| Pattern | Type | Why Forbidden |
|---------|------|---------------|
| `public void/int/string` | C# code | Implementation detail |
| `[Required]` | C# attribute | Technical annotation |
| `function name()` | JS code | Implementation detail |
| `INSERT INTO` | SQL | Database-specific |
| `<MudButton>` | Component | UI framework code |

## What Passes Validation

- Markdown tables describing attributes
- ASCII wireframes
- Mermaid diagrams (ER, flowcharts)
- Gherkin scenarios
- Business rule descriptions
- API endpoint specifications (without implementation)
