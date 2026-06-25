import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InputBuffer } from "../InputBuffer";
import { Config } from "../Config";


/**
 * InputBufferの動作テスト
 * - InputBufferクラスの各メソッドが正しく動作するかを確認。
 * - 初期化、数字入力、小数点入力、クリア、数値変換、空の状態の判定、桁数のカウントなどのテスト。
 * - 境界値やエッジケースも含めて、様々な入力パターンに対する動作を確認。
 * - テスト前後の処理でコンソール出力をモック化して、テストの可読性を保ち、ログ出力がテスト結果に影響を与えないようにする。
 */
describe("InputBufferの動作テスト", () => {
    /**
     * テスト前処理
     * 桁超過時ログ出力をモック化して、テスト中のコンソール出力を抑制
     * 理由：テストの可読性を保ち、ログ出力がテスト結果に影響を与えないようにするため
     */
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    /**
     * テスト後処理
     * モックを毎回解除
     * 理由：他のテストケースに影響を与えないようにするため
     */
    afterEach(() => {
        vi.restoreAllMocks();
    });


    /** 各メソッドの動作テスト */

    /**
     *  初期化のテスト
     * - インスタンス生成時の初期状態を確認。
     * - 初期値を指定して生成できるか確認。
     */
    describe("初期状態", () => {
        it("インスタンス生成時は空の状態で初期化される（数値0, 桁数0）", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS); // 最大桁数はConfigから取得
            expect(buffer.isEmpty()).toBe(true); // 初期状態は入力データは空であることを確認 
            expect(buffer.toNumber()).toBe(0); // 初期状態は数値変換したときは0になることを確認
            expect(buffer.digitCount()).toBe(0); // 初期状態は桁数が0であることを確認
        });

        /**
         * 初期値を指定して生成できるか確認
         * - 数値123が入力された状態で初期化されることを確認。
         * - 数値変換したときに123になることを確認。
         * - 桁数が3であることを確認。
         */
        it("初期値を指定して生成できる（数値123, 桁数3）", () => {
            // 123が入力された状態で初期化されることを確認
            const buffer = new InputBuffer(Config.MAX_DIGITS, "123");
            expect(buffer.toNumber()).toBe(123);// 数値変換したときに123になることを確認
            expect(buffer.digitCount()).toBe(3);// 桁数が3であることを確認
        });

        /**
         * pushMinus メソッドのテスト
         * - マイナス記号の追加が正しく動作するか確認
         */
        describe("pushMinus メソッド", () => {
            /**
             * 空の状態でpushMinusを呼び出すと"-"になることを確認
             */
            it("空の状態でpushMinusを呼び出すと'-'になる", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus();

                expect(buffer.toNumber()).toBeNaN(); // "-"のみなのでNaN
                expect(buffer.isEmpty()).toBe(false);
                expect(buffer.digitCount()).toBe(0); // マイナス記号は桁数にカウントされない
            });

            /**
             * "0"の状態でpushMinusを呼び出すと"-"になることを確認
             */
            it("'0'の状態でpushMinusを呼び出すと'-'になる", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS, Config.ZERO);
                buffer.pushMinus();

                expect(buffer.toNumber()).toBeNaN(); // "-"のみなのでNaN
                expect(buffer.isEmpty()).toBe(false);
            });

            /**
             * 既にマイナス記号がある場合は何もしないことを確認
             */
            it("既にマイナス記号がある場合は何もしない", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS, "-5");
                buffer.pushMinus();

                expect(buffer.toNumber()).toBe(-5);
            });

            /**
             * 数字が入力されている場合は何もしないことを確認
             */
            it("数字が入力されている場合は何もしない", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS, "5");
                buffer.pushMinus();

                expect(buffer.toNumber()).toBe(5);
            });
        });


        /**
         * 負数でのpushDigit メソッドのテスト
         */
        describe("負数でのpushDigit メソッド", () => {
            /**
             * "-"の状態で数字を入力すると負数になることを確認
             */
            it("'-'の状態で数字5を入力すると'-5'になる", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus();
                buffer.pushDigit(5);

                expect(buffer.toNumber()).toBe(-5);
                expect(buffer.digitCount()).toBe(1);
            });

            /**
             * "-0"の状態で0以外の数字を入力すると"-0"が置き換わることを確認
             */
            it("'-0'の状態で数字5を入力すると'-5'になる", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus();
                buffer.pushDigit(0); // "-0"になる
                buffer.pushDigit(5);

                expect(buffer.toNumber()).toBe(-5);
                expect(buffer.digitCount()).toBe(1);
            });

            /**
             * "-0"の状態で0を入力しても何も変化しないことを確認
             */
            it("'-0'の状態で0を入力しても何も変化しない", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus();
                buffer.pushDigit(0); // "-0"になる
                buffer.pushDigit(0);

                expect(buffer.toNumber()).toBe(-0); // -0は0と等しい
                expect(buffer.digitCount()).toBe(1);
            });

            /**
             * "-"の状態で0を入力すると"-0"になり、さらに0を入力しても変化しないことを確認
             */
            it("'-'の状態で0を入力すると'-0'になる", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus(); // "-"になる
                expect(buffer.getValue()).toBe("-");

                buffer.pushDigit(0); // "-0"になる
                expect(buffer.getValue()).toBe("-0");
                expect(buffer.toNumber()).toBe(-0); // -0は0と等しい
                expect(buffer.digitCount()).toBe(1);

                // さらに0を入力しても変化しない
                buffer.pushDigit(0);
                expect(buffer.getValue()).toBe("-0");
                expect(buffer.digitCount()).toBe(1);
            });

            /**
             * 負数の小数点以下に入力できることを確認
             */
            it("負数の小数点以下に入力できる（数値-1.5, 桁数2）", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus();
                buffer.pushDigit(1);
                buffer.pushDecimal();
                buffer.pushDigit(5);

                expect(buffer.toNumber()).toBe(-1.5);
                expect(buffer.digitCount()).toBe(2);
            });
        });


        /**
         * 負数でのpushDecimal メソッドのテスト
         */
        describe("負数でのpushDecimal メソッド", () => {
            /**
             * "-"の状態で小数点を入力すると"-0."になることを確認
             */
            it("'-'の状態で小数点を入力すると'-0.'になる", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus();
                buffer.pushDecimal();

                expect(buffer.getValue()).toBe("-0."); // "-0."に変換される
                expect(buffer.digitCount()).toBe(1);
            });

            /**
             * "-0."の状態で数字を入力できることを確認
             */
            it("'-0.'の状態で数字5を入力すると'-0.5'になる", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS, "-0.");
                buffer.pushDigit(5);

                expect(buffer.toNumber()).toBe(-0.5);
                expect(buffer.digitCount()).toBe(2);
            });
        });


        /**
         * 負数の境界値・エッジケースのテスト
         */
        describe("負数の境界値・エッジケース", () => {
            /**
             * 負数で最大桁数まで入力できることを確認
             */
            it("負数で最大桁数まで入力できる（数値-12345678, 桁数8）", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus();
                for (let i = 1; i <= Config.MAX_DIGITS; i++) {
                    buffer.pushDigit(i);
                }

                expect(buffer.toNumber()).toBe(-12345678);
                expect(buffer.digitCount()).toBe(Config.MAX_DIGITS);
            });

            /**
             * 負数で最大桁数を超えて入力しようとすると無視されることを確認
             */
            it("負数で最大桁数を超えて入力しようとすると無視される", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus();
                for (let i = 1; i <= Config.MAX_DIGITS; i++) {
                    buffer.pushDigit(i);
                }
                buffer.pushDigit(9); // 無視される

                expect(buffer.toNumber()).toBe(-12345678);
                expect(buffer.digitCount()).toBe(Config.MAX_DIGITS);
            });

            /**
             * 負数の小数点を含めた最大桁数のテスト
             */
            it("負数の小数点を含めた最大桁数（数値-1234.5678, 桁数8）", () => {
                const buffer = new InputBuffer(Config.MAX_DIGITS);
                buffer.pushMinus();
                buffer.pushDigit(1);
                buffer.pushDigit(2);
                buffer.pushDigit(3);
                buffer.pushDigit(4);
                buffer.pushDecimal();
                buffer.pushDigit(5);
                buffer.pushDigit(6);
                buffer.pushDigit(7);
                buffer.pushDigit(8);

                expect(buffer.toNumber()).toBe(-1234.5678);
                expect(buffer.digitCount()).toBe(Config.MAX_DIGITS);
            });
        });
    });


    /** 
     * 数字入力メソッドのテスト
     * - pushDigitとpushDecimalの基本的な動作を確認。
     */

    describe("pushDigit メソッド", () => {

        /**
         * 複数の数字を連続で入力できるか確認
         * - 数字1、2、3を順番に入力して、数値変換したときに123になることを確認。
         * - 桁数が3であることを確認。
         */
        it("複数の数字を連続で入力できる (数値123, 桁数3)", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            buffer.pushDigit(1); // 数字1を入力
            buffer.pushDigit(2); // 数字2を入力
            buffer.pushDigit(3); // 数字3を入力

            expect(buffer.toNumber()).toBe(123); // 数値変換したときに123になる
            expect(buffer.digitCount()).toBe(3); // 桁数が3であることを確認
        });


        /**
         *  先頭が0の状態で0以外の数字を入力すると0が置き換わることを確認
         * - 初期状態が0の状態で、数字5を入力すると、数値変換したときに5になることを確認。
         * - 桁数が1であることを確認。
         */
        it("先頭が0の状態で0以外の数字を入力すると0が置き換わる（数値5, 桁数1）", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, Config.ZERO); //最大桁数・初期値はConfigから取得
            buffer.pushDigit(5); // 数字5を入力

            expect(buffer.toNumber()).toBe(5); // 数値変換したときに5になることを確認
            expect(buffer.digitCount()).toBe(1); // 桁数が1であることを確認
        });


        /**
         * 先頭が0の状態で0を入力しても何も変化しないことを確認。
         * - 初期状態が0の状態で、さらに数字0を入力しても、数値変換したときに0のままであることを確認。
         * - 桁数が1のままであることを確認。
         */
        it("先頭が0の状態で0を入力しても何も変化しない（数値0, 桁数1）", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, Config.ZERO); //最大桁数・初期値はConfigから取得
            buffer.pushDigit(0);// 数字0を入力

            expect(buffer.toNumber()).toBe(0); // 数値変換したときに0のままであることを確認
            expect(buffer.digitCount()).toBe(1); // 桁数が1のままであることを確認
        });


        /**
         * 最大桁数を超えて入力しようとすると無視されることを確認
          * - 最大桁数が8の場合、9桁目の入力は無視される。
          * - さらに、桁超過の入力があった場合にコンソールに警告ログが出力されることも確認する。
         */
        it("最大桁数を超えて入力しようとすると無視され、警告ログが出力される（数値12345678, 桁数8, 警告ログ）", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS); //最大桁数はConfigから取得

            // 最大桁数まで入力
            buffer.pushDigit(1);
            buffer.pushDigit(2);
            buffer.pushDigit(3);
            buffer.pushDigit(4);
            buffer.pushDigit(5);
            buffer.pushDigit(6);
            buffer.pushDigit(7);
            buffer.pushDigit(8);
            expect(buffer.digitCount()).toBe(Config.MAX_DIGITS); // 桁数が最大桁数であることを確認
            expect(buffer.toNumber()).toBe(12345678); // 数値変換したときに最大桁数分の数字になることを確認

            // 超過分の入力
            buffer.pushDigit(9);

            expect(buffer.digitCount()).toBe(Config.MAX_DIGITS);// 桁数が最大桁数のままであることを確認
            expect(buffer.toNumber()).toBe(12345678); // 数値変換したときに最大桁数分の数字のままであることを確認
            // コンソールに警告ログが出力されることを確認
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("最大桁数"));
        });
    });

    /**
     *  小数点入力メソッドのテスト
     * - pushDecimalの基本的な動作を確認。 
    */
    describe("pushDecimal メソッド", () => {

        /**
         * 小数点を入力できるか確認
         * - 数字を入力した後に小数点を入力して、さらに数字を入力できることを確認。
         * - 小数点を入力した状態で数値変換したときに正しい小数になることを確認。
         * - 桁数は小数点を除いて正しくカウントされることを確認。
         */
        it("小数点を入力できる（数値1.5, 桁数2）", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            buffer.pushDigit(1); // 数字1を入力
            buffer.pushDecimal(); // 小数点を入力
            buffer.pushDigit(5); // 数字5を入力

            expect(buffer.toNumber()).toBe(1.5); // 数値変換したときに1.5になることを確認
            expect(buffer.digitCount()).toBe(2); // 桁数が小数点を除いて2であることを確認
        });


        /**
         * 小数点を入力できる条件のテスト
         * - 空の状態で小数点を入力すると 0. となることを確認
         * - 既に小数点が存在する場合は追加されないことを確認
         * - 小数点入力後も数字を追加できることを確認
         */
        it("空の状態で小数点を入力すると0.になる", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            buffer.pushDecimal(); // 小数点を入力

            expect(buffer.getValue()).toBe("0."); // "0."に変換される
            expect(buffer.isEmpty()).toBe(false);
        });

        /**
         * 既に小数点が存在する場合は追加されないことを確認
         * - "12.34"の状態でさらに小数点を入力しても、状態は変わらないことを確認。
         * - 桁数も小数点を除いて4のままであることを確認。
         */
        it("既に小数点が存在する場合は追加されない（数値12.34, 桁数4）", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, "12.34"); // 初期値を"12.34"に設定
            buffer.pushDecimal();// さらに小数点を入力

            expect(buffer.toNumber()).toBe(12.34); // 数値変換したときに12.34のままであることを確認
            expect(buffer.digitCount()).toBe(4); // 桁数が小数点を除いて4のままであることを確認
        });

        /**
         * 小数点入力後も数字を追加できるか確認
         * - "0."の状態で数字1と2を入力すると、数値は0.12になることを確認。
         * - 桁数は小数点を除いて3になることを確認。
         */
        it("小数点入力後も数字を追加できる（数値0.12, 桁数3）", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            buffer.pushDigit(0); // 数字0を入力
            buffer.pushDecimal(); // 小数点を入力 → "0."
            buffer.pushDigit(1); // 数字1を入力
            buffer.pushDigit(2); // 数字2を入力

            expect(buffer.toNumber()).toBe(0.12); // 数値変換したときに0.12になることを確認
            expect(buffer.digitCount()).toBe(3); // 桁数が小数点を除いて3であることを確認
        });

        /**
         * 小数点連打時にコンソールにログが出力されることを確認
         */
        it("小数点連打時にコンソールにログが出力される", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, "0."); // "0."の状態

            // console.logを個別にスパイ（beforeEachで既にモック化されている）
            buffer.pushDecimal(); // 2回目の小数点

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining("2回目以降押されたが、すでに小数点を入力済みです")
            );
        });
    });

    /**
     * 少数点を含めた最大桁数のテスト
     * - 小数点を含めた状態で最大桁数まで入力できることを確認。
     * - 例えば、最大桁数が8の場合、"1234.5678"の状態は小数点を除いて8桁であるため、さらに数字を入力しようとすると無視されることを確認。
     * - また、桁超過の入力があった場合にコンソールに警告ログが出力されることも確認する。
     */
    it("小数点を含めた最大桁数のテスト（数値1234.5678, 桁数8, 警告ログ）", () => {
        const buffer = new InputBuffer(Config.MAX_DIGITS); //最大桁数はConfigから取得
        // 小数点を含めた最大桁数まで入力
        buffer.pushDigit(1);
        buffer.pushDigit(2);
        buffer.pushDigit(3);
        buffer.pushDigit(4);
        buffer.pushDecimal();
        buffer.pushDigit(5);
        buffer.pushDigit(6);
        buffer.pushDigit(7);
        buffer.pushDigit(8);
        expect(buffer.digitCount()).toBe(Config.MAX_DIGITS); // 桁数が最大桁数であることを確認
        expect(buffer.toNumber()).toBe(1234.5678); // 数値変換したときに小数点を含めた最大桁数分の数字になることを確認

        // 超過分の入力
        buffer.pushDigit(9);
        expect(buffer.digitCount()).toBe(Config.MAX_DIGITS); // 桁数が最大桁数のままであることを確認
        expect(buffer.toNumber()).toBe(1234.5678); // 数値変換したときに小数点を含めた最大桁数分の数字のままであることを確認
        // コンソールに警告ログが出力されることを確認
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("最大桁数"));
    });

    /**
     * クリアメソッドのテスト
     * - clearメソッドを呼び出すと、入力内容がクリアされて空の状態に戻ることを確認。
    */
    describe("clear メソッド", () => {

        /**
         * 入力内容をクリアして空の状態に戻ることを確認
         * - 数字と小数点を入力した状態でclearメソッドを呼び出すと、数値変換したときに0になることを確認。
         * - isEmptyメソッドがtrueを返すことを確認。
         * - digitCountメソッドが0を返すことを確認。
         */
        it("入力内容をクリアして空の状態に戻る（数値0, 桁数0）", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            buffer.pushDigit(1); // 数字1を入力
            buffer.pushDigit(2); // 数字2を入力
            buffer.pushDecimal(); // 小数点を入力
            buffer.pushDigit(3); // 数字3を入力 (ここまでの状態は"12.3")

            buffer.clear(); // クリアメソッドを呼び出す

            expect(buffer.isEmpty()).toBe(true); // isEmptyメソッドがtrueを返すことを確認
            expect(buffer.toNumber()).toBe(0);  // 数値変換したときに0になることを確認
            expect(buffer.digitCount()).toBe(0); // 桁数が0を返すことを確認
        });
    });

    it("clearメソッド後に再入力できることを確認(数値3.4, 桁数2)", () => {
        const buffer = new InputBuffer(Config.MAX_DIGITS);
        buffer.pushDigit(1);    // 数字1を入力
        buffer.pushDigit(2);    // 数字2を入力 (ここまでの状態は"12")
        buffer.clear(); // クリアして空の状態に戻す

        // クリア後に再度数字を入力して、正しく動作することを確認
        buffer.pushDigit(3);    // 数字3を入力
        buffer.pushDecimal();   // 小数点を入力
        buffer.pushDigit(4);    // 数字4を入力
        buffer.pushDigit(5);    // 数字5を入力(ここまでの状態は"3.45")

        expect(buffer.toNumber()).toBe(3.45); // 数値変換したときに3.45になることを確認
        expect(buffer.digitCount()).toBe(3); // 桁数が小数点を除いて3であることを確認
    });

    /**
     * toNumber メソッドのテスト
     * - 入力バッファの内容を正しく数値へ変換できるか確認する。
     * - 入力が空の場合は 0 を返すことを確認する。
     * - 整数を正しく数値変換することを確認。
     * - 小数を正しく数値変換することを確認。
     */
    describe("toNumber メソッド", () => {

        /**
         * 入力が空の場合は 0 を返すことを確認
         * - 入力バッファが空の状態でtoNumberメソッドを呼び出すと、数値変換したときに0になることを確認。
         * - 桁数も0であることを確認。
         */
        it("空の場合は 0 を返す(数値0, 桁数0)", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            expect(buffer.toNumber()).toBe(0); // 数値変換したときに0になることを確認
            expect(buffer.digitCount()).toBe(0); // 桁数も0であることを確認
        });

        /**
         * 整数を正しく数値変換する
         * - 入力バッファに整数が入力されている場合、toNumberメソッドを呼び出すと正しい数値が返ることを確認。
         * - "12345"の状態でtoNumberメソッドを呼び出すと、数値変換したときに12345になることを確認。
         * - 桁数も5であることを確認。
         */
        it("整数を正しく数値変換する(数値12345, 桁数5)", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, "12345"); // 初期値を"12345"に設定
            expect(buffer.toNumber()).toBe(12345); // 数値変換したときに12345になることを確認
            expect(buffer.digitCount()).toBe(5); // 桁数も5であることを確認
        });

        /**
         * 小数を正しく数値変換する
         * - 入力バッファに小数が入力されている場合、toNumberメソッドを呼び出すと正しい数値が返ることを確認。
         * - "123.45"の状態でtoNumberメソッドを呼び出すと、数値変換したときに123.45になることを確認。
         * - 桁数も5であることを確認（小数点は桁数にカウントされないため）。
         */
        it("小数を正しく数値変換する(数値123.45, 桁数5)", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, "123.45");
            expect(buffer.toNumber()).toBe(123.45); // 数値変換したときに123.45になることを確認
            expect(buffer.digitCount()).toBe(5); // 桁数も5であることを確認
        });
    });


    /**
     * isEmpty メソッドのテスト
     * - 入力バッファが空の状態を正しく判定できるか確認。
     * - 数字が入力されている場合は false を返すことを確認。
     * - 小数点のみ入力されている場合も false を返すことを確認。
     */
    describe("isEmpty メソッド", () => {

        /**
         * 入力バッファが空の状態を正しく判定できるか確認
         * - 入力バッファが空の状態でisEmptyメソッドを呼び出すと、trueを返すことを確認。
         */
        it("空の場合、 true を返す", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            expect(buffer.isEmpty()).toBe(true); // 入力バッファが空の状態でisEmptyメソッドを呼び出すと、trueを返すことを確認
        });

        /**
         * 数字が入力されている場合は false を返すことを確認
         * - 数字が入力された状態でisEmptyメソッドを呼び出すと、falseを返すことを確認。
         */
        it("数字が入力されている場合、 false を返す", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            buffer.pushDigit(0); // 数字0を入力
            expect(buffer.isEmpty()).toBe(false); // 数字が入力された状態でisEmptyメソッドを呼び出すと、falseを返すことを確認
        });

        it("小数点のみ入力されている場合、 false を返す", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, "0."); // 小数点のみ入力された状態
            expect(buffer.isEmpty()).toBe(false); // 小数点のみ入力された状態でisEmptyメソッドを呼び出すと、falseを返すことを確認
        });
    });


    /**
     * digitCount メソッドのテスト
     * - 入力バッファの内容を正しく桁数としてカウントできるか確認。
     * - 小数点は桁数にカウントされないことを確認。
     * - 空の場合は0を返すことを確認。
     * - 0. などの小数点が入っている場合は1桁とカウントされることを確認。
     */
    describe("digitCount メソッド", () => {

        /**
         * 空の場合は0を返すことを確認
         * - 入力バッファが空の状態でdigitCountメソッドを呼び出すと、0を返すことを確認。
         */
        it("空の場合は 0 を返す(0桁)", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            expect(buffer.digitCount()).toBe(0); // 入力バッファが空の状態でdigitCountメソッドを呼び出すと、0を返すことを確認
        });

        /**
         * 入力バッファの内容を正しく桁数としてカウントできるか確認
         * - "12345"の状態でdigitCountメソッドを呼び出すと、5を返すことを確認。
        */
        it("整数の桁数を正しくカウントする(12345 = 5桁)", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, "12345"); // 初期値を"12345"に設定
            expect(buffer.digitCount()).toBe(5); // "12345"の状態でdigitCountメソッドを呼び出すと、桁数5を返すことを確認
        });

        /**
         * 小数点は桁数にカウントされないことを確認
         * - "123.45"の状態でdigitCountメソッドを呼び出すと、5を返すことを確認（小数点は桁数にカウントされないため）。
         */
        it("小数点は桁数にカウントしない(123.45 = 5桁)", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, "123.45"); // 初期値を"123.45"に設定
            expect(buffer.digitCount()).toBe(5); // "123.45"の状態でdigitCountメソッドを呼び出すと、桁数5を返すことを確認
        });

        /**
         * 0. などの小数点が入っている場合は1桁とカウントされることを確認
         * - "0."の状態でdigitCountメソッドを呼び出すと、1を返すことを確認。
         */
        it("0. の場合でも正しくカウントする（0. = 1桁）", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, "0."); // "0."の状態
            expect(buffer.digitCount()).toBe(1); // "0."の状態でdigitCountメソッドを呼び出すと、1を返すことを確認
        });
    });


    /**
     * 境界値・エッジケースのテスト
     * - 最大桁数ギリギリまで入力できることを確認。
     * - 0を連続で押しても1つだけ保持されることを確認。
     * - 小数部だけで最大桁数まで入力できることを確認。
     */
    describe("境界値・エッジケース", () => {

        /**
         * 最大桁数ギリギリまで入力できることを確認
         * - 最大桁数が8の場合、8桁まで入力できることを確認。
         * - さらに、9桁目の入力は無視されることを確認。
         */
        it("最大桁数ギリギリまで入力できる", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS); //最大桁数はConfigから取得

            for (let i = 0; i < Config.MAX_DIGITS; i++) { // 最大桁数まで入力
                buffer.pushDigit(9); // 数字9を入力 (ここまでの状態は"99999999(9桁)")
            }

            expect(buffer.digitCount()).toBe(Config.MAX_DIGITS);// 桁数が最大桁数であることを確認
            expect(buffer.toNumber()).toBe(99999999); // 数値変換したときに最大桁数分の数字になることを確認
        });

        /**
         * 0を連続で押しても1つだけ保持されることを確認
         * - 初期状態が0の状態で、さらに数字0を複数回入力しても、数値変換したときに0のままであることを確認。
         * - 桁数が1のままであることを確認。
         */
        it("0を連続で押しても1つだけ保持される", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS, Config.ZERO); //最大桁数・初期値はConfigから取得
            buffer.pushDigit(0); // 数字0を入力
            buffer.pushDigit(0); // さらに数字0を入力
            buffer.pushDigit(0); // さらに数字0を入力

            expect(buffer.toNumber()).toBe(0); // 数値変換したときに0のままであることを確認
            expect(buffer.digitCount()).toBe(1); // 桁数が1のままであることを確認
        });

        /**
         * 小数部だけで最大桁数まで入力できることを確認
         * - 小数点を入力した状態で、数字を最大桁数まで入力できることを確認。
         * - 数値変換したときに正しい小数になることを確認。
         * - 桁数は小数点を除いて正しくカウントされることを確認。
         */
        it("小数部だけで最大桁数まで入力できる", () => {
            const buffer = new InputBuffer(Config.MAX_DIGITS);
            buffer.pushDigit(0); // 数字0を入力
            buffer.pushDecimal(); // 小数点を入力して状態を"0."にする

            buffer.pushDigit(1);
            buffer.pushDigit(2);
            buffer.pushDigit(3);
            buffer.pushDigit(4);
            buffer.pushDigit(5);
            buffer.pushDigit(6);
            buffer.pushDigit(7); // 小数点を入力した状態で、数字を最大桁数まで入力できることを確認 (ここまでの状態は"0.1234567(8桁)")

            // さらに、9桁目の入力は無視されることを確認
            buffer.pushDigit(8);


            expect(buffer.digitCount()).toBe(Config.MAX_DIGITS);
            expect(buffer.toNumber()).toBe(0.1234567);
        });
    });
});