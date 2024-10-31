import prisma from './index';

export function getWhiteListByAccount(account: string) {
  return prisma.whiteList.findFirst({
    where: {
      account,
      status: {
        gt: -1, // 状态大于 -1 表示正常
      },
    },
  });
}

export function getWhiteList(robotId: number) {
  return prisma.whiteList.findMany({
    where: {
      robotId: robotId,
      status: {
        gt: -1, // 状态大于 -1 表示正常
      },
    },
    orderBy: {
      id: 'desc',
    },
  });
}

export function addWhiteList(data: { robotId: number; account: string; permission: string }) {
  return prisma.whiteList.create({
    data: {
      ...data,
      status: 1,
    },
  });
}

export function delWhiteList(id: number) {
  return prisma.whiteList.delete({
    where: { id },
  });
}
