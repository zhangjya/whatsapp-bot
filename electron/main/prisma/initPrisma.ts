import prismaClient from '@prisma/client';
import electronIsDev from 'electron-is-dev';
import { join } from 'path';

console.log('🚀 ~ electronIsDev:', electronIsDev);

const globalForPrisma = globalThis as unknown as { prisma: prismaClient.PrismaClient };
const dbPath = electronIsDev ? 'sqllite.db' : join(process.resourcesPath, 'database/prod.db');

// 保证只有一个实例
export const prisma =
  globalForPrisma.prisma ||
  new prismaClient.PrismaClient({
    // datasources: {
    //   db: {
    //     url: `file:sqllite.db`,
    //     // url: `file:${dbPath}`,
    //   },
    // },
  });
