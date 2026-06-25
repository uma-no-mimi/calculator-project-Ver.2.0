/**
 * OperationFormatter.ts（演算子フォーマッタ）
 * 演算子を表示用の文字列に変換するクラス。
 * - 引数の演算子を対応する表示用の文字列に変換して返す。
 */

import { Operation } from "./Operation";

export class OperationFormatter {
    /**
     * 演算子を表示用の文字列に変換するメソッド
     * @param operation 演算子
     * @returns 対応する表示用の文字列
     */
    public static format(
        operator: Operation
    ): string {

        switch (operator) {

            case Operation.Add:
                return "+";

            case Operation.Subtract:
                return "−";

            case Operation.Multiply:
                return "×";

            case Operation.Divide:
                return "÷";
        }
    }
}