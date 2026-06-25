/**
 * main.ts(HTMLからのイベント検知処理領域)
 * HTMLのボタン要素を取得し、クリックイベントを検知して電卓の処理を呼び出す。
 * - DomDisplay: 計算結果やエラーを画面へ表示するクラス
 * - InputBuffer: 数字や小数点の入力を管理するクラス
 * - NumberFormatter: 計算結果を表示用にフォーマットするクラス
 * - Calculator: 入力を受け取り、状態を管理し、計算処理と表示フォーマットを統括するクラス
 * - KeyMapper: HTMLボタンのdata-key属性を、電卓で扱うKeyTokenへ変換するクラス
 * 上記のクラスをインスタンス化し、HTMLのボタンにクリックイベントリスナーを設定して、ユーザーの入力を処理。
 *  */

import { Config } from "./Config";
import { DomDisplay } from "./DomDisplay";
import { Calculator } from "./Calculator";
import { InputBuffer } from "./InputBuffer";
import { NumberFormatter } from "./NumberFormatter";
import { KeyMapper } from "./KeyMapper";


/** 表示制御生成 */
// HTMLの表示領域要素を取得してDomDisplayクラスのインスタンスを生成
const display = new DomDisplay(
  document.getElementById("display")!,
  document.getElementById("history")!
);

/** 表示フォーマッタ生成 */
// 計算結果を表示用にフォーマットするNumberFormatterクラスのインスタンスを生成。Configから最大桁数を渡す。
const formatter = new NumberFormatter(
  Config.MAX_DIGITS
);

/** 入力バッファ生成 */
// 入力された数字を管理するInputBufferクラスのインスタンスを生成。Configから最大桁数を渡す。
const inputBuffer = new InputBuffer(
  Config.MAX_DIGITS
);

/** 電卓本体生成 */
// DomDisplay、NumberFormatter、InputBufferのインスタンスを渡してCalculatorクラスのインスタンスを生成
const calculator = new Calculator(
  display,
  formatter,
  inputBuffer
);

/** 入力変換生成 */
// HTMLのボタン要素のdata-key属性を、電卓で扱うKeyTokenへ変換するKeyMapperクラスのインスタンスを生成
const mapper = new KeyMapper();


/**
 * 全ボタンにクリックイベント設定
 */
// HTMLの全てのボタン要素を取得し、forEachでそれぞれにクリックイベントリスナーを設定
document
  .querySelectorAll(".buttons > button")
  .forEach((buttonElement) => {

    // クリックイベントリスナーの設定
    buttonElement.addEventListener(
      "click",
      (event) => {

        //クリックされたボタン要素を取得
        const clickedElement =
          event.currentTarget as HTMLElement;

        //クリックされたボタンのdata-key属性を解析してKeyTokenへ変換
        const token =
          mapper.resolve(clickedElement.dataset.key);

        //有効なKeyTokenが得られた場合は、Calculatorのhandleメソッドに渡して処理を実行
        if (token) {
          calculator.handle(token);
        }

      }
    );

  });

/** ページロード完了時にコンソロールにログを出力 */
console.log("[App] Calculatorアプリが起動しました");