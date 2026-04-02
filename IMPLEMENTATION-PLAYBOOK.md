# Implementation Playbook
## Filling the Rooms: One Package at a Time

**What this is:** A step-by-step guide for implementing each of the 43 packages in your claude-code-patterns monorepo using Claude Code terminal. Each section gives you the exact prompt to copy-paste.

**Core principle:** One package per Claude Code session. Never combine packages. Never rush.

---

## Before You Start: Source Access

Your stub files reference Claude Code source paths like `utils/permissions/denialTracking.ts`. You have two options for providing that source to Claude Code:

**Option A — Mount the source (recommended for Extract tier):**
If you still have the claude-code source tree, put it where Claude Code can see it:
```
~/projects/Inside Claude Code/claude-code/src/
```
Then your prompts can say "read the source at claude-code/src/..." and Claude Code will extract directly from it.

**Option B — Use KB v2.1 only (works for Build + Translate tiers):**
The Knowledge Base has enough detail (constants, types, architecture descriptions) to implement most packages without the raw source. Every stub's README.md references the relevant KB section.

**Bottom line:** Extract-tier packages are faster with the source mounted. Build and Translate tiers don't need it.

---

## The Three Prompt Templates

Each tier needs a different prompting approach. Below are the templates. Copy the one you need, fill in the blanks, paste into Claude Code.

---

### Template 1: EXTRACT (copy from source)
Use for: permission-system, denial-tracking, cost-tracker, and all 16 extract-tier packages

```
I'm implementing the @claude-patterns/{PACKAGE_NAME} package.

CONTEXT:
- Monorepo root: current directory
- Stub file: packages/extract/{PACKAGE_NAME}/src/index.ts
- README: packages/extract/{PACKAGE_NAME}/README.md
- Source reference: claude-code/src/{SOURCE_PATH}
- KB reference: Section {KB_SECTION} in claude-code-technical-knowledge-base-v2.1.md

TASK:
1. Read the stub file and README to understand the interface contract
2. Read the source file(s) at claude-code/src/{SOURCE_PATH}
3. Replace every TODO-throwing function body with working code extracted from the source
4. Adapt imports — remove any Claude Code internal dependencies that aren't in our monorepo
5. Keep the existing type signatures exactly as they are
6. Add a basic test file at packages/extract/{PACKAGE_NAME}/src/{PACKAGE_NAME}.test.ts

RULES:
- Do NOT change the exported types or function signatures
- Do NOT add dependencies outside this package (unless it's a @claude-patterns/ dep listed in the README)
- Do NOT modify any other package
- Run `make type-check` when done to verify

Show me the stub file first, then the source, then implement step by step.
```

---

### Template 2: BUILD (design from reference)
Use for: prompt-system, context-injection, agent-dialogue-loop, and all 10 build-tier packages

```
I'm implementing the @claude-patterns/{PACKAGE_NAME} package.

CONTEXT:
- Monorepo root: current directory
- Stub file: packages/build/{PACKAGE_NAME}/src/index.ts
- README: packages/build/{PACKAGE_NAME}/README.md
- KB reference: Section {KB_SECTION} in claude-code-technical-knowledge-base-v2.1.md

TASK:
1. Read the stub file and README to understand the interface contract
2. Read KB Section {KB_SECTION} for the architectural pattern
3. Implement each function based on the pattern described in the KB
4. This is a BUILD package — we're creating our own version inspired by the pattern, not copying source verbatim
5. Add a basic test file at packages/build/{PACKAGE_NAME}/src/{PACKAGE_NAME}.test.ts

DESIGN GUIDANCE FROM KB:
{PASTE 2-3 KEY SENTENCES FROM THE KB SECTION DESCRIBING THE PATTERN}

RULES:
- Do NOT change the exported types or function signatures
- Do NOT add dependencies outside this package (unless it's a @claude-patterns/ dep listed in the README)
- Do NOT modify any other package
- Run `make type-check` when done to verify

Read the stub first, then implement function by function. Show me each function before moving to the next.
```

---

### Template 3: TRANSLATE (apply pattern to new domain)
Use for: consecutive-breach-tracker, cost-per-interaction, prompt-cache-optimizer, ivr-call-flow-validator, agent-skill-routing

