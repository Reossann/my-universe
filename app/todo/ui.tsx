'use client';

import Link from 'next/link'; // 忘れずに！
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ← 1. 追加！
import { addTodo, deleteTodo, toggleTodo } from '../actions';

type Todoitem = {
    id: number;
    text:string;
    isDone:boolean;
}

type Props = {
  initialTodos: Todoitem[]; // ← DBのデータの型
};

export default function TodoUI({ initialTodos }: Props) {
    const [input, setInput] = useState<string>("")
    const list = initialTodos;
    const router = useRouter();

    const handleAdd = async () => {
        if (input === "") return;

        await addTodo(input);

        setInput("");

        router.refresh();
    }
    const handleRemove = async (id: number) => {
  if (window.confirm("本当に消しますか？")) {
    await deleteTodo(id); // サーバーにお願い！
  }
};
    
    const handleCheck = async (id: number, currentIsDone: boolean) => {
  // 今の状態(currentIsDone)の「逆」を渡す
  await toggleTodo(id, !currentIsDone); 
};
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
          onKeyDown={(e) => {
            if (e.key == "Enter"){
              handleAdd()
            }
          }}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={handleAdd} >
          追加
        </button>
      </div>

      <div className="space-y-2">
        {list.map((list_element) => (
            <div 
            tabIndex={0}
            key={list_element.id} 
            className='flex bg-yellow-300 text-black px-4 py-2 rounded-md hover:bg-red-500'
            onKeyDown={(e)=>{
              if (e.key == "Backspace"){
              handleRemove(list_element.id)
            }
            }}
            >
              <div className='flex gap-2 item-center'>
                <input
                type='checkbox'
                checked={list_element.isDone}
                onChange={() => handleCheck(list_element.id,list_element.isDone)}
                className='w-10 h-10' />
              </div>
                <h1 className={`
                ${list_element.isDone ? "text-gray-500 line-through" : ""} 
                text-2xl 
                mx-4`}>
                  {list_element.text}
                </h1>
                <button
                onClick={() => handleRemove(list_element.id)}
                className='bg-blue-200 text-black px-2 py-1 rounded'>
                  削除
                </button>
            </div>
        ))}
      </div>

    </main>
  );
}