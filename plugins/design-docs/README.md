[English](README.md) | [日本語](README.ja.md)

# design-docs

A Claude Code plugin that auto-generates and syncs design documents from web application source code. Uses [code-review-graph](https://github.com/tirth8205/code-review-graph) for dependency analysis and [ast-grep](https://github.com/ast-grep/ast-grep) for structural extraction to produce consistent, high-quality design documents every time.

**For web applications only** (frontend + backend + batch). Not intended for embedded systems, games, etc.

## Setup

### 1. Install required tools

```bash
# code-review-graph (Python 3.10+)
pip install code-review-graph[communities]

# ast-grep
npm install -g @ast-grep/cli
```

> **Windows:** Set `PYTHONUTF8=1` environment variable for code-review-graph.

### 2. Load the plugin

```bash
claude --plugin-dir ./plugins/design-docs
```

### 3. Initialize

Run on any Web application project:

```
/design-docs:init
```

This analyzes your source code and proposes how to split design documents. If no code exists yet, it walks you through a hearing to set up the configuration.

### Optional: Playwright (for screen wireframes)

```bash
cd plugins/design-docs/scripts
npm install
npx playwright install chromium
```

All other features work without Playwright.

## Commands

### `/design-docs:init`

Set up the design document environment with a 5-phase flow:

```
/design-docs:init
```

- **Phase 1:** Asks 4 questions — document language, output directory, code presence, project description (freeform)
- **Phase 2:** Asks what the project contains (API / screens / batch / modules)
- **Phase 3:** Auto-detects sample files via Glob, user confirms classification
- **Phase 4:** Infers ast-grep patterns from confirmed samples, shows match results (not raw patterns) for verification
- **Phase 5:** Generates `design-docs.config.md` + `design-docs.knowledge.md`

For projects without code yet, init does Phase 1 + an additional hearing (what to build, main features, planned stack), then generates config.md with feature-name entries and an empty knowledge.md. Re-run init after implementing code to populate patterns.

### `/design-docs:generate [doc-name]`

Generate design documents.

```
/design-docs:generate users-api.md    # specific document
/design-docs:generate                 # all documents (staged)
```

- Selects the appropriate template (api/screen/batch/module) or auto-structures
- Extracts endpoints, validation, DB operations from source code
- Generates wireframe images for screen templates (requires Playwright)
- Requires user approval before writing files

### `/design-docs:sync [doc-name]`

Detect code changes and propose document updates.

```
/design-docs:sync users-api.md       # specific document
/design-docs:sync                    # all documents
```

- Identifies base commit from revision history
- Uses blast radius analysis to find impacted scope
- Classifies changes as "needs update" or "no impact"
- Requires user approval before editing

### `/design-docs:review [doc-name]`

Review document quality.

```
/design-docs:review users-api.md     # specific document
/design-docs:review                  # all documents
```

- Checks template structure compliance
- Validates 11 writing rules
- Cross-checks against source code with ast-grep
- Outputs results as a checklist

### `/design-docs:explain [question]`

Answer questions about design and features.

```
/design-docs:explain How does user registration work?
/design-docs:explain What is the auth flow?
```

- Investigates both design documents and source code
- Explains with numbered steps and mermaid diagrams
- Cites sources (file paths, method names)

## Configuration

`/design-docs:init` generates `design-docs.config.md`:

```markdown
# design-docs.config.md

## settings
- output: docs/design/
- language: ja
- framework: Express で Web API

## documents
| Document | Template | Entry Point |
|----------|----------|-------------|
| users-api.md | api | src/routes/users.js |
| dashboard.md | screen | src/pages/dashboard.html |
| cleanup.md | batch | src/batch/cleanup.js |
| logger.md | module | src/utils/logger.js |
```

See [config/config.example.md](config/config.example.md) for a full example including code-not-present format.

## How it works (and its limits)

**Framework-agnostic by design.** `/design-docs:init` reads your actual source files and infers ast-grep patterns — it does not rely on a predefined framework list. Works with any language or framework as long as you can point to sample files during init.

Patterns are saved to `design-docs.knowledge.md` at the project root and reused by all subsequent commands. Commit this file to git so your team shares the same patterns.

### Verification confidence

**Exact (via ast-grep) — ✓**
- Endpoint methods/paths
- Middleware order

**Approximate (via AI reading, ~80-90% accuracy) — ≈**
- Request validation matching
- Response structure matching
- Error code/status matching
- DB operation matching

The review skill marks each verification item with ✓ or ≈ so you know the confidence level.

### Execution time

- Document generation: 10-30 seconds per document
- Review: 5-15 seconds per document
- Sync: 10-20 seconds per document

### Best for

- Web API projects (REST/GraphQL) with any framework
- Projects with web screens and wireframes
- Batch jobs and backend modules

### Not suitable for

- Projects where endpoints/screens are generated fully dynamically at runtime with no static source pattern
- Non-web applications (embedded systems, games)

### Why no review exceptions / rule accumulation

We deliberately do not support accumulating review exceptions or custom rules in knowledge.md. AI judgment of such lists degrades at scale — this is a known failure pattern across AI coding tools. Only ast-grep patterns (programmatic execution, not AI judgment) are stored as knowledge.

## Templates

4 built-in templates. Auto-selected or manually specified:

| Template | Use case |
|----------|----------|
| api | REST/GraphQL API endpoints |
| screen | UI screens and pages |
| batch | Batch and background jobs |
| module | Other feature modules |

If none fits, the generate skill auto-structures sections based on source code characteristics.

Templates are customizable — edit files under `skills/generate/templates/`.

## Rules

11 writing rules for quality checks:

- **Always apply (1-4):** Terse style, mermaid diagrams, no wrapper headings, overview first
- **Code present only (5-11):** table.column format, source attribution, implementation locations, unified endpoint format, JSON samples from implementation, unified numbered format, no duplicate implementation sections

See [skills/review/rules/default.md](skills/review/rules/default.md) for full details with examples.

## Supported scenarios

- **Code present** — retrofit design documents onto an existing project
- **Code not present** — write design documents before implementation (sections marked as TBD)
