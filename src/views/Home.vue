<template>
  <el-container class="home_container">
    <!--头部区域-->
    <el-header class="home_header">
      <img src="../assets/header_logo.png" class="logo" alt="ONCLOUD"/>
      <el-dropdown class="user_dropdown" @command="handleCommand">
        <span class="user_info">
          <el-icon><User /></el-icon>
          {{ username }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>

    <el-container class="body_container">
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="home_aside">
        <div class="toggle-button" @click="isCollapse = !isCollapse">
          <el-icon v-if="isCollapse"><Expand /></el-icon>
          <el-icon v-else><Fold /></el-icon>
        </div>
        <el-menu
          router
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="$route.path"
          background-color="#9dae28"
          text-color="#ffffff"
          active-text-color="#ffd04b">
          <template v-for="item in menu" :key="item.menuId">
            <el-sub-menu v-if="item.list && item.list.length" :index="String(item.menuId)">
              <template #title>
                <el-icon><Menu /></el-icon>
                <span>{{ item.name }}</span>
              </template>
              <el-menu-item v-for="child in item.list" :key="child.menuId" :index="'/home/' + child.url">
                {{ child.name }}
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="'/home/' + item.url">
              <el-icon><Document /></el-icon>
              <template #title>{{ item.name }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <!--内容区域-->
      <el-main class="home_main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { User, Menu, Document, Fold, Expand } from '@element-plus/icons-vue'
import { getToken, removeToken } from '../utils/auth'

export default {
  name: 'Home',
  components: { User, Menu, Document, Fold, Expand },
  data() {
    return {
      isCollapse: false,
      menu: [],
      username: ''
    }
  },
  methods: {
    async getMenu() {
      try {
        const { data: res } = await this.$http.get('/menu')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '获取菜单失败')
        this.menu = res.data || []
      } catch (e) {
        // 错误提示已由拦截器统一处理
      }
    },
    async getUserInfo() {
      try {
        const { data: res } = await this.$http.get('/user')
        if (res.meta.status === 200) {
          this.username = res.data.username
        }
      } catch (e) {
        // 错误提示已由拦截器统一处理
      }
    },
    async handleCommand(command) {
      if (command !== 'logout') return
      try {
        await this.$http.post('/logout')
      } catch (e) {
        // 即使后端退出失败，本地也要清理登录态
      }
      removeToken()
      this.$router.replace('/login')
    }
  },
  created() {
    if (getToken()) {
      this.getMenu()
      this.getUserInfo()
    }
  }
}
</script>

<style scoped>
  .home_container {
    height: 100%;
  }

  .home_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #9dae28;
    height: 60px;
    padding: 0 20px;
  }

  .logo {
    height: 50px;
    width: 100px;
  }

  .user_info {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
  }

  .body_container {
    height: calc(100% - 60px);
  }

  .home_aside {
    background-color: #9dae28;
    overflow-x: hidden;
    transition: width 0.2s;
  }

  .toggle-button {
    color: #ffffff;
    text-align: center;
    padding: 12px 0;
    cursor: pointer;
  }

  .toggle-button .el-icon {
    font-size: 18px;
    vertical-align: middle;
  }

  .home_aside :deep(.el-menu) {
    border-right: none;
  }

  .home_main {
    background-color: #eaedf1;
    padding: 20px;
  }
</style>
