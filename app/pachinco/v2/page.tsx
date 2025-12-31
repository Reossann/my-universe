"use client";

import Link from 'next/link';
import { useRef, useState } from 'react';

// ■ 1. 契約書（型定義）
// 親（ロジック）から子（見た目）に渡すデータのルール
type PachinkoViewProps = {
  counter: number;
  totalSpent: number;
  result: string;
  randomVariable: number;
  probability: number;
  costPerSpin: number;
  isSettingsOpen: boolean;
  handleSpin: (times: number) => void;
  reset: () => void;
  setProbability: (prob: number) => void;
  setCostPerSpin: (cost: number) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
};

// ■ 2. サイバーパンク・モード (CyberView)
const CyberView = (props: PachinkoViewProps) => {
  return (
    <div className="flex flex-col h-screen bg-black text-cyan-400 p-4 font-mono overflow-hidden relative">
      {/* 背景エフェクト */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900 rounded-full blur-[120px] opacity-20 -z-10"></div>

      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6 px-4 py-2 border-b border-cyan-900/50 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-cyan-500 hover:text-cyan-300 transition group">
          <span className="group-hover:-translate-x-1 transition-transform">◀</span>
          <span className="text-sm tracking-widest">SYSTEM_EXIT</span>
        </Link>
        <Link href="/pachinco" className="flex items-center gap-2 text-cyan-500 hover:text-cyan-300 transition group">
          <span className="group-hover:-translate-x-1 transition-transform">◀</span>
          <span className="text-sm tracking-widest">BACK-v1</span>
        </Link>
        <div className="flex gap-4">
          <button onClick={props.reset} className="text-xs border border-red-900 text-red-500 px-3 py-1 hover:bg-red-900/30 transition uppercase tracking-wider">
            Reset_Data
          </button>
          <button onClick={() => props.setIsSettingsOpen(true)} className="flex items-center gap-2 text-xs border border-cyan-900 text-cyan-300 px-3 py-1 hover:bg-cyan-900/30 transition uppercase tracking-wider">
            <span>CONFIG</span>
            <span className="bg-cyan-900 px-1 text-black font-bold">1/{props.probability}</span>
          </button>
        </div>
      </div>

      {/* メインモニター */}
      <div className="flex-1 flex flex-col items-center justify-start gap-8 z-10">
        <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
          {/* 回転数 */}
          <div className="bg-slate-900/80 border border-cyan-500/50 p-4 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
            <div className="text-xs text-cyan-600 mb-1 tracking-widest">SPIN_COUNT</div>
            <div className="text-4xl font-bold text-cyan-400">{props.counter.toString().padStart(4, '0')}</div>
          </div>
          {/* 投資金額 */}
          <div className="bg-slate-900/80 border border-pink-500/50 p-4 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/50"></div>
            <div className="text-xs text-pink-600 mb-1 tracking-widest">TOTAL_INVEST</div>
            <div className="text-4xl font-bold text-pink-400">¥{props.totalSpent.toLocaleString()}</div>
          </div>
          {/* ハマり確率 */}
          <div className="bg-slate-900/80 border border-yellow-500/50 p-4 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50"></div>
            <div className="text-xs text-yellow-600 mb-1 tracking-widest">PROB_LOSE</div>
            <div className="text-4xl font-bold text-yellow-400">{(props.randomVariable * 100).toFixed(2)}%</div>
          </div>
        </div>

        {/* 演出用ディスプレイ */}
        <div className={`flex justify-center items-center w-full max-w-2xl h-48 border-2 rounded-xl transition-all duration-300 relative ${props.result === "Yes!!!" ? "border-red-500 bg-red-900/20 shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-pulse" : "border-cyan-900 bg-black shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"}`}>
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
          <div className={`text-6xl font-black tracking-tighter ${props.result === "Yes!!!" ? "text-red-500 scale-110" : "text-slate-700"}`}>
            {props.result === "Yes!!!" ? "JACKPOT !!" : props.result === "Ready?" ? "STANDBY..." : "MISS"}
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="flex gap-8 mt-4">
          <button onClick={() => props.handleSpin(1)} className="group w-32 h-32 rounded-full bg-slate-800 border-4 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95 transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-cyan-100">PUSH</span>
            <span className="text-xs text-cyan-500">SINGLE</span>
          </button>
          <button onClick={() => props.handleSpin(10)} className="group w-32 h-32 rounded-full bg-slate-800 border-4 border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)] active:scale-95 transition-all hover:border-pink-400 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-pink-100">AUTO</span>
            <span className="text-xs text-pink-500">10 SPIN</span>
          </button>
          <button onClick={() => props.handleSpin(100)} className="group w-32 h-32 rounded-full bg-slate-800 border-4 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95 transition-all hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex flex-col items-center justify-center">
             <span className="text-2xl font-bold text-yellow-100">TURBO</span>
             <span className="text-xs text-yellow-500">100 SPIN</span>
          </button>
        </div>
      </div>

      {/* 設定モーダル (Cyber) */}
      {props.isSettingsOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-slate-900 p-8 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.4)] w-96 relative">
            <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400 tracking-widest border-b border-cyan-900 pb-2">SYSTEM_CONFIG</h2>
            <div className="mb-6">
               <p className="text-xs text-cyan-600 mb-2">PROBABILITY</p>
               <div className="flex gap-2">
                 {[99, 319, 2].map(p => (
                   <button key={p} onClick={() => props.setProbability(p)} className={`flex-1 py-2 border ${props.probability === p ? 'bg-cyan-500 text-black border-cyan-400' : 'text-cyan-600 border-cyan-900'}`}>1/{p}</button>
                 ))}
               </div>
            </div>
            <div className="mb-8">
               <p className="text-xs text-yellow-600 mb-2">COST</p>
               <div className="flex gap-2">
                 {[50, 100].map(c => (
                   <button key={c} onClick={() => props.setCostPerSpin(c)} className={`flex-1 py-2 border ${props.costPerSpin === c ? 'bg-yellow-500 text-black border-yellow-400' : 'text-yellow-600 border-yellow-900'}`}>¥{c}</button>
                 ))}
               </div>
            </div>
            <button onClick={() => props.setIsSettingsOpen(false)} className="w-full py-3 bg-slate-800 border border-slate-600 text-slate-400 hover:text-white uppercase">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ■ 3. レトロ・モード (ClassicView)
const ClassicView = (props: PachinkoViewProps) => {
  return (
    <div className="flex flex-col h-screen bg-white text-black font-sans relative">
      <header className="bg-red-600 text-white p-4 text-center text-3xl font-bold shadow-md border-b-4 border-red-800">
        ★ パチンコ 確率機 ★
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
        {/* データランプ風 */}
        <div className="flex w-full max-w-3xl justify-around bg-gray-200 p-6 rounded-xl border-4 border-gray-400 shadow-inner">
           <div className="text-center">
             <div className="text-sm font-bold text-gray-600">回転数</div>
             <div className="text-4xl font-bold text-red-600 font-mono bg-black px-4 py-2 rounded border-2 border-gray-500 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
               {props.counter}
             </div>
           </div>
           <div className="text-center">
             <div className="text-sm font-bold text-gray-600">投資金額</div>
             <div className="text-4xl font-bold text-green-500 font-mono bg-black px-4 py-2 rounded border-2 border-gray-500 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
               {props.totalSpent}
             </div>
           </div>
        </div>

        {/* 結果表示 */}
        <div className={`text-6xl font-black h-24 flex items-center justify-center w-full max-w-2xl border-4 rounded-full ${props.result === "Yes!!!" ? "text-red-600 border-red-600 bg-red-100 animate-bounce" : "text-gray-300 border-gray-300"}`}>
            {props.result === "Yes!!!" ? "大当り！" : props.result === "Ready?" ? "準備完了" : "ハズレ"}
        </div>

        {/* 物理ボタン */}
        <div className="flex gap-8 mt-8">
            <button onClick={() => props.handleSpin(1)} className="w-32 h-32 rounded-full bg-red-500 text-white text-2xl font-bold shadow-[0_6px_0_#991b1b] active:shadow-none active:translate-y-[6px] transition-all border-4 border-red-400">
               PUSH
            </button>
            <button onClick={() => props.handleSpin(10)} className="w-32 h-32 rounded-full bg-blue-500 text-white text-xl font-bold shadow-[0_6px_0_#1e40af] active:shadow-none active:translate-y-[6px] transition-all border-4 border-blue-400 flex flex-col items-center justify-center">
               <span>オート</span>
               <span className="text-sm">10回転</span>
            </button>
        </div>

        <div className="mt-8 flex gap-4">
            <button onClick={() => props.setIsSettingsOpen(true)} className="px-4 py-2 bg-gray-200 rounded shadow text-gray-700 font-bold hover:bg-gray-300">
               店舗設定
            </button>
            <button onClick={props.reset} className="px-4 py-2 bg-gray-200 rounded shadow text-gray-700 font-bold hover:bg-gray-300">
               リセット
            </button>
            <Link href="/" className="px-4 py-2 bg-gray-800 rounded shadow text-white font-bold hover:bg-black">
               退店する
            </Link>
            <Link href="/pachinco" className="px-4 py-2 bg-gray-800 rounded shadow text-white font-bold hover:bg-black">
               前のやつに戻る
            </Link>
        </div>
      </div>

      {/* 設定モーダル (Classic) */}
      {props.isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
           <div className="bg-white p-6 rounded-lg shadow-xl w-80 border-4 border-gray-300">
              <h3 className="text-xl font-bold mb-4 text-center border-b-2 border-red-500 pb-2">管理者設定メニュー</h3>
              <div className="mb-4">
                 <p className="font-bold mb-2">確率設定</p>
                 <div className="flex gap-2">
                    {[99, 319, 2].map(p => (
                       <button key={p} onClick={() => props.setProbability(p)} className={`flex-1 py-1 border rounded ${props.probability === p ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>1/{p}</button>
                    ))}
                 </div>
              </div>
              <div className="mb-6">
                 <p className="font-bold mb-2">貸玉料金</p>
                 <div className="flex gap-2">
                    {[50, 100].map(c => (
                       <button key={c} onClick={() => props.setCostPerSpin(c)} className={`flex-1 py-1 border rounded ${props.costPerSpin === c ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}>¥{c}</button>
                    ))}
                 </div>
              </div>
              <button onClick={() => props.setIsSettingsOpen(false)} className="w-full py-2 bg-gray-500 text-white rounded font-bold shadow">閉じる</button>
           </div>
        </div>
      )}
    </div>
  );
};

// ■ 4. 親コンポーネント（メインロジック）
export default function PachinkoPage() {
  const [counter, setCounter] = useState<number>(0);
  const [result, setResult] = useState<string>("Ready?");
  const [randomVariable, setRandomVariable] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [costPerSpin, setCostPerSpin] = useState<number>(50);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [probability, setProbability] = useState(319); // 初期値はミドル
  const [version, setVersion] = useState<'classic' | 'cyber'>('cyber');

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
  };

  const sleep = (time: number) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  const handleSpin = async (times: number) => {
    // 現在の状態をRefに同期
    counterRef.current = counter;
    totalSpentRef.current = totalSpent;
    resultRef.current = result;

    for (let i = 0; i < times; i++) {
      if (resultRef.current === "Yes!!!") {
        console.log("当たり済みなのでストップ");
        break;
      }

      // 計算実行
      counterRef.current += 1;
      totalSpentRef.current += costPerSpin;

      // 画面更新
      setCounter(counterRef.current);
      setTotalSpent(totalSpentRef.current);
      // ハマり確率: (1 - 1/p) ^ n
      setRandomVariable(Math.pow(1 - (1 / probability), counterRef.current));

      // 抽選
      const randomNumber = Math.random();
      if (randomNumber < 1 / probability) {
        setResult("Yes!!!");
        resultRef.current = "Yes!!!";
      } else {
        setResult("No!!!");
      }

      // 演出ウェイト（ターボなら短く、通常なら少し待つなど調整可）
      await sleep(times > 10 ? 20 : 50);
    }
  };

  // 子に渡すデータをまとめる
  const viewProps: PachinkoViewProps = {
    counter, totalSpent, result, randomVariable, probability, costPerSpin, isSettingsOpen,
    handleSpin, reset, setProbability, setCostPerSpin, setIsSettingsOpen
  };

  return (
    <>
      {/* バージョン切り替えスイッチ (画面右上に固定) */}
      <div className="fixed top-4 right-4 z-[100] flex bg-black/50 p-1 rounded-full backdrop-blur-md border border-white/20">
        <button
          onClick={() => setVersion('classic')}
          className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${version === 'classic' ? 'bg-white text-black shadow-lg' : 'text-white hover:bg-white/20'}`}
        >
          RETRO
        </button>
        <button
          onClick={() => setVersion('cyber')}
          className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${version === 'cyber' ? 'bg-cyan-500 text-black shadow-[0_0_10px_#06b6d4]' : 'text-white hover:bg-white/20'}`}
        >
          CYBER
        </button>
      </div>

      {/* 選択中のビューを表示 */}
      {version === 'classic' ? <ClassicView {...viewProps} /> : <CyberView {...viewProps} />}
    </>
  );
}