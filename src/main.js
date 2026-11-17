import { createApp } from 'vue'
import ElementPlus, { ElLoading, ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import axios from 'axios'
import qs from 'qs'

import App from './App.vue'
import router from './router/nav_index'
import './assets/css/global.css'
import { getToken, removeToken } from './utils/auth'

// 开发环境走 vite 代理，生产环境可通过 VITE_API_BASE 指定后端地址
axios.defaults.baseURL = import.meta.env.VITE_API_BASE || '/api/'
axios.defaults.timeout = 30000

let loadingCount = 0
let loadingInstance = null

function openLoading() {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
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
  ElMessage.error(message || '登录已失效，请重新登录')
  const current = router.currentRoute.value
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
      ElMessage.error('请求超时，请稍后重试')
    } else if (!response) {
      ElMessage.error('无法连接服务器，请检查后端是否启动')
    } else {
      ElMessage.error((meta && meta.msg) || '请求失败，请稍后重试')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)
app.use(router)
app.use(ElementPlus, { locale: zhCn })
// 组件内通过 this.$http 使用统一配置好的 axios 实例
app.config.globalProperties.$http = axios
app.config.globalProperties.$qs = qs
app.mount('#app')
