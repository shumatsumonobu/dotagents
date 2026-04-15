# Changelog

## 1.0.0 (2026-04-15)

Initial release.

### Features

- `/design-docs:init` — project setup with auto-detection of code structure
- `/design-docs:generate` — design document generation from source code or hearing
- `/design-docs:sync` — detect code changes and propose document updates
- `/design-docs:review` — quality review against templates and rules
- `/design-docs:explain` — Q&A about design and features

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

### Other

- 11 writing rules with quality checklist
- Multi-language support (ja/en) via config
- Code-present and code-not-present scenarios
- Staged generation for multi-document consistency
