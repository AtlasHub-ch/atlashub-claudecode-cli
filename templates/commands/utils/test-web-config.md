---
description: Configure test-web targets from external config file
argument-hint: [path/to/config.json]
allowed-tools: Read, Write, AskUserQuestion, Glob
model: haiku
---

# /test-web:config - Web test configuration

Updates web test configuration from external file.

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool **interactively**. You MUST execute the tool with these parameters to get user response BEFORE continuing.

## Usage

```
/test-web:config                     # Ask for file interactively
/test-web:config path/to/config.json # Load file directly
```

## Workflow

### 1. Get source file

**If argument provided**: Use given path

**Otherwise**: Ask user

```
AskUserQuestion:
  question: "Which configuration file do you want to load?"
  header: "Config file"
  options:
    - label: "Search in project"
      description: "Glob to find *test-web*.json files"
    - label: "Enter path"
      description: "Manually specify file path"
```

### 2. Validate file

1. Check file exists
2. Read JSON content
3. Validate structure (targets, settings)

**Expected structure**:

```json
{
  "targets": [
    {
      "name": "string (required)",
      "url": "string (required for fetch)",
      "query": "string (required for search)",
      "type": "fetch|search (required)",
      "expects": {
        "status": "number (optional)",
        "contains": ["strings"] "(optional)",
        "hasResults": "boolean (optional)"
      }
    }
  ],
  "chrome": {
    "enabled": "boolean",
    "targets": [...]
  },
  "settings": {
    "timeout": "number",
    "retries": "number",
    "reportPath": "string"
  }
}
```

### 3. Merge or replace

```
AskUserQuestion:
  question: "How to apply new configuration?"
  header: "Mode"
  options:
    - label: "Replace"
      description: "Completely replace existing config"
    - label: "Merge (add)"
      description: "Add new targets to existing"
```

### 4. Apply

1. Read existing [.claude/test-web/config.json](.claude/test-web/config.json)
2. Apply chosen mode (replace or merge)
3. Write result

### 5. Confirm

```
CONFIG UPDATED
────────────────────────────────
Source:  {source_file_path}
Mode:    {replace|merge}
Targets: {total_count}
────────────────────────────────

Test now:
/test-web --quick
```

## Example source files

### Minimal

```json
{
  "targets": [
    {
      "name": "My site",
      "url": "https://example.com",
      "type": "fetch",
      "expects": { "status": 200 }
    }
  ]
}
```

### Complete

```json
{
  "targets": [
    {
      "name": "API Health",
      "url": "https://api.example.com/health",
      "type": "fetch",
      "expects": {
        "status": 200,
        "contains": ["healthy", "ok"]
      }
    },
    {
      "name": "SEO Check",
      "query": "site:example.com",
      "type": "search",
      "expects": { "hasResults": true }
    }
  ],
  "settings": {
    "timeout": 60000,
    "retries": 3
  }
}
```

## Available templates

Configuration templates are available in:
[templates/test-web/](templates/test-web/)

---

User: $ARGUMENTS
