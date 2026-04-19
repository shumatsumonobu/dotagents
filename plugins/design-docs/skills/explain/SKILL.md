---
name: explain
description: Answer questions about design and features. Investigates design documents and source code to explain processing flows, specifications, and architecture. Use for "how does this work?", "what is this feature?", "why is this designed this way?".
disable-model-invocation: true
argument-hint: [question e.g. How does user registration work?]
allowed-tools: Read Grep Glob Bash
---

# design-docs:explain

Investigate design documents and source code to answer questions about features, specifications, and processing flows.

## Language

All responses must be in the language specified by `language` in `design-docs.config.md`.

## Iron Law

1. When design document and source code differ, present both (never assume one is correct)
2. Never write low-confidence answers in assertive tone
3. Never expand answers beyond the scope of the question

## Steps

### 1. Identify question target

Reference the documents table in `design-docs.config.md` to identify relevant design documents. If config.md is not found, tell the user to run `/design-docs:init` first and stop.

If the argument is a document name, target that document. If it's a question, match keywords to identify the relevant document.

### 2. Determine code presence

If entry point column contains a file path → code present. If it contains a feature name → code not present.

### 3. Collect information

#### Code present

a. **Read design document** — most reliable source.

b. **Trace related code with code-review-graph:**
```bash
if [ ! -f .code-review-graph/graph.db ]; then
  PYTHONUTF8=1 code-review-graph build
else
  PYTHONUTF8=1 code-review-graph update
fi
```
Identify files related to the entry point from the dependency graph.

c. **Read source code** — when design document doesn't exist or is insufficient.

d. Collect information in priority order: design document → source code → DB schema.

#### Code not present

a. Answer based on design document content only.
b. Explicitly state that the answer is based on design document only as source is not yet implemented.

### 4. Create response

Follow these guidelines:

- Explain processing flows as **numbered steps**
- Use **mermaid** diagrams where helpful
- Always cite information sources (design document file path, source code file path::method name)
- When design document and source code differ, **present both** and provide evidence for which is more current

### 5. Response format

```markdown
## {Question summary}

### Overview
{1-3 sentence summary}

### Details
{Processing flow and specification details}

### Sources
- Design doc: `{file path}` (v{version}, commit `{hash}`)
- Source code: `{file path}`, `{file path}`
```

### 6. When unable to answer

If information is insufficient:
- State "Based on source code reading as design document has not been created"
- Mark low-confidence parts as "speculative"
- Indicate areas requiring further investigation
