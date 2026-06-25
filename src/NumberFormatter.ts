/**
 * NumberFormatter.ts(数値の表示フォーマット管理領域)
 * 数値を表示用の文字列に変換するクラスを定義する。
 */

/** NumberFormatter(概要)
 * 数値を表示用の文字列に変換するクラス。
 * - formatForDisplay(n: number): 数値nを表示用の文字列に変換して返す。桁数がmaxDigitsを超える場合は指数表記にする。
 * 変換ルール:
 * - 通常はnをそのまま文字列に変換する。
 * - 小数点以下の不要な0は削除する（例: "1.2300" → "1.23"）。
 * - 桁数がmaxDigitsを超える場合は指数表記にする（例: 123456789 → "1.23e+8"）。
 * - 桁数のカウントは、数字のみを対象とし、小数点やマイナス記号は除外する。
 * - maxDigitsはコンストラクタで指定し、表示可能な最大桁数を設定する。
 * - 例外処理は特に必要ないが、入力が数値でない場合はNaNを返すことも考慮する。
 */

//数値を表示用の文字列に変換するクラス
export class NumberFormatter { //コンストラクタで表示可能な最大桁数を指定
  private readonly maxDigits: number;
  constructor(maxDigits: number) { this.maxDigits = maxDigits; }

  //数値を表示用の文字列に変換
  public formatForDisplay(n: number): string {
    // 通常表示
    let str = n.toString();

    // 指数表記（非常に小さい数）の場合、toFixed で通常の小数表記に変換する
    // 例: 0.0000001 → toString() → "1e-7" → toFixed(7) → "0.0000001"
    if (str.includes('e-')) {
      const exp = parseInt(str.split('e-')[1], 10);
      str = n.toFixed(exp);
    }

    // 浮動小数点誤差の補正:
    // 小数点以下の桁数が10桁を超える場合、toFixed(10)で適切に丸める
    // 例: -3*9.3 → -27.899999999999999 (15桁) → toFixed(10) → "-27.9000000000" → "-27.9"
    if (str.includes('.') && str.split('.')[1].length > 10) {
      str = n.toFixed(10);
    }

    // 不要な0を削除(例: "1.2300" → "1.23")
    if (str.includes(".")) {
      str = str.replace(/\.?0+$/, "");
    }

    // 桁数チェック（.と-除外）
    const digitCount = str.replace(/[.\-]/g, "").length;

    // 桁数オーバーなら指数表記
    if (digitCount > this.maxDigits) {
      str = n.toExponential(this.maxDigits - 1);
    }

    return str;
  }
}