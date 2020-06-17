<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>导航</el-breadcrumb-item>
      <el-breadcrumb-item>我的桌面</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card-control">
    <el-col :span="20">
      <el-card class="box-card" shadow="hover" style="float: left">
        <div class="text item">
          <h2>欢迎来到ONCLOUD，{{userInfo.username}}！</h2>
          <h2>您的身份：{{userInfo.role}}</h2>
          <h2>您的状态：{{userInfo.state == 1 ? '已启用' : '未启用'}}</h2>
        </div>
      </el-card>
      <el-card class="box-card" shadow="hover" style="float: left">
        <div class="text item">
          <h1>当前时间：{{date}}</h1>
        </div>
      </el-card>
    </el-col>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Tabletop",
    data() {
      return {
        //用户对象
        userInfo: {},
        date: ''
      }
    },
    methods: {
      async getUserInfo(){
        await this.axios.get('/user').then((resp => {
          this.userInfo = resp.data.data
        }))
      }
    },
    created() {
      this.getUserInfo()
      this.date = new Date()
    }
  }
</script>

<style scoped>
  .text {
    font-size: 14px;
  }
  .box-card {
    width: 480px;
  }
</style>
