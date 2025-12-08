"use client";

import Link from 'next/link'; // 忘れずに！
import {  useState } from 'react';


export default function P(){
    const [counter, setCounter] = useState<number>(0);
    const [result,setResult] = useState<string>("Yeear!!");
    const [random_variable, setRandom_varianle] = useState<number>(0);
    const handleLack = () => {
        if (result === "Yes!!!")return
        setCounter(counter + 1)
        console.log(counter)
        const randomNumber = Math.random()
        console.log(randomNumber)
        if (randomNumber < 1/99.9){
            setResult("Yes!!!")
        }else{
            setResult("No!!!")
        }
    }



   return( <main 
    className='flex flex-col h-screen bg-slate-900 text-white p-4 justify-around'
    tabIndex={0}
    onKeyDown={(e) =>{
            if(e.key === "Enter")handleLack()
        }}
    >
            <div className="flex mb-8 flex-row justify-around border-4">
                <Link href="/" className="text-blue-500 hover:underline text-2xl">
          ← ホームに戻る
                </Link>
                <div> 
                    設定[{random_variable}]
                </div>
            </div>
            <div className='flex mb-8 flex-row justify-around border-4 text-4xl'>
                <div>
                    回転数
                    [{counter}]
                </div>
                <div>
                    投資金額
                    []
                </div>
                <div>
                    はまり確立
                    []
                </div>
            </div>
            <div className='flex justify-around text-4xl'>
                結果
                [{result}]
            </div>
            <div className='flex justify-around text-4xl'>
                <button 
        className='bg-red border-4 border-gray-800 ' 
        onClick={() => handleLack()}
        >おせ！！！</button>
            </div>
        
    </main>
   )
}