import Vue from 'vue'
import Router from 'vue-router'

//首页框架
import Home from "../views/Home";
//桌面
import Tabletop from "../views/Tabletop";
import Doc_list from "../views/Doc_list";
import Doc_upload from "../views/Doc_upload";
import Doc_hall from "../views/Doc_hall";
import Authc_list from "../views/Authc_list";
import Audit from "../views/Audit";

//登录组件
import Login from "../views/Login";

Vue.use(Router)


const router = new Router({
  routes: [
    {
      name: "login",
      path: '/',
      redirect: '/login'
    },
    {
      name: 'login',
      path: '/login',
      component: Login
    },
    {
      name: '导航',
      path: '/home',
      component: Home,
      redirect: '/home/tabletop',
      children: [
        {
          name: '我的桌面',
          path: '/home/tabletop',
          component: Tabletop
        },
        {
          name: '文件列表',
          path: '/home/doc_list',
          component: Doc_list
        },
        {
          name: '文件上传',
          path: '/home/doc_upload',
          component: Doc_upload
        },
        {
          name: '大厅',
          path: '/home/doc_hall',
          component: Doc_hall
        },
        {
          name: '管理员列表',
          path: '/home/authc_list',
          component: Authc_list
        },
        {
          name: '审核',
          path: '/home/audit',
          component: Audit
        }
      ]
    }
  ],
  mode: 'history',
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 将要访问的路径
  //from 代表从哪个路径跳转而来
  //next 是一个函数，表示放行
  // next() next('/login') 强制跳转
  if (to.path === '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem("token")
  if (tokenStr === null || tokenStr === '' || tokenStr === undefined) return next('/login')
  next()
})


export default router
