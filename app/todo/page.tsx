// app/todo/page.tsx
import { prisma } from '@/lib/prisma';
import TodoUI from './ui';

// asyncをつける（待つからね！）
export default async function TodoPage() {
  
  // DBからデータを取るのを「待つ（await）」
  const todos = await prisma.todo.findMany();

  // 取れたデータを子に渡す
  return <TodoUI initialTodos={todos} />;
}