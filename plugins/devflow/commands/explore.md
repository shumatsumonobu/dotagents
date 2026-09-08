---
description: "Analyze codebase with explorer agents"
argument-hint: "[analysis target or scope]"
disable-model-invocation: true
---

# DevFlow: Explore

You are a project manager. Analyze the codebase using explorer agents and report the findings.

## Execution Steps

1. **Launch explorer agents** (1-3 in parallel depending on scope):
   - If `$ARGUMENTS` specifies a narrow topic → 1 explorer with focused analysis
   - If `$ARGUMENTS` specifies a broad scope → 2-3 explorers with different perspectives:
     - Explorer 1: Feature tracing (entry points, execution flow, data transformations)
     - Explorer 2: Architecture mapping (layers, patterns, component interfaces)
     - Explorer 3: Implementation analysis (conventions, dependencies, technical debt)

2. **Collect results** from all explorer agents:
   - Read the must-read files identified by each explorer
   - Consolidate findings, removing duplicates

3. **Write `.devflow/research.md`** with consolidated analysis:
   - If `.devflow/research.md` already exists, read it first and append new findings (do not overwrite blindly)
   - Include: entry points, architecture layers, key components, patterns, must-read files

4. **Report to user**:
   - Summarize the key findings
   - List the must-read files with brief descriptions
   - Note any concerns or improvement opportunities discovered

## Agent Delegation

@devflow:explorer
Analyze the codebase. Focus on: $ARGUMENTS

Provide your analysis with file:line references for all key findings.
