import { describe, it, expect } from "vitest";
import { Evaluator } from "../Evaluator";
import { Operation } from "../Operation";
import { DivisionByZeroError } from "../DivisionByZeroError";

/**
 * Evaluatorの動作テスト
 * - Evaluatorクラスのcomputeメソッドが正しい結果を返すか、例外を投げるかを確認。
 * - 基本的な演算、例外処理、負の数、0の計算、小数、大きな数、単位元のテスト。
 */
describe("Evaluatorの動作テスト", () => {

    /** 
     * 基本的な演算のテスト
     * - 加算、減算、乗算、除算の基本的な動作を確認。
     */
    it("加算できる(2 + 3 = 5)", () => {
        expect(
            Evaluator.compute(2, Operation.Add, 3)
        ).toBe(5);
    });

    it("減算できる(10 - 4 = 6)", () => {
        expect(
            Evaluator.compute(10, Operation.Subtract, 4)
        ).toBe(6);
    });

    it("乗算できる(3 * 5 = 15)", () => {
        expect(
            Evaluator.compute(3, Operation.Multiply, 5)
        ).toBe(15);
    });

    it("除算できる(8 / 2 = 4)", () => {
        expect(
            Evaluator.compute(8, Operation.Divide, 2)
        ).toBe(4);
    });

    /**
     *  例外処理のテスト 
     * - 0除算の例外処理を確認。
     * - 未対応の演算子の例外処理を確認。
     */
    it("0除算で例外(5 / 0 = 例外)", () => {
        expect(() =>
            Evaluator.compute(5, Operation.Divide, 0)
        ).toThrow(DivisionByZeroError);
    });

    it("未対応の演算子で例外(2 ^ 3 = 例外)", () => {
        expect(() =>
            Evaluator.compute(
                2,
                "Exponentiation" as Operation,
                3
            )
        ).toThrow("未対応の演算子です");
    });

    /** 
     * 負の数のテスト
     * - 負の数同士の演算結果を確認。
     */
    it("負の数の加算(-2 + -3 = -5)", () => {
        expect(
            Evaluator.compute(-2, Operation.Add, -3)
        ).toBe(-5);
    });

    it("負の数の減算(-5 - (-3) = -2)", () => {
        expect(
            Evaluator.compute(-5, Operation.Subtract, -3)
        ).toBe(-2);
    });


    it("負の数の乗算(-4 * -2 = 8)", () => {
        expect(
            Evaluator.compute(-4, Operation.Multiply, -2)
        ).toBe(8);
    });

    it("負の数の除算(-10 / -2 = 5)", () => {
        expect(
            Evaluator.compute(-10, Operation.Divide, -2)
        ).toBe(5);
    });


    /**
     * 0の計算のテスト
     * - 0は加算しても減算しても、元の数に影響を与えない。
     * - 0を乗算すると、結果は常に0になる。
     * - 0で除算することはできないが、0を除算することは可能で、結果は常に0になる。
     */
    it("0の加算(0 + 5 = 5)", () => {
        expect(
            Evaluator.compute(0, Operation.Add, 5)
        ).toBe(5);
    });

    it("0の減算(0 - 8 = -8)", () => {
        expect(
            Evaluator.compute(0, Operation.Subtract, 8)
        ).toBe(-8);
    });

    it("0の乗算(0 * 100 = 0)", () => {
        expect(
            Evaluator.compute(0, Operation.Multiply, 100)
        ).toBe(0);
    });

    it("0の除算(0 / 5 = 0)", () => {
        expect(
            Evaluator.compute(0, Operation.Divide, 5)
        ).toBe(0);
    });

    /**
     *  小数のテスト 
     * - 小数同士の演算結果を確認。
     */
    it("小数の加算(1.5 + 2.5 = 4.0)", () => {
        expect(
            Evaluator.compute(1.5, Operation.Add, 2.5)
        ).toBe(4.0);
    });

    it("小数の減算(5.0 - 3.0 = 2.0)", () => {
        expect(
            Evaluator.compute(5.0, Operation.Subtract, 3.0)
        ).toBe(2.0);
    });

    it("小数の乗算(2.5 * 4.0 = 10.0)", () => {
        expect(
            Evaluator.compute(2.5, Operation.Multiply, 4.0)
        ).toBe(10.0);
    });

    it("小数の除算(5.0 / 2.0 = 2.5)", () => {
        expect(
            Evaluator.compute(5.0, Operation.Divide, 2.0)
        ).toBe(2.5);
    });


    /**
     *  大きな数のテスト
     * - 大きな数同士の演算結果を確認。
    */

    it("大きな数の加算(999999 + 1 = 1000000)", () => {
        expect(
            Evaluator.compute(999999, Operation.Add, 1)
        ).toBe(1000000);
    });

    it("大きな数の減算(1000000 - 999999 = 1)", () => {
        expect(
            Evaluator.compute(1000000, Operation.Subtract, 999999)
        ).toBe(1);
    });

    it("大きな数の乗算(1000000 * 1000000 = 1000000000000)", () => {
        expect(
            Evaluator.compute(1000000, Operation.Multiply, 1000000)
        ).toBe(1000000000000);
    });

    it("大きな数の除算(1000000000000 / 1000000 = 1000000)", () => {
        expect(
            Evaluator.compute(1000000000000, Operation.Divide, 1000000)
        ).toBe(1000000);
    });


    /**
     *  単位元のテスト
     * - 1は乗算の単位元であり、どんな数に1を乗算しても元の数が返る。
     */
    it("1で乗算しても変化しない", () => {
        expect(
            Evaluator.compute(999, Operation.Multiply, 1)
        ).toBe(999);
    });

    it("0を足しても変化しない", () => {
        expect(
            Evaluator.compute(123, Operation.Add, 0)
        ).toBe(123);
    });

});