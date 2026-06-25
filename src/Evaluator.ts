/**
 * Evaluator.ts(計算処理領域)
 * 計算処理を行うクラスを定義する。
 */

/** Evaluator(概要)
 * 四則演算を行うクラス。
 * -compute(leftNumber: number, rightNumber: number, operator: Operation): 左辺と右辺の数値を指定された演算で計算して返す。0で割る場合は例外をスローする。
 * Operation定数オブジェクトは、使用可能な演算子を定義するために使用される。constアサーションを使用して、オブジェクトのプロパティを固定化し、型安全に利用できるようにする。
 * DivisionByZeroErrorクラスは、0で割る操作が行われたときにスローされる例外を定義する。
 */

import { Operation } from "./Operation";
import { DivisionByZeroError } from "./DivisionByZeroError";

//四則演算を行うクラス
export class Evaluator {
  /**
   * 2つの数値に対して指定された演算を実行する
   * @param leftNumber 左側の数値
   * @param operator 演算子
   * @param rightNumber 右側の数値
   * @returns 計算結果
   * @throws DivisionByZeroError 0除算時
   */
  public static compute(leftNumber: number, operator: Operation, rightNumber: number): number {
    let result: number;

    switch (operator) {
      case Operation.Add:
        result = leftNumber + rightNumber;
        break;

      case Operation.Subtract:
        result = leftNumber - rightNumber;
        break;

      case Operation.Multiply:
        result = leftNumber * rightNumber;
        break;

      case Operation.Divide:
        if (rightNumber === 0) {
          //0で割る計算が行われた場合のエラーログをコンソールに出力
          console.error(`[Evaluator] 0で割る計算が行われました: ${leftNumber} / ${rightNumber}`);
          throw new DivisionByZeroError();
        }
        result = leftNumber / rightNumber;
        break;

      default:
        throw new Error(`未対応の演算子です: ${operator}`);
    }

    //計算の詳細をコンソールログに出力
    console.log(`[Evaluator] ${leftNumber} ${operator} ${rightNumber} = ${result}`);
    return result;
  }
}