"use client";

import Link from 'next/link'; // 忘れずに！
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ← 1. 追加！





export default function Calc(){

    const numbersList = ["1","2","3","4","5","6","7","8","9","CRE","0","="];
    const [result, setResult] = useState<string>("")
    const handlePrint = (number: string) => {
        let new_result = structuredClone(result);
        if ("CRE" === number){
                new_result = ""
                setResult(new_result)
                return
            }
        if ("=" === number){

        }
        if ("+" === number)
        for (const i of numbersList){
            
            if (number === i){
                new_result += number
                setResult(new_result)
                return
            }
            
        }

        
        
    }



    return(
        <main className="
        min-h-screen 
        p-8 
        bg-gray-50 center
        min-h-screen 
         ">
            <div className="mb-8">
                <Link href="/" className="text-blue-500 hover:underline text-2xl">
          ← ホームに戻る
                </Link>
            </div>
            <h1 
            className='text-5xl center bg-blue-500 px-4 py-2'
            >
                {result}
            </h1>
            <div className='
            grid        
            justify-center 
            grid-cols-3
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