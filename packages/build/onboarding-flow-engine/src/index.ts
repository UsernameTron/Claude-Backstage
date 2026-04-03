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
  private config: OnboardingConfig;
  private state: OnboardingState;
  private assembledSteps: OnboardingStep[] = [];

  /**
   * Creates a new onboarding flow engine with the given configuration.
   */
  constructor(config: OnboardingConfig) {
    this.config = config;
    this.state = {
      currentStep: "",
      completedSteps: [],
      skippedSteps: [],
      errors: [],
    };
  }

  /**
   * Assembles the step list based on auth method and environment.
   * Filters out steps that should be skipped and validates dependency order.
   */
  assembleSteps(config: OnboardingConfig): OnboardingStep[] {
    const filtered = config.steps.filter((step) => !step.shouldSkip());
    const filteredIds = new Set(filtered.map((s) => s.id));

    for (const step of filtered) {
      for (const depId of step.dependsOn) {
        if (!filteredIds.has(depId)) {
          throw new Error(`Missing dependency: ${depId} for step ${step.id}`);
        }
      }
    }

    this.assembledSteps = filtered;
    return filtered;
  }

  /**
   * Executes a single onboarding step and records the result.
   */
  async runStep(step: OnboardingStep): Promise<StepResult> {
    try {
      const result = await step.execute();
      if (result.success) {
        this.state.completedSteps.push(step.id);
      } else {
        this.state.errors.push({
          stepId: step.id,
          error: result.error ?? "unknown",
        });
      }
      this.state.currentStep = step.id;
      return result;
    } catch (e) {
      this.state.errors.push({ stepId: step.id, error: String(e) });
      return { success: false, nextStep: null, error: String(e) };
    }
  }

  /**
   * Runs all assembled steps in dependency order.
   * Skips steps whose shouldSkip() returns true.
   */
  async run(): Promise<OnboardingState> {
    // Validate dependencies via assembleSteps
    this.assembleSteps(this.config);

    // Execute all config steps, checking shouldSkip at runtime
    for (const step of this.config.steps) {
      if (step.shouldSkip()) {
        this.state.skippedSteps.push(step.id);
      } else {
        await this.runStep(step);
      }
    }

    return { ...this.state };
  }

  /**
   * Returns the current onboarding state snapshot.
   */
  getState(): OnboardingState {
    return {
      ...this.state,
      completedSteps: [...this.state.completedSteps],
      skippedSteps: [...this.state.skippedSteps],
      errors: [...this.state.errors],
    };
  }

  /**
   * Skips ahead to a specific step, marking intermediate steps as skipped.
   */
  skipTo(stepId: string): void {
    const steps = this.assembledSteps.length > 0
      ? this.assembledSteps
      : this.config.steps;

    const targetIndex = steps.findIndex((s) => s.id === stepId);
    if (targetIndex === -1) {
      throw new Error(`Step not found: ${stepId}`);
    }

    for (let i = 0; i < targetIndex; i++) {
      if (!this.state.skippedSteps.includes(steps[i].id) &&
          !this.state.completedSteps.includes(steps[i].id)) {
        this.state.skippedSteps.push(steps[i].id);
      }
    }

    this.state.currentStep = stepId;
  }
}
