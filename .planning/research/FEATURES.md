# Feature Landscape

**Domain:** Type-stub monorepo / build reference library
**Researched:** 2026-04-01

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `tsc --noEmit` passes for all TS packages | Type stubs that don't compile are useless | Med | 28 packages, strict mode, cross-package refs |
| `pip install -e` works for Python packages | Must be installable to be usable | Low | 3 packages, standard pyproject.toml |
| Cross-package imports resolve | `@claude-patterns/permission-system` must resolve from any package | Med | Workspace protocol + tsconfig paths |
| Single `make type-check` validates everything | Monorepo without unified validation is just scattered files | Low | Makefile target wrapping tsc |
| Each package has README with source references | Core value prop -- mapping to Claude Code source | Med | 31 READMEs with source paths, LOC estimates |
| Dependency graph is documented | Users need to know build order and relationships | Low | Markdown graph in root docs |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Tier-based organization (extract/build/translate) | Tells user HOW to use each package, not just what it contains | Low | Directory structure + README annotations |
| Source file path references in stubs | Jump from stub to exact Claude Code source location | Low | TODO comments with file paths |
| P0-P3 priority labeling | Guides build order for consumers | Low | Already defined in KB v2.1 |
| Pattern cross-references | Links between related subsystems (e.g., permission-system <-> yolo-classifier) | Med | Dependency graph + README links |
| Scaffold validation (`make scaffold-check`) | Ensures structural consistency across 31 packages | Low | Bash script checking required files |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Runtime implementations | Scope explosion, 512K+ LOC. This is a reference library. | Type stubs + TODO comments only |
| Unit tests | No behavior to test -- stubs have no logic | Validate with `tsc --noEmit` |
| npm publishing | Packages consumed by copy, not install | Workspace-local references only |
| CI/CD pipeline | Single developer, build reference only | Makefile targets are sufficient |
| Auto-generation from source | Claude Code source may not be accessible | Manual stubs from KB v2.1 + source reading |

## Feature Dependencies

```
Root tooling (tsconfig, biome, Makefile) -> All packages
permission-system -> yolo-classifier, dangerous-command-detection
token-estimation -> auto-compact
path-validation -> sandbox-config, dangerous-command-detection
claudemd-memory -> skills-system
mcp-integration -> multi-agent-coordinator
streaming-tool-executor + state-store + token-estimation -> agent-dialogue-loop
```

## MVP Recommendation

Prioritize:
1. Root monorepo scaffold (package.json, tsconfig.base.json, biome.json, Makefile)
2. P0 packages (8 packages -- the dependency foundations)
3. Scaffold validation (`make scaffold-check`)

Defer: Non-P0 packages until scaffold is proven with P0 set. Python packages can follow TS packages since they are independent.
