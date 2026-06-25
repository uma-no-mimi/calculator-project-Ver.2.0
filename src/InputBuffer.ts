/**
 * input-buffer.ts(入力バッファ管理領域)
 * 入力バッファを管理するクラスを定義する。
 */

/** InputBuffer(概要)
 * 数字や小数点の入力を管理するクラス。
 * 入力された数字を文字列として保持し、必要に応じて数値に変換する。
 * - pushDigit(d: number): 数字を入力バッファに追加する。桁数の制限を考慮する。
 * - pushDecimal(): 小数点を入力バッファに追加する。すでに小数点がある場合は追加しない。
 * - clear(): 入力バッファをクリアする。
 * - toNumber(): 入力バッファの内容を数値に変換して返す。空の場合は0とみなす。
 * - isEmpty(): 入力バッファが空かどうかを返す。
 * - digitCount(): 入力バッファ内の数字の桁数をカウントして返す。小数点やマイナス記号は除外する。
 *  - getValue(): デバッグ用に入力バッファの現在の文字列を返す。 
 *  */

import { Config } from "./Config";

export class InputBuffer {
  private readonly maxDigits: number;
  private value: string;

  constructor(maxDigits: number, value: string = "") {
    this.maxDigits = maxDigits;
    this.value = value;
  }

  /**数字の追加(数字ボタンが押されたときの処理) 
   * - 桁数の制限を考慮して数字を追加。
   * - 先頭が0の状態で新しい数字が入力された場合は、先頭の0を新しい数字に置き換える。
   * - 先頭の0に0を追加することはしない。
   * - 先頭が"-0"の場合も同様に処理する。
   * - 先頭が"-"のみの場合も"-0"とみなして同様に処理。(負の数入力後に0を入力した場合の表示対応)
   * 
   * @param digit 入力された数字
   * @returns void
   */
  public pushDigit(digit: number): void {
    //桁数のチェック 
    //超える場合は入力を無視し、コンソールに警告を表示
    if (this.digitCount() >= this.maxDigits) {
      console.warn(`[InputBuffer] 最大桁数 (${this.maxDigits}) を超えました`);
      return;
    }

    //先頭が0の状態で新しい数字が入力された場合は、先頭の0を新しい数字に置き換える。
    if (this.value === Config.ZERO) { //定数ZEROを使用して先頭の0の状態をチェック 
      if (digit === 0) return; //先頭の0に0を追加
      this.value = digit.toString();//先頭の0を新しい数字に置き換え
      return;
    }

    //先頭が"-"のみの場合、"-0"に変換してから"-0"の処理に進む（負の数入力後に0を入力した場合の表示対応）
    if (this.value === Config.MINUS) {
      this.value = "-0"; // "-" → "-0"
    }

    //先頭が"-0"の場合も同様に処理
    if (this.value === "-0") {
      if (digit === 0) return; //"-0"に0を追加
      this.value = Config.MINUS + digit.toString(); //"-0"を新しい数字に置き換え
      return;
    }

    this.value += digit.toString(); //上記の条件に当てはまらない場合は数値から文字列に変換して追加
  }

  /**小数点の追加 
   * - すでに小数点がある場合は追加しない（コンソールにログを出力）。
   * - 数値未入力（空または"-"のみ）の場合は無視する。
   * - 上記の条件に当てはまらない場合は小数点を追加する。
   * @returns void
   */
  public pushDecimal(): void {
    //すでに小数点がある場合は追加しない（不具合4対応：コンソールにログを出力）
    if (this.value.includes(".")) {
      console.log("[InputBuffer] 2回目以降押されたが、すでに小数点を入力済みです");
      return;
    }

    //数値未入力（空）の場合は"0."として扱う
    if (this.value === "") {
      this.value = "0.";
      return;
    }

    //"-"のみの場合は"-0."として扱う
    if (this.value === Config.MINUS) {
      this.value = "-0.";
      return;
    }

    this.value += "."; //上記の条件に当てはまらない場合は小数点を追加
  }

  /**入力のクリア
   * 入力バッファを空にする。
   * @returns void
   */
  public clear(): void {
    this.value = "";//入力バッファを空にする
  }

  /**マイナス記号の追加
   * - 空の状態または"0"のときにのみマイナス記号を追加する。
   * - 既にマイナス記号がある場合は何もしない。
   * @returns void
   */
  public pushMinus(): void {
    //既にマイナス記号がある場合は何もしない
    if (this.value.startsWith(Config.MINUS)) {
      return;
    }

    //空の状態または"0"のときにのみマイナス記号を追加
    if (this.value === "" || this.value === Config.ZERO) {
      this.value = Config.MINUS;
    }
  }


  /**文字列を数値に変換
   * @returns number
   */
  public toNumber(): number {
    return parseFloat(this.value || Config.ZERO); //空の場合は0とみなす
  }


  /**空データチェック(空白も考慮する)
   * @returns boolean
   */
  public isEmpty(): boolean {
    return this.value.length === 0;
  }


  /**桁数のカウント
   * @returns number
   */
  public digitCount(): number {
    //小数点を除いた文字数をカウント
    return this.value.replace(/[.\-]/g, "").length;//小数点とマイナス記号を除外して数字の桁数をカウント
  }

  /**
 * 現在の入力文字列を取得する
 * @returns 入力中の文字列
 */
  public getValue(): string {
    return this.value;
  }
}