<template>
  <div class="login_container">
    <div class="login_box">
      <!--头像区域-->
      <div class="avatar_box">
        <img src="../assets/oc_logo.png" alt="logo"/>
      </div>
      <el-form class="login_form" ref="loginForm" :model="loginForm" :rules="loginFormRules"
               label-width="0" @submit.native.prevent>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid" type="text"
                    placeholder="用户名" name="username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"
                    placeholder="密码" name="password" @keyup.enter.native="login"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" :loading="loginLoading" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm('loginForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { setToken } from '../utils/auth'

export default {
  name: 'login',
  data() {
    return {
      loginLoading: false,
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3到10个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在5到15个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return
        this.loginLoading = true
        try {
          const form = new URLSearchParams()
          form.append('username', this.loginForm.username)
          form.append('password', this.loginForm.password)
          const { data: res } = await this.axios.post('/login', form)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          setToken(res.data.token)
          this.$message.success('登录成功')
          this.$router.replace(this.$route.query.redirect || '/home')
        } catch (e) {
          // 错误提示已由拦截器统一处理
        } finally {
          this.loginLoading = false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style scoped>
  .login_container {
    background-color: #133046;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 280px;
    background-color: #ffffff;
    border-radius: 60px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .avatar_box {
    height: 120px;
    width: 120px;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #dddddd;
    position: absolute;
    left: 50%;
    top: -60px;
    transform: translateX(-50%);
  }

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: #eeeeee;
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 30px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    justify-content: center;
  }
</style>
