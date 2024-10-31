export function getGroupList(robotId: number) {
  return window.ipcRenderer.invoke('get-group-list', robotId);
}

export function groupChangeEnable(id: number, enable?: boolean) {
  return window.ipcRenderer.invoke('group-change-enable', id, enable);
}
