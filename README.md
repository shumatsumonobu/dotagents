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

## Install

```
/plugin marketplace add shumatsumonobu/dotagents
/plugin install devflow@dotagents
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
