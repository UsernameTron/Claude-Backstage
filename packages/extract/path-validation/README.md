# @claude-patterns/path-validation

Multi-layer path validation: UNC, tilde TOCTOU, shell expansion, glob.

## Source Reference

- **Files:** `utils/permissions/pathValidation.ts`
- **LOC:** 485
- **KB Section:** 10 — Path Validation
- **Tier:** Extract P2

## Key Concepts

- **4-layer validation** — UNC credential leak, tilde TOCTOU, shell expansion ($VAR), glob pattern
- **Case normalization** — Defense against case-insensitive filesystems (macOS/Windows)
- **Dangerous file lists** — Code execution vectors (.bashrc, .gitconfig, .mcp.json)
- **Operation-aware** — Stricter validation for write/delete than read

## Exports

- `FileOperationType` — Type: read, write, create, delete
- `PathCheckResult` — Interface: allowed, reason, per-check results
- `DANGEROUS_FILES` / `DANGEROUS_DIRECTORIES` — Readonly arrays
- `validatePath()` — Multi-layer validation
- `isPathAllowed()` — Permission-aware path check
- `expandTilde()` — Safe tilde expansion (rejects ~user, ~+, ~-)
- `isDangerousRemovalPath()` — Blocks dangerous deletions
- `normalizeCaseForComparison()` — Case normalization
- `isClaudeConfigFilePath()` — Claude config file detection

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** sandbox-config, dangerous-command-detection
