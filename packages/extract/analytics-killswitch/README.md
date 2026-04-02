# @claude-patterns/analytics-killswitch

Analytics event system with remote killswitch and PII protection.

## Source Reference

- **Files:** `services/analytics/` (9 files)
- **LOC:** 4,040
- **KB Section:** 14 — Analytics & Killswitch
- **Tier:** Extract P3

## Key Concepts

- **Remote killswitch** — Emergency privacy response: disable all telemetry remotely
- **_PROTO_ prefix** — PII-protected fields routed to BigQuery, stripped before Datadog
- **Type-name governance** — Long type names force developer attestation of PII safety
- **Event queuing** — Events buffer before sink attachment, drain via queueMicrotask()
- **Multi-backend** — Datadog (operational), first-party (product), BigQuery (warehouse)

## Exports

- `AnalyticsEvent` — Interface: name, properties, timestamp
- `TelemetrySink` — Interface: send, flush, isEnabled
- `TelemetryBackend` — Type: datadog, firstParty, bigQuery
- `logEvent()` — Log an analytics event (queues before sink ready)
- `isKillswitchEnabled()` — Check remote killswitch status
- `initializeAnalytics()` — Initialize with sink array
- `isProtectedField()` — Check for _PROTO_ prefix

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** None
