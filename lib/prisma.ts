import { PrismaClient } from '@prisma/client';

// グローバル変数にPrismaClientを保存するための型定義
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// すでにインスタンスがあればそれを使い、なければ新しく作る
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // 実行されたSQLをログに出す（デバッグ用）
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;