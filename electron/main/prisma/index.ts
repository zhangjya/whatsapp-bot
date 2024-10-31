import { ipcMain } from 'electron';

import { destoryClient, logoutClient } from '../waClient';
import { getGroupList, groupChangeEnable } from './_group';
import { delRobot, getRobot, getRobotList, saveRobot, updateRobotStatus } from './_robot';
import { addWhiteList, delWhiteList, getWhiteList } from './_whiteList';
import { prisma } from './initPrisma';

// const prisma = new PrismaClient();
export default prisma;

export function initEvent() {
  // 获取机器人列表
  ipcMain.handle('get-robot-list', async (event: Electron.IpcMainEvent) => {
    const list = await getRobotList();
    return list;
  });
  // 保存机器人信息
  ipcMain.handle('save-robot', (event: Electron.IpcMainEvent, data) => {
    console.log('🚀 ~ ipcMain.handle ~ data:', data);
    return saveRobot(data);
  });
  // 获取机器人信息
  ipcMain.handle('get-robot-by-id', (event: Electron.IpcMainEvent, id: number) => {
    console.log('🚀 ~ ipcMain.handle ~ id:', id);
    return getRobot(id);
  });
  // 删除机器人
  ipcMain.handle('delete-robot', async (event: Electron.IpcMainEvent, id) => {
    try {
      await delRobot(id);
      return true;
    } catch (error) {
      return false;
    }
  });
  // 登出机器人的授权
  ipcMain.handle('logout-robot', async (event: Electron.IpcMainEvent, id) => {
    try {
      await logoutClient(id);
      await updateRobotStatus(id, 0);
      return true;
    } catch (error) {
      return false;
    }
  });
  // 销毁机器人客户端，同时也会更新状态为代授权
  ipcMain.handle('destory-robot', async (event: Electron.IpcMainEvent, id) => {
    try {
      await destoryClient(id);
      await updateRobotStatus(id, 0);
      return true;
    } catch (error) {
      return false;
    }
  });

  // 获取群组列表
  ipcMain.handle('get-group-list', (event: Electron.IpcMainEvent, robotId: number) => {
    return getGroupList(robotId);
  });
  // 切换群组状态
  ipcMain.handle(
    'group-change-enable',
    async (event: Electron.IpcMainEvent, id: number, enable?: boolean) => {
      return groupChangeEnable(id, enable);
    },
  );
  // 获取白名单列表
  ipcMain.handle('get-white-list', (event: Electron.IpcMainEvent, robotId: number) => {
    return getWhiteList(robotId);
  });
  // 新增白名单
  ipcMain.handle(
    'add-white-list',
    async (
      event: Electron.IpcMainEvent,
      data: { robotId: number; account: string; permission: string },
    ) => {
      return addWhiteList(data);
    },
  );
  // 删除白名单
  ipcMain.handle('delete-white-list', async (event: Electron.IpcMainEvent, id: number) => {
    return delWhiteList(id);
  });
}
