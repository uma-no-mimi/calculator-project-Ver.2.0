/**
 * IDisplay.ts（表示インターフェース定義）
 * 表示機能を持つクラスが実装すべきメソッドを定義する。
 * IDisplayインターフェースは、電卓の表示機能を抽象化するために使用される。
 * これにより、異なる表示方法（例：HTML、コンソール、GUIなど）を持つクラスが同じインターフェースを実装することで、
 * Calculatorクラスが表示方法に依存せずに動作可能。
 */
export interface IDisplay {

    /**
     * 通常表示を行う
     * @param displayText 表示文字列
     */
    render(
        displayText: string
    ): void;

    /**
     * 履歴表示を行う
     * @param historyText 履歴文字列
     */
    renderHistory(
        historyText: string
    ): void;


    /**
     * エラー表示を行う
     * @param errorMessage エラーメッセージ
     */
    renderError(
        errorMessage: string
    ): void;

}