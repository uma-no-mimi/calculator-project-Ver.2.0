import { describe, it, expect, beforeEach } from 'vitest';
import { KeyMapper } from '../KeyMapper';
import { Operation } from '../Operation';

/**
 * KeyMapperクラスの単体テスト
 * このテストでは、KeyMapperのresolveメソッドが正しくトークンを返すかどうかを検証。
 * 正常系のテストケースでは、数字キー、制御キー、四則演算子キーが正しいトークンに変換されることを確認。
 * 異常系のテストケースでは、無効な入力に対してnullが返ることを確認。
 */
describe('KeyMapper', () => {
    let keyMapper: KeyMapper;

    /**
     * 各テスト実行前にKeyMapperのインスタンスを初期化
     * これにより、各テストが独立して実行されることを保証し、テスト間の副作用を防止。
     */
    beforeEach(() => {
        keyMapper = new KeyMapper();
    });

    /**
     * 入力の種類ごとに正常系のテストケースをグループ化
     * 数字キー、制御キー、四則演算子キーのそれぞれについて、正しいトークンが返ることを確認。
     * it.eachを使用して、複数の入力値と期待されるトークンを効率的にテスト。
     */
    describe('数字キー (0〜9) の変換', () => {
        it.each([
            ['0', 0],
            ['1', 1],
            ['2', 2],
            ['3', 3],
            ['4', 4],
            ['5', 5],
            ['6', 6],
            ['7', 7],
            ['8', 8],
            ['9', 9],
        ])('data-key="%s" の場合 digitトークン value=%d が返る', (keyValue, expectedNumber) => {
            const result = keyMapper.resolve(keyValue);
            expect(result).toEqual({ kind: 'digit', value: expectedNumber });
        });
    });


    describe('制御キー の変換', () => {
        it('"decimal" の場合 decimalトークンが返る', () => {
            expect(keyMapper.resolve('decimal')).toEqual({ kind: 'decimal' });
        });

        it('"equal" の場合 equalトークンが返る', () => {
            expect(keyMapper.resolve('equal')).toEqual({ kind: 'equal' });
        });

        it('"clear" の場合 clearトークンが返る', () => {
            expect(keyMapper.resolve('clear')).toEqual({ kind: 'clear' });
        });
    });

    describe('四則演算子キー の変換', () => {
        it.each([
            ['operator:+', Operation.Add],
            ['operator:-', Operation.Subtract],
            ['operator:*', Operation.Multiply],
            ['operator:/', Operation.Divide],
        ])('"%s" の場合 operatorトークン value=%s が返る', (keyValue, expectedOperation) => {
            const result = keyMapper.resolve(keyValue);
            expect(result).toEqual({ kind: 'operator', value: expectedOperation });
        });
    });

    describe('無効な入力の場合 nullが返ること', () => {
        it('undefined の場合 null', () => {
            expect(keyMapper.resolve(undefined)).toBeNull();
        });

        it('空文字列の場合 null', () => {
            expect(keyMapper.resolve('')).toBeNull();
        });

        it('2桁以上の数字文字列の場合 null', () => {
            expect(keyMapper.resolve('12')).toBeNull();
        });

        it('アルファベット文字の場合 null', () => {
            expect(keyMapper.resolve('abc')).toBeNull();
        });

        it('未定義のオペレーターキーの場合 null', () => {
            expect(keyMapper.resolve('op:%')).toBeNull();
        });

        it('大文字の場合 null', () => {
            expect(keyMapper.resolve('CLEAR')).toBeNull();
        });

        it('前後にスペースが含まれている場合、trimされて認識される', () => {
            expect(keyMapper.resolve(' equal ')).toEqual({ kind: 'equal' });
        });

        it('全角数字の場合 null', () => {
            expect(keyMapper.resolve('１')).toBeNull();
        });
    });
});