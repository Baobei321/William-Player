import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import Layout from '@/layout/index.vue'

const constantRoutes = [
  {
    path: '/',
    component: Layout,
    hidden: true,
    redirect: '/home',
    children: [
      {
        path: 'home',
        component: () => import('@/pages/electron/home/index'),
        name: 'Home',
        meta: { title: '首页' }
      },
      {
        path: 'detail',
        component: () => import('@/pages/electron/home/detail'),
        name: 'Detail',
        meta: { title: '详情页' }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'video',
        component: () => import('@/pages/electron/video/video-player'),
        name: 'Video',
        meta: { title: '播放器', icon: 'user' }
      }
    ]
  },
  // 更多路由配置...
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  h5: { //配置了之后就可以不用uniapp的那套路由了
    vueRouterDev: true, //完全使用vue-router开发 默认 false
  },
});

export default router;