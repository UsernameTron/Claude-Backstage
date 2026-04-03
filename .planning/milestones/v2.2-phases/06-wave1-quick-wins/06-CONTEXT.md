# Phase 6: Wave 1 Quick Wins - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** IMPLEMENTATION-PLAYBOOK.md + stub analysis

<domain>
## Phase Boundary

Implement 4 standalone, small-LOC packages. Replace all TODO throws with working code. These are the first implementations in the monorepo — they prove the workflow before scaling to larger packages.

Packages:
1. **denial-tracking** (Extract/TS, 45 LOC) — KB 8.4. Tracks permission denials, triggers fallback after thresholds.
2. **cost-tracker** (Extract/TS, 323 LOC) — KB 33. Session cost tracking across models with formatting.
3. **consecutive-breach-tracker** (Translate/Python, ~80 LOC) — Pattern 7 + KB 43. SLA breach tracking per queue.
4. **cost-per-interaction** (Translate/Python, ~100 LOC) — KB 33 + 43. Per-channel cost aggregation.

</domain>

<decisions>
## Implementation Decisions

### Template Selection
- denial-tracking: Template 1 (Extract) — implement from KB section 8.4 description
- cost-tracker: Template 1 (Extract) — implement from KB section 33 description
- consecutive-breach-tracker: Template 3 (Translate) — translate denial-tracking pattern to contact center domain
- cost-per-interaction: Template 3 (Translate) — translate cost-tracker pattern to contact center domain

### Implementation Rules
- Preserve all existing type signatures exactly (interfaces, classes, function signatures)
- Replace TODO throws with working implementations
- No new dependencies — these are standalone packages
- TS packages must pass tsc --noEmit strict mode
- Python packages must pass ruff lint and pip install -e
- Add basic tests for each package

### Claude's Discretion
- Internal implementation details within function bodies
- Test structure and test runner choice
- Error handling approach within functions

</decisions>

<canonical_refs>
## Canonical References

### Existing Stubs (MUST read before implementing)
- `packages/extract/denial-tracking/src/index.ts` — DenialTracker class, DenialState, DENIAL_LIMITS
- `packages/extract/cost-tracker/src/index.ts` — SessionCostEntry, getStoredSessionCosts, formatTotalCost
- `packages/translate/consecutive-breach-tracker/src/consecutive_breach_tracker/__init__.py` — ConsecutiveBreachTracker, BreachAction enum
- `packages/translate/cost-per-interaction/src/cost_per_interaction/__init__.py` — ChannelCostAggregator, Channel enum

### Project Config
- `IMPLEMENTATION-PLAYBOOK.md` — Build order, templates, session protocol
- `CLAUDE.md` — Project conventions (type stubs + TODO only → now implementing)

</canonical_refs>

<specifics>
## Specific Ideas

### denial-tracking (45 LOC target)
- recordDenial(): increment consecutive + total, check thresholds, return action
- recordApproval(): reset consecutive to 0 (total stays)
- shouldFallback(): check consecutive >= 3 OR total >= 20
- reset(): zero both counters
- getState(): return readonly copy of state

### cost-tracker (323 LOC target)
- In-memory storage (Map<string, SessionCostEntry> keyed by model)
- addToTotalSessionCost(): upsert by model, accumulate all token fields
- getStoredSessionCosts(): return entries array + totalCostUSD sum
- formatTotalCost(): "$X.XX" formatting with 2 decimal places
- saveCurrentSessionCosts(): serialize to JSON (or no-op for standalone)

### consecutive-breach-tracker (~80 LOC target)
- Same logic as denial-tracking but with queue_id context
- record_breach() → NONE / WIDEN_RINGS / FORCE_STAFFING
- record_recovery() → reset consecutive (like recordApproval)
- Thresholds: 3 consecutive → widen_rings, 20 total → force_staffing

### cost-per-interaction (~100 LOC target)
- Dict[Channel, list[InteractionCost]] storage
- add_interaction(): append to channel list
- get_cost_per_contact(): total_cost / total_interactions for channel
- get_summary(): aggregate per channel into ChannelSummary objects
- format_total_cost(): "$X.XX" across all channels

</specifics>

<deferred>
## Deferred Ideas

None — Phase 6 scope is fully defined.

</deferred>

---

*Phase: 06-wave1-quick-wins*
*Context gathered: 2026-04-02 via playbook analysis*
