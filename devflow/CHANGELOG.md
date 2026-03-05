[日本語版はこちら](CHANGELOG.ja.md)

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!--
### Planned
- Additional language support (Java, C#, etc.)
- Integration with external code review tools
- Performance profiling integration
- CI/CD pipeline generation
-->

## [2.0.0] - 2026-02-23

### Added
- **explorer agent**: Read-only codebase analysis agent (Read, Glob, Grep only)
  - Entry point identification with file:line references
  - Execution flow tracing, architecture layer mapping
  - Must-read file list (5-10 files) for informed design
- **`/devflow:explore` command**: Standalone codebase analysis with 1-3 explorer agents
  - Outputs consolidated analysis to `.devflow/research.md`
- **`/devflow:history` command**: Search and browse past session archives
  - Keyword filtering via arguments
  - Summary table with date, goal, tech stack, mode
- **9-phase workflow** in `/devflow:dev`:
  - Phase 2: Codebase Exploration (2-3 explorer agents in parallel)
  - Phase 3: Clarifying Questions (mandatory, never skipped)
  - Phase 9: Summary with completion report and session archiving
- **Architecture Candidates** in planner output (docs/DESIGN.md):
  - 3 options (Minimal Changes, Clean Architecture, Pragmatic Balance)
  - Pros/Cons for each option with Recommendation
  - User selects via AskUserQuestion before implementation
- **Confidence Scoring** in reviewer:
  - 0-100 scale for each finding
  - Reporting threshold: only findings >= 75 are included
  - Each finding requires [Confidence: XX], file:line reference, and concrete fix suggestion
- **Session history archiving**: Completed sessions archived to `.devflow/history/YYYY-MM-DD-HHmm-{title}/`
  - Includes session.md (requirements, decisions, progress) and design.md (architecture details)
- **Session continuation**: AskUserQuestion prompt to continue or start new when incomplete session exists
- **AskUserQuestion integration**: Clickable UI selections for development mode (Phase 1), architecture choice (Phase 4), and review response (Phase 7)
- **Expected Outputs control**: session.md lists expected output files; sub-agents only generate listed files

### Changed
- **Agent count**: 5 → 6 (added explorer)
- **Workflow**: 3-step → 9-phase pipeline (Discovery → Exploration → Clarifying → Architecture → Implementation → Testing → Review → Documentation → Summary)
- **Session storage**: `.claude/memory/dev-session.md` → `.devflow/session.md`
- **Research storage**: Explorer analysis results stored in `.devflow/research.md` (written by PM, not explorer)
- **Planner**: Now reads `.devflow/research.md` to leverage explorer findings
- **Reviewer output**: Findings now require [Confidence: XX] and file:line references
- **All agent prompts**: Converted from Japanese to English for improved token efficiency and instruction following
- **Compaction recovery**: Now reads 3 files (session.md + research.md + DESIGN.md) instead of 1
- **Plugin version**: 1.0.0 → 2.0.0

### Removed
- **Language selection** (Step 0): Claude naturally adapts to user's input language
- **`.claude/memory/user-preferences.md`**: No longer needed without language selection
- **Japanese agent prompts**: All converted to English

## [1.0.0] - 2026-02-08

### Added
- **`/devflow:dev` command**: PM-like workflow with hearing, design, implementation, testing, review, and documentation
  - Step 0: Conversation language selection (first time only)
  - Step 1: Automatic project environment analysis (for existing projects)
  - Step 2: Requirements hearing with 7 principles
  - Step 3: Development execution with parallel task management
  - Orchestration logic integrated directly into the command (flat subagent hierarchy for hook compatibility)
- **planner agent**: Design and impact analysis
- **coder agent**: Multi-language implementation support (TypeScript/JavaScript, Python, Go, Rust)
  - Automatic coding convention detection
- **tester agent**: Test framework auto-detection and execution
  - Vitest/Jest/Mocha/Jasmine/Ava, pytest/unittest/nose, Go testing/testify, cargo test
  - Coverage measurement support
- **reviewer agent**: Code quality and security review
  - Security checklist (XSS, SQL injection, command injection, etc.)
  - Language-specific security checks
  - Review output to docs/REVIEW.md
- **documenter agent**: Documentation generation (README.md, OpenAPI spec, architecture docs)
- **Custom commands** (`/devflow:*`): `/devflow:dev`, `/devflow:design`, `/devflow:review`, `/devflow:test`, `/devflow:docs`
- **SubagentStart/Stop hooks**: Notification on agent start/stop
- **Development mode selection**: Choose from 4 modes during hearing (full, no-test, no-review, no-test-no-review)
- **Agent `color` field**: planner(green), coder(yellow), tester(cyan), reviewer(red), documenter(magenta)
- Plugin marketplace support (marketplace.json and plugin.json)

### Features
- Dynamic parallel execution of coder x N + tester (number of coders based on task structure)
- Tester Phase control: Phase 1 (spec writing, parallel with coder) and Phase 2 (test execution, sequential)
- Session persistence via `.claude/memory/dev-session.md` (Requirements Summary, Parallel Plan, Progress)
- Compaction recovery: auto-restores state from dev-session.md after context compression
- Test retry with max 3 attempts before moving on
- Emoji prohibition in all generated documents
- Debug logging toggle in notify.js (`DEBUG_LOG` flag)
- Project memory scope for knowledge persistence
- Multi-language coding standards enforcement
- Source code protection: reviewer (read-only via `disallowedTools: Edit`), documenter (docs-only editing via prompt instructions)
- Agent heading structure: `##` with `**bold**` subsections (following official plugin pattern)
- Document output enforcement: Concrete H2 section names listed in agent prompts
- `maxTurns` on all agents to prevent runaway execution
- `disable-model-invocation` on all commands (user-triggered only)
- `argument-hint` on all commands for autocomplete UX
