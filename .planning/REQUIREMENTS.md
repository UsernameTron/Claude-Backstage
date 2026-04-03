# Requirements: claude-code-patterns v2.2

Generated: 2026-04-02

## Functional Requirements

### W1: Wave 1 — Quick Wins (4 packages, standalone, small LOC)
| REQ | Package | Tier | Template | LOC | KB Section |
|-----|---------|------|----------|-----|------------|
| W1-01 | denial-tracking | Extract | Template 1 | 45 | 8.4 |
| W1-02 | cost-tracker | Extract | Template 1 | 323 | 33 |
| W1-03 | consecutive-breach-tracker | Translate/Py | Template 3 | ~80 | Pattern 7 + 43 |
| W1-04 | cost-per-interaction | Translate/Py | Template 3 | ~100 | 33 + 43 |

### W2: Wave 2 — Core Architecture (4 packages, no deps, medium LOC)
| REQ | Package | Tier | Template | LOC | KB Section |
|-----|---------|------|----------|-----|------------|
| W2-01 | prompt-cache-optimizer | Translate/TS | Template 3 | ~200 | Pattern 4 + 21 |
| W2-02 | prompt-system | Build | Template 2 | 2,368 | 15 |
| W2-03 | context-injection | Build | Template 2 | 1,484 | 16 |
| W2-04 | permission-system | Extract | Template 1 | 9,409 | 8 |

### W3: Wave 3 — P1 Portfolio (11 packages, some deps)
| REQ | Package | Tier | Depends On | Template | KB Section |
|-----|---------|------|------------|----------|------------|
| W3-01 | token-estimation | Extract | none | Template 1 | 18.4 |
| W3-02 | streaming-tool-executor | Extract | none | Template 1 | 31 |
| W3-03 | state-store | Extract | none | Template 1 | 7 |
| W3-04 | yolo-classifier | Extract | permission-system | Template 1 | 8.5 |
| W3-05 | auto-compact | Extract | token-estimation | Template 1 | 18 |
| W3-06 | claudemd-memory | Extract | none | Template 1 | 17 |
| W3-07 | multi-agent-coordinator | Build | none | Template 2 | 26 |
| W3-08 | agent-dialogue-loop | Build | W3-02+W3-03+W3-01 | Template 2 | 5 |
| W3-09 | ivr-call-flow-validator | Translate/TS | none | Template 3 | Recipe 5 |
| W3-10 | agent-skill-routing | Translate/Py | none | Template 3 | Recipe 1 + 43 |
| W3-11 | skills-system | Build | W3-06 | Template 2 | 22 |

### W4: Wave 4 — P2 Engineering Depth (8 packages)
| REQ | Package | Tier | Depends On | Template | KB Section |
|-----|---------|------|------------|----------|------------|
| W4-01 | subprocess-env-scrubbing | Extract | none | Template 1 | 11 |
| W4-02 | config-migration | Extract | none | Template 1 | 4 |
| W4-03 | path-validation | Extract | none | Template 1 | 8 |
| W4-04 | read-only-validation | Extract | none | Template 1 | 8 |
| W4-05 | sandbox-config | Extract | W4-03 | Template 1 | 9 |
| W4-06 | dangerous-command-detection | Extract | W2-04+W4-03 | Template 1 | 8.6 |
| W4-07 | mcp-integration | Build | none | Template 2 | 24 |
| W4-08 | cli-startup-optimization | Build | none | Template 2 | 27 |

### W5: Wave 5 — P3 Nice to Have (4 packages)
| REQ | Package | Tier | Template | KB Section |
|-----|---------|------|----------|------------|
| W5-01 | analytics-killswitch | Extract | Template 1 | 14 |
| W5-02 | vim-mode-fsm | Build | Template 2 | 34 |
| W5-03 | keyboard-shortcuts | Build | Template 2 | 35 |
| W5-04 | ink-renderer | Build | Template 2 | 33 |

### W6: Wave 6 — Expansion Packages (12 packages, #32-43)
| REQ | Package | Tier | Language | Template | KB Section |
|-----|---------|------|----------|----------|------------|
| W6-01 | workforce-scheduling-coordinator | Translate | Python | Template 3 | 24 |
| W6-02 | genesys-flow-security-validator | Translate | TS | Template 3 | 8-10, 38 |
| W6-03 | multi-step-ivr-input-validator | Translate | TS | Template 3 | 8.6 |
| W6-04 | tool-schema-cache | Build | TS | Template 2 | 21.3 |
| W6-05 | tool-registry | Build | TS | Template 2 | 6.2-6.3 |
| W6-06 | dialogue-history-manager | Build | TS | Template 2 | 19 |
| W6-07 | system-reminder-injection | Build | TS | Template 2 | 20 |
| W6-08 | plugin-lifecycle-manager | Build | TS | Template 2 | 25 |
| W6-09 | sdk-bridge | Build | TS | Template 2 | 26 |
| W6-10 | voice-input-gating | Build | TS | Template 2 | 34 |
| W6-11 | output-style-system | Build | TS | Template 2 | 35 |
| W6-12 | onboarding-flow-engine | Build | TS | Template 2 | 36 |

## Non-Functional Requirements

| REQ | Description | Priority |
|-----|-------------|----------|
| NFR-01 | All TS implementations compile with tsc --noEmit strict mode | P0 |
| NFR-02 | All Python implementations pass ruff lint + pip install -e | P0 |
| NFR-03 | No TODO throws remain in implemented packages | P0 |
| NFR-04 | Cross-package imports resolve after implementation | P0 |
| NFR-05 | Each package has tests (unit or integration as appropriate) | P1 |
| NFR-06 | make type-check and make lint pass after each wave | P0 |

## Implementation Templates

- **Template 1 (Extract)**: Read stub + KB section → implement working code → preserve type signatures → add tests
- **Template 2 (Build)**: Read stub + KB section → design-from-reference (not verbatim copy) → add tests
- **Template 3 (Translate)**: Read stub + KB pattern → implement in target domain → add tests

## Traceability

| Phase | Requirements |
|-------|-------------|
| Phase 6 | W1-01 through W1-04, NFR-01 through NFR-06 |
| Phase 7 | W2-01 through W2-04 |
| Phase 8 | W3-01 through W3-11 |
| Phase 9 | W4-01 through W4-08 |
| Phase 10 | W5-01 through W5-04 |
| Phase 11 | W6-01 through W6-12 |
