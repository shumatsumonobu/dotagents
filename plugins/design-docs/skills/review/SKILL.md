---
name: review
description: Review design documents for quality. Checks template structure, writing rules, and source code consistency. Use for "review", "check docs".
disable-model-invocation: true
argument-hint: [document name e.g. todos-api.md]
allowed-tools: Read Grep Glob Bash
---

# design-docs:review

Review design documents against templates, writing rules, and source code.

## Language

All review output (checklist, findings) must be in the language specified by `language` in `design-docs.config.md`.

## Iron Law

1. Never raise issues based on criteria not in the rules
2. Never judge "mismatch" without verifying source code
3. Never report speculation-based findings as facts

## Steps

### 1. Identify target

Read `design-docs.config.md` and get info for the specified document (or all documents). If config.md is not found, tell the user to run `/design-docs:init` first and stop. Read the target design document.

### 2. Template structure check

Identify the template type (api / screen / batch / module) and compare with [templates](../generate/templates/):

- Do required sections exist (table of contents, revision history, overview)?
- Does section order follow the template?
- Are there unnecessary wrapper headings?

If the document was auto-structured (not using a standard template), skip template structure check.

### 3. Rule check

Check against all rules in [rules/default.md](rules/default.md).

**Always apply (rules 1-4):**
1. Terse style — no polite/formal language mixed in
2. Mermaid diagrams — flow diagrams use mermaid
3. No unnecessary wrapper headings
4. Overview first, details later — processing flow diagram placed right after overview

**Code present only (rules 5-11):**
5. Table.column format
6. Source attribution
7. Implementation location specified
8. Unified endpoint format
9. JSON samples based on implementation
10. Numbered items in unified format
11. No separate implementation locations section

### 4. Source code verification (code present only)

Extract facts from source with ast-grep and cross-check with design document.

**Verification items:**
- Endpoint HTTP methods and paths match route definitions
- Request parameter types and required/optional match validation definitions
- Response JSON structure matches actual response objects
- Error codes and HTTP status match throw/res.status values
- DB operations (tables, columns, conditions) match implementation
- Middleware application order matches route definitions

**Gap check:**
- Endpoints that exist in source but not documented
- Error cases that exist in source but not documented

### 5. Code not present — additional checks

- Source code verification section outputs "Skipped — source not implemented"
- Report TBD section count ("TBD remaining: N items")

### 6. Output results

Output as checklist:

```markdown
## Review Result: {document name}

### Template: {api / screen / batch / module / auto-structured}

### Structure Check
- [x] Required sections (TOC, revision history, overview)
- [x] Section order
- [ ] No unnecessary wrapper headings ← point out location

### Rule Check (1-4: always / 5-11: code present only)
- [x] 1. Terse style
- [x] 2. Mermaid diagrams
- [x] 3. No unnecessary wrapper headings
- [x] 4. Overview first
- [x] 5. Table.column format
- [ ] 6. Source attribution ← point out location
- ...

### Source Code Verification
- [x] Endpoint HTTP methods/paths match route definitions
- [ ] Request parameter types/required match validation definitions ← point out diff
- [x] Response JSON structure matches actual response objects
- [x] Error codes/HTTP status match throw/res.status values
- [ ] DB operations (tables/columns/conditions) match implementation ← point out diff
- [x] Middleware application order matches route definitions

### Findings

#### Must Fix
1. {location} — {specific finding}

#### Recommended
1. {location} — {specific finding}
```
