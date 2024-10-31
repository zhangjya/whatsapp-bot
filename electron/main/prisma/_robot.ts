import prisma from './index';

export function getRobot(id: number) {
  return prisma.robot.findUnique({
    where: {
      id,
    },
  });
}

export function getRobotList() {
  return prisma.robot.findMany({
    where: {
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
 * 保存机器人信息，可以是创建，也可以是更新
 * @param name
 * @returns
 */
export function saveRobot(data: {
  id?: number;
  name: string;
  mobile?: string;
  nickName?: string;
  status?: number;
}) {
  return prisma.robot.upsert({
    where: {
      id: data.id || 0,
    },
    update: data,
    create: { status: 0, ...data },
  });
}

/**
 * 删除机器人信息
 * @param id
 * @returns
 */
export function delRobot(id: number) {
  return prisma.robot.update({
    where: {
      id,
    },
    data: {
      status: -1,
    },
  });
}

/**
 * 更新机器人的状态
 * @param id
 * @param status
 * @returns
 */
export async function updateRobotStatus(id: number, status: number) {
  console.log('🚀 ~ updateRobotStatus ~ id:', id, status);
  const res = await prisma.robot.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
  console.log('🚀 ~ updateRobotStatus ~ res:', res);

  return res;
}
