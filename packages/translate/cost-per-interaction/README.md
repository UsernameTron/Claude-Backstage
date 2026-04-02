# cost-per-interaction

Per-channel cost aggregation translated from Claude Code's cost tracking subsystem.

## Tier

**Translate** — New build from pattern adaptation.

## Priority

**P0** — Core translate package.

## Source Pattern

- **Source file**: `cost-tracker.ts` (323 LOC)
- **KB sections**: Section 29 (Cost Tracking), Section 43 (Translate Tier Patterns)

## Domain Translation

Mirrors per-model token cost tracking from cost-tracker.ts applied to contact center channel economics:

| Claude Code Concept | Contact Center Concept |
|---------------------|----------------------|
| Model (Sonnet, Opus, Haiku) | Channel (voice, chat, email, SMS) |
| Token cost per model | Cost per interaction per channel |
| Session cost total | Shift/period cost total |
| Cost formatting | Cost-per-contact reporting |

## Key Insight

Claude Code tracks costs per model to show session economics. Contact centers need the same pattern per channel — voice calls cost more than chats, but chat volume is higher. The aggregation pattern (accumulate per category, compute averages, format summaries) is identical.

## Exports

- `ChannelCostAggregator` — Main aggregator class
- `InteractionCost` — Dataclass for single interaction cost records
- `ChannelSummary` — Dataclass for aggregated channel summaries
- `Channel` — Enum: VOICE, CHAT, EMAIL, SMS, SOCIAL, CALLBACK

## Status

Type stubs only. All methods raise `NotImplementedError`.
