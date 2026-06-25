/**
 * KeyMapper.ts（入力変換処理）
 * HTMLボタンのdata-key属性を、電卓で扱うKeyTokenへ変換するクラス
 */

import { Operation } from "./Operation";
import type { KeyToken } from "./KeyToken";

// 許可されるキーの型を定義。これにより、keyMapのキーが限定され、誤ったキーの使用を防止。
type ValidKey =
    "decimal" |
    "equal" |
    "clear" |
    "operator:+" |
    "operator:-" |
    "operator:*" |
    "operator:/";

export class KeyMapper {

    // 正規表現は定数として一度だけ生成
    private static readonly DIGIT_PATTERN = /^\d$/;

    /**
     * data-key文字列とKeyTokenの対応表
     * 数字キー（0〜9）は動的生成するためここには含めない
     */
    private readonly keyMap: ReadonlyMap<ValidKey, KeyToken> = new Map<ValidKey, KeyToken>([
        ["decimal", { kind: "decimal" }],
        ["equal", { kind: "equal" }],
        ["clear", { kind: "clear" }],
        ["operator:+", { kind: "operator", value: Operation.Add }],
        ["operator:-", { kind: "operator", value: Operation.Subtract }],
        ["operator:*", { kind: "operator", value: Operation.Multiply }],
        ["operator:/", { kind: "operator", value: Operation.Divide }]
    ]);


    /**
     * HTML要素のdata-key属性を解析し、
     * KeyTokenへ変換する
     *
     * 数字キーは動的にdigitトークンを生成、
     * 記号キーはMapから対応する意味を取得。
     *
     * @param element クリックされたボタン要素
     * @returns 変換されたKeyToken。不正入力時はnull
     */
    public resolve(key: string | undefined): KeyToken | null {
        // keyがundefinedやnullの場合はnullを返す
        if (!key) {
            return null;
        }

        // 入力の前後に余分な空白がある場合はtrimして正規化する
        const normalizedKey = key.trim();

        // trim後に空文字列になった場合はnullを返す
        if (normalizedKey === "") {
            return null;
        }

        // 数字キー（0〜9）は動的生成
        // ^ = 文字列の開始
        // \d = 任意の数字（0-9）
        // $ = 文字列の終了
        // 文字列全体が1文字の数字である場合にマッチしているかをチェックし、マッチしていればdigitトークンを生成して返す
        if (KeyMapper.DIGIT_PATTERN.test(normalizedKey)) {
            return {
                kind: "digit",
                value: Number(normalizedKey)
            };
        }

        // Mapから意味を取得して返す。存在しない場合はnullを返す。
        if (this.keyMap.has(normalizedKey as ValidKey)) {
            return this.keyMap.get(normalizedKey as ValidKey)!;
        }

        return null;
    }
}