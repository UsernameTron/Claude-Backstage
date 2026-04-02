// onboarding-flow-engine — Dynamic multi-step onboarding
// Source Pattern: Section 36 — conditional step assembly: preflight -> theme -> oauth -> api-key -> security -> terminal-setup
// KB: Section 36

// --- Types & Interfaces ---

/**
 * Result of executing a single onboarding step.
 */
export interface StepResult {
  success: boolean;
  nextStep: string | null;
  error: string | null;
}

/**
 * A single step in the onboarding flow.
 * Steps can be conditionally skipped and declare dependencies on other steps.
 */
export interface OnboardingStep {
  id: string;
  label: string;
  execute: () => Promise<StepResult>;
  shouldSkip: () => boolean;
  dependsOn: string[];
}

/**
 * Configuration for assembling an onboarding flow.
 * The auth method and environment determine which steps are included.
 */
export interface OnboardingConfig {
  steps: OnboardingStep[];
  authMethod: string;
  environment: string;
}

/**
 * Tracks the state of an onboarding flow execution.
 */
export interface OnboardingState {
  currentStep: string;
  completedSteps: string[];
  skippedSteps: string[];
  errors: Array<{ stepId: string; error: string }>;
}

// --- Classes ---

/**
 * Engine for executing dynamic multi-step onboarding flows.
 * Assembles steps conditionally based on auth method and environment,
 * then runs them in dependency order with skip support.
 *
 * Standard flow: preflight -> theme -> oauth -> api-key -> security -> terminal-setup
 */
export class OnboardingFlowEngine {
  /**
   * Creates a new onboarding flow engine with the given configuration.
   * TODO: implement constructor with config storage and initial state
   */
  constructor(_config: OnboardingConfig) {
    throw new Error(
      "TODO: implement constructor with config storage and initial state",
    );
  }

  /**
   * Assembles the step list based on auth method and environment.
   * Filters out steps that should be skipped and validates dependency order.
   * TODO: implement conditional step assembly
   */
  assembleSteps(_config: OnboardingConfig): OnboardingStep[] {
    throw new Error("TODO: implement conditional step assembly");
  }

  /**
   * Executes a single onboarding step and records the result.
   * TODO: implement step execution with error capture
   */
  runStep(_step: OnboardingStep): Promise<StepResult> {
    throw new Error("TODO: implement step execution with error capture");
  }

  /**
   * Runs all assembled steps in dependency order.
   * Skips steps whose shouldSkip() returns true.
   * TODO: implement full flow execution with dependency ordering
   */
  run(): Promise<OnboardingState> {
    throw new Error(
      "TODO: implement full flow execution with dependency ordering",
    );
  }

  /**
   * Returns the current onboarding state snapshot.
   * TODO: implement state getter
   */
  getState(): OnboardingState {
    throw new Error("TODO: implement state getter");
  }

  /**
   * Skips ahead to a specific step, marking intermediate steps as skipped.
   * TODO: implement skip-to with intermediate step marking
   */
  skipTo(_stepId: string): void {
    throw new Error(
      "TODO: implement skip-to with intermediate step marking",
    );
  }
}
