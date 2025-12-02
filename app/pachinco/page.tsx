"use client";

import Link from 'next/link'; // 忘れずに！
import { useState } from 'react';
import "random";


export default function P(){
    const [counter, setCounter] = useState<number>(0);
    const handleLack = () => {
        setCounter(counter + 1)
        const randomNumber = Math.random()
        if (0.09 < randomNumber ){
            
        }
    }



   return( <main>
        <div className="mb-8">
                <Link href="/" className="text-blue-500 hover:underline text-2xl">
          ← ホームに戻る
                </Link>
            </div>
        <h1 className='text-5xl center px-4 py-2'>
            開発途中....!!!!!!
        </h1>
    </main>
   )
}