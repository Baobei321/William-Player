import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const constantRoutes = [
  {
    path: '/',
    component: Layout,
    hidden: true,
    redirect: '/entry',
    children: [
      {
        path: 'entry',
        component: () => import('@/pages/electron/login/entry'),
        name: 'Entry',
        meta: { title: '入口', hideSidebar: true, noTransition: true },
      },
      {
        path: 'login',
        component: () => import('@/pages/electron/login/index'),
        name: 'Login',
        meta: { title: '登录', hideSidebar: true, noTransition: true },
      },
      {
        path: 'home',
        component: () => import('@/pages/electron/home/index'),
        name: 'Home',
        meta: { title: '首页' },
      },
      {
        path: 'emby',
        component: () => import('@/pages/electron/emby/index'),
        name: 'Emby',
        meta: { title: 'Emby' },
      },
      {
        path: 'live',
        component: () => import('@/pages/electron/live/index'),
        name: 'Live',
        meta: { title: '直播' },
      },
      {
        path: 'settings',
        component: () => import('@/pages/electron/settings/index'),
        name: 'Settings',
        meta: { title: '设置' },
      },
      {
        path: 'homeDetail',
        component: () => import('@/pages/electron/home/detail'),
        name: 'HomeDetail',
        meta: { title: '详情页' },
      },
      {
        path: 'homeAll',
        component: () => import('@/pages/electron/home/all'),
        name: 'HomeAll',
        meta: { title: '所有' },
      },
      {
        path: 'embyAll',
        component: () => import('@/pages/electron/emby/emby-all'),
        name: 'EmbyAll',
        meta: { title: 'Emby所有' },
      },
      {
        path: 'embyAll-copy',
        component: () => import('@/pages/electron/emby/emby-all'),
        name: 'EmbyAllCopy',
        meta: { title: 'Emby所有' },
      },
      {
        path: 'sourceList',
        component: () => import('@/pages/electron/source/source-list'),
        name: 'SourceList',
        meta: { title: '资源库' },
      },
      {
        path: 'mediaList',
        component: () => import('@/pages/electron/media/list'),
        name: 'MediaList',
        meta: { title: '媒体库列表' },
      },
      {
        path: 'appreciate',
        component: () => import('@/pages/electron/settings/appreciate'),
        name: 'Appreciate',
        meta: { title: '赞赏' },
      },
      {
        path: 'iframe',
        component: () => import('@/pages/electron/settings/iframe'),
        name: 'Iframe',
        meta: { title: 'iframe页面' },
      },
      {
        path: 'qqTalk',
        component: () => import('@/pages/electron/settings/qq-talk'),
        name: 'QqTalk',
        meta: { title: 'QQ甲流' },
      },
      {
        path: 'about-version',
        component: () => import('@/pages/electron/settings/about-version'),
        name: 'AboutVersion',
        meta: { title: '关于' },
      },
      {
        path: 'catelog-mulu',
        component: () => import('@/pages/electron/media/catelog-mulu'),
        name: 'CatelogMulu',
        meta: { title: '目录设置' },
      },
    ],
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
        meta: { title: '播放器', icon: 'user', hideSidebar: true },
      },
    ],
  },
  // 更多路由配置...
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  h5: {
    //配置了之后就可以不用uniapp的那套路由了
    vueRouterDev: true, //完全使用vue-router开发 默认 false
  },
})

export default router
