import prisma from '.';

export function getLastBilling(groupNumId: number) {
  return prisma.bills.findFirst({
    where: {
      groupId: groupNumId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export function getBillList(groupId: number, robotId: number) {
  return prisma.bills.findMany({
    where: {
      groupId,
      robotId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export function addBillItem(data: {
  groupId: number;
  robotId: number;
  mathStr: string;
  amount: number;
  currentAmount: number;
}) {
  return prisma.bills.create({
    data,
  });
}

// 删除最后一条账单，可以用于撤回功能
export function delBillItems(id: number) {
  return prisma.bills.delete({
    where: {
      id,
    },
  });
}

// 清除群组的记账记录
// 将当前群里的数据转移到账单历史表中
export async function clearBilling(groupId: number, robotId: number) {
  const billings = await getBillList(groupId, robotId);
  // 批量转移到历史表
  const billingBatchNo = String(Date.now()); // 批次号
  const historyBillings = billings.map((b) => {
    return {
      ...b,
      groupId,
      billingBatchNo: billingBatchNo,
    };
  });
  await prisma.billsHistory.createMany({
    data: historyBillings,
  });
  await prisma.bills.deleteMany({
    where: {
      groupId,
      robotId,
    },
  });
  return true;
}
