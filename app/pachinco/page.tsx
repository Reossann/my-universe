"use client";

import Link from 'next/link'; // 忘れずに！
import {  useRef,useState } from 'react';


export default function P(){
    const [counter, setCounter] = useState<number>(0);
    const [result,setResult] = useState<string>("Ready?");
    const [randomVariable, setRandomVariable] = useState<number>(0);
    const [totalSpent, setTotalSpent] = useState<number>(0);
    const [costPerSpin, setCostPerSpin] = useState<number>(50);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [probability, setProbability] = useState(99);

    const counterRef = useRef(0);
    const totalSpentRef = useRef(0);
    const resultRef = useRef("Ready?");

    

    const reset = () => {
        setCounter(0);
        setResult("Ready?");
        setRandomVariable(0);
        setTotalSpent(0);

        counterRef.current = 0;
        totalSpentRef.current = 0;
        resultRef.current = "Ready?";
    }

    const sleep = (time:number) => {
        return new Promise((resolve) => {
            setTimeout(()=> {
                resolve(null);
            }, time)
        });
    };


    const handleSpin = async (times:number) => {
        // 1. スタート時の同期：現在の画面の値を、計算用のRefにセットする
        counterRef.current = counter;
        totalSpentRef.current = totalSpent;
        resultRef.current = result;

        for (let i = 0; i < times; i++) {
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
            setRandomVariable((1 - (1 / probability)) ** counterRef.current);

            // 抽選ロジック
            const randomNumber = Math.random();

            if (randomNumber < 1 / probability) {
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


   return( 
   <main 
    className='flex flex-col h-screen bg-slate-900 text-white p-4 justify-around'
    tabIndex={0}
    onKeyDown={(e) =>{
        console.log(e.key)
            if(e.key === "Enter")handleSpin(1)
            if(e.key === "r")reset()
        }}
    >
        <div className="flex mb-8 flex-row justify-around border-4 text-4xl">
            <div>version1.0</div>
        </div>
            <div className="flex mb-8 flex-row justify-around border-4 text-4xl">
                <Link href="/" className="text-blue-500 hover:underline ">
          ← ホームに戻る
                </Link>
                <button onClick={() => reset()}>
                    リセット
                </button>
                <button onClick={() => setIsSettingsOpen(true)}> 
                    設定[1/{probability}]
                </button>
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
                    はまり確率
                    [{randomVariable.toFixed(6)}]
                </div>
            </div>
            <div className='flex justify-around text-4xl'>
                結果
                [{result}]
            </div>
            <div className='flex justify-around text-4xl'>
                <button 
        className='bg-red border-4 border-red-500  rounded-xl' 
        onClick={() => handleSpin(1)}
        >おせ！！！</button>
        <button 
        className='bg-red border-4 border-red-500  rounded-xl' 
        onClick={() => handleSpin(10)}
        >おせ！！！(１０回転)</button>
        <button 
        className='bg-red border-4 border-red-500 y  rounded-xl' 
        onClick={() => handleSpin(100)}
        >おせ！！！(１００回転)</button>
            </div>
        
        {/* isSettingsOpen が true の時だけ表示されるエリア */}
{isSettingsOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <div className="bg-slate-800 p-8 rounded-xl border-4 border-blue-500 shadow-2xl w-96">
            <h2 className="text-2xl font-bold mb-6 text-center border-b pb-2">⚙️ 設定変更</h2>
            
            {/* 確率設定セクション */}
            <div className="mb-6">
                <p className="mb-2 font-bold text-blue-300">大当たり確率</p>
                <div className="flex justify-between gap-2">
                    <button 
                        onClick={() => setProbability(99)}
                        className={`flex-1 py-2 rounded ${probability === 99 ? 'bg-red-500 ring-2 ring-white' : 'bg-gray-600'}`}
                    >
                        1/99<br/><span className="text-xs">甘デジ</span>
                    </button>
                    <button 
                        onClick={() => setProbability(319)}
                        className={`flex-1 py-2 rounded ${probability === 319 ? 'bg-red-500 ring-2 ring-white' : 'bg-gray-600'}`}
                    >
                        1/319<br/><span className="text-xs">ミドル</span>
                    </button>
                    <button 
                        onClick={() => setProbability(2)}
                        className={`flex-1 py-2 rounded ${probability === 2 ? 'bg-red-500 ring-2 ring-white' : 'bg-gray-600'}`}
                    >
                        1/2<br/><span className="text-xs">神</span>
                    </button>
                </div>
            </div>

            {/* レート設定セクション */}
            <div className="mb-8">
                <p className="mb-2 font-bold text-yellow-300">1回転のコスト</p>
                <div className="flex justify-between gap-2">
                     <button 
                        onClick={() => setCostPerSpin(50)}
                        className={`flex-1 py-2 rounded ${costPerSpin === 50 ? 'bg-yellow-600 ring-2 ring-white' : 'bg-gray-600'}`}
                    >
                        50円
                    </button>
                    <button 
                        onClick={() => setCostPerSpin(100)}
                        className={`flex-1 py-2 rounded ${costPerSpin === 100 ? 'bg-yellow-600 ring-2 ring-white' : 'bg-gray-600'}`}
                    >
                        100円
                    </button>
                </div>
            </div>

            {/* 閉じるボタン */}
            <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-3 bg-gray-500 hover:bg-gray-400 rounded-lg font-bold transition"
            >
                設定を閉じる
            </button>
        </div>
    </div>
)}
    </main>
   )
}
