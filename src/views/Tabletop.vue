<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>我的桌面</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>个人信息</template>
          <p class="line">欢迎来到 ONCLOUD，{{ userInfo.username }}！</p>
          <p class="line">您的身份：{{ userInfo.role }}</p>
          <p class="line">您的状态：{{ userInfo.state == 1 ? '已启用' : '已停用' }}</p>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>当前时间</template>
          <p class="clock">{{ now }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ArrowRight } from '@element-plus/icons-vue'
import { formatDate } from '../utils/format'

export default {
  name: 'Tabletop',
  setup() {
    return { ArrowRight }
  },
  data() {
    return {
      userInfo: {},
      now: '',
      timer: null
    }
  },
  methods: {
    async getUserInfo() {
      try {
        const { data: res } = await this.$http.get('/user')
        if (res.meta.status === 200) {
          this.userInfo = res.data
        }
      } catch (e) {
        // 错误提示已由拦截器统一处理
      }
    },
    updateTime() {
      const date = new Date()
      const time = date.toTimeString().slice(0, 8)
      this.now = `${formatDate(date)} ${time}`
    }
  },
  created() {
    this.getUserInfo()
    this.updateTime()
    this.timer = window.setInterval(this.updateTime, 1000)
  },
  beforeUnmount() {
    window.clearInterval(this.timer)
  }
}
</script>

<style scoped>
  .line {
    font-size: 16px;
    line-height: 1.8;
    margin: 0;
  }

  .clock {
    font-size: 26px;
    font-weight: bold;
    color: #9dae28;
    margin: 10px 0;
  }
</style>
