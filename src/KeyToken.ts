import type { Operation } from "./Operation";

export type KeyToken =
  | { kind: "digit"; value: number }
  | { kind: "decimal" }
  | { kind: "operator"; value: Operation }
  | { kind: "equal" }
  | { kind: "clear" };