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
    className='min-h-screen'
    tabIndex={0}
    onKeyDown={(e) =>{
            if(e.key === "Enter")handleLack()
        }}
    >
        <div className="mb-8">
                <Link href="/" className="text-blue-500 hover:underline text-2xl">
          ← ホームに戻る
                </Link>
            </div>
        <h1 className='text-5xl center px-4 py-2'>
            {result}
        </h1>
        <div className='text-5xl'>
            {counter}
        </div>
        <button 
        className='bg-red border-4 border-gray-800' 
        onClick={() => handleLack()}
        >おせ！！！</button>
    </main>
   )
}