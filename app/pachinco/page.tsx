"use client";

import Link from 'next/link'; // 忘れずに！
import { resolve } from 'path';
import {  useRef,useState } from 'react';


export default function P(){
    const [counter, setCounter] = useState<number>(0);
    const [result,setResult] = useState<string>("Yeear!!");
    const [randomVariable, setRandomVariable] = useState<number>(0);
    const [totalSpent, setTotalSpent] = useState<number>(0);
    const [costPerSpin, setCostPerSpin] = useState<number>(50);

    const counterRef = useRef(0);
    const totalSpentRef = useRef(0);
    const resultRef = useRef("Yeear!!");

    

    const reset = () => {
        setCounter(0);
        setResult("Yeear!!");
        setRandomVariable(0);
        setTotalSpent(0);

        counterRef.current = 0;
        totalSpentRef.current = 0;
        resultRef.current = "Yeear!!";
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

    const handleLack_10 = async () => {
        // 1. スタート時の同期：現在の画面の値を、計算用のRefにセットする
        counterRef.current = counter;
        totalSpentRef.current = totalSpent;
        resultRef.current = result;

        for (let i = 0; i < 10; i++) {
            // もし「当たり」が出ていたら、ループを止める
            if (resultRef.current === "Yes!!!") {
                console.log("当たり済みなのでストップ");
                break;
            }

            // 2. 計算はすべて「Ref（.current）」を使って行う！
            // (Stateを使うと、古い値のまま計算してしまうため)
            counterRef.current = counterRef.current + 1;
            totalSpentRef.current = totalSpentRef.current + costPerSpin;

            // 3. 計算結果を画面（State）に反映させて、ユーザーに見せる
            setCounter(counterRef.current);
            setTotalSpent(totalSpentRef.current);
            setRandomVariable((1 - (1 / 99.9)) ** counterRef.current);

            // 抽選ロジック
            const randomNumber = Math.random();

            if (randomNumber < 1 / 99.9) {
                // 当たり！
                setResult("Yes!!!");
                resultRef.current = "Yes!!!"; // ★重要：Refも更新して、次のループの冒頭で気づけるようにする
            } else {
                setResult("No!!!");
                // Refのresultは変えなくてOK（ハズレのままなので）
            }

            // 4. 次の回転まで少し待つ（演出）
            await sleep(50); 
        }
    }

    const handleLack_100 = async () => {
        // 1. スタート時の同期：現在の画面の値を、計算用のRefにセットする
        counterRef.current = counter;
        totalSpentRef.current = totalSpent;
        resultRef.current = result;

        for (let i = 0; i < 100; i++) {
            // もし「当たり」が出ていたら、ループを止める
            if (resultRef.current === "Yes!!!") {
                console.log("当たり済みなのでストップ");
                break;
            }

            // 2. 計算はすべて「Ref（.current）」を使って行う！
            // (Stateを使うと、古い値のまま計算してしまうため)
            counterRef.current = counterRef.current + 1;
            totalSpentRef.current = totalSpentRef.current + costPerSpin;

            // 3. 計算結果を画面（State）に反映させて、ユーザーに見せる
            setCounter(counterRef.current);
            setTotalSpent(totalSpentRef.current);
            setRandomVariable((1 - (1 / 99.9)) ** counterRef.current);

            // 抽選ロジック
            const randomNumber = Math.random();

            if (randomNumber < 1 / 99.9) {
                // 当たり！
                setResult("Yes!!!");
                resultRef.current = "Yes!!!"; // ★重要：Refも更新して、次のループの冒頭で気づけるようにする
            } else {
                setResult("No!!!");
                // Refのresultは変えなくてOK（ハズレのままなので）
            }

            // 4. 次の回転まで少し待つ（演出）
            await sleep(50); 
        }
    }


   return( <main 
    className='flex flex-col h-screen bg-slate-900 text-white p-4 justify-around'
    tabIndex={0}
    onKeyDown={(e) =>{
        console.log(e.key)
            if(e.key === "Enter")handleLack()
            if(e.key === "r")reset()
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
        onClick={() => handleLack_10()}
        >おせ！！！(１０回転)</button>
        <button 
        className='bg-red border-4 border-gray-800 ' 
        onClick={() => handleLack_100()}
        >おせ！！！(１００回転)</button>
            </div>
        
    </main>
   )
}