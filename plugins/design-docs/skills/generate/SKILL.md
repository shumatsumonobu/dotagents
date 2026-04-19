---
name: generate
description: Generate design documents from source code analysis using templates and project-specific patterns. Use when asked to create or write design documents.
disable-model-invocation: true
argument-hint: [document name e.g. users-api.md]
allowed-tools: Read Grep Glob Bash Write
---

# design-docs:generate

Generate design documents from source code or hearing content using templates and patterns from `design-docs.knowledge.md`.

## Language

All output (design document content, messages to user) must be in the language specified by `language` in `design-docs.config.md`.

**Important:** Templates are written in English, but the generated design document must use the configured language. This includes:
- Section headings (e.g. "Revision History" → "改訂履歴" for Japanese)
- Table headers (e.g. "Method" → "メソッド")
- Placeholder descriptions and labels
- All prose content

Do NOT output English headings when `language: ja` is configured.

## Iron Law

1. Never write information that does not exist in the source code (for code-not-present, mark as "TBD — to be filled after implementation")
2. Never write files without user approval
3. Never omit required template sections

## Steps

### 1. Identify target

Read `design-docs.config.md` and get info for the specified document (or all documents). If config.md is not found, tell the user to run `/design-docs:init` first and stop.

- With argument → specified document only
- Without argument → process all documents sequentially (staged generation)

### 2. Determine code presence and output path

If the entry point column contains a file path (e.g. `src/...`) → code present. If it contains a feature name in natural language → code not present.

Output path: `{config.md settings.output}/{document name}` (e.g. `docs/design/users-api.md`).

### 3. Load patterns from knowledge.md

Read `design-docs.knowledge.md`. Extract patterns by Section.

- **If knowledge.md doesn't exist or is empty (no patterns):**
  - For code-present case: tell user "Patterns not set up. Run `/design-docs:init` to infer patterns from your code" and stop.
  - For code-not-present case: continue (no patterns needed).
- **If patterns exist:** use them in step 5 (Collect information and generate) for extraction.

### 4. Select template

Check the template type from config.md. If one of the 4 standard templates (api/screen/batch/module) matches, use it. If none fits well, auto-generate an appropriate section structure based on the source code's characteristics, using the standard templates as reference. In this case, the review skill will skip template structure validation and only check rules.

Templates (section headings must be translated to match the configured language):
- [api.md](templates/api.md)
- [screen.md](templates/screen.md)
- [batch.md](templates/batch.md)
- [module.md](templates/module.md)

### 5. Collect information and generate

#### Code present

a. **Update code graph and identify related files:**

```bash
if [ ! -f .code-review-graph/graph.db ]; then
  PYTHONUTF8=1 code-review-graph build
else
  PYTHONUTF8=1 code-review-graph update
fi
PYTHONUTF8=1 code-review-graph wiki
```
Read markdown files under `.code-review-graph/wiki/` and identify related files from the community member list that the entry point belongs to.

b. **Extract structural info using patterns from knowledge.md:**

For each section of the selected template, find the matching pattern in knowledge.md (by Section field) and run:

```bash
sg --pattern '<pattern from knowledge.md>' --lang <language from knowledge.md> --json=compact <target files>
```

Use the `Scope` field to determine which files to run the pattern on. If no pattern is defined for a section, fall back to direct source reading.

c. **Read source directly for content that can't be pattern-matched** (validation logic, branch conditions, transaction handling, response shaping, etc.).

d. **Generate design document using the selected template** — fill each section with collected information.

e. **Record commit hash in revision history:**
```bash
git rev-parse --short HEAD
```

#### Code not present

a. Generate skeleton from the selected template using config.md hearing content and feature names.

b. Fill sections with "TBD — to be filled after implementation". However, fill these if info is available:
- Overview (feature description)
- Processing flow (expected flow as mermaid diagram)
- API list and data structures

c. Set revision history source commit to "- (not implemented)".

### 6. Wireframe processing (screen template only)

1. Check if existing HTML wireframes exist in the output `assets/` directory
2. **If exists** → convert to PNG with Playwright:
   ```bash
   node ${CLAUDE_SKILL_DIR}/../../scripts/screenshot.js {HTML path} {PNG path}
   ```
3. **If not** → generate HTML wireframe from source (code present) or hearing content (code not present) → convert to PNG
4. Embed the PNG in the "Screen Layout" section as `![Wireframe](assets/{name}-wireframe.png)`
5. If Playwright is not installed → warn that wireframe image was skipped

**HTML wireframe rules:**
- Black and white only (no colors)
- All text in black `#000` (no light text)
- Simple borders `1px solid #000`
- No decorative design (purpose is to confirm layout and items)

### 7. User approval

Present the full design document to the user and write to file only after approval.

### 8. Staged generation (multiple documents)

When processing all documents without argument, process one at a time. When generating the next document, include only related existing design documents in context (identified by code-review-graph dependency graph).

## Information Collection Guidelines (code present)

Defines what to collect via patterns (from knowledge.md) vs direct Read for each section. Use patterns to grasp structure first, then Read only where detail is needed.

| Section | From knowledge.md patterns | From direct Read |
|---------|---------------------------|------------------|
| API list | Endpoint definitions (match entries with Section = "API list") | — |
| Request parameters | — | Validation definitions |
| Response | — | Response object shaping code |
| Error response | — | Error throws and status codes |
| Processing flow | Function signatures (match entries with Section = "Processing flow") | Branch conditions, transaction handling |
| DB operations | Model/repository calls (match entries with Section = "DB operations") | WHERE conditions, JOINs, transactions |
| Middleware | Middleware chains (match entries with Section = "Middleware") | Auth/authorization logic details |
| Screen item definitions | Component props/state (match entries with Section = "Screen items") | Validation, event handlers |
| Batch target data | — | SQL queries, target condition logic |

If knowledge.md is missing a pattern for a section, fall back to direct Read of the relevant files (identified via Phase 3 samples from init).

## Pattern size monitoring

Count entries with `grep -c "^- \*\*Section:" design-docs.knowledge.md`. If the count exceeds 50 → warn the user that the patterns file is large and may indicate consolidation is needed. Continue execution.

## Writing rules

Generated documents must follow all rules in [rules/default.md](../review/rules/default.md).
