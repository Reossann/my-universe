'use client';

// app/todo/page.tsx
import Link from 'next/link'; // 忘れずに！
import { useState } from 'react';
type Todoitem = {
    id: number;
    text:string;
    isDone:boolean;
}


export default function TodoPage() {

    const [input, setInput] = useState<string>("")
    const [list, setList] = useState<Todoitem[]>([])

    const handleAdd = () => {
        const new_list = structuredClone(list);
        const add_elements = {text:input, id: Date.now(), isDone:false};
        if (add_elements.text === "")return;
        new_list.push(add_elements);
        setList(new_list);
        setInput("");
    }
    const handleRemove = (id : number) => {
      if (window.confirm("本当に消しますか？")){
        const new_list = list.filter(element => {
            return element.id != id
        })
        setList(new_list);
      }else return;
    }
    
    const handleCheck = (id:number) => {
      const new_item = list.map((item) => {
        if (item.id === id){
          return { ...item, isDone: !item.isDone };
        }
        return item;
      })
      setList(new_item)
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
                onChange={() => handleCheck(list_element.id)}
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