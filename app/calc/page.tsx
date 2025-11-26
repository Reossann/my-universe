"use client";

import Link from 'next/link'; // 忘れずに！
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ← 1. 追加！
import { addTodo, deleteTodo, toggleTodo } from '../actions';





export default function Calc(){



    return(
        <main className="min-h-screen p-8 bg-gray-50">
            <div className="mb-8">
                <Link href="/" className="text-blue-500 hover:underline text-2xl">
          ← ホームに戻る
                </Link>
            </div>
            <h1 className='text-5xl center'>
                開発途中。。。。
            </h1>
        </main>
    )
}