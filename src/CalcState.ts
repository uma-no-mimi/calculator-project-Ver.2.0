/**
 * CalcState.ts（電卓状態定義）
 * 電卓の状態を定数として管理する。
 */

export const CalcState = {
    Ready: "Ready",
    InputtingFirst: "InputtingFirst",
    OperatorEntered: "OperatorEntered",
    InputtingSecond: "InputtingSecond",
    ResultShown: "ResultShown",
    Error: "Error"
} as const;

/**
 * 電卓状態型
 */
export type CalcState =
    typeof CalcState[keyof typeof CalcState];