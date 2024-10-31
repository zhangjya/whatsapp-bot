export function getWhiteList(robotId: number) {
  return window.ipcRenderer.invoke('get-white-list', robotId);
}

export function addWhiteList(data: WHITELIST.SaveParams) {
  return window.ipcRenderer.invoke('add-white-list', data);
}

export function deleteWhiteList(id: number) {
  return window.ipcRenderer.invoke('delete-white-list', id);
}
