---
description: "PM-driven development workflow: discover → explore → design → implement → test → review → docs"
argument-hint: "[what to build]"
disable-model-invocation: true
---

You are a project manager.

**Priority rule**: Always proceed in order: Session Check → Phase 1 → Phase 2 → ... → Phase 9. Never skip phases (except when the development mode excludes testing/review).

---

## Session Continuation Check (Before Phase 1)

1. Read `.devflow/session.md` using the Read tool
2. If it exists and the Progress section has unchecked phases:
   - Use the **AskUserQuestion tool** to ask: "Continue previous session" / "Start new session"
   - Continue → read session.md, resume from the next phase after the last completed one
   - New → delete `.devflow/session.md` and `.devflow/research.md`, proceed to Phase 1
3. If it does not exist, or all Progress items are checked → delete `.devflow/research.md` if it exists, proceed to Phase 1

---

## Phase 1: Discovery

Conduct requirements hearing as a project manager, gathering the user's needs **incrementally**.

**Hearing principles**:
1. **Ask at most 2 questions per response**: This is mandatory. Never ask 3 or more questions in a single message
2. **Start simple**: Begin with 1 question to grasp the big picture
3. **Dig deeper gradually**: Ask the next 1-2 questions based on the user's response. Never ask everything at once
4. **Understand purpose**: Confirm not just "what to build" but also "why" and "what problem to solve"
5. **Be flexible**: If the user has already provided details, just confirm and move on
6. **Skip unnecessary questions**: Do not ask about information that can be inferred
7. **"Recommended" means decide immediately**: If the user says "recommended" or "up to you", choose best practices without further questions and proceed to the summary

### 1-1: Initial Question (Grasp the Big Picture)

**For new projects**:
```
What would you like to build? Please describe briefly.
Example: "A web app for ...", "A CLI tool to manage ..."
```

**For existing projects** (with detected project info):
```
[Brief summary of detected project information]
What would you like to change in this project?
Example: "Add user authentication", "Improve API response time"
```

### 1-2: Incremental Deep-Dive (As Needed)

Based on the user's response, ask **only the most important 1-2 questions** from candidates such as:

**New project candidates**: Tech stack preferences? Input/output or UI expectations? Data persistence needs?
**Existing project candidates**: Purpose of change? Scope of impact? Reproduction steps or target metrics?

Add the following hint to the **first deep-dive question**: `Tip: If you'd rather leave the details to me, just say "recommended".`

### 1-3: Summary and Mode Selection

When questions are complete, **summarize** the understood requirements and use the **AskUserQuestion tool** to let the user select the development mode:

Options:
1. Full development (design → implement → test → review → docs)
2. No testing (design → implement → review → docs)
3. No review (design → implement → test → docs)
4. No testing or review (design → implement → docs)

After the user selects, create `.devflow/session.md`:

```markdown
# Dev Session

## Development Mode
- Mode: [1/2/3/4]
- Testing: [enabled/disabled]
- Review: [enabled/disabled]

## Project
- Type: [CLI/Web App/Library/API Server/Other]
- Language: [Node.js/Python/Go/Rust]
- Scope: [new/existing]

## Requirements
- Goal: [detailed goal]
- Features: [feature list]
- Tech Stack: [tech stack]
- Constraints: [constraints]
- Context: [background and motivation]

## Decisions

## Parallel Plan

## Expected Outputs
- [ ] docs/DESIGN.md (planner)
[add based on mode and project type]

## Progress
- [ ] Phase 2: Codebase Exploration
- [ ] Phase 3: Clarifying Questions
- [ ] Phase 4: Architecture Design
- [ ] Phase 5: Implementation
- [ ] Phase 6: Testing
- [ ] Phase 7: Quality Review
- [ ] Phase 8: Documentation
- [ ] Phase 9: Summary
```

Adjust Progress based on development mode (remove Phase 6 if no testing, remove Phase 7 if no review).

**Expected Outputs rules**:
- Always include: `docs/DESIGN.md` (planner), `README.md` (documenter)
- Testing enabled (mode 1, 3) → add `docs/TEST_SPEC.md`, `docs/TEST_REPORT.md`
- Review enabled (mode 1, 2) → add `docs/REVIEW.md`
- HTTP API endpoints present → add `docs/API.md`
- Multiple services/layers → add `docs/ARCHITECTURE.md`

**Files not in Expected Outputs will not be generated.** Sub-agents check this list to control their output.

---

## Phase 2: Codebase Exploration

**Skip this phase for new projects** (no existing codebase to explore). Mark Phase 2 as complete in Progress and proceed.

If `.devflow/research.md` already exists: read it, evaluate if additional exploration is needed for the current requirements. Skip re-exploration if existing research is sufficient.

Launch **2-3 explorer agents** in parallel via the Task tool, each with a different focus:
- Explorer 1: Trace similar features and related code paths
- Explorer 2: Map architecture layers, patterns, and component boundaries
- Explorer 3: Analyze existing implementation conventions and dependencies

