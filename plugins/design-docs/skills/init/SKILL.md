---
name: init
description: Set up the design document environment for a project. Hears project context, detects sample files, infers ast-grep patterns with user confirmation, and generates config.md and knowledge.md. Use for initial setup or reconfiguration.
disable-model-invocation: true
argument-hint: (no arguments)
allowed-tools: Read Grep Glob Bash Write
---

# design-docs:init

Set up the design document environment, generate `design-docs.config.md`, and infer project-specific ast-grep patterns into `design-docs.knowledge.md`.

## Language

All messages to the user must be in the language selected during Phase 1 (Q1). If reconfiguring (config.md already exists), use the `language` setting from the existing config.md.

## Iron Law

1. Never write `design-docs.config.md` or `design-docs.knowledge.md` without user confirmation
2. Never state auto-detection results as fact — always say "detected" or "estimated"
3. Never infer patterns without showing match results for user verification

## Steps

### 1. Check for existing config

Check if `design-docs.config.md` exists in the project root.

- **If exists**: Ask the user "Existing configuration found. Overwrite?" — if No, stop.
- **If not exists or overwrite selected**: Proceed to Phase 1.

### 2. Phase 1: Basic settings (4 questions via AskUserQuestion)

- **Q1: Document language** — Japanese / English (default: Japanese)
- **Q2: Output directory** — suggest `docs/design/` as default
- **Q3: Source code present?** — auto-detect first (check if any source files exist under `src/`, `lib/`, `app/`, etc.), present finding to user for confirmation
- **Q4: Brief project description** — freeform 1-2 lines. Examples:
  - "Laravel で社内管理画面"
  - "Next.js で SaaS フロントエンド + Go API"
  - "Python FastAPI でマイクロサービス"

### 3. Branch by code presence

#### Code present

a. **Required tool check.** Verify tools are installed:

```bash
PYTHONUTF8=1 code-review-graph --version
sg --version
```

If either is missing, show an error message and stop. Tell the user to install the required tools and refer to the README.

b. **Auto-detect language.** Detect primary language from project files (no user question):
- `package.json` → js or ts (check for `.ts` files to distinguish)
- `requirements.txt`, `pyproject.toml`, `setup.py` → py
- `pom.xml`, `build.gradle` → java
- `composer.json` → php
- `go.mod` → go
- `Gemfile` → rb
- Fallback: file extension census in source directories

Store detection result. Used later for ast-grep `--lang` flag.

c. Proceed to Phase 2.

#### Code not present

a. **Additional hearing:**
- What to build (API, screen, batch, etc.)
- List of main features
- Planned technology stack

b. Derive document split candidates from hearing results (will be presented for approval in Phase 5).

c. Skip Phases 2-4. Go to Phase 5 with empty knowledge.md template.

Inform the user: "Since no code exists yet, patterns cannot be inferred. Run `/design-docs:init` again after implementing code to populate `design-docs.knowledge.md` with ast-grep patterns."

### 4. Phase 2: Project structure (1 question, code-present only)

**Q5: What does this project include?** — multi-select:
- REST/GraphQL API
- Web screens (UI)
- Batch jobs / scheduled processes
- Modules / libraries / utilities

### 5. Phase 3: Sample file detection and confirmation (code-present only)

a. **Auto-detect candidate files** via Glob based on Q5 selection:

- **API (if selected):** `{routes,controllers,api,handlers}/**/*.{js,ts,py,java,rb,go,php}`
- **Screens (if selected):** `{pages,views,components,screens}/**/*.{html,tsx,jsx,vue,blade.php,erb}`
- **Batch (if selected):** `{batch,jobs,cron,tasks}/**/*.{js,ts,py,java,rb,go,php}`
- **Modules (if selected):** `{services,utils,lib,helpers}/**/*.{js,ts,py,java,rb,go,php}`

Exclude `node_modules/`, `vendor/`, `dist/`, `build/`, `.git/`.

b. **Present detected files to user:**

```
Detected files for your project:

- Routes/endpoints: src/routes/users.ts, src/routes/orders.ts (2 files)
- Services: src/services/UserService.ts (1 file)
- Models: src/models/User.ts (1 file)
- Screens: src/pages/Dashboard.tsx (1 file)

Does this classification look correct? If not, please specify the correct file paths.
```

