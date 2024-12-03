import { Group } from '@prisma/client';
import { app, ipcMain, ipcRenderer } from 'electron';
import fs from 'fs';
import { evaluate, round } from 'mathjs';
import path from 'path';
import WAWebJS, { Chat, GroupNotification, Message } from 'whatsapp-web.js';

import {
  addBillItem,
  clearBilling,
  delBillItems,
  getBillList,
  getLastBilling,
} from '../prisma/_bills';
import { batchUpdateGroup, getGroup, updateGroupTotalAmout } from '../prisma/_group';
import { getRobot, saveRobot, updateRobotStatus } from '../prisma/_robot';
import { getWhiteList } from '../prisma/_whiteList';
import { getChromePath } from '../utils';

const { Client, LocalAuth, NoAuth } = WAWebJS;
const waClientMap = new Map<number, WAWebJS.Client>(); // 机器人客户端map

const _replyCheHui = async (message: Message, group: Group) => {
  const billingInfo = await getLastBilling(group.id);
  if (!billingInfo) {
    message.reply('请先输入金额');
    return;
  }
  // 撤回账单，直接物理删除
  await delBillItems(billingInfo.id);
  // 获取撤回后的最后一条账单信息，里面有当前金额
  const _lastBillingAfterRemove = await getLastBilling(group.id);
  const reAmount = billingInfo.currentAmount - (_lastBillingAfterRemove?.currentAmount ?? 0);
  // 更新撤回后的群组余额
  await updateGroupTotalAmout(group.id, round(group.totalAmount - reAmount, 2));
  // // 更新撤回后的卡商余额
  // await this.cardBuyerService.updateAmout(
  //   group.buyer.id,
  //   round(group.buyer.amount - reAmount, 2),
  // );
  // 撤回后要重新结算一下
  await _replyJieSuan(message, group);
};

const _replyJieSuan = async (message: Message, group: Group) => {
  const billingList = await getBillList(group.id, group.robotId);
  if (billingList.length === 0) {
    message.reply('请先输入金额');
    return;
  }
  const totalAmount = billingList[billingList.length - 1].currentAmount;
  const historyArr = billingList.map((b) => `${b.mathStr}=${b.currentAmount}`);
  const replyMsg = `结算合计金额：${totalAmount}:\n${(historyArr || []).join('。\n')}`;
  // this.logger.log(`【${group.robotId}】${replyMsg}`);
  message.reply(replyMsg);
};

const _replyQingZhang = async (message: Message, group: Group) => {
  // 1. 清除群组的记账记录
  await clearBilling(group.id, group.robotId);
  // 2. 重置群的余额
  await updateGroupTotalAmout(group.id, 0);
  // // 3. 卡商余额减去被清账的总额
  // const buyerAmout = round(group.buyer.amount - group.groupAmount, 2);
  // await this.cardBuyerService.updateAmout(group.buyer.id, buyerAmout);
  // 回复清账消息
  const replyMsg = '清除账单余额：0';
  console.log(`【${group.robotId}】${replyMsg}`);
  message.reply(replyMsg);
};

const _matchMathMessage = async (message: Message, group: Group) => {
  const mathStr = message.body;
  // 匹配带有数学运算符和数字的字符串，且最后一位必须是数字
  // const mathRegex = /^([+\-*/])([(]?\d+[+\-*/.\d()]*)?(^$|[\d])$/;
  const mathRegex = /^([+\-*/](?!$|[\+\-*/])(?!0(?!\.))\d*(\.\d+)?)+(?<![\+\-\*/])$/;
  const mathMatch = mathRegex.test(mathStr);
  if (!mathMatch) {
    console.warn(`${mathStr} 未通过正则匹配: ${mathMatch}`);
    return;
  }
  // 通过了数学表达式的正则匹配
  console.log(`${mathStr} 通过正则匹配: ${mathMatch}`);
  const _billingInfo = await getLastBilling(group.id);
  // 计算数学表达式
  const _evalAmount = evaluate(`${_billingInfo?.currentAmount ?? 0}${mathStr}`) || 0;
  // 精确小数点两位
  const currentAmount = round(_evalAmount, 2);

  const mathStrAmout = round(evaluate(`0${mathStr}`), 2);
  if (_billingInfo) {
    const replyMsg = `总账单余额：${_billingInfo.currentAmount}${mathStr}=${currentAmount}[${mathStrAmout}]`;
    console.log(`【${group.robotId}】${replyMsg}`);
    message.reply(replyMsg);
  } else {
    const replyMsg = `总账单余额：${mathStr}=${currentAmount}[${mathStrAmout}]`;
    console.log(`【${group.robotId}】${replyMsg}`);
    message.reply(replyMsg);
  }
  // 构建新的账单记录
  // 增加新的账单记录
  await addBillItem({
    groupId: group.id,
    robotId: group.robotId,
    mathStr: mathStr,
    amount: mathStrAmout,
    currentAmount: currentAmount,
  });
  // 更新群组余额
  const newGroupAmout = round(currentAmount, 2);
  await updateGroupTotalAmout(group.id, newGroupAmout);
  // 更新卡商金额
  // const newBuyerAmout = await this.groupService.sumByBuyerId(group.buyer.id);
  // await this.cardBuyerService.updateAmout(group.buyer.id, newBuyerAmout);
};

