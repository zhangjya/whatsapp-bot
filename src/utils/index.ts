import dayjs from 'dayjs';

export function formatDate(date: any) {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export const getChromePath = () => {
  if (navigator.userAgent.includes('Mac OS X')) {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
};
