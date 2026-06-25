/**
 * DomDisplay.ts（表示制御）
 * 計算結果、履歴、やエラーを画面へ表示するクラス
 * 画面(DOM)を渡されると、計算結果やエラーを表示するためのメソッドを提供。  
 * DomDisplayが保持するのは、表示領域のHTML要素だけで、計算ロジックや入力管理には関与しない。
 */

//表示インターフェースを定義するクラス
import type { IDisplay } from "./IDisplay";

export class DomDisplay implements IDisplay {

    // 表示領域のHTML要素
    private readonly displayElement: HTMLElement;

    //履歴表示用のHTML要素
    private readonly historyElement: HTMLElement;

    /**
     * コンストラクタで表示領域のHTML要素を受け取り、プロパティに保存
     * @param displayElement 表示領域のHTML要素
     * @param historyElement 履歴表示用のHTML要素
     */
    constructor(displayElement: HTMLElement, historyElement: HTMLElement) {
        this.displayElement = displayElement;
        this.historyElement = historyElement;
    }

    /**
     * 計算結果を画面へ表示
     * @param displayText 表示する文字列
     */
    public render(displayText: string): void {
        this.displayElement.textContent = displayText;

        // エラー表示スタイル解除
        this.displayElement.classList.remove("error");
    }

    /**
     * 履歴を画面へ表示
     * @param historyText 履歴に表示する文字列
     */
    public renderHistory(historyText: string): void {
        this.historyElement.textContent = historyText;
    }

    /**
     * エラー内容を画面へ表示する
     * @param errorMessage エラーメッセージ
     */
    public renderError(errorMessage: string): void {
        //エラーメッセージを表示領域に表示
        this.displayElement.textContent = errorMessage;

        //履歴クリア
        this.historyElement.textContent = "";

        //エラー表示用のCSSクラス "error" を追加して赤文字にする
        this.displayElement.classList.add("error");
    }

}