```
I'm implementing the @claude-patterns/{PACKAGE_NAME} package.

CONTEXT:
- Monorepo root: current directory
- Stub file: packages/translate/{PACKAGE_NAME}/src/{STUB_PATH}
- README: packages/translate/{PACKAGE_NAME}/README.md
- Source pattern: {PATTERN_NAME} from KB Section {KB_SECTION}

TASK:
1. Read the stub file and README to understand the target interface
2. Read the source pattern description in KB Section {KB_SECTION}
3. This is a TRANSLATE package — we're applying a Claude Code pattern to a different domain
4. The pattern is: {ONE_SENTENCE_PATTERN_DESCRIPTION}
5. The domain translation is: {ONE_SENTENCE_DOMAIN_DESCRIPTION}
6. Implement each method based on the translated pattern
7. Add tests at packages/translate/{PACKAGE_NAME}/src/test_{PACKAGE_NAME}.py (Python) or .test.ts (TS)

RULES:
- Do NOT change the exported types or function/method signatures
- Do NOT add heavy dependencies — keep it lightweight
- Do NOT modify any other package
- Language: {Python 3.11+ | TypeScript}

Read the stub first, then implement method by method.
```

---

## Build Order: The Exact Sequence

### Wave 1: Quick Wins (no dependencies, small LOC)
Get the workflow dialed in with easy packages before tackling the big ones.

| # | Package | Tier | LOC | Template | KB Section |
|---|---------|------|-----|----------|------------|
| 1 | denial-tracking | Extract | 45 | Template 1 | 8.4 |
| 2 | cost-tracker | Extract | 323 | Template 1 | 33 |
| 3 | consecutive-breach-tracker | Translate/Py | ~80 | Template 3 | Pattern 7 + 43 |
| 4 | cost-per-interaction | Translate/Py | ~100 | Template 3 | 33 + 43 |

**Why this order:** These four are standalone (zero deps), small, and give you working code in your first four sessions. denial-tracking at 45 LOC is your training wheels — if the workflow works there, it works everywhere.

### Wave 2: Core Architecture (no dependencies, medium LOC)
Now that the workflow is proven, build the architectural core.

| # | Package | Tier | LOC | Template | KB Section |
|---|---------|------|-----|----------|------------|
| 5 | prompt-cache-optimizer | Translate/TS | ~200 | Template 3 | Pattern 4 + 21 |
| 6 | prompt-system | Build | 2,368 | Template 2 | 15 |
| 7 | context-injection | Build | 1,484 | Template 2 | 16 |
| 8 | permission-system | Extract | 9,409 | Template 1 | 8 |

**Why this order:** prompt-cache-optimizer is still small. prompt-system and context-injection are medium builds. permission-system is the biggest P0 and comes last so you have maximum experience before tackling 9K+ LOC.

### Wave 3: P1 Portfolio Pieces (some have dependencies)

| # | Package | Tier | Depends On | Template | KB Section |
|---|---------|------|------------|----------|------------|
| 9 | token-estimation | Extract | none | Template 1 | 18.4 |
| 10 | streaming-tool-executor | Extract | none | Template 1 | 31 |
| 11 | state-store | Extract | none | Template 1 | 7 |
| 12 | yolo-classifier | Extract | permission-system | Template 1 | 8.5 |
| 13 | auto-compact | Extract | token-estimation | Template 1 | 18 |
| 14 | claudemd-memory | Extract | none | Template 1 | 17 |
| 15 | multi-agent-coordinator | Build | none* | Template 2 | 26 |
| 16 | agent-dialogue-loop | Build | #10 + #11 + #9 | Template 2 | 5 |
| 17 | ivr-call-flow-validator | Translate/TS | none | Template 3 | Recipe 5 |
| 18 | agent-skill-routing | Translate/Py | none | Template 3 | Recipe 1 + 43 |
| 19 | skills-system | Build | claudemd-memory | Template 2 | 22 |

