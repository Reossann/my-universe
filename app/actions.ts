'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// これが addTodo 関数！
export const addTodo = async (text: string) => {
  await prisma.todo.create({
    data: {
      text: text,
    },
  });

  // 保存したら、キャッシュをクリアして画面を更新させる
  revalidatePath('/todo'); 
};

export const deleteTodo = async (id: number) => {
  await prisma.todo.delete({
    where: { id: id }, // IDを指定して削除
  });
  revalidatePath('/todo'); // 画面更新
};

// ★追加2: 完了切り替え機能
export const toggleTodo = async (id: number, isDone: boolean) => {
  await prisma.todo.update({
    where: { id: id },
    data: { 
      isDone: isDone // 新しい状態をセット
    },
  });
  revalidatePath('/todo'); // 画面更新
};