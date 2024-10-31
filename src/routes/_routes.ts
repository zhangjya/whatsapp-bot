import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/index',
    component: () => import('/@/layouts/index.vue'),
    children: [
      {
        path: '/index',
        component: () => import('/@/pages/index.vue'),
        meta: {
          header: false,
        },
      },
      {
        path: '/home',
        component: () => import('/@/pages/home/index.vue'),
      },
    ],
  },
];

export default routes;
