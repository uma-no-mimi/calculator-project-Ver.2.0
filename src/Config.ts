/**
 * Config.ts（設定値管理）
 * アプリ全体で使用する定数を管理する
 */

export const Config = {
  /** 最大入力桁数（小数点・符号を除く） */
  MAX_DIGITS: 8,

  /** 初期表示 */
  INITIAL_DISPLAY: "0",

  /** エラー表示 */
  ERROR_MESSAGE: "Error",

  /** 数値のゼロ文字列 */
  ZERO: "0",

  /** マイナス記号 */
  MINUS: "-"
} as const;



