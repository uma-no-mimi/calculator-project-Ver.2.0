import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Calculator } from '../Calculator';
import { InputBuffer } from '../InputBuffer';
import { NumberFormatter } from '../NumberFormatter';
import { Operation } from '../Operation';
import { CalcState } from '../CalcState';
import { Config } from '../Config';
import type { IDisplay } from '../IDisplay';
import type { KeyToken } from '../KeyToken';

/**
 * Calculatorクラスのテスト
 * - Calculatorクラスのhandleメソッドが正しい動作をするかを確認。
 * - 基本的な機能、四則演算の正常系、異常系・エラー処理、境界値・特殊ケース、状態遷移のテストを実施。
 */

/** モックオブジェクト作成
 * - IDisplayインターフェースを実装したモッククラスを作成し、render、renderHistory、renderErrorメソッドをjest.fn()でモック化。
 * - テスト内でこのモッククラスを使用して、Calculatorクラスの表示関連の動作を検証。
 */
class MockDisplay implements IDisplay {
    render = vi.fn();
    renderHistory = vi.fn();
    renderError = vi.fn();
}

describe('Calculator クラス テスト', () => {
    let calculator: Calculator;
    let mockDisplay: MockDisplay;
    let formatter: NumberFormatter;
    let buffer: InputBuffer;

    // 各テスト実行前に毎回初期化
    beforeEach(() => {
        mockDisplay = new MockDisplay();
        formatter = new NumberFormatter(Config.MAX_DIGITS);
        buffer = new InputBuffer(Config.MAX_DIGITS);
        calculator = new Calculator(mockDisplay, formatter, buffer);
        vi.clearAllMocks();
    });

    // テストで使用するKeyTokenを簡単に作成するためのヘルパー関数
    const createDigitToken = (value: number): KeyToken => ({ kind: 'digit', value });
    const createDecimalToken = (): KeyToken => ({ kind: 'decimal' });
    const createOperatorToken = (value: Operation): KeyToken => ({ kind: 'operator', value });
    const createEqualToken = (): KeyToken => ({ kind: 'equal' });
    const createClearToken = (): KeyToken => ({ kind: 'clear' });

    /**
     * 基本機能のテスト
     * - 初期状態で表示が0になっていることを確認。
     * - 数字入力が正しく表示されることを確認。
     * - 小数点入力が正しく処理されることを確認。
     * - クリア(C)ボタンで全ての状態がリセットされることを確認。
     */
    describe('基本機能', () => {
        it('初期状態で表示が0になっている', () => {
            calculator.handle(createClearToken());
            expect(mockDisplay.render).toHaveBeenCalledWith('0');
        });

        it('数字入力が正しく表示される', () => {
            calculator.handle(createDigitToken(1));
            calculator.handle(createDigitToken(2));
            calculator.handle(createDigitToken(3));

            expect(mockDisplay.render).toHaveBeenLastCalledWith('123');
        });

        it('小数点入力が正しく処理される', () => {
            calculator.handle(createDigitToken(5));
            calculator.handle(createDecimalToken());
            calculator.handle(createDigitToken(7));

            expect(mockDisplay.render).toHaveBeenLastCalledWith('5.7');
        });

        it('クリア(C)ボタンで全ての状態がリセットされる', () => {
            calculator.handle(createDigitToken(9));
            calculator.handle(createClearToken());

            expect(mockDisplay.render).toHaveBeenLastCalledWith('0');
            expect(buffer.isEmpty()).toBe(true);
        });
    });

    /**
     * 四則演算 正常系テスト
     * - 足し算が正しく計算できること
     * - 引き算が正しく計算できること
     * - 掛け算が正しく計算できること
     * - 割り算が正しく計算できること
     * - 小数の計算が正しく計算できること
     * - 連続演算が左から順に評価されること
     */
    describe('四則演算 正常系', () => {
        it('足し算: 1 + 2 = 3 が正しく計算できる', () => {
            calculator.handle(createDigitToken(1));
            calculator.handle(createOperatorToken(Operation.Add));
            calculator.handle(createDigitToken(2));
            calculator.handle(createEqualToken());

            expect(mockDisplay.render).toHaveBeenLastCalledWith('3');
        });

        it('引き算: 10 - 4 = 6 が正しく計算できる', () => {
            calculator.handle(createDigitToken(1));
            calculator.handle(createDigitToken(0));
            calculator.handle(createOperatorToken(Operation.Subtract));
            calculator.handle(createDigitToken(4));
            calculator.handle(createEqualToken());

            expect(mockDisplay.render).toHaveBeenLastCalledWith('6');
        });

        it('掛け算: 7 * 8 = 56 が正しく計算できる', () => {
            calculator.handle(createDigitToken(7));
            calculator.handle(createOperatorToken(Operation.Multiply));
            calculator.handle(createDigitToken(8));
            calculator.handle(createEqualToken());

            expect(mockDisplay.render).toHaveBeenLastCalledWith('56');
        });

        it('割り算: 12 / 4 = 3 が正しく計算できる', () => {
            calculator.handle(createDigitToken(1));
            calculator.handle(createDigitToken(2));
            calculator.handle(createOperatorToken(Operation.Divide));
            calculator.handle(createDigitToken(4));
            calculator.handle(createEqualToken());

            expect(mockDisplay.render).toHaveBeenLastCalledWith('3');
        });

        it('小数の計算: 0.5 + 0.3 = 0.8 が正しく計算できる', () => {
            calculator.handle(createDigitToken(0));
            calculator.handle(createDecimalToken());
            calculator.handle(createDigitToken(5));
            calculator.handle(createOperatorToken(Operation.Add));
            calculator.handle(createDigitToken(0));
            calculator.handle(createDecimalToken());
            calculator.handle(createDigitToken(3));
            calculator.handle(createEqualToken());

            expect(mockDisplay.render).toHaveBeenLastCalledWith('0.8');
        });

        it('連続演算: 1 + 2 + 3 = 6 が左から順に評価される', () => {
            calculator.handle(createDigitToken(1));
            calculator.handle(createOperatorToken(Operation.Add));
            calculator.handle(createDigitToken(2));
            calculator.handle(createOperatorToken(Operation.Add));
            calculator.handle(createDigitToken(3));
            calculator.handle(createEqualToken());

            expect(mockDisplay.render).toHaveBeenLastCalledWith('6');
        });
    });

    /**
     * 異常系・エラーテスト
     * - 0除算時に DivisionByZeroError が正しく処理されること
     * - エラー発生後に数字入力すると状態がリセットされること
     * - イコール単体押下で何も実行されないこと
     */
    describe('異常系・エラー処理', () => {
        it('0除算時に DivisionByZeroError が正しく処理される', () => {
            calculator.handle(createDigitToken(5));
            calculator.handle(createOperatorToken(Operation.Divide));
            calculator.handle(createDigitToken(0));
            calculator.handle(createEqualToken());

            expect(mockDisplay.renderError).toHaveBeenCalledWith('0で割ることはできません。');
        });

        it('エラー発生後に数字入力しても無視される（Cキーのみで復帰）', () => {
            // 0除算でエラー発生
            calculator.handle(createDigitToken(9));
            calculator.handle(createOperatorToken(Operation.Divide));
            calculator.handle(createDigitToken(0));
            calculator.handle(createEqualToken());

            // エラー表示後のrender呼び出し回数を記録
            const renderCallCount = mockDisplay.render.mock.calls.length;

            // 数字を入力しても無視される
            calculator.handle(createDigitToken(7));

            // renderが追加で呼ばれていない（表示が変わらない）
            expect(mockDisplay.render).toHaveBeenCalledTimes(renderCallCount);
        });

        it('イコール単体押下で何も実行されない', () => {
            const renderBeforeCallCount = mockDisplay.render.mock.calls.length;
            calculator.handle(createEqualToken());

            expect(mockDisplay.render).toHaveBeenCalledTimes(renderBeforeCallCount);
        });
    });

    /**
     * 境界値・特殊ケーステスト
     * - 最大桁数入力時の動作
     * - 演算結果表示後に新しい数字を入力するとリセットされること
     * - 同じ演算子を連続で押下した場合、最後の演算子が有効になること
     */
    describe('境界値・特殊ケース', () => {
        it('最大桁数入力時の動作', () => {
            // MAX_DIGITSの桁数分、9を入力
            for (let i = 0; i < Config.MAX_DIGITS; i++) {
                calculator.handle(createDigitToken(9)); // 9を連続入力
            }

            expect(mockDisplay.render).toHaveBeenLastCalledWith('99999999'); // MAX_DIGITSの数値を参照に沿った回答
        });

        it('演算結果表示後に新しい数字を入力するとリセットされる', () => {
            // 計算実行
            calculator.handle(createDigitToken(3));
            calculator.handle(createOperatorToken(Operation.Add));
            calculator.handle(createDigitToken(5));
            calculator.handle(createEqualToken());

            // 新しい数字入力
            calculator.handle(createDigitToken(7));

            expect(mockDisplay.render).toHaveBeenLastCalledWith('7');
        });

        it('同じ演算子を連続で押下した場合、最後の演算子が有効になる', () => {
            calculator.handle(createDigitToken(5));
            calculator.handle(createOperatorToken(Operation.Add));
            calculator.handle(createOperatorToken(Operation.Multiply)); // 上書き
            calculator.handle(createDigitToken(3));
            calculator.handle(createEqualToken());

            expect(mockDisplay.render).toHaveBeenLastCalledWith('15');
        });
    });

    /**
     * 状態遷移テスト
     * - Ready → InputtingFirst → OperatorEntered → InputtingSecond → ResultShown の順で状態が遷移するか確認
     */
    describe('状態遷移', () => {
        it('Ready → InputtingFirst → OperatorEntered → InputtingSecond → ResultShown の順で状態が遷移する', () => {
            // ※privateプロパティへのアクセスはテスト目的でのみ許可
            const getState = () => (calculator as any).state;

            expect(getState()).toBe(CalcState.Ready);

            calculator.handle(createDigitToken(5));
            expect(getState()).toBe(CalcState.InputtingFirst);

            calculator.handle(createOperatorToken(Operation.Add));
            expect(getState()).toBe(CalcState.OperatorEntered);

            calculator.handle(createDigitToken(3));
            expect(getState()).toBe(CalcState.InputtingSecond);

            calculator.handle(createEqualToken());
            expect(getState()).toBe(CalcState.ResultShown);
        });
    });


    /**
     * 例外系・特殊な操作・エラー時復旧テスト
     * 予期せぬ操作やエラーが発生した際の動作を確認するテスト
     * 
     * 3. バッファが "-" の状態で他の演算子を押しても無視されること
     * 4. Error状態でマイナスを押すとリセットされて負の数が入れられること
     * 5. Error状態で他の演算子を押しても無視されること
     * 6. "-" の状態で "0" を押しても表示が"-"のまま維持されること（"-0"として扱われる）
     * 7. 小数点連打時のコンソールログ確認
     */

    //初期状態での各演算子の挙動テスト
    describe('不具合修正の動作保証', () => {
        it('初期状態で+を押しても無視され、表示は変化しない', () => {
            // 初期状態で + を押す → 数値未入力のため無視される
            calculator.handle(createOperatorToken(Operation.Add));

            // 表示は更新されない
            expect(mockDisplay.render).not.toHaveBeenCalled();
            // 履歴は更新されない
            expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
        });

        it('初期状態で×を押しても無視され、表示は変化しない', () => {
            // 初期状態で × を押す → 数値未入力のため無視される
            calculator.handle(createOperatorToken(Operation.Multiply));

            // 表示は更新されない
            expect(mockDisplay.render).not.toHaveBeenCalled();
            // 履歴は更新されない
            expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
        });

        it('初期状態で÷を押しても無視され、表示は変化しない', () => {
            // 初期状態で ÷ を押す → 数値未入力のため無視される
            calculator.handle(createOperatorToken(Operation.Divide));

            // 表示は更新されない
            expect(mockDisplay.render).not.toHaveBeenCalled();
            // 履歴は更新されない
            expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
        });


        it('初期状態でマイナスを押すと "-" のみが表示される', () => {
            calculator.handle(createOperatorToken(Operation.Subtract));

            expect(mockDisplay.render).toHaveBeenLastCalledWith('-');
        });

        it('"-"の状態で+を押しても無視され、"-"表示は変わらない', () => {
            // 初期状態でマイナスを押す → "-"表示
            calculator.handle(createOperatorToken(Operation.Subtract));
            expect(mockDisplay.render).toHaveBeenLastCalledWith('-');

            const renderCallCount = mockDisplay.render.mock.calls.length;

            // "+"を押す → 負の数入力中は他の演算子を無視
            calculator.handle(createOperatorToken(Operation.Add));

            // renderが追加で呼ばれていない（表示が変わらない）
            expect(mockDisplay.render).toHaveBeenCalledTimes(renderCallCount);
        });

        it('"-"の状態で×を押しても無視され、"-"表示は変わらない', () => {
            calculator.handle(createOperatorToken(Operation.Subtract));
            expect(mockDisplay.render).toHaveBeenLastCalledWith('-');

            const renderCallCount = mockDisplay.render.mock.calls.length;

            calculator.handle(createOperatorToken(Operation.Multiply));

            expect(mockDisplay.render).toHaveBeenCalledTimes(renderCallCount);
        });

        it('"-"の状態で÷を押しても無視され、"-"表示は変わらない', () => {
            calculator.handle(createOperatorToken(Operation.Subtract));
            expect(mockDisplay.render).toHaveBeenLastCalledWith('-');

            const renderCallCount = mockDisplay.render.mock.calls.length;

            calculator.handle(createOperatorToken(Operation.Divide));

            expect(mockDisplay.render).toHaveBeenCalledTimes(renderCallCount);
        });

        it('"-"の状態で小数点を押すと"-0."に変換される', () => {
            // 初期状態でマイナスを押す → "-"表示
            calculator.handle(createOperatorToken(Operation.Subtract));
            expect(mockDisplay.render).toHaveBeenLastCalledWith('-');

            // 小数点を押すと "-0." に変換される
            calculator.handle(createDecimalToken());
            expect(mockDisplay.render).toHaveBeenLastCalledWith('-0.');
        });

        it('Error状態でマイナスを押しても無視される（Cキーのみで復帰）', () => {
            // 0除算でエラー発生
            calculator.handle(createDigitToken(5));
            calculator.handle(createOperatorToken(Operation.Divide));
            calculator.handle(createDigitToken(0));
            calculator.handle(createEqualToken());

            // エラー表示後のrender呼び出し回数を記録
            const renderCallCount = mockDisplay.render.mock.calls.length;

            // Error状態でマイナスを押しても無視される
            calculator.handle(createOperatorToken(Operation.Subtract));

            // renderが追加で呼ばれていない（表示が変わらない）
            expect(mockDisplay.render).toHaveBeenCalledTimes(renderCallCount);
        });

        it('Error状態で他の演算子を押しても無視される', () => {
            // 0除算でエラー発生
            calculator.handle(createDigitToken(5));
            calculator.handle(createOperatorToken(Operation.Divide));
            calculator.handle(createDigitToken(0));
            calculator.handle(createEqualToken());

            // エラー表示後のrender/Error呼び出しカウントを取得
            const renderCallCount = mockDisplay.render.mock.calls.length;

            // Error状態で+を押す
            calculator.handle(createOperatorToken(Operation.Add));

            // renderが追加で呼ばれていない（表示が変わらない）ことを確認
            expect(mockDisplay.render).toHaveBeenCalledTimes(renderCallCount);
        });

        it('"-"の状態で0を押すと "-0" に変化する', () => {
            // 初期状態でマイナスを押す → "-"表示
            calculator.handle(createOperatorToken(Operation.Subtract));
            expect(mockDisplay.render).toHaveBeenLastCalledWith('-');

            // 0を押す → "-"が"-0"に変化
            calculator.handle(createDigitToken(0));
            expect(mockDisplay.render).toHaveBeenLastCalledWith('-0');

            // 内部で"-0"になっている
            expect(buffer.getValue()).toBe('-0');
        });

        it('小数点連打時にコンソールにログが出力される', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            // 数字→小数点→数字→小数点（2回目）
            calculator.handle(createDigitToken(1));
            calculator.handle(createDecimalToken());
            calculator.handle(createDigitToken(5));
            calculator.handle(createDecimalToken()); // 2回目の小数点

            // 2回目の小数点でログが出力されたことを確認
            expect(consoleLogSpy).toHaveBeenCalledWith(
                expect.stringContaining('2回目以降押されたが、すでに小数点を入力済みです')
            );

            consoleLogSpy.mockRestore();
        });
    });
});