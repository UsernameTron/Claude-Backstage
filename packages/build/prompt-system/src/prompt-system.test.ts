import { describe, test, expect } from "bun:test";
import {
  getSystemPrompt,
  systemPromptSection,
  resolveSystemPromptSections,
  getSimpleIntroSection,
  getSimpleSystemSection,
  getSimpleDoingTasksSection,
  getActionsSection,
  getUsingYourToolsSection,
  getSimpleToneAndStyleSection,
  getOutputEfficiencySection,
  shouldUseGlobalCacheScope,
  SYSTEM_PROMPT_DYNAMIC_BOUNDARY,
  type SystemPromptSection,
} from "./index";

describe("systemPromptSection", () => {
  test("creates static section with correct fields", () => {
    const section = systemPromptSection("intro", "Hello", "static");
    expect(section).toEqual({
      id: "intro",
      content: "Hello",
      type: "static",
      cached: true,
    });
  });

  test("creates dynamic section with cached=false", () => {
    const section = systemPromptSection("mem", "Data", "dynamic");
    expect(section).toEqual({
      id: "mem",
      content: "Data",
      type: "dynamic",
      cached: false,
    });
  });

  test("defaults type to static and cached to true", () => {
    const section = systemPromptSection("test", "Body");
    expect(section.type).toBe("static");
    expect(section.cached).toBe(true);
  });
});

describe("resolveSystemPromptSections", () => {
  test("returns content strings from sections", () => {
    const s1 = systemPromptSection("a", "Alpha");
    const s2 = systemPromptSection("b", "Beta");
    expect(resolveSystemPromptSections([s1, s2])).toEqual(["Alpha", "Beta"]);
  });

  test("returns empty array for empty input", () => {
    expect(resolveSystemPromptSections([])).toEqual([]);
  });
});

describe("section getters", () => {
  test("getSimpleIntroSection returns section with id intro", () => {
    const section = getSimpleIntroSection();
    expect(section).not.toBeNull();
    expect(section!.id).toBe("intro");
    expect(section!.type).toBe("static");
  });

  test("getSimpleIntroSection returns null when skipIntro is true", () => {
    const section = getSimpleIntroSection({ skipIntro: true });
    expect(section).toBeNull();
  });

  test("getSimpleSystemSection returns section with id system", () => {
    const section = getSimpleSystemSection();
    expect(section).not.toBeNull();
    expect(section!.id).toBe("system");
  });

  test("getSimpleDoingTasksSection returns section with id doing_tasks", () => {
    const section = getSimpleDoingTasksSection();
    expect(section).not.toBeNull();
    expect(section!.id).toBe("doing_tasks");
  });

  test("getActionsSection returns section with id actions", () => {
    const section = getActionsSection();
    expect(section).not.toBeNull();
    expect(section!.id).toBe("actions");
  });

  test("getUsingYourToolsSection returns section with id using_tools", () => {
    const section = getUsingYourToolsSection();
    expect(section).not.toBeNull();
    expect(section!.id).toBe("using_tools");
  });

  test("getUsingYourToolsSection mentions provided tools", () => {
    const section = getUsingYourToolsSection(["Bash", "Read"]);
    expect(section).not.toBeNull();
    expect(section!.content).toContain("Bash");
    expect(section!.content).toContain("Read");
  });

  test("getSimpleToneAndStyleSection returns section with id tone_style", () => {
    const section = getSimpleToneAndStyleSection();
    expect(section).not.toBeNull();
    expect(section!.id).toBe("tone_style");
  });

  test("getOutputEfficiencySection returns section with id output_efficiency", () => {
    const section = getOutputEfficiencySection();
    expect(section).not.toBeNull();
    expect(section!.id).toBe("output_efficiency");
  });
});

describe("shouldUseGlobalCacheScope", () => {
  test("returns true by default", () => {
    expect(shouldUseGlobalCacheScope()).toBe(true);
  });
});

describe("getSystemPrompt", () => {
  test("returns string containing SYSTEM_PROMPT_DYNAMIC_BOUNDARY", () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain(SYSTEM_PROMPT_DYNAMIC_BOUNDARY);
  });

  test("contains static section content before boundary", () => {
    const prompt = getSystemPrompt();
    const boundaryIndex = prompt.indexOf(SYSTEM_PROMPT_DYNAMIC_BOUNDARY);
    const beforeBoundary = prompt.slice(0, boundaryIndex);
    // Intro section content should appear before boundary
    expect(beforeBoundary).toContain("Claude");
  });
});
