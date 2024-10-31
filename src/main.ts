import { createApp } from 'vue';
import App from './App.vue';

import './styles/global.less';

import './demos/ipc';
import router from './routes';
import store from './store';
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

createApp(App)
  .use(store)
  .use(router)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
