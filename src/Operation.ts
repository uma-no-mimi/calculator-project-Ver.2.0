/**
 * Operation.ts（演算子定義）
 * 使用可能な演算子定義
 * constアサーションで固定化し
 * 型安全に利用する
 */

export const Operation = {
    Add: "Add",
    Subtract: "Subtract",
    Multiply: "Multiply",
    Divide: "Divide"
} as const;

//Operationオブジェクトの値の型を定義するために、typeofとkeyofを使用。
export type Operation = typeof Operation[keyof typeof Operation];