const analysisWAMessage = async (message: Message, chat: Chat, robotId: number) => {
  if (message.type !== 'chat') {
    // this.logger.warn(
    //   `【${robotId}】消息类型不是chat：${message.type} `,
    //   message.body,
    // );
    return;
  }
  if (!message.author) {
    // this.logger.warn(`【${robotId}】没找到发送人：【${message.author}】`);
    return;
  }
  // TODO: 白名单功能
  const senderAccount = message.author.split('@')[0];
  const whiteList = await getWhiteList(robotId);
  const authMap = {
    canQZ: true, // 清账
    canCH: true, // 撤回
    canJS: true, // 结算
  };
  if (whiteList.length > 0) {
    // 存在白名单时，表示白名单功能已开启
    const whiteListInfo = whiteList.find((item) => item.account === senderAccount);
    if (!whiteListInfo) {
      console.log(`【${robotId}】${senderAccount} 不在白名单中`);
      return;
    }

    // 判断白名单中的权限
    authMap.canQZ = whiteListInfo.permission.includes('qz');
    authMap.canCH = whiteListInfo.permission.includes('ch');
    authMap.canJS = whiteListInfo.permission.includes('js');
  }

  // TODO: 暂时不处理不符合要求的群的指令，后续可能根据不同类型的机器人放开这里
  const _groupInfo = await getGroup(chat.id.user, robotId);
  if (!_groupInfo) {
    return;
  }

  // 此处可以设置各种指令以及处理方法
  switch (message.body) {
    case '/qz':
      // this.logger.error(`【${robotId}】【${senderAccount}】发送了指令：${message.body}`);
      authMap.canQZ && _replyQingZhang(message, _groupInfo);
      break;
    case '/ch':
      // this.logger.log(`【${robotId}】【${senderAccount}】发送了指令：${message.body}`);
      authMap.canCH && _replyCheHui(message, _groupInfo);
      break;
    case '+0':
    case '/js':
      // this.logger.log(`【${robotId}】【${senderAccount}】发送了指令：${message.body}`);
      authMap.canJS && _replyJieSuan(message, _groupInfo);
      break;
    default:
      _matchMathMessage(message, _groupInfo);
      break;
  }
};

const _syncGroupList = async (robotId: number, chats: WAWebJS.Chat[]) => {
  console.log('🚀 ~ const_syncGroupList= ~ chats:', chats);
  const _groups = chats
    // .filter((chat) => chat.isGroup)
    .map((item) => ({
      uniqueId: `${robotId}_${item.id.user}`,
      robotId: robotId,
      groupId: item.id.user,
      name: item.name,
    }));
  batchUpdateGroup(_groups);
};

