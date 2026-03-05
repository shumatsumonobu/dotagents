[日本語版 README はこちら](README.ja.md)

# Flux

A plugin collection that accelerates your Claude Code development workflow.

## Available Plugins

### [DevFlow](devflow/README.md)

Just say what you want to build. 6 specialized agents handle the full cycle — codebase exploration, design, implementation, testing, review, and documentation — automatically.

```
You:     /devflow:dev
         "Add a chat feature using Gemini API"

DevFlow: Web UI or CLI? Save conversation history?
You:     Web UI. Session-only is fine.

DevFlow: Which architecture?
         [Option 1: Minimal]  [Option 2: Clean]  [Option 3: Balanced]
You:     (clicks Option 2)

-> Automatically runs explore -> design -> code -> test -> review -> docs
```

**Features**: Conversational requirements, codebase exploration, architecture candidates, multi-language (TS/JS, Python, Go, Rust), parallel execution, development modes, auto-fix loop, confidence scoring, session history, security checks, memory

## Installation

### 1. Add marketplace

```
/plugin marketplace add takuya-motoshima/flux
```

### 2. Install plugin

```
/plugin install devflow@flux
```

Choose your preferred scope:

| Scope | Usage |
|-------|-------|
| **user** (default) | Available across all projects |
| **project** | Shared with team via Git |
| **local** | Personal use, Git excluded |

### 3. Restart and verify

Restart Claude Code, then run:

```
/agents
```

## Requirements

- Claude Code >= 1.0.0

## License

MIT

## Author

Takuya Motoshima ([@takuya-motoshima](https://github.com/takuya-motoshima))
