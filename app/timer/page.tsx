"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function P() {
  // タイマーの状態管理
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [firstLap, setFirstLap] = useState<number | null>(null); // 1回目の値を保持する場所

  // タイマーの動作ロジック
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 10); // 10msごとに更新
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // ボタンを押した時の処理
  const handleAction = () => {
    if (!isRunning && time === 0) {
      // 0. まだ動いていないならスタート
      setIsRunning(true);
    } else if (isRunning && firstLap === null) {
      // 1. 動いていて、まだ1回目も押していないなら -> 1回目の値を記録 (止まらない)
      setFirstLap(time);
    } else if (isRunning && firstLap !== null) {
      // 2. 動いていて、すでに1回目の値があるなら -> 完全にストップ
      setIsRunning(false);
    } else {
      // 停止後にリセットして再スタートしたい場合
      setTime(0);
      setFirstLap(null);
      setIsRunning(true);
    }
  };

  // 時間を「00:00.00」形式に整形する関数
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-blue-500 hover:underline text-2xl font-bold">
          ← ホームに戻る
        </Link>
      </div>

      <div className="text-center space-y-8">
        <h1 className='text-3xl md:text-5xl font-bold px-4 py-2 mb-8'>
          バイブスコーディング予定表
          <br />
          <span className="text-lg font-normal text-gray-500 block mt-2">
            （1回目でキープ、2回目でストップ！）
          </span>
        </h1>

        {/* メインのタイマー表示 */}
        <div className="text-8xl font-mono font-bold tracking-wider text-blue-600">
          {formatTime(time)}
        </div>

        {/* 1回目のタイムを表示するエリア */}
        <div className={`h-16 text-2xl font-mono transition-all duration-300 ${firstLap ? 'opacity-100' : 'opacity-0'}`}>
          {firstLap ? (
            <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-300">
              1st KEEP: {formatTime(firstLap)}
            </span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>

        {/* 操作ボタン */}
        <button
          onClick={handleAction}
          className={`
            px-12 py-6 rounded-full text-2xl font-bold text-white transition-all shadow-lg hover:scale-105 active:scale-95
            ${!isRunning && time === 0 ? 'bg-green-500 hover:bg-green-600' : ''}
            ${isRunning && firstLap === null ? 'bg-orange-500 hover:bg-orange-600' : ''}
            ${isRunning && firstLap !== null ? 'bg-red-500 hover:bg-red-600' : ''}
            ${!isRunning && time > 0 ? 'bg-gray-500 hover:bg-gray-600' : ''}
          `}
        >
          {!isRunning && time === 0 && "START !"}
          {isRunning && firstLap === null && "KEEP (1回目)"}
          {isRunning && firstLap !== null && "STOP (2回目)"}
          {!isRunning && time > 0 && "RESTART"}
        </button>

        {/* 状態の説明 */}
        <p className="text-gray-400 mt-4 text-sm">
          {!isRunning && time === 0 && "ボタンを押してスタートしてください"}
          {isRunning && firstLap === null && "今押すと、現在のタイムを一時記録します（止まりません）"}
          {isRunning && firstLap !== null && "もう一度押すと、タイマーが完全に止まります"}
          {!isRunning && time > 0 && "お疲れ様でした！もう一度押すとリセットされます"}
        </p>
      </div>
    </main>
  );
}