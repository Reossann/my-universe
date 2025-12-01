"use client";

import Link from 'next/link';
import { useState } from 'react';
// useRouter は使っていないので削除しました

export default function Calc() {
  const numbersList = ["C", "÷", "×", "B", "7", "8", "9", "-", "4", "5", "6", "+", "1", "2", "3", "=", "0", "00", "."];
  
  const [result, setResult] = useState<string>("");
  const [calc, setCalc] = useState<string>("");
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  const handlePrint = (btn: string) => {
    // --- ドット連打防止ロジック ---
    if (btn === ".") {
      const new_calc = calc.split(/[\+\-\×\÷]/);
      const currentNumber = new_calc.pop();
      if (currentNumber === undefined) return;
      if (currentNumber.includes(".")) {
        return; // すでにドットがあったら何もしない
      }
    }

    // --- 1. バックスペース (B) ---
    if (btn === "B") {
      setCalc(calc.slice(0, -1));
      return;
    }

    // --- 2. クリア (C) ---
    if (btn === "C") {
      setCalc("");
      setResult("");
      setIsCalculated(false);
      return;
    }

    // --- 3. 計算実行 (=) ---
    if (btn === "=") {
      try {
        let formula = calc.replaceAll("×", "*").replaceAll("÷", "/");

        // 数字の正規化（00.3 -> 0.3 など）
        formula = formula.replace(/(\d+(\.\d+)?)/g, (match) => {
          return String(Number(match));
        });

        const calcResult = new Function("return " + formula)();

        // ★★★ 修正ポイント：計算誤差（0.3000...4）を消す魔法 ★★★
        // 15桁で丸めて、不要な0を消す
        const cleanResult = parseFloat(calcResult.toPrecision(15));
        
        setResult(String(cleanResult));
        setIsCalculated(true);
      } catch (error) {
        setResult("Error");
      }
      return;
    }

    // --- 4. 数字・演算子の入力 ---
    if (isCalculated) {
      const isOperator = ["+", "-", "×", "÷"].includes(btn);

      if (isOperator) {
        // 演算子なら続きから
        setCalc(result + btn);
      } else {
        // 数字ならリセットして新規入力
        setCalc(btn);
      }
      setResult(""); 
      setIsCalculated(false);
      return;
    }

    setCalc(calc + btn);
  };

  return (
    <main
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Backspace") handlePrint("B");
        else if (e.key === "Delete" || e.key === "Escape") handlePrint("C");
        else if (e.key === "Enter") handlePrint("=");
        else if (e.key === "*") handlePrint("×");
        else if (e.key === "/") handlePrint("÷");
        else if (numbersList.includes(e.key)) handlePrint(e.key);
      }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4"
    >
      {/* ディスプレイエリア */}
      <div className="w-full max-w-md bg-black rounded-2xl p-6 mb-4 shadow-2xl border-4 border-gray-800">
        
        {/* ホームに戻る */}
        <div className="mb-4"> {/* mb-4l というタイポを修正 */}
           <Link href="/" className="text-gray-500 hover:text-white text-xl">← Home</Link>
        </div>

        {/* 計算式 */}
        <div className="text-right text-gray-400 text-3xl font-mono h-10 overflow-hidden">
          {calc || "0"}
        </div>

        {/* 答え */}
        <div className="text-right text-6xl text-white font-bold overflow-x-auto whitespace-nowrap scrollbar-hide">
             {/* bg-red-500 を消して、text-right を追加！ */}
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
              ${btn === "=" ? "bg-orange-500 hover:bg-orange-400 text-white" : ""}
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