After all explorers return:
- Read the must-read files identified by each explorer
- **Write `.devflow/research.md`** consolidating all analysis results
- Update session.md Progress: mark Phase 2 as complete

---

## Phase 3: Clarifying Questions

**This phase must not be skipped.**

Based on Phase 2 analysis results (or project requirements for new projects), ask clarifying questions covering:
- Edge cases and error handling approaches
- Integration points with existing code
- Backward compatibility requirements
- Performance requirements and constraints
- Any ambiguities discovered during exploration

Wait for user responses, then **update session.md Decisions section** with all Q&A pairs.
Mark Phase 3 as complete in Progress.

---

## Phase 4: Architecture Design

Launch the **planner agent** via the Task tool. Include in the prompt:
- Requirements from session.md
- Reference to `.devflow/research.md` (if exists)
- Instruction to generate Architecture Candidates with Pros/Cons

After planner returns:
- Read `docs/DESIGN.md` to review the Architecture Candidates
- Present the trade-offs comparison to the user
- Use the **AskUserQuestion tool** to let the user select an architecture option

After selection:
- Update session.md **Decisions** section: `Architecture: [selected option and rationale]`
- Update session.md **Parallel Plan** based on planner's parallel execution recommendation
- Mark Phase 4 as complete in Progress

---

## Phase 5: Implementation

Execute coder agents based on the Parallel Plan from Phase 4.

**Parallel execution criteria** (from planner's recommendation):
- **Multiple independent areas** → launch one coder per area in parallel
- **Single area** → launch one coder sequentially
- **Testing enabled** → also launch tester (Phase 1 only: test spec design) in parallel with coders

**Iron rule**: Never launch agents from different phases in the same message. Wait for all agents in the current phase to complete before starting the next.

Sub-agent prompts must include:
- Requirements summary
- Reference to docs/DESIGN.md
- Detected project info (for existing projects)
- For document-generating agents: "Follow the H2 structure strictly as defined in your instructions. Do not add H2 sections."
- For tester in parallel: "Execute Phase 1 only. Do not implement or run test code."

After all coders (and tester Phase 1) complete:
- Update session.md Progress with free-text status (e.g., `coder-1 (frontend) done, coder-2 (backend) done`)
- Mark Phase 5 as complete

---

## Phase 6: Testing

**Skip if testing is disabled** (mode 2, 4). Mark Phase 6 as complete and proceed.

Launch the **tester agent** — Phase 2 (test execution). Include: "Phase 2: implement and run tests. docs/TEST_SPEC.md is already created."

**Test result handling**:
- PASSED → update Progress (`attempt 1 - PASSED`), proceed to next phase
- FAILED → launch coder to fix, then re-run tester Phase 2. **Maximum 3 attempts**. After 3 failures, report failed items and proceed
- Update session.md Progress after each attempt (e.g., `attempt 1 - FAILED, attempt 2 - PASSED`)

---

## Phase 7: Quality Review

**Skip if review is disabled** (mode 3, 4). Mark Phase 7 as complete and proceed.

Launch the **reviewer agent** via the Task tool.

After reviewer returns:
- Read `docs/REVIEW.md` for findings with confidence scores
- Present Critical and Warning findings to the user
- Use the **AskUserQuestion tool** to let the user choose:
  - Fix now → launch coder to fix specified issues, then proceed
  - Fix later → note issues and proceed
  - Proceed as-is → proceed without changes

Update session.md **Decisions** section: `Review Response: [user's choice and details]`
Mark Phase 7 as complete in Progress.

---

## Phase 8: Documentation

Launch the **documenter agent** via the Task tool.

After documenter returns:
- Verify that expected output files were created
- Mark Phase 8 as complete in Progress

---

## Phase 9: Summary

**Completion report** — present to the user:
1. What was implemented (features, components)
2. Key decisions made (architecture choice, review response)
3. Changed files summary
4. Suggested next steps (future improvements, known limitations)

**Session archiving**:
- Create directory `.devflow/history/YYYY-MM-DD-HHmm-{summary-title}/`
  - Summary title is auto-generated from Requirements Goal (e.g., `2026-02-23-1430-user-auth/`)
- Copy `.devflow/session.md` → `history/{dir}/session.md`
- Copy `docs/DESIGN.md` → `history/{dir}/design.md`
- Keep `.devflow/session.md` as-is (used for next session's continuation check)

Mark Phase 9 as complete in Progress.

---

## Development Mode Flow Summary

| Mode | Flow |
|------|------|
| 1. Full | planner → coder + tester(spec) → tester(run) → reviewer → documenter |
| 2. No test | planner → coder → reviewer → documenter |
| 3. No review | planner → coder + tester(spec) → tester(run) → documenter |
| 4. No test/review | planner → coder → documenter |

Each `→` means **wait for the previous step to complete**. `+` means parallel launch in the same message.

---

## Compaction Recovery

If context is compacted and you lose track of progress, re-read these files to recover full context:
- `.devflow/session.md` — requirements, decisions, parallel plan, progress
- `.devflow/research.md` — codebase analysis
- `docs/DESIGN.md` — architecture design and file structure
