import { describe, test, expect, beforeEach } from "bun:test";
import {
  OnboardingFlowEngine,
  type OnboardingConfig,
  type OnboardingStep,
  type StepResult,
} from "./index";

function makeStep(overrides: Partial<OnboardingStep> = {}): OnboardingStep {
  return {
    id: "step-1",
    label: "Step 1",
    execute: () => Promise.resolve({ success: true, nextStep: null, error: null }),
    shouldSkip: () => false,
    dependsOn: [],
    ...overrides,
  };
}

function makeConfig(steps: OnboardingStep[]): OnboardingConfig {
  return {
    steps,
    authMethod: "api-key",
    environment: "development",
  };
}

describe("OnboardingFlowEngine", () => {
  test("constructor initializes with empty state", () => {
    const engine = new OnboardingFlowEngine(makeConfig([]));
    const state = engine.getState();
    expect(state.currentStep).toBe("");
    expect(state.completedSteps).toHaveLength(0);
    expect(state.skippedSteps).toHaveLength(0);
    expect(state.errors).toHaveLength(0);
  });

  test("assembleSteps filters out skipped steps", () => {
    const steps = [
      makeStep({ id: "a", shouldSkip: () => false }),
      makeStep({ id: "b", shouldSkip: () => true }),
      makeStep({ id: "c", shouldSkip: () => false }),
    ];
    const engine = new OnboardingFlowEngine(makeConfig(steps));
    const assembled = engine.assembleSteps(makeConfig(steps));
    expect(assembled).toHaveLength(2);
    expect(assembled.map((s) => s.id)).toEqual(["a", "c"]);
  });

  test("assembleSteps validates dependencies exist", () => {
    const steps = [
      makeStep({ id: "a" }),
      makeStep({ id: "b", dependsOn: ["nonexistent"] }),
    ];
    const engine = new OnboardingFlowEngine(makeConfig(steps));
    expect(() => engine.assembleSteps(makeConfig(steps))).toThrow(
      "Missing dependency: nonexistent for step b",
    );
  });

  test("assembleSteps allows valid dependencies", () => {
    const steps = [
      makeStep({ id: "a" }),
      makeStep({ id: "b", dependsOn: ["a"] }),
    ];
    const engine = new OnboardingFlowEngine(makeConfig(steps));
    const assembled = engine.assembleSteps(makeConfig(steps));
    expect(assembled).toHaveLength(2);
  });

  test("run executes steps in order and records completed", async () => {
    const steps = [
      makeStep({ id: "step-1", label: "First" }),
      makeStep({ id: "step-2", label: "Second" }),
    ];
    const engine = new OnboardingFlowEngine(makeConfig(steps));
    const state = await engine.run();
    expect(state.completedSteps).toEqual(["step-1", "step-2"]);
    expect(state.errors).toHaveLength(0);
  });

  test("run records errors for failing steps", async () => {
    const steps = [
      makeStep({
        id: "fail-step",
        execute: () => Promise.resolve({ success: false, nextStep: null, error: "something broke" }),
      }),
    ];
    const engine = new OnboardingFlowEngine(makeConfig(steps));
    const state = await engine.run();
    expect(state.errors).toHaveLength(1);
    expect(state.errors[0].stepId).toBe("fail-step");
    expect(state.errors[0].error).toBe("something broke");
  });

  test("run skips steps where shouldSkip returns true during execution", async () => {
    const steps = [
      makeStep({ id: "a" }),
      makeStep({ id: "b", shouldSkip: () => true }),
      makeStep({ id: "c" }),
    ];
    const engine = new OnboardingFlowEngine(makeConfig(steps));
    const state = await engine.run();
    expect(state.completedSteps).toEqual(["a", "c"]);
    expect(state.skippedSteps).toContain("b");
  });

  test("getState returns a copy that does not mutate internal state", () => {
    const engine = new OnboardingFlowEngine(makeConfig([]));
    const state1 = engine.getState();
    state1.completedSteps.push("injected");
    const state2 = engine.getState();
    expect(state2.completedSteps).toHaveLength(0);
  });

  test("skipTo marks intermediate steps as skipped", async () => {
    const steps = [
      makeStep({ id: "a" }),
      makeStep({ id: "b" }),
      makeStep({ id: "c" }),
    ];
    const engine = new OnboardingFlowEngine(makeConfig(steps));
    // Need to assemble steps first so skipTo has something to work with
    await engine.run(); // This assembles and runs; let's test on a fresh engine
    const engine2 = new OnboardingFlowEngine(makeConfig(steps));
    engine2.assembleSteps(makeConfig(steps));
    engine2.skipTo("c");
    const state = engine2.getState();
    expect(state.currentStep).toBe("c");
    expect(state.skippedSteps).toContain("a");
    expect(state.skippedSteps).toContain("b");
  });

  test("runStep handles thrown exceptions", async () => {
    const steps = [
      makeStep({
        id: "throw-step",
        execute: () => { throw new Error("unexpected crash"); },
      }),
    ];
    const engine = new OnboardingFlowEngine(makeConfig(steps));
    const result = await engine.runStep(steps[0]);
    expect(result.success).toBe(false);
    expect(result.error).toContain("unexpected crash");
  });
});
