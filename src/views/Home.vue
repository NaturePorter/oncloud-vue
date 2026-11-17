<template>
  <el-container class="home_container">
    <!--头部区域-->
    <el-header class="home_header">
      <img src="../assets/header_logo.png" class="logo" alt="ONCLOUD"/>
      <el-dropdown class="user_dropdown" @command="handleCommand">
        <span class="user_info"><i class="el-icon-user"></i> {{ username }}</span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-header>

    <el-container class="body_container">
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="home_aside">
        <div class="toggle-button" @click="isCollapse = !isCollapse">
          <i :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </div>
        <el-menu
          router
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="$route.path"
          background-color="#9dae28"
          text-color="#ffffff"
          active-text-color="#ffd04b">
          <template v-for="item in menu">
            <el-submenu v-if="item.list && item.list.length" :key="item.menuId" :index="String(item.menuId)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ item.name }}</span>
              </template>
              <el-menu-item v-for="child in item.list" :key="child.menuId" :index="'/home/' + child.url">
                {{ child.name }}
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-else :key="item.menuId" :index="'/home/' + item.url">
              <i class="el-icon-document"></i>
              <span slot="title">{{ item.name }}</span>
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
import { getToken, removeToken } from '../utils/auth'

export default {
  name: 'Home',
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
        const { data: res } = await this.axios.get('/menu')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '获取菜单失败')
        this.menu = res.data || []
      } catch (e) {
        // 错误提示已由拦截器统一处理
      }
    },
    async getUserInfo() {
      try {
        const { data: res } = await this.axios.get('/user')
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
        await this.axios.post('/logout')
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
    line-height: 40px;
    cursor: pointer;
  }

  .home_aside ::v-deep .el-menu {
    border-right: none;
  }

  .home_main {
    background-color: #eaedf1;
    padding: 20px;
  }
</style>
