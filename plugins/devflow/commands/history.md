---
description: "Search and browse past development session history"
argument-hint: "[search keyword or date]"
disable-model-invocation: true
---

# DevFlow: History

Browse past development sessions archived in `.devflow/history/`.

## Execution Steps

1. **Find session archives**: Use Glob to find `.devflow/history/*/session.md`

2. **If no archives found**: Report "No session history found. Sessions are archived when `/devflow:dev` completes Phase 9."

3. **If archives found**:
   - Read each `session.md` and extract: date (from directory name), Goal, Features, Tech Stack, Development Mode, Architecture decision
   - If `$ARGUMENTS` is provided: filter sessions where the directory name or content matches the keyword
   - Display a summary table of matching sessions

4. **Output format**:

```
## Session History

| Date | Goal | Tech Stack | Mode |
|------|------|------------|------|
| 2026-02-23 14:30 | User authentication | Node.js + Express | Full |
| 2026-02-20 10:15 | API refactoring | Go + Gin | No test |

Total: X sessions found
```

5. **If user wants details**: When only one session matches (or user specifies), show the full session.md content and note that `design.md` is also available in the same directory for architecture details.
