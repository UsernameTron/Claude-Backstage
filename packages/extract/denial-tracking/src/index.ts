/**
 * @claude-patterns/denial-tracking
 *
 * Type stubs for Claude Code's denial tracking with behavioral adaptation.
 * Source: utils/permissions/denialTracking.ts (45 LOC)
 * KB Reference: Section 8.4 — Denial Tracking with Behavioral Adaptation
 */

/**
 * Denial thresholds that trigger fallback to interactive prompting.
 * After 3 consecutive or 20 total denials, the system changes strategy
 * rather than looping on blocked actions.
 */
export const DENIAL_LIMITS = {
  maxConsecutive: 3,
  maxTotal: 20,
} as const;

/**
 * Current denial counter state.
 */
export interface DenialState {
  consecutive: number;
  total: number;
}

/**
 * Action to take after a denial is recorded.
 * "continue" means keep operating normally.
 * "fallback_to_interactive" means switch to interactive prompting.
 */
export type DenialAction = "continue" | "fallback_to_interactive";

/**
 * Tracks permission denials and triggers fallback when thresholds are exceeded.
 * Prevents the AI from stubbornly retrying blocked actions.
 */
export class DenialTracker {
  private state: DenialState;

  constructor() {
    this.state = { consecutive: 0, total: 0 };
  }

  recordDenial(): DenialAction {
    // TODO: extract from utils/permissions/denialTracking.ts
    throw new Error("TODO: extract from utils/permissions/denialTracking.ts");
  }

  recordApproval(): void {
    // TODO: extract from utils/permissions/denialTracking.ts
    throw new Error("TODO: extract from utils/permissions/denialTracking.ts");
  }

  shouldFallback(): boolean {
    // TODO: extract from utils/permissions/denialTracking.ts
    throw new Error("TODO: extract from utils/permissions/denialTracking.ts");
  }

  reset(): void {
    // TODO: extract from utils/permissions/denialTracking.ts
    throw new Error("TODO: extract from utils/permissions/denialTracking.ts");
  }

  getState(): Readonly<DenialState> {
    // TODO: extract from utils/permissions/denialTracking.ts
    throw new Error("TODO: extract from utils/permissions/denialTracking.ts");
  }
}
