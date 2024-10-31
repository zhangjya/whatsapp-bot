export const getChromePath = () => {
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
};
