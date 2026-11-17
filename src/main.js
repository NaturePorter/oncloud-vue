import Vue from 'vue'
import ElementUI, { Loading, Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueAxios from 'vue-axios'
import axios from 'axios'
import qs from 'qs'

import App from './App.vue'
import router from './router/nav_index'
import './assets/css/global.css'
import { getToken, removeToken } from './utils/auth'

Vue.config.productionTip = false
Vue.use(ElementUI, { size: 'medium' })
Vue.use(VueAxios, axios)
Vue.prototype.$qs = qs

// 开发环境走 vite 代理，生产环境可通过 VITE_API_BASE 指定后端地址
axios.defaults.baseURL = import.meta.env.VITE_API_BASE || '/api/'
axios.defaults.timeout = 30000

let loadingCount = 0
let loadingInstance = null

function openLoading() {
  if (loadingCount === 0) {
    loadingInstance = Loading.service({
      fullscreen: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.15)'
    })
  }
  loadingCount += 1
}

function closeLoading() {
  if (loadingCount > 0) loadingCount -= 1
  if (loadingCount === 0 && loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

let unauthorizedLock = false

function handleUnauthorized(message) {
  removeToken()
  if (unauthorizedLock) return
  unauthorizedLock = true
  Message.error(message || '登录已失效，请重新登录')
  const current = router.currentRoute
  if (current.path !== '/login') {
    router.replace({ path: '/login', query: { redirect: current.fullPath } })
  }
  window.setTimeout(() => {
    unauthorizedLock = false
  }, 1500)
}

axios.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.token = token
    }
    if (!config.noLoading) openLoading()
    return config
  },
  error => {
    closeLoading()
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    closeLoading()
    // 文件下载等二进制响应直接返回
    if (response.config.responseType === 'blob') {
      return response
    }
    const meta = response.data && response.data.meta
    // 仅当本地已存在登录态时才按“登录失效”处理，避免登录失败被重复提示
    if (meta && meta.status === 401 && getToken()) {
      handleUnauthorized(meta.msg)
    }
    return response
  },
  error => {
    closeLoading()
    const response = error.response
    const meta = response && response.data && response.data.meta
    if (response && response.status === 401) {
      handleUnauthorized(meta && meta.msg)
    } else if (error.code === 'ECONNABORTED') {
      Message.error('请求超时，请稍后重试')
    } else if (!response) {
      Message.error('无法连接服务器，请检查后端是否启动')
    } else {
      Message.error((meta && meta.msg) || '请求失败，请稍后重试')
    }
    return Promise.reject(error)
  }
)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
