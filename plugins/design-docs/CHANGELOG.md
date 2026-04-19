# Changelog

## 1.0.0 (2026-04-19)

Initial release.

### Commands

- `/design-docs:init` — project setup with 5-phase flow (hearing → sample detection → pattern inference → verification → save)
- `/design-docs:generate` — design document generation from source code or hearing
- `/design-docs:sync` — detect code changes and propose document updates
- `/design-docs:review` — quality review against templates and rules
- `/design-docs:explain` — Q&A about design and features

### Pattern-driven design (framework-agnostic)

- `design-docs.knowledge.md` stores project-specific ast-grep patterns inferred during init
- No hardcoded framework list — works with any language/framework
- Patterns are inferred from user-provided sample files with match result verification

### Templates

- api — REST/GraphQL API endpoints
- screen — UI screens with wireframe support
- batch — batch and background jobs
- module — general feature modules
- Auto-structure fallback for non-standard patterns

### Tools

- code-review-graph integration (dependency graph, community detection, blast radius)
- ast-grep integration (structural code extraction)
- Playwright integration (wireframe screenshots, optional)

### Quality

- 11 writing rules with quality checklist
- Verification classification: ✓ exact (ast-grep) vs ≈ approximate (AI judgment)
- Sync with ast-grep diff for reliable new/removed endpoint detection

### Other

- Multi-language support (ja/en) via config
- Code-present and code-not-present scenarios
- Staged generation for multi-document consistency
