"use client";

import Link from 'next/link'; // 忘れずに！
import { resolve } from 'path';
import {  useState } from 'react';


export default function P(){
    const [counter, setCounter] = useState<number>(0);
    const [result,setResult] = useState<string>("Yeear!!");
    const [randomVariable, setRandomVariable] = useState<number>(0);
    const [totalSpent, setTotalSpent] = useState<number>(0);
    const [costPerSpin, setCostPerSpin] = useState<number>(50);

    const reset = () => {
        setCounter(0);
        setResult("Yeear!!");
        setRandomVariable(0);
        setTotalSpent(0);
    }

    const sleep = (time:number) => {
        return new Promise((resolve) => {
            setTimeout(()=> {
                resolve(null);
            }, time)
        });
    };

    const handleLack = () => {
        if (result === "Yes!!!")return
        setCounter((prev) => prev + 1)
        setTotalSpent((prev) => prev + costPerSpin)
        setRandomVariable((1 - (1/99.9)) ** (counter + 1))
        console.log(counter)
        const randomNumber = Math.random()
        console.log(randomNumber)
        if (randomNumber < 1/99.9){
            setResult("Yes!!!")
        }else{
            setResult("No!!!")
        }
    }
    const  handleLack_10 = async () => {
        for (let i = 0; i < 10; i++){
            handleLack()
            await sleep(100)
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
                <button onClick={() => reset()}>
                    リセット
                </button>
                <div> 
                    設定[]
                </div>
            </div>
            <div className='flex mb-8 flex-row justify-around border-4 text-4xl'>
                <div>
                    回転数
                    [{counter}]
                </div>
                <div>
                    投資金額
                    [{totalSpent}]
                </div>
                <div>
                    はまり確立
                    [{randomVariable.toFixed(6)}]
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
        <button 
        className='bg-red border-4 border-gray-800 ' 
        onClick={() => {handleLack_10()}}
        >おせ！！！(１０回転)</button>
        <button 
        className='bg-red border-4 border-gray-800 ' 
        onClick={() => handleLack()}
        >おせ！！！</button>
            </div>
        
    </main>
   )
}