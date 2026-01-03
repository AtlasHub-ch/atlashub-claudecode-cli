# Changelog

## [1.7.0] - 2025-01-02

### Added
- **EF Core Cross-Branch Validation** - New commands to manage migrations across branches
  - `/efcore:scan` - Scan migrations on all active worktree branches
  - `/efcore:conflicts` - Analyze potential ModelSnapshot conflicts (BLOCKING)
  - `/efcore:rebase-snapshot` - Rebase ModelSnapshot on develop and regenerate migration
  - `/efcore:squash` - Merge multiple migrations into a single consolidated migration
- **Git Worktrees Support** - Full worktree structure for parallel branch development
  - Permanent worktrees for main and develop branches
  - Organized structure: features/, releases/, hotfixes/
  - Auto-cleanup on branch finish
- **Cross-Branch Configuration** - New config options in `config.json`
  - `worktrees.enabled` - Enable/disable worktree structure
  - `efcore.crossBranch.enabled` - Enable cross-branch validation
  - `efcore.crossBranch.blockOnConflict` - Block migration creation on conflict

### Changed
- `/gitflow:1-init` now creates worktree structure by default (`--with-worktrees`)
- `/efcore:migration` now includes ETAPE 0 for cross-branch validation before creation
- Config schema version updated to 1.2.0

## [1.6.1] - 2025-01-01

### Fixed
- Hotfix for user questions handling

## [1.6.0] - 2024-12-31

### Added
- Business Analyse workflow (7 phases)
- APEX methodology commands
- GitFlow 11-phase workflow
- Prompt generation tools

## [1.0.0] - 2024-12-30

### Added
- Initial release
- GitFlow commands: /gf-plan, /gf-exec, /gf-status, /gf-abort
- License validation system
- EF Core migration support
- Interactive CLI with colored output