**Why this order:** Independent packages first (#9-11, 14-15), then packages that depend on things we just built (#12-13, 16, 19).

*multi-agent-coordinator depends on mcp-integration in theory, but at 369 LOC it can be built standalone with a mock interface.

### Wave 4: P2 Engineering Depth

| # | Package | Tier | Depends On | Template | KB Section |
|---|---------|------|------------|----------|------------|
| 20 | subprocess-env-scrubbing | Extract | none | Template 1 | 11 |
| 21 | config-migration | Extract | none | Template 1 | 4 |
| 22 | path-validation | Extract | none | Template 1 | 8 |
| 23 | read-only-validation | Extract | none | Template 1 | 8 |
| 24 | sandbox-config | Extract | path-validation | Template 1 | 9 |
| 25 | dangerous-command-detection | Extract | permission-system + path-validation | Template 1 | 8.6 |
| 26 | mcp-integration | Build | none | Template 2 | 24 |
| 27 | cli-startup-optimization | Build | none | Template 2 | 27 |

### Wave 5: P3 Nice to Have

| # | Package | Tier | Template | KB Section |
|---|---------|------|----------|------------|
| 28 | analytics-killswitch | Extract | Template 1 | 14 |
| 29 | vim-mode-fsm | Build | Template 2 | 34 |
| 30 | keyboard-shortcuts | Build | Template 2 | 35 |
| 31 | ink-renderer | Build | Template 2 | 33 |

### Wave 6 -- Expansion Packages (#32-43)

- [ ] 32. workforce-scheduling-coordinator (Python, P1)
- [ ] 33. genesys-flow-security-validator (TS, P1)
- [ ] 34. multi-step-ivr-input-validator (TS, P2, needs #28)
- [ ] 35. tool-schema-cache (TS, P2)
- [ ] 36. tool-registry (TS, P2)
- [ ] 37. dialogue-history-manager (TS, P2)
- [ ] 38. system-reminder-injection (TS, P2)
- [ ] 39. plugin-lifecycle-manager (TS, P2)
- [ ] 40. sdk-bridge (TS, P3)
- [ ] 41. voice-input-gating (TS, P3)
- [ ] 42. output-style-system (TS, P3)
- [ ] 43. onboarding-flow-engine (TS, P3)

---

## Session Protocol: What You Actually Do Each Time

### Step 1: Open Claude Code terminal
Navigate to your monorepo root:
```bash
cd ~/projects/Inside\ Claude\ Code
```

### Step 2: Pick the next package from the build order above

### Step 3: Copy the right template (1, 2, or 3) and fill in the blanks
The blanks are:
- `{PACKAGE_NAME}` — from the build order table
- `{SOURCE_PATH}` — from the stub's TODO comment (e.g., `utils/permissions/denialTracking.ts`)
- `{KB_SECTION}` — from the build order table
- For Template 2: paste a few key sentences from the KB section
- For Template 3: describe the pattern and the domain translation

### Step 4: Paste the filled template into Claude Code

### Step 5: Let Claude Code work through it step by step
It will:
1. Read the stub → show you the interface
2. Read the source/KB → show you the reference
3. Implement each function → show you the code
4. Run type-check → confirm it compiles

### Step 6: Verify
After Claude Code says it's done:
```bash
make type-check        # All TS packages compile
make lint              # No lint errors
```
For Python packages:
```bash
cd packages/translate/{PACKAGE_NAME}
pip install -e . --break-system-packages
python -m pytest       # If tests exist
```

### Step 7: Commit
```bash
git add packages/extract/{PACKAGE_NAME}/  # or build/ or translate/
git commit -m "Implement @claude-patterns/{PACKAGE_NAME}"
```

### Step 8: Close the session and start fresh for the next package

---

## Filled Example: Your First Session

Here's the exact prompt for Package #1 (denial-tracking), ready to paste:

```
I'm implementing the @claude-patterns/denial-tracking package.

CONTEXT:
- Monorepo root: current directory
- Stub file: packages/extract/denial-tracking/src/index.ts
- README: packages/extract/denial-tracking/README.md
- Source reference: claude-code/src/utils/permissions/denialTracking.ts
- KB reference: Section 8.4 in claude-code-technical-knowledge-base-v2.1.md

TASK:
1. Read the stub file and README to understand the interface contract
2. Read the source file at claude-code/src/utils/permissions/denialTracking.ts
3. Replace every TODO-throwing function body with working code extracted from the source
4. Adapt imports — remove any Claude Code internal dependencies
5. Keep the existing type signatures exactly as they are
6. Add a basic test file at packages/extract/denial-tracking/src/denial-tracking.test.ts

RULES:
- Do NOT change the exported types or function signatures
- Do NOT add dependencies outside this package
- Do NOT modify any other package
- Run make type-check when done to verify

Show me the stub file first, then the source, then implement step by step.
```

If the source tree isn't mounted, swap step 2 for:
```
2. The implementation logic from KB Section 8.4: After 3 consecutive or 20 total denials, fall back to interactive prompting. Approval resets consecutive counter but not total. The tracker is a simple stateful counter — increment on denial, reset consecutive on approval, check thresholds on shouldFallback.
```

---

## Troubleshooting

**"Claude Code is trying to change other packages"**
→ Add to your prompt: "ONLY modify files inside packages/{tier}/{package-name}/. Do not touch anything else."

**"Claude Code is changing my type signatures"**
→ Add: "The type signatures in the stub are the CONTRACT. Do not modify them. Implement behind them."

**"Claude Code ran out of context mid-implementation"**
→ The package is too big for one shot. Split it: "Implement ONLY these functions today: [list first 3]. We'll do the rest in the next session."

**"make type-check fails after implementation"**
→ Paste the error into a new Claude Code message: "Fix this type error. Do not change the exported interface."

**"I don't have the source tree mounted"**
→ For Extract packages, paste the relevant KB section into the prompt as DESIGN GUIDANCE. For the 45-LOC denial-tracking, the KB description is sufficient. For the 9,409-LOC permission-system, you really want the source mounted.

---

## Progress Tracker

Copy this into a file and check off as you go:

```
Wave 1 — Quick Wins
[ ] 1. denial-tracking (45 LOC)
[ ] 2. cost-tracker (323 LOC)
[ ] 3. consecutive-breach-tracker (Python, ~80 LOC)
[ ] 4. cost-per-interaction (Python, ~100 LOC)

Wave 2 — Core Architecture
[ ] 5. prompt-cache-optimizer (TS, ~200 LOC)
[ ] 6. prompt-system (2,368 LOC)
[ ] 7. context-injection (1,484 LOC)
[ ] 8. permission-system (9,409 LOC)

Wave 3 — P1 Portfolio
[ ] 9.  token-estimation
[ ] 10. streaming-tool-executor
[ ] 11. state-store
[ ] 12. yolo-classifier (needs #8)
[ ] 13. auto-compact (needs #9)
[ ] 14. claudemd-memory
[ ] 15. multi-agent-coordinator
[ ] 16. agent-dialogue-loop (needs #9, #10, #11)
[ ] 17. ivr-call-flow-validator
[ ] 18. agent-skill-routing (Python)
[ ] 19. skills-system (needs #14)

Wave 4 — P2 Engineering
[ ] 20. subprocess-env-scrubbing
[ ] 21. config-migration
[ ] 22. path-validation
[ ] 23. read-only-validation
[ ] 24. sandbox-config (needs #22)
[ ] 25. dangerous-command-detection (needs #8, #22)
[ ] 26. mcp-integration
[ ] 27. cli-startup-optimization

Wave 5 — P3 Nice to Have
[ ] 28. analytics-killswitch
[ ] 29. vim-mode-fsm
[ ] 30. keyboard-shortcuts
[ ] 31. ink-renderer

Wave 6 — Expansion Packages (#32-43)
[ ] 32. workforce-scheduling-coordinator (Python, P1)
[ ] 33. genesys-flow-security-validator (TS, P1)
[ ] 34. multi-step-ivr-input-validator (TS, P2, needs #28)
[ ] 35. tool-schema-cache (TS, P2)
[ ] 36. tool-registry (TS, P2)
[ ] 37. dialogue-history-manager (TS, P2)
[ ] 38. system-reminder-injection (TS, P2)
[ ] 39. plugin-lifecycle-manager (TS, P2)
[ ] 40. sdk-bridge (TS, P3)
[ ] 41. voice-input-gating (TS, P3)
[ ] 42. output-style-system (TS, P3)
[ ] 43. onboarding-flow-engine (TS, P3)
```
