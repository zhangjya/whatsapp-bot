import prisma from './index';

export function getGroup(groupId: string, robotId: number) {
  return prisma.group.findFirst({
    where: {
      groupId,
      robotId,
      status: 1,
    },
  });
}

export function getGroupList(robotId: number) {
  return prisma.group.findMany({
    where: {
      robotId,
      status: {
        gt: -1, // 状态大于 -1 表示正常
      },
    },
    orderBy: {
      id: 'desc',
    },
  });
}

/**
 * 批量更新群组信息
 */
export function batchUpdateGroup(
  data: {
    uniqueId: string;
    robotId: number;
    groupId: string;
    name?: string;
  }[],
) {
  return prisma.$transaction(
    data.map((item) =>
      prisma.group.upsert({
        where: {
          uniqueId: item.uniqueId,
        },
        update: {
          groupId: item.groupId,
          robotId: item.robotId,
          name: item.name,
        },
        create: {
          uniqueId: `${item.robotId}_${item.groupId}`,
          groupId: item.groupId,
          robotId: item.robotId,
          name: item.name,
          totalAmount: 0,
          status: 1,
        },
      }),
    ),
  );
}

/**
 * 删除机器人信息
 * @param id
 * @returns
 */
export function groupChangeEnable(id: number, enable: boolean = true) {
  return prisma.group.update({
    where: {
      id,
    },
    data: {
      status: enable ? 1 : 0,
    },
  });
}

export function updateGroupTotalAmout(id: number, totalAmount: number) {
  return prisma.group.update({
    where: {
      id,
    },
    data: {
      totalAmount: totalAmount,
    },
  });
}
