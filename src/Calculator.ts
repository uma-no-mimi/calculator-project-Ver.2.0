//Calculator.ts
/**
 * Calculator.ts(計算機能の統括領域)
 * 入力を受け取り、状態を管理し、計算処理と表示フォーマットを統括するクラスを定義。
 */


//各クラスをインポート
//四則演算を行うクラスと0除算エラーを定義するクラス
import { Evaluator } from "./Evaluator";
//0で割る計算が行われた場合に送出する例外クラス
import { DivisionByZeroError } from "./DivisionByZeroError";
//入力バッファを管理するクラス
import { InputBuffer } from "./InputBuffer";
//数値を表示用の文字列に変換するクラス
import { NumberFormatter } from "./NumberFormatter";
//設定値を管理するクラス
import { Config } from "./Config";
//ユーザーの入力を表すクラス（型のみなのでtype使用）
import type { KeyToken } from "./KeyToken";
//演算子定義クラス
import { Operation } from "./Operation";
//表示インターフェースを定義するクラス
import type { IDisplay } from "./IDisplay";
//電卓の状態を定数として管理するクラスと電卓状態型を定義するクラス
import { CalcState } from "./CalcState";
//演算子を表示用の文字列に変換するクラス
import { OperationFormatter } from "./OperationFormatter";


export class Calculator {
  private leftOperand: number | null = null; //左辺の数値
  private operator: Operation | null = null; //演算子
  private state: CalcState = CalcState.Ready; //電卓の状態
  private history: string = ""; //計算履歴を保存する文字列
  private readonly display: IDisplay; //表示制御
  private readonly formatter: NumberFormatter; //数値を表示用の文字列に変換するクラスを受け取る
  private readonly buffer: InputBuffer; //入力バッファを管理するクラスを受け取る

  constructor(
    display: IDisplay,
    formatter: NumberFormatter,
    buffer: InputBuffer
  ) {
    this.display = display;
    this.formatter = formatter;
    this.buffer = buffer;
  }

  /**
   * 入力トークンを受け取り、処理を振り分けるメソッド
   * @param token ユーザーの入力を表すトークン
   * トークンの種類に応じて、数字の入力、演算子の入力、計算の実行、クリアなどの処理を行う。
   * 例えば、数字のトークンが入力された場合は入力バッファに追加し、演算子のトークンが入力された場合は左辺の数値を確定して演算子を保存する。
   * "="のトークンが入力された場合は、右辺の数値を確定して計算を実行し、結果を表示する。
   * "C"のトークンが入力された場合は、すべての状態をリセットする。
   */
  public handle(token: KeyToken): void {
    try {
      switch (token.kind) {
        case "digit":
          //入力された数字をコンソールログに出力
          console.log(`[Calculator] 数字ボタン: ${token.value}が押されました`);
          this.handleDigit(token.value);
          break;

        case "decimal":
          //入力された小数点をコンソールログに出力
          console.log(`[Calculator] 小数点ボタンが押されました`);
          this.handleDecimal();
          break;

        case "operator":
          //入力された演算子をコンソールログに出力
          console.log(`[Calculator] 演算子ボタン: ${token.value}が押されました`);
          this.handleOperator(token.value);
          break;

        case "equal":
          //入力されたイコールをコンソールログに出力
          console.log(`[Calculator] イコールボタンが押されました`);
          this.handleEqual();
          break;

        case "clear":
          //入力されたクリアをコンソールログに出力
          console.log(`[Calculator] クリアボタンが押されました`);
          this.handleClear();
          break;
      }
    } catch (error) {
      this.handleError(error); //エラーが発生した場合はエラー処理を行う
    }
  }


  /**
 * 数字入力を処理する
 * 入力バッファに数字を追加し、状態を更新して表示を反映する
 * @param digit 入力された数字
 */

  private handleDigit(digit: number): void {
    // Error状態では数字入力を無視する（Cキーのみで復帰可能）
    if (this.state === CalcState.Error) {
      console.log(`[Calculator] Error状態のため数字入力を無視します`);
      return;
    }

    if (this.state === CalcState.ResultShown) {
      this.reset();
    }

    this.buffer.pushDigit(digit);
    this.state = this.leftOperand === null ? CalcState.InputtingFirst : CalcState.InputtingSecond;
    this.updateDisplay();
  }

