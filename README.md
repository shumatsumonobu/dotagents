# dotagents

Agents, unchained.

A Claude Code plugin marketplace. Two plugins live here: one runs a development cycle end to end,
the other keeps design documents in step with the code they describe.

## Install

```shell
/plugin marketplace add shumatsumonobu/dotagents
/plugin install devflow@dotagents
/plugin install design-docs@dotagents
```

Each install opens that plugin's details, where you choose a scope.

| Scope | Reaches |
|---|---|
| **user** | You, in every project |
| **project** | Everyone on this repository, through `.claude/settings.json` |
| **local** | You, in this repository only |

The install summary tells you whether the plugin is live. `Plugin is now active.` means it is.
`Run /reload-plugins to activate.` means run that command.

To see what a plugin added, open `/plugin` and select it under **Installed**.

Third-party marketplaces do not auto-update. Pull later changes with:

```shell
/plugin marketplace update dotagents
```

## DevFlow

Say what you want built. Six agents carry it from reading the codebase through design,
implementation, tests, review, and documentation, asking questions instead of expecting a spec.

```shell
/devflow:dev       # the full pipeline
/devflow:explore   # analyse the codebase
/devflow:design    # design document only
/devflow:review    # review with confidence scoring
/devflow:test      # tests only
/devflow:docs      # documentation only
/devflow:history   # browse past sessions
```

Nine phases, four modes from full to prototype-speed, and three architecture candidates put to you
before any code gets written. Session state survives interruption and context compaction.

[Details](plugins/devflow/README.md)

## design-docs

Design documents generated from source, and kept in step with it as the source changes.

```shell
/design-docs:init      # infer patterns from your code, once per project
/design-docs:generate  # write documents from source
/design-docs:sync      # find what the code changed and propose edits
/design-docs:review    # check documents against the source and the writing rules
/design-docs:explain   # answer questions from the documents and the source together
```

Framework-agnostic: `init` reads your actual files and infers the extraction patterns, so there is
no framework list to fall off. Four templates cover APIs, screens, batch jobs, and modules.

Needs [code-review-graph](https://github.com/tirth8205/code-review-graph) and
[ast-grep](https://github.com/ast-grep/ast-grep). Web applications only.

[Details](plugins/design-docs/README.md)

## License

MIT

## Author

shumatsumonobu ([@shumatsumonobu](https://github.com/shumatsumonobu))