c. If user indicates a miss, ask for corrections (which file should be which type, or add missing files).

### 6. Phase 4: Pattern inference and match verification (code-present only)

a. **Read 1-2 samples from each category** with Read tool.

b. **Infer ast-grep patterns from code structure.** Use Claude's understanding of the code to generate appropriate meta-variable patterns.

Example inferences:
- If sample contains `router.get('/users', handler)` → pattern `router.$METHOD($PATH, $$$)`
- If sample contains `Route::get('/users', [...])` → pattern `Route::$METHOD($PATH, $$$)`
- If sample contains `@app.get("/users")` followed by `async def users():` → two patterns (decorator + function)

c. **Run inferred patterns on the project to produce match results:**

```bash
sg --pattern '<inferred pattern>' --lang <detected language> --json=compact <project>
```

d. **Present match results (NOT raw patterns) to user:**

```
Using the inferred patterns, detected:

API endpoints (8 total):
- src/routes/users.ts: GET /users, POST /users, GET /users/:id, PUT /users/:id, DELETE /users/:id
- src/routes/orders.ts: GET /orders, POST /orders, PATCH /orders/:id

Screen files (1): src/pages/Dashboard.tsx
Model files (1): src/models/User.ts
Batch files (0): none detected

Is this detection accurate? If anything is missing, please specify additional sample files.
```

e. **If user indicates mismatch**, iterate: ask for additional samples, refine patterns, re-run match.

f. **If match results are good**, save patterns to knowledge.md (via Phase 5).

### 7. Phase 5: Generate config.md and knowledge.md

a. **Propose document split:**
- **Code present**: based on detected structure (Phase 3 files + Q5 choices). Entry Point column = file paths.
- **Code not present**: based on hearing results from step 3 (Code not present branch). Entry Point column = feature names.

Example (code present):
```
Proposed document split:

| Document | Template | Entry Point |
|----------|----------|-------------|
| users-api.md | api | src/routes/users.ts |
| orders-api.md | api | src/routes/orders.ts |
| dashboard.md | screen | src/pages/Dashboard.tsx |

Approve? If not, specify what to change.
```

Example (code not present):
```
Proposed document split:

| Document | Template | Entry Point |
|----------|----------|-------------|
| users-api.md | api | User CRUD API |
| dashboard.md | screen | Dashboard screen |

Approve? If not, specify what to change.
```

b. **Generate config.md** after approval:

```markdown
# design-docs.config.md

## settings
- output: {output directory}
- language: {ja / en}
- framework: {freeform from Q4 description}

## documents
| Document | Template | Entry Point |
|----------|----------|-------------|
| {name}.md | {api/screen/batch/module} | {file path or feature name} |
```

c. **Generate knowledge.md** with inferred patterns:

**Code present — full template:**
```markdown
# design-docs.knowledge.md

> Project-specific ast-grep patterns inferred during /design-docs:init.
> These are the source of truth for all pattern-based extraction (no framework hardcoding).

## Project context

{Freeform description from Q4}

## Detected language

{Language from step 3b auto-detection}

## Custom ast-grep patterns

- **Section:** API list
  **Pattern:** `{inferred pattern}`
  **Language:** {detected lang}
  **Extracts:** {meta variables}
  **Scope:** `{glob, default covers Phase 3 files}`

- **Section:** Processing flow
  **Pattern:** `{inferred pattern}`
  ...

(one entry per project category confirmed in Phase 4)
```

**Code not present — minimal template:**
```markdown
# design-docs.knowledge.md

> Project-specific ast-grep patterns. To be populated by re-running /design-docs:init after implementing code.

## Project context

{Freeform description from Q4}

## Custom ast-grep patterns

<!-- Run /design-docs:init after implementing code to populate this section -->
```

Note: in the code-not-present template, the `Detected language` section is omitted, and `Custom ast-grep patterns` contains only a placeholder comment (no entries) since no code exists to detect from.

d. **Inform user about git management:**

"Commit both `design-docs.config.md` and `design-docs.knowledge.md` to git for team sharing. Add `.code-review-graph/` to `.gitignore` (machine-specific SQLite data)."

### 8. Summary

Show the user:
- config.md location
- knowledge.md location
- Detected patterns count
- Next steps: `/design-docs:generate {document-name}` to create a design document