  /**
 * 小数点入力を処理する
 * 入力バッファに小数点を追加し、表示を更新する
 * エラー状態や計算結果表示中の場合は入力を無視する
 */
  private handleDecimal(): void {
    // エラー状態や計算結果表示中は入力を無視する
    if (this.state === CalcState.ResultShown || this.state === CalcState.Error) {
      console.log(`[Calculator] ${this.state}状態のため小数点入力を無視します`);
      return;
    }
    this.buffer.pushDecimal();
    this.updateDisplay();
  }

  /**
   * 演算子入力を処理する
   * 左の数値・右の数値・演算子が揃っている場合は計算を実行し、
   * その結果を新しい左の数値として保持する（左から順評価）
   * 0で割る場合は例外をスロー
   * 左の数値を確定して保存。まだ左の数値が確定していない場合は、入力バッファの数値を左の数値として保存
   * @param operator 入力された演算子
   */
  private handleOperator(operator: Operation): void {

    // Error状態の場合は全ての演算子を無視する（Cキーのみで復帰可能）
    if (this.state === CalcState.Error) {
      console.log(`[Calculator] Error状態のため演算子 ${operator} を無視します`);
      return;
    }

    // 数値が未入力（初期状態）で演算子が押された場合
    if (this.leftOperand === null && this.buffer.isEmpty()) {
      // マイナス記号のみは負の数入力として許可する
      if (operator === Operation.Subtract) {
        //負の数の入力が開始されたことをコンソールログに出力
        console.log("[Calculator] 負の数の入力を開始しました");
        this.buffer.pushMinus();
        this.updateDisplay();
        return;
      }
      // 数値未入力での演算子（+、×、÷）は無視する
      console.log(`[Calculator] 初期状態のため、演算子 ${operator} を無視します`);
      return;
    }

    // 負の数入力関連のガード（OperatorEntered状態では演算子更新として後続処理に流す）
    // ResultShown状態では「-」は負の数入力ではなく減算演算子として扱う
    if (this.state !== CalcState.OperatorEntered && this.state !== CalcState.ResultShown) {
      // バッファが"-"のみの状態で他の演算子が押された場合は無視
      if (this.buffer.getValue() === Config.MINUS && operator !== Operation.Subtract) {
        console.log(`[Calculator] 負の数入力中に他の演算子が押されたため無視します: ${operator}`);
        return;
      }
      // バッファが"-"のみの状態でさらに"-"が押された場合は無視
      if (this.buffer.getValue() === Config.MINUS && operator === Operation.Subtract) {
        console.log("[Calculator] -が押下されましたが、すでに操作済みなので無視します");
        return;
      }
      // バッファが空で"-"が押された場合は負の数入力として開始
      if (this.buffer.isEmpty() && operator === Operation.Subtract) {
        console.log("[Calculator] 負の数の入力が開始されました");
        this.buffer.pushMinus();
        this.updateDisplay();
        return;
      }
    }

    //左辺・右辺・演算子が揃っている場合は計算を実行し、その結果を新しい左辺として保持する（左から順評価）。0で割る場合は例外をスロー
    if (this.leftOperand !== null && !this.buffer.isEmpty() && this.operator !== null) {
      const rightOperand = this.buffer.toNumber();
      console.log(`[Calculator] intermediate compute: ${this.leftOperand} ${this.operator} ${rightOperand}`); //左辺・右辺・演算子が揃っている状態で演算子が入力されたことをコンソールログに出力 

      //左辺と右辺の数値を指定された演算で計算して左辺に保存する。0で割る場合は例外をスロー
      this.leftOperand = Evaluator.compute(
        this.leftOperand,
        this.operator,
        rightOperand
      );
      //計算結果をコンソールログに出力
      console.log(`[Calculator] intermediate result: ${this.leftOperand}`);

    } else {
      //左の数値を確定して保存する。まだ左の数値が確定していない場合は、入力バッファの数値を左の数値として保存
      if (!this.buffer.isEmpty()) {
        this.leftOperand = this.buffer.toNumber();
      }
    }

    //履歴の更新
    const operatorText = OperationFormatter.format(operator); //演算子を表示用の文字列に変換
    this.history = `${this.formatter.formatForDisplay(this.leftOperand!)} ${operatorText}`; //履歴文字列を更新
    this.display.renderHistory(this.history); //更新した履歴を表示

    //演算子を保存する
    this.operator = operator;

    //入力バッファをクリアして状態を更新
    this.buffer.clear();

    //演算子入力後の状態更新
    this.state = CalcState.OperatorEntered;

    //演算子入力後に左辺の値を表示
    if (this.leftOperand !== null) {
      this.display.render(this.formatter.formatForDisplay(this.leftOperand));
    }
  }

