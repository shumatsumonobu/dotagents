# Changelog

## [Unreleased]

### Changed
- **Repository**: Renamed from `shumatsumonobu/claude` to `shumatsumonobu/dotagents`
- **READMEs**: Rewritten for clarity
- **Project structure**: Moved plugin from `devflow/` to `plugins/devflow/`

### Removed
- Japanese documentation (`*.ja.md`) — English only
- PLAN.md (merged into CHANGELOG)

## [2.0.0] - 2026-02-23

### Added
- **explorer agent**: Read-only codebase analysis (Read, Glob, Grep only)
- **`/devflow:explore`**: Standalone codebase analysis with 1-3 explorers
- **`/devflow:history`**: Search and browse past sessions
- **9-phase workflow**: Discovery → Exploration → Clarifying → Architecture → Implementation → Testing → Review → Documentation → Summary
- **Architecture candidates**: Planner proposes 3 options with trade-offs; user selects before implementation
- **Confidence scoring**: Reviewer scores findings 0-100, only reports >= 75
- **Session history archiving**: Completed sessions archived to `.devflow/history/`

### Changed
- Agent count: 5 → 6 (added explorer)
- Session storage: `.claude/memory/` → `.devflow/`
- All agent prompts: Japanese → English
- Compaction recovery: reads 3 files (session.md + research.md + DESIGN.md)

### Removed
- Language selection step (Claude adapts naturally)

## [1.0.0] - 2026-02-08

### Added
- **`/devflow:dev`**: PM-like workflow — hearing → design → code → test → review → docs
- **5 agents**: planner, coder, tester, reviewer, documenter
- **4 development modes**: full, no-test, no-review, speed
- Parallel execution (coder x N + tester)
- Test auto-retry (up to 3 attempts)
- Session persistence and compaction recovery
- SubagentStart/Stop hooks
- Plugin marketplace support
