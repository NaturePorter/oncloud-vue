<template>
  <div class="home_container">
    <el-container class="home_container">
      <!--头部区域-->
      <el-header style="text-align: right; font-size: 12px">
        <img src="../assets/header_logo.png" height="60" width="120" style="float: left"/>
        <el-dropdown>
          <i class="el-icon-user" style="margin-right: 15px"></i>
          <el-dropdown-menu slot="dropdown">
            <a @click="logout()"><el-dropdown-item>退出登录</el-dropdown-item></a>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <!--页面主体区域-->
      <el-container>
        <!--侧边栏-->
        <el-aside style="width: auto">
        <div class="toggle-button" @click="collapseButton"><i class="el-icon-thumb"></i></div>
        <!--菜单栏-->
        <el-menu router class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse"
                 default-openeds="/home/tabletop">
          <el-submenu v-for="(item, index) in menu" :index="index + '-'">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span slot="title">{{item.name}}</span>
            </template>
            <el-menu-item v-for="(item2, index2) in item.list" :index="item2.url"
                          :class="$route.path==item2.url?'is-active':''">{{item2.name}}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
        <!--右侧内容主体-->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  export default {
    name: "frame",
    data() {
      return {
        isCollapse: true,
        menu: []
      };
    },
    methods: {
      async getMenu(){
        const {data: res} = await this.axios.get('/menu');
        // if (res.meta.status !== 200) return this.$message.error('获取菜单成功！');
        this.menu = res.data
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
      logout() {
        //清理掉token
        window.sessionStorage.clear()
        //重新定位到登录页面
        this.$router.push('login')
      },
      collapseButton(){
        this.isCollapse = !this.isCollapse;
      }
    },
    created() {
      this.getMenu();
    }
  };
</script>

<style scoped>
  .el-header {
    background-color: #9dae28;
    line-height: 65px;
  }

  .el-aside {
    background-color: #9dae28;
  }

  .el-main {
    background-color: #eaedf1;
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    background-color: #9dae28;
    width: 200px;
    min-height: 400px;
    border: none;
  }

  .home_container {
    height: 100%;
  }
  .toggle-button{
    text-align: center;
  }
</style>
