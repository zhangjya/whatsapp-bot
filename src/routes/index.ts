import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './_routes';

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});

router.beforeEach((_to, _from, next) => {
  // 开启路由切换的loading
  next();
});

router.afterEach((_to, _from) => {
  // 关闭路由切换的loading
});

export default router;
