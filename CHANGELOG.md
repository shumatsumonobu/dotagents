# Changelog

One log for the whole repository. Components version independently, so each heading names the
component it belongs to.

## Initial release — 2026-09-08

Two plugins, distributed through the marketplace in `.claude-plugin/marketplace.json`.

### devflow

Say what you want built; six agents run the cycle.

- Six agents: explorer, planner, coder, tester, reviewer, documenter. The explorer is read-only,
  restricted to Read, Glob, and Grep
- Seven commands: `/devflow:dev` runs the whole thing, and `explore`, `history`, `design`,
  `review`, `test`, `docs` run their phases on their own
- Nine phases: discovery, exploration, clarifying, architecture, implementation, testing, review,
  documentation, summary
- Architecture candidates: the planner proposes three options with their trade-offs, and the user
  chooses before implementation starts
- Confidence scoring: the reviewer scores each finding from 0 to 100 and reports only those at 75
  or above
- Four modes: full, no-test, no-review, speed
- Parallel execution, with several coders alongside a tester
- Test retry, up to three attempts
- Session state in `.devflow/`, archived to `.devflow/history/` when a session completes
- Compaction recovery reads `session.md`, `research.md`, and `DESIGN.md`
- SubagentStart and SubagentStop hooks, flat hierarchy so every one of them fires

### design-docs

Design documents generated from source and kept in step with it.

- Five commands: `/design-docs:init`, `generate`, `sync`, `review`, `explain`
- Pattern-driven and framework-agnostic: `init` infers ast-grep patterns from sample files the
  user supplies and stores them in `design-docs.knowledge.md`. No hardcoded framework list
- Four templates — `api` for REST and GraphQL endpoints, `screen` for interfaces with wireframe
  support, `batch` for background jobs, `module` for general features — plus an automatic
  structure for anything that fits none of them
- code-review-graph for dependency graphs, community detection, and blast radius
- ast-grep for structural extraction
- Playwright for wireframe screenshots, optional
- Eleven writing rules with a checklist, and verification split into exact, which ast-grep can
  confirm, and approximate, which rests on judgment
- Sync uses an ast-grep diff, so new and removed endpoints are detected reliably
- Output language selectable in config; works with code present and with code not yet written
- Staged generation, one document at a time, for consistency across a set

### Repository

- English only. A second copy of the same prose drifts apart silently, and a stale translation
  misinforms rather than helps
- One changelog at the root rather than one per plugin
