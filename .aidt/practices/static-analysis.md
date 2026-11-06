<!--
  Practices: static analysis · free tools that cover what SonarQube checks.
  The builder runs them before showing a section; the reviewer runs them as a gate.
  Declare the commands of your project in `.aidt/config.json` → `quality.commands`,
  or in a single script (e.g. `npm run verify`). Edit this file to fit your stack.
-->
# Static analysis without SonarQube

What SonarQube reports, covered with free tools that run locally and in CI.

| Concern | JavaScript / TypeScript | Python | Go |
|---|---|---|---|
| Cognitive complexity | Biome `noExcessiveCognitiveComplexity`, or ESLint + `eslint-plugin-sonarjs` | `ruff` (C901), `radon`, `complexipy` | `gocognit` (golangci-lint) |
| Code smells, bugs | Biome / ESLint + `eslint-plugin-sonarjs` (Sonar's own rules) | `ruff` | `golangci-lint` |
| Duplication | `jscpd` | `jscpd` | `jscpd`, `dupl` |
| Boundaries between flows | `dependency-cruiser` | `import-linter` | `depguard` (golangci-lint) |
| Unused code and exports | `knip` | `vulture` | `deadcode`, `unused` |
| Security (SAST) | Semgrep Community Edition | Semgrep, `bandit` | Semgrep, `gosec` |
| Coverage | Vitest / Jest coverage, minimum only in domain and use cases | `coverage.py` | `go test -cover` |
| Vulnerable dependencies | `npm audit`, Dependabot | `pip-audit`, Dependabot | `govulncheck`, Dependabot |
| Secrets | `gitleaks` | `gitleaks` | `gitleaks` |

## Defaults

- **Cognitive complexity:** at most 15 per function (Sonar's default).
- **Duplication:** fail above 3 % of the code, ignoring tests.
- **Coverage:** a minimum (e.g. 80 % lines) only where the logic lives; never as a project-wide target.
- **Security and dependencies:** fail on high and critical findings; review the rest.
- Everything runs in one command locally and in CI, and CI reports findings as annotations on the PR.

## When SonarQube is worth it

When several teams share the codebase and need a dashboard with history and quality gates per
project, or the repository is public (SonarQube Cloud is free for public projects).
