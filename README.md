[English](README.md) | [日本語](README.ja.md)

# dotagents

Agents, unchained.

## Plugins

### [DevFlow](plugins/devflow/README.md)

Just say what you want to build. 6 specialized agents handle the full cycle — exploration, design, implementation, testing, review, and documentation — automatically.

```
You:     /devflow:dev "Add a chat feature using Gemini API"

DevFlow: Web UI or CLI? Save history?
You:     Web UI. Session-only.

DevFlow: Which architecture?
         [Option 1: Minimal]  [Option 2: Clean]  [Option 3: Balanced]
You:     (clicks Option 2)

→ explore → design → code → test → review → docs → done
```

### [design-docs](plugins/design-docs/README.md)

Auto-generate and sync design documents from web application source code. Pattern-driven (framework-agnostic) — init infers ast-grep patterns from your actual code, no hardcoded framework list.

```
You:         /design-docs:init

design-docs: (hearing) What language? Output dir? Code present? Project summary?
You:         TypeScript, docs/design/, yes, Next.js e-commerce backend

design-docs: Detected files: src/routes/users.ts, src/routes/orders.ts, ...
             Is this classification correct?
You:         Yes

design-docs: Inferred patterns → detected 12 endpoints across 3 files. Accurate?
You:         Yes

→ generates config.md + knowledge.md, ready for /design-docs:generate
```

## Install

```
/plugin marketplace add shumatsumonobu/dotagents
/plugin install devflow@dotagents
/plugin install design-docs@dotagents
```

| Scope | Usage |
|-------|-------|
| **user** (default) | Available across all projects |
| **project** | Shared with team via Git |
| **local** | Personal use, Git excluded |

Restart Claude Code, then `/agents` to verify.

## Requirements

- Claude Code >= 1.0.0

## License

MIT

## Author

shumatsumonobu ([@shumatsumonobu](https://github.com/shumatsumonobu))
