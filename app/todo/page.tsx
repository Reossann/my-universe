// app/todo/page.tsx
import Link from 'next/link'; // 忘れずに！

export default function TodoPage() {
  return (
    // min-h-screen: 画面の高さいっぱい, p-8: 余白
    <main className="min-h-screen p-8 bg-gray-50">
      
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline">
          ← ホームに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Todo List</h1>

      <div className="flex gap-2 mb-8">
        <input 
          type="text" 
          placeholder="新しいタスクを入力..." 
          className="border p-2 rounded-md flex-1 text-black" 
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          追加
        </button>
      </div>

      <div className="space-y-2">
        <div className="bg-white p-4 rounded shadow border text-black">
          プログラミングの勉強をする
        </div>
        <div className="bg-white p-4 rounded shadow border text-black">
          買い物に行く
        </div>
      </div>

    </main>
  );
}