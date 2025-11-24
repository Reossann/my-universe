'use client';

// app/todo/page.tsx
import Link from 'next/link'; // 忘れずに！
import { useState } from 'react';
type Todoitem = {
    id: number;
    text:string;
}


export default function TodoPage() {

    const [input, setInput] = useState<string>("")
    const [list, setList] = useState<Todoitem[]>([])

    const handleAdd = () => {
        const new_list = structuredClone(list);
        const add_elements = {text:input, id: Date.now()};
        new_list.push(add_elements);
        setList(new_list)
        setInput("")

    }
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
          placeholder='新しいタスクを入力...'
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 rounded-md flex-1 text-black" 
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={handleAdd}>
          追加
        </button>
      </div>

      <div className="space-y-2">
        {list.map((list_element) => (
            <div key={list_element.id} className='bg-yellow-300 text-black px-4 py-2 rounded-md hover:bg-red-500'>
                <h1>{list_element.text}</h1>
            </div>
        ))}
      </div>

    </main>
  );
}