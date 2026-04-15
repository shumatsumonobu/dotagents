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

Set up the design document environment.

```
/design-docs:init
```

- Asks about document language, output directory, and code availability
- Analyzes source with code-review-graph and ast-grep to auto-propose document splits
- Generates `design-docs.config.md`

### `/design-docs:generate [doc-name]`

Generate design documents.

```
/design-docs:generate todos-api.md    # specific document
/design-docs:generate                 # all documents (staged)
```

- Selects the appropriate template (api/screen/batch/module) or auto-structures
- Extracts endpoints, validation, DB operations from source code
- Generates wireframe images for screen templates (requires Playwright)
- Requires user approval before writing files

### `/design-docs:sync [doc-name]`

Detect code changes and propose document updates.

```
/design-docs:sync todos-api.md       # specific document
/design-docs:sync                    # all documents
```

- Identifies base commit from revision history
- Uses blast radius analysis to find impacted scope
- Classifies changes as "needs update" or "no impact"
- Requires user approval before editing

### `/design-docs:review [doc-name]`

Review document quality.

```
/design-docs:review todos-api.md     # specific document
/design-docs:review                  # all documents
```

- Checks template structure compliance
- Validates 11 writing rules
- Cross-checks against source code with ast-grep
- Outputs results as a checklist

### `/design-docs:explain [question]`

Answer questions about design and features.

```
/design-docs:explain How does the TODO CRUD work?
/design-docs:explain What is the auth flow?
```

- Investigates both design documents and source code
- Explains with numbered steps and mermaid diagrams
- Cites sources (file paths, method names)

## Demo

A working Express app is included in `examples/todo-app/`.

```bash
# Set up the demo app
cd examples/todo-app
npm install
cd ../..

# Initialize
/design-docs:init

# Generate a design document
/design-docs:generate todos-api.md

# After making code changes, sync
/design-docs:sync todos-api.md

# Review quality
/design-docs:review todos-api.md
```

## Configuration

`/design-docs:init` generates `design-docs.config.md`:

```markdown
# design-docs.config.md

## settings
- output: docs/design/
- language: ja
- framework: express (auto-detected)

## documents
| Document | Template | Entry Point |
|----------|----------|-------------|
| todos-api.md | api | src/routes/todos.js |
| dashboard.md | screen | src/pages/dashboard.html |
| cleanup.md | batch | src/batch/cleanup.js |
| logger.md | module | src/utils/logger.js |
```

See [config/config.example.md](config/config.example.md) for a full example including code-not-present format.

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
