# @atlashub/claude-gitflow

Professional GitFlow automation CLI for Claude Code with EF Core migration support.

## Features

- GitFlow workflow automation (/gf-plan, /gf-exec, /gf-status, /gf-abort)
- EF Core migration management
- License key validation system
- Interactive CLI with colored output
- Project auto-detection (Git, .NET, EF Core)

## Installation

```bash
# Configure npm for GitHub Packages
npm config set @atlashub:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN

# Install globally
npm install -g @atlashub/claude-gitflow
```

## Quick Start

```bash
# Activate your license
claude-gitflow activate YOUR-LICENSE-KEY

# Install GitFlow commands in your project
cd your-project
claude-gitflow install

# Check status
claude-gitflow status
```

## Commands

| Command | Description |
|---------|-------------|
| `activate <key>` | Activate license key |
| `install` | Install GitFlow commands |
| `uninstall` | Remove GitFlow commands |
| `status` | Show license and installation status |
| `update` | Update commands to latest version |

## GitFlow Commands (after installation)

| Command | Description |
|---------|-------------|
| `/gf-plan` | Create a GitFlow plan |
| `/gf-exec` | Execute a GitFlow plan |
| `/gf-status` | Show GitFlow status |
| `/gf-abort` | Abort current operation |

## Configuration

After installation, configure your project in `.claude-gitflow.json`:

```json
{
  "git": {
    "branches": {
      "main": "main",
      "develop": "develop"
    },
    "remote": "origin",
    "mergeStrategy": "--no-ff",
    "tagPrefix": "v"
  },
  "efcore": {
    "enabled": true,
    "projectPath": "auto-detect",
    "contextName": "ApplicationDbContext"
  }
}
```

## License

This software requires a valid license key. Visit [atlashub.ch/claude-gitflow](https://atlashub.ch/claude-gitflow) for licensing information.

## Support

- Documentation: [atlashub.ch/docs](https://atlashub.ch/docs)
- Issues: [GitHub Issues](https://github.com/atlashub/claude-gitflow/issues)
- Email: support@atlashub.ch