  /**
  * イコール入力を処理する
  * 左辺・右辺・演算子が揃っている場合に計算を実行し、結果を表示する
  */
  private handleEqual(): void {
    if (this.leftOperand === null || this.operator === null || this.buffer.isEmpty()) {
      //イコールが入力されたが、左辺・右辺・演算子のいずれかが不足している状態であることをコンソールログに出力
      console.warn("[Calculator] イコールボタンが押されましたが、左辺・右辺・演算子のいずれかが不足しています");
      return;
    }

    //右の数値を確定して保存する。入力バッファの数値を右の数値として保存
    const rightOperand = this.buffer.toNumber();

    //履歴の更新
    const rightText = this.formatter.formatForDisplay(rightOperand); //右の数値を表示用の文字列に変換
    this.history = `${this.history} ${rightText} =`; //履歴文字列を更新
    this.display.renderHistory(this.history); //更新した履歴を表示

    //左の数値・演算子・右の数値が揃っている状態でイコールが入力されたことをコンソールログに出力
    console.log(`[Calculator] compute: ${this.leftOperand} ${this.operator} ${rightOperand}`);

    //計算の実行。左の数値と右の数値を指定された演算で計算して結果を得る。0で割る場合は例外をスロー
    const result = Evaluator.compute(this.leftOperand, this.operator, rightOperand);

    //結果を新しい左の数値として保存する。計算結果を左の数値に保存して、入力バッファをクリアし、状態を更新
    this.leftOperand = result;
    this.buffer.clear();
    this.state = CalcState.ResultShown;

    //計算結果を表示する。表示用にフォーマットしてから表示する。
    this.display.render(this.formatter.formatForDisplay(result));
  }

  /**
   *クリア処理を行う
   *全ての状態を初期化し、表示を0に戻す
   */
  private handleClear(): void {
    this.reset();
    this.display.render(Config.INITIAL_DISPLAY);
    this.display.renderHistory("");
  }


  /**
 * エラー処理を行う
 * 計算エラー時にエラーメッセージを表示し、状態をリセットする
 * @param error 発生したエラー
 */
  private handleError(error: unknown): void {
    this.state = CalcState.Error;

    // エラーの種類に応じて適切なエラーメッセージを表示
    if (error instanceof DivisionByZeroError) {
      // 0で割ることはできません。(DivisionByZeroErrorクラスのmessageプロパティを表示)
      this.display.renderError(error.message);
    } else {
      this.display.renderError(Config.ERROR_MESSAGE);
    }

    //履歴のクリア
    this.display.renderHistory("");

    // 内部値の初期化
    this.leftOperand = null;
    this.operator = null;
    this.history = "";
    this.buffer.clear();
  }

  /**
   * 表示を更新 
   */
  private updateDisplay(): void {
    const rawValue = this.buffer.getValue();

    //入力バッファが空の場合は0を表示する
    if (rawValue === "") {
      this.display.render(Config.INITIAL_DISPLAY);
      return;
    }

    //負の数の入力中はマイナス記号を表示する
    if (rawValue === "-") {
      this.display.render("-");
      return;
    }

    //負の数の入力中で0の場合は"-0"と表示する
    if (rawValue === "-0") {
      this.display.render("-0");
      return;
    }

    //小数点を入力中はそのまま表示する
    if (rawValue.includes(".")) {
      this.display.render(rawValue);
      return;
    }

    //数値を表示用の文字列に変換して表示する
    const value = this.buffer.toNumber();
    const formattedDisplayValue = this.formatter.formatForDisplay(value);
    this.display.render(formattedDisplayValue);
  }

  /**
   * 電卓の内部状態を初期状態にリセットする
   */
  private reset(): void {
    this.leftOperand = null;
    this.operator = null;
    this.history = "";
    this.buffer.clear();
    this.state = CalcState.Ready;
  }
}
