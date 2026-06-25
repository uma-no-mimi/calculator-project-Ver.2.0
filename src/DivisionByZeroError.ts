/**
 * DivisionByZeroError.ts（0除算例外）
 * 0で割る計算が行われた場合に送出する例外クラス
 */
export class DivisionByZeroError extends Error {

    /**
     * 0除算エラー生成
     */
    constructor() {
        // Errorクラスのコンストラクタにエラーメッセージを渡す
        super("0で割ることはできません。");

        // Errorクラスを継承
        this.name = "DivisionByZeroError";
    }

}