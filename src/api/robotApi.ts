export function getRobotList() {
  return window.ipcRenderer.invoke('get-robot-list');
}

export function addRobot(data: ROBOT.SaveParams) {
  return window.ipcRenderer.invoke('save-robot', data);
}

export function getRobotById(id: number) {
  return window.ipcRenderer.invoke('get-robot-by-id', id);
}

export function startRobotById(id: number) {
  return window.ipcRenderer.invoke('start-wa-client', id);
}

/**
 * 删除机器人，只有未授权状态时才可以删除
 * @param id 
 * @returns 
 */
export function deleteRobot(id: number) {
  return window.ipcRenderer.invoke('delete-robot', id);
}

/**
 * 登出机器人的授权，只有已授权状态时才可以登出
 * @param id 
 * @returns 
 */
export function logoutRobot(id: number) {
  return window.ipcRenderer.invoke('logout-robot', id);
}

/**
 * 销毁机器人客户端，非未授权和非已授权状态下调用，同时也会更新状态为未授权
 * @param id 
 * @returns 
 */
export function destoryRobot(id: number) {
  return window.ipcRenderer.invoke('destory-robot', id);
}