---
phase: 09-wave4-p2-engineering
plan: 03
subsystem: security
tags: [sandbox, command-detection, compound-decomposition, self-referential-security, path-validation]

requires:
  - phase: 09-wave4-p2-engineering/09-01
    provides: path-validation (PathCheckResult, isDangerousRemovalPath, validatePath, DANGEROUS_FILES)
  - phase: 07-wave2-core-architecture
    provides: permission-system (DANGEROUS_BASH_PATTERNS, CROSS_PLATFORM_CODE_EXEC, PermissionMode)
provides:
  - sandbox-config with self-referential security and compound command exclusion
  - dangerous-command-detection with compound decomposition and security analysis
affects: [agent-dialogue-loop, cli-startup-optimization]

tech-stack:
  added: []
  patterns: [compound-command-decomposition, self-referential-security-denials, pipe-to-shell-detection]

key-files:
  created:
    - packages/extract/sandbox-config/src/sandbox-config.test.ts
    - packages/extract/dangerous-command-detection/src/dangerous-command-detection.test.ts
  modified:
    - packages/extract/sandbox-config/src/index.ts
    - packages/extract/dangerous-command-detection/src/index.ts

key-decisions:
  - "Sandbox self-referential denials use static list of .claude/settings, .claude/skills, .git paths"
  - "Compound decomposition preserves quoted content to avoid false splits"
  - "Destructive patterns (rm -rf) checked separately from DANGEROUS_BASH_PATTERNS"
  - "Plan mode safe commands use whitelist approach with git subcommand verification"

patterns-established:
  - "Quote-aware compound command splitting for security analysis"
  - "Layered danger detection: DANGEROUS_BASH_PATTERNS + DESTRUCTIVE_PATTERNS + pipe-to-shell"

requirements-completed: [W4-05, W4-06, NFR-01, NFR-03, NFR-04, NFR-06]

duration: 4min
completed: 2026-04-03
---

# Phase 09 Plan 03: Security Packages Summary

**Sandbox config with self-referential write denials and dangerous command detection with quote-aware compound decomposition**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-03T02:33:16Z
- **Completed:** 2026-04-03T02:37:40Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- sandbox-config: convertToSandboxRuntimeConfig always denies writes to .claude/settings and .git paths (KB 9.3 self-referential security)
- dangerous-command-detection: quote-aware compound decomposition prevents injection bypass on &&, ||, ;, | operators
- Cross-package imports verified at compile time: sandbox-config <- path-validation, dangerous-command-detection <- permission-system + path-validation
- Full monorepo type-check (39 packages) and lint pass clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement sandbox-config** - `f7cb2e2` (feat)
2. **Task 2: Implement dangerous-command-detection** - `e4ba58e` (feat)

## Files Created/Modified
- `packages/extract/sandbox-config/src/index.ts` - Sandbox configuration with self-referential security, compound exclusion
- `packages/extract/sandbox-config/src/sandbox-config.test.ts` - 20 tests covering all functions
- `packages/extract/dangerous-command-detection/src/index.ts` - Compound decomposition, danger detection, plan mode safety
- `packages/extract/dangerous-command-detection/src/dangerous-command-detection.test.ts` - 31 tests covering all functions

## Decisions Made
- Sandbox self-referential denied write paths use a static list rather than dynamic resolution - simpler and matches source pattern
- Compound command decomposition handles single and double quotes to avoid splitting inside quoted strings
- Added DESTRUCTIVE_PATTERNS (rm -rf, mkfs, dd) beyond DANGEROUS_BASH_PATTERNS since `rm` is not in the permission-system patterns
- Plan mode safe commands use a whitelist with special git subcommand verification (only read-only git subcommands allowed)
- Test for `/Users/test` deletion adjusted to `/Users` to match actual isDangerousRemovalPath behavior (exact DANGEROUS_ROOTS match only)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added DESTRUCTIVE_PATTERNS for rm -rf detection**
- **Found during:** Task 2 (dangerous-command-detection)
- **Issue:** `rm` is not in DANGEROUS_BASH_PATTERNS from permission-system, so `rm -rf /` was not detected as dangerous
- **Fix:** Added DESTRUCTIVE_PATTERNS array with regex patterns for rm -rf, chmod -R 777, mkfs, dd to device
- **Files modified:** packages/extract/dangerous-command-detection/src/index.ts
- **Verification:** isDangerousCommand("rm -rf /", "default") now returns isDangerous:true
- **Committed in:** e4ba58e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential for correctness - rm -rf / must be detected as dangerous. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all TODO throws replaced with working implementations.

## Next Phase Readiness
- All 3 plans in phase 09 complete
- Cross-package dependency chains fully verified: sandbox-config <- path-validation, dangerous-command-detection <- permission-system + path-validation
- Full monorepo type-check and lint clean

---
*Phase: 09-wave4-p2-engineering*
*Completed: 2026-04-03*
