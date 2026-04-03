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
    this.state.consecutive++;
    this.state.total++;
    return this.shouldFallback() ? "fallback_to_interactive" : "continue";
  }

  recordApproval(): void {
    this.state.consecutive = 0;
  }

  shouldFallback(): boolean {
    return (
      this.state.consecutive >= DENIAL_LIMITS.maxConsecutive ||
      this.state.total >= DENIAL_LIMITS.maxTotal
    );
  }

  reset(): void {
    this.state.consecutive = 0;
    this.state.total = 0;
  }

  getState(): Readonly<DenialState> {
    return { ...this.state };
  }
}
