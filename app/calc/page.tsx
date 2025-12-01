"use client";

import Link from 'next/link'; // 忘れずに！
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ← 1. 追加！





export default function Calc(){

    const numbersList = ["C", "÷", "×", "B", "7", "8", "9", "-", "4", "5", "6", "+", "1", "2", "3", "=", "0", "00", "."];
    const [result, setResult] = useState<string>("")
    const [calc, setCalc] = useState<string>("")
    const [isCalculated, setIsCalculated] = useState<boolean>(false);
    const handlePrint = (btn: string) => {
    // 1. バックスペース (B)
    if (btn === "B") {
      setCalc(calc.slice(0, -1));
      return;
    }

    // 2. クリア (C)
    if (btn === "C") {
      setCalc("");
      setResult("")
      setIsCalculated(false);
      return;
    }

    // 3. 計算実行 (=)
    if (btn === "=") {
      try {
        let formula = calc.replaceAll("×", "*").replaceAll("÷", "/");
        
        // ★最強の解決策：数字の部分だけを見つけて、正しい形(Number)に直す
        // 正規表現の説明: (\d+(\.\d+)?) → 「数字」または「少数」の塊を見つける
        formula = formula.replace(/(\d+(\.\d+)?)/g, (match) => {
          // 見つけた数字(match)を一度Number型にしてからStringに戻す
          // これで "04"->4, "00.3"->0.3, "05"->5 に自動的に直ります！
          return String(Number(match));
        });

        const calcResult = new Function("return " + formula)();
        setResult(String(calcResult));
        setIsCalculated(true);
      } catch (error) {
        setResult("Error");
      }
      return;
    }

    // 4. それ以外（数字や演算子）
    // ループしなくても、ただくっつければOK！
    if (isCalculated) {
        const isOperator = ["+", "-", "×", "÷"].includes(btn);
        
        if (isOperator) {
            // 演算子なら、前の答えを使って計算を続ける (例: 10 + )
            setCalc(result + btn);
        } else {
            // 数字なら、新規作成
            setCalc(btn);
        }
        setResult(""); // 答え表示は消す
        setIsCalculated(false); // フラグを戻す
        return;
    }
    setCalc(calc + btn);
  };


    return (
    <main
      tabIndex={0}
      onKeyDown={(e) => {
        // キーボード対応の強化
        if (e.key === "Backspace") handlePrint("B");
        else if (e.key === "Delete" || e.key === "Escape") handlePrint("C");
        else if (e.key === "Enter") handlePrint("=");
        else if (e.key === "*") handlePrint("×"); // * を × に変換
        else if (e.key === "/") handlePrint("÷"); // / を ÷ に変換
        else if (numbersList.includes(e.key)) handlePrint(e.key);
      }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4" // 全体を中央寄せ
    >
      
      {/* 画面のようなディスプレイエリア */}
      <div className="w-full max-w-md bg-black rounded-2xl p-6 mb-4 shadow-2xl border-4 border-gray-800">
        
        {/* ホームに戻る (小さく配置) */}
        <div className="mb-4">
           <Link href="/" className="text-gray-500 hover:text-white text-sm">← Home</Link>
        </div>

        {/* 計算式 (上段・小さめ・グレー) */}
        <div className="text-right text-gray-400 text-xl font-mono h-8 overflow-hidden">
          {calc || "0"}
        </div>

        {/* 答え (下段・デカ文字・白) */}
        <div className="text-right text-white text-6xl font-bold font-mono overflow-x-auto whitespace-nowrap">
            {result || (calc ? "" : "0")}
        </div>
      </div>

      {/* ボタンエリア */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {numbersList.map((btn) => (
          <button
            key={btn}
            onClick={() => handlePrint(btn)}
            className={`
              h-20 text-3xl font-bold rounded-2xl transition active:scale-95 shadow-md
              ${btn === "=" ? "bg-orange-500 hover:bg-orange-400" : ""}
              ${["C", "B", "÷", "×", "-", "+"].includes(btn) ? "bg-gray-300 text-black hover:bg-gray-200" : "bg-white text-gray-800 hover:bg-gray-50"}
              ${btn === "0" ? "col-span-2" : ""} 
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </main>
  );
}