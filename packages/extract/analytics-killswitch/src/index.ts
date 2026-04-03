/**
 * @claude-patterns/analytics-killswitch
 *
 * Analytics event system with remote killswitch and PII protection.
 * Source: services/analytics/ (9 files, 4,040 LOC)
 * KB: Section 14 — Analytics & Killswitch
 * Tier: Extract P3
 */

// Analytics event with PII-safe metadata
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, string | number | boolean>;
  timestamp: number;
}

// Type-governance names that force developer attestation (KB section 12.4)
export type AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = never;
export type AnalyticsMetadata_I_VERIFIED_THIS_IS_PII_TAGGED = never;

// Telemetry sink for routing events to backends
export interface TelemetrySink {
  send(event: AnalyticsEvent): void;
  flush(): Promise<void>;
  isEnabled(): boolean;
}

// Backend routes: Datadog (operational), first-party (product), BigQuery (warehouse)
export type TelemetryBackend = "datadog" | "firstParty" | "bigQuery";

// --- Module-level state ---
let eventQueue: AnalyticsEvent[] = [];
let sinks: TelemetrySink[] = [];
let killswitchActive = false;
let initialized = false;

// Log an analytics event — events queue before sink attachment
export function logEvent(event: AnalyticsEvent): void {
  if (killswitchActive) return;
  if (!initialized) {
    eventQueue.push(event);
    return;
  }
  for (const sink of sinks) {
    if (sink.isEnabled()) {
      sink.send(event);
    }
  }
}

// Check if killswitch is active — can disable all telemetry remotely
export function isKillswitchEnabled(): boolean {
  return killswitchActive;
}

// Initialize the event system — idempotent, queue drains on init
export function initializeAnalytics(newSinks: TelemetrySink[]): void {
  sinks.length = 0;
  for (const sink of newSinks) {
    sinks.push(sink);
  }
  initialized = true;
  // Drain queued events
  while (eventQueue.length > 0) {
    const event = eventQueue.shift()!;
    logEvent(event);
  }
}

// _PROTO_ prefix routes to protected BigQuery columns, stripped before Datadog
export function isProtectedField(fieldName: string): boolean {
  return fieldName.startsWith("_PROTO_");
}

// Set killswitch state — for runtime toggling and testing
export function setKillswitch(active: boolean): void {
  killswitchActive = active;
}

// Reset all module-level state — for test isolation
export function resetState(): void {
  eventQueue.length = 0;
  sinks.length = 0;
  killswitchActive = false;
  initialized = false;
}
