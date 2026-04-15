---
name: sync
description: Sync design documents with source code changes. Analyzes impact of code changes and proposes document updates. Use for "update docs", "sync docs", "check diff".
disable-model-invocation: true
argument-hint: [document name e.g. todos-api.md]
allowed-tools: Read Grep Glob Bash Edit Write
---

# design-docs:sync

Analyze source code changes and propose design document updates.

## Language

All messages to the user and update proposals must be in the language specified by `language` in `design-docs.config.md`.

## Iron Law

1. Never edit design documents without user approval
2. Never classify out-of-scope changes as "needs update"
3. Never add sections that don't exist in the design document

## Precondition

**Only works with code present.** If the revision history shows source commit as "- (not implemented)", inform the user to run `/design-docs:sync` after implementing code, and stop.

## Steps

### 1. Identify target

Read `design-docs.config.md` and get info for the specified document (or all documents). If config.md is not found, tell the user to run `/design-docs:init` first and stop.

### 2. Get base commit

Get the latest "Source Commit" value from the target document's revision history table. If "- (not implemented)", show a guidance message and stop.

### 3. Update graph and identify impact scope

```bash
if [ ! -f .code-review-graph/graph.db ]; then
  PYTHONUTF8=1 code-review-graph build
else
  PYTHONUTF8=1 code-review-graph update
fi
PYTHONUTF8=1 code-review-graph detect-changes
```

Get `changed_functions`, `affected_flows`, `risk_score` from the detect-changes JSON output.

> **Note:** `detect-changes` analyzes the most recent commit diff. To capture all changes from the design document's base commit to HEAD, step 4's `git diff` is the primary source. `detect-changes` supplements with risk scores and affected flow identification.

### 4. Get actual changes

Get the actual change content for files in the impact scope:

```bash
git diff {base_commit}..HEAD -- {impacted_file1} {impacted_file2} ...
```

### 5. Determine section impact

Analyze changes and determine which design document sections are affected:

| Change type | Affected sections |
|-------------|-------------------|
| Endpoint add/change/delete | API list, affected API detail |
| Validation change | Request parameters |
| Response structure change | Response (success), JSON samples |
| DB operation change | DB design, processing flow |
| Middleware change | Processing flow, access permissions |
| Screen item change | Screen item definitions, operation specs |
| Batch condition change | Target data, processing flow |

### 6. Classify changes

Classify only impacted changes:

**Design document update needed:**
- Endpoint changes, processing flow changes, DB operation changes
- Validation rule changes, response structure changes
- New feature additions

**No impact (report only):**
- Refactoring (no logic change)
- Comment / log output changes
- Test code changes
- Performance improvements (no behavior change)

### 7. Output update proposal

Output in this format:

```markdown
## Update Proposal: {document name}

### Commit Range
- Base: `{base_commit}`
- Latest: `{latest_commit}`

### Changes Requiring Document Update

#### 1. {change summary}
**Source:** `{file name}`

**Current document text:**
> {quote from design document}

**Proposed update:**
> {updated text}

### No-Impact Changes (reference)
- {refactoring summary, etc.}
```

### 8. User approval and update

Get user approval before editing the document. Support partial approval (apply only selected changes).

After update:
1. Add new row to revision history table (date, version +0.1, latest commit hash, change summary)
2. Apply only approved changes to the design document