const _initWaClient = async (robotId: number, webContents: Electron.WebContents) => {
  const id = robotId; // 机器人id
  if (waClientMap.has(id)) {
    // 缓存在map中，避免重复启动
    return;
  }
  // 默认配置
  let puppeteerOptions: Record<string, any> = {
    headless: false,
    devtools: false,
    dumpio: true,
    args: ['--no-sandbox', '--ignore-certificate-errors'],
    // 直接指定本地的chrome浏览器路径
    executablePath: getChromePath(),
    // executablePath:
    //   'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  };
  // 生产上linux服务器的配置
  //   if (IS_PROD) {
  //     puppeteerOptions = {
  //       // headless: false,
  //       args: ['--no-sandbox'],
  //     };
  //   }
  // const wwebVersion = '2.2412.50';

  const rootDir = app.getAppPath();
  const authDir = path.join(rootDir, '../', '.wwebjs_auth');
  fs.mkdirSync(authDir, { recursive: true });
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: `client_${id}`,
      dataPath: authDir,
    }),
    puppeteer: puppeteerOptions,
    // webVersion: wwebVersion,
    // webVersionCache: {
    //   type: 'remote',
    //   remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    // },
  });

  waClientMap.set(id, client);

  client.on('qr', async (qr: string) => {
    console.log('🚀 ~ client.on ~ qr:', qr);
    const _robot = await getRobot(id);
    // 更新机器人的状态为待扫码
    if (_robot && _robot.status !== 1) {
      updateRobotStatus(id, 1);
    }
    // TODO: 发送二维码到渲染进程
    webContents.send('robot-info-change', { robotId: id, qr, state: 1 });
  });

  client.on('disconnected', () => {
    updateRobotStatus(id, 0);
    // TODO: 通知状态变化到渲染进程
    webContents.send('robot-info-change', { robotId: id, state: 0 });
  });
  client.on('auth_failure', (err: any) => {
    console.error('auth_failure', err);
    updateRobotStatus(id, 0);
    // TODO: 通知状态变化到渲染进程
    webContents.send('robot-info-change', { robotId: id, state: 0 });
  });
  client.on('loading_screen', async (percent: number, msg: string) => {
    console.log(`loading_screen ${percent} ${msg}`);
    const robotInfo = await getRobot(id);
    if (robotInfo && robotInfo.status === 3) {
      return;
    }
    updateRobotStatus(id, 2);
    // TODO: 通知加载进度到渲染进程
    webContents.send('robot-info-change', { robotId: id, percent, state: 2 });
  });

  client.on('ready', async () => {
    console.log('🚀 ~ client.on ~ ready');

    const robotInfo = await getRobot(id);
    const save = await saveRobot({
      id,
      name: robotInfo.name,
      mobile: client.info.wid.user,
      nickName: client.info.pushname,
      status: 3,
    });
    console.log(save);

    updateRobotStatus(id, 3);

    webContents.send('robot-info-change', { robotId: id, state: 3 });
    const chats = await client.getChats();
    /// 开始同步群组信息
    _syncGroupList(id, chats);
  });

  client.on('group_update', async (notification: GroupNotification) => {
    const groupId = notification.chatId.split('@')[0];
    // 同步新加或更新的组群信息
    if (groupId) {
      const _chat = await notification.getChat();
      batchUpdateGroup([
        {
          uniqueId: `${id}_${groupId}`,
          robotId: id,
          groupId,
          name: notification.body || _chat.name,
        },
      ]);
    }
  });

  // TODO: 目前只要在update中处理就行了
  // client.on('group_join', (notification: GroupNotification) => {
  //   logger.log('🚀 ~ client.on ~ notification:', notification);
  // });

  client.on('message', async (message: Message) => {
    const chat = await message.getChat();
    analysisWAMessage(message, chat, id);
    // if (chat.isGroup) {
    //   analysisWAMessage(message, chat, id);
    // }
  });

  try {
    await client.initialize();
    console.log(`机器人【${id}】启动中`);
    return Promise.resolve(true);
  } catch (error) {
    console.error('🚀 ~ const_initWaClient= ~ error:', error);
    client.destroy();
    waClientMap.delete(id);
    return Promise.reject(error);
  }
};

export async function initWaClientEvent(webContents: Electron.WebContents) {
  // 启动机器人客户端
  ipcMain.handle('start-wa-client', async (event: Electron.IpcMainEvent, robotId: number) => {
    const robotInfo = await getRobot(robotId);
    if (!robotInfo) {
      return '';
    }
    return _initWaClient(robotId, webContents);
  });
}

/**
 * 销毁机器人客户端，可能待扫码、可能已授权
 * @param robotId
 */
export const destoryClient = async (robotId: number) => {
  const _client = waClientMap.get(Number(robotId));
  if (_client) {
    _client.removeAllListeners();
    await _client.destroy();
    waClientMap.delete(robotId);
  }
};

/**
 * 登出机器人，只有已经授权成功的才需要
 * @param robotId
 */
export const logoutClient = async (robotId: number) => {
  const _client = waClientMap.get(Number(robotId));
  if (_client) {
    await _client.logout();
    destoryClient(robotId);
  }
};

export function sendMessage() {
  ipcRenderer.send('send-message');
}
