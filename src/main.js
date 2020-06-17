// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import {Message,Loading} from 'element-ui'

//导航页路由
import router from './router/nav_index'

Vue.use(router);

//element-ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI);
//axios
import axios from 'axios'
import VueAxios from 'vue-axios'

// 权限校验加入方法
import { isAuth } from '@/utils'

Vue.use(VueAxios, axios);

//导入全局样式
import './assets/css/global.css'

//在main.js引入qs
import qs from 'qs'
//配全局属性配置，在任意组件内可以使用this.$qs获取qs对象
Vue.prototype.$qs = qs;

//配置请求的根路径
axios.defaults.baseURL = 'http://localhost:8797/api/'
//axios拦截器，拦截请求使其带上 token 的令牌
axios.interceptors.request.use(config => {
  config.headers.token = window.sessionStorage.getItem('token');
  Loading.service({text:"Loading..."});
  return config
}, err => {
  Message.error({message: '请求超时!'});
  return Promise.resolve(err);
});
//axios响应拦截器
axios.interceptors.response.use(res => {
  Loading.service().close();
  console.log(res.data.meta.status)
  if (res.data.meta && res.data.meta.status === 401) { // 401, token失效
    //clearLoginInfo()
    router.push({ name: 'login' })
  }
  return res;
}, err => {
  Loading.service().close();
  return Promise.reject(err);
})


Vue.config.productionTip = false;

Vue.prototype.isAuth = isAuth     // 权限方法

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router, //配置路由
  components: {App},
  template: '<App/>'
});
