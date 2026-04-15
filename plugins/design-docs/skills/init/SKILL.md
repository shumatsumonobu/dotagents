---
name: init
description: Set up the design document environment for a project. Analyzes source code to propose document splits and generates design-docs.config.md. Use for initial setup or reconfiguration.
disable-model-invocation: true
argument-hint: (no arguments)
allowed-tools: Read Grep Glob Bash Write
---

# design-docs:init

Set up the design document environment and generate `design-docs.config.md`.

## Language

All messages to the user must be in the language selected during the hearing (step 2). If reconfiguring (config.md already exists), use the `language` setting from the existing config.md.

## Iron Law

1. Never write `design-docs.config.md` without user confirmation
2. Never state auto-detection results as fact — always say "estimated" or "detected"
3. Never reference non-existent files when no source code is present

## Steps

### 1. Check for existing config

Check if `design-docs.config.md` exists in the project root.

- **If exists**: Ask the user "Existing configuration found. Overwrite?" — if No, stop.
- **If not exists or overwrite selected**: Proceed to step 2.

### 2. Hearing

Ask the user the following via AskUserQuestion:

1. **Document language** — Japanese / English (default: Japanese)
2. **Output directory** — suggest `docs/design/` as default
3. **Source code availability** — does source code already exist?

### 3. Required tool check (code-present only)

Verify tools are installed:

```bash
PYTHONUTF8=1 code-review-graph --version
sg --version
```

If either is missing, show an error message and stop. Tell the user to install the required tools and refer to the README.

### 4. Branch processing

#### Code present

a. **Verify git repository** — run `git rev-parse --is-inside-work-tree`. If not a git repo, inform the user that code-review-graph requires a git repository and stop.

b. **Build or update the code graph:**
```bash
if [ ! -f .code-review-graph/graph.db ]; then
  PYTHONUTF8=1 code-review-graph build
else
  PYTHONUTF8=1 code-review-graph update
fi
```

Before running, inform the user that a `.code-review-graph/` directory will be created containing a SQLite database of the code structure. Recommend adding `.code-review-graph/` to `.gitignore` (it contains absolute paths and is machine-specific).

c. **Combine 3 sources to generate a document split proposal:**

Community detection alone is insufficient (e.g., Express anonymous router callbacks are not included in communities). Combine these 3 sources:

**Source 1: code-review-graph wiki (detect services, batches, utilities)**
```bash
PYTHONUTF8=1 code-review-graph wiki
```
Read `.code-review-graph/wiki/index.md` to get the community list.

**Source 2: ast-grep (detect API route files)**
```bash
sg --pattern 'router.$METHOD($PATH, $$$)' --lang js --json=compact
```
Identify files containing endpoint definitions → api template candidates. Exclude matches under node_modules.

**Source 3: Glob (detect screen files)**
Search for HTML/JSX/TSX/Vue files under `pages/`, `views/`, `components/` → screen template candidates.

d. **Auto-detect framework** — check `package.json`, `requirements.txt`, `go.mod`, `pom.xml`, etc. and estimate the framework.

e. **Determine template types:**
- Files with endpoint definitions found by Source 2 → api
- Screen files found by Source 3 → screen
- Communities with files primarily under batch/jobs/cron → batch
- Everything else → module

f. **Present split proposal to user:**
Present the combined proposal as a table. Mark all detections as "estimated". Get user confirmation.

g. **Generate config.md** — write only after user approval.

#### Code not present

a. **Additional hearing:**
- What to build (API, screen, batch, etc.)
- List of main features
- Planned technology stack

b. Propose document splits based on hearing results.

c. **Generate config.md** — entry point column contains feature names. Inform the user they can re-run `/design-docs:init` after implementing code to update to file paths.

### 5. config.md format

```markdown
# design-docs.config.md

## settings
- output: {output directory}
- language: {ja / en}
- framework: {framework name} ({auto-detected / user-specified})

## documents
| Document | Template | Entry Point |
|----------|----------|-------------|
| {name}.md | {api/screen/batch/module} | {file path or feature name} |
```

### Reference: Templates

See template details:
- [api.md](../generate/templates/api.md)
- [screen.md](../generate/templates/screen.md)
- [batch.md](../generate/templates/batch.md)
- [module.md](../generate/templates/module.md)
