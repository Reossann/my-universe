"use client";

import Link from 'next/link'; // 忘れずに！
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ← 1. 追加！





export default function Calc(){

    const numbersList = ["C", "÷", "×", "B", "7", "8", "9", "-", "4", "5", "6", "+", "1", "2", "3", "=", "0", "00", "."];
    const [result, setResult] = useState<string>("")
    const [calc, setCalc] = useState<string>("")
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
      return;
    }

    // 3. 計算実行 (=)
    if (btn === "=") {
      try {
        // ★ここで初めて「×」を「*」に変換する（画面はずっと「×」のまま！）
        const formula = calc.replaceAll("×", "*").replaceAll("÷", "/");
        const calcResult = new Function("return " + formula)();
        setResult(String(calcResult));
      } catch (error) {
        setResult("Error");
      }
      return;
    }

    // 4. それ以外（数字や演算子）
    // ループしなくても、ただくっつければOK！
    setCalc(calc + btn);
  };


    return(
        <main 
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Backspace"){
            handlePrint("B")
          }if(e.key === "Delete"){
            handlePrint("C")
          }if(numbersList.includes(e.key)){
            handlePrint(e.key)
          }
        }}
        className="
        min-h-screen 
        p-8 
        bg-gray-50
        min-h-screen 
         ">
            <div className="mb-8">
                <Link href="/" className="text-blue-500 hover:underline text-2xl">
          ← ホームに戻る
                </Link>
            </div>
            <h1 
            className='text-5xl bg-blue-500 px-4 py-2'
            >
                {calc}
            </h1>
            <h1 
            className='text-5xl bg-red-500 px-4 py-2'
            >
                {result}
            </h1>
            <div className='
            grid        
            justify-center 
            grid-cols-4
            gap-2
            '>
            {numbersList.map((numbers) => (
                
                    <button 
                    key={numbers}
                    onClick={() => handlePrint(numbers)}
                    className='text-8xl border border-blue-400'>
                        {numbers}
                    </button>
            ))}
            </div>
        </main>
    )
}
