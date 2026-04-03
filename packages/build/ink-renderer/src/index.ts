/**
 * @claude-patterns/ink-renderer
 *
 * High-level render types and component stubs for terminal UI.
 * Source: ink/ (97 files, 19,848 LOC)
 * KB: Section 22 — Ink Renderer
 * Tier: Build P3
 */

// Options for creating an Ink render instance
export interface RenderOptions {
  stdout?: NodeJS.WriteStream;
  stdin?: NodeJS.ReadStream;
  exitOnCtrlC?: boolean;
  patchConsole?: boolean;
}

// Handle returned by render() for controlling the rendered tree
export interface InkInstance {
  rerender: (tree: unknown) => void;
  unmount: () => void;
  waitUntilExit: () => Promise<void>;
  clear: () => void;
}

// Layout container props (flexbox model)
export interface BoxProps {
  flexDirection?: "row" | "column";
  padding?: number;
  margin?: number;
  width?: number | string;
  height?: number | string;
  borderStyle?: string;
  borderColor?: string;
}

// Text styling props
export interface TextProps {
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dimColor?: boolean;
  wrap?: "wrap" | "truncate" | "truncate-end" | "truncate-middle" | "truncate-start";
}

// Interactive button props
export interface ButtonProps {
  label: string;
  onPress?: () => void;
  isFocused?: boolean;
  disabled?: boolean;
}

// Frame performance metrics
export interface FrameMetrics {
  fps: number;
  frameTime: number;
  dropCount: number;
}

// Core Ink renderer class
export class Ink {
  private options: RenderOptions;
  private mounted = false;
  private currentTree: unknown = null;
  private exitResolve: (() => void) | null = null;
  public readonly exitPromise: Promise<void>;

  constructor(options?: RenderOptions) {
    this.options = {
      exitOnCtrlC: true,
      patchConsole: false,
      ...options,
    };
    this.exitPromise = new Promise<void>((resolve) => {
      this.exitResolve = resolve;
    });
  }

  render(tree: unknown): void {
    this.currentTree = tree;
    this.mounted = true;
  }

  unmount(): void {
    this.mounted = false;
    if (this.exitResolve) {
      this.exitResolve();
    }
  }
}

// Top-level render function — creates Ink instance and renders tree
export function render(tree: unknown, options?: RenderOptions): InkInstance {
  const ink = new Ink(options);
  ink.render(tree);

  return {
    rerender: (newTree: unknown) => ink.render(newTree),
    unmount: () => ink.unmount(),
    waitUntilExit: () => ink.exitPromise,
    clear: () => {},
  };
}

// Box layout component stub
export function Box(props: BoxProps): { type: "box"; props: BoxProps } {
  return { type: "box" as const, props };
}

// Text rendering component stub
export function Text(props: TextProps): { type: "text"; props: TextProps } {
  return { type: "text" as const, props };
}

// Button interactive component stub
export function Button(props: ButtonProps): { type: "button"; props: ButtonProps } {
  return { type: "button" as const, props };
}
