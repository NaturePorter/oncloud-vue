<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>管理员列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20" class="toolbar">
        <el-col :span="8">
          <el-input placeholder="请输入用户名" v-model="queryInfo.query" clearable @clear="getUserList">
            <template #append>
              <el-button :icon="Search" @click="getUserList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" :icon="CirclePlus"
                     @click="addUserdialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userlist" border stripe>
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="角色" prop="role"></el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch :model-value="scope.row.state == 1"
                       @change="value => changeState(scope.row, value)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="primary" :icon="UserFilled" size="small"
                         @click="openRoleDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button type="danger" :icon="Delete" size="small"
                         @click="deleteUserByid(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--添加用户的对话框-->
    <el-dialog title="添加用户" v-model="addUserdialogVisible" width="40%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px" status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="addForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="item in roleOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addUserdialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="saving" @click="addUser">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!--分配用户角色-->
    <el-dialog title="修改用户角色" v-model="editUserRoledialogVisible" width="30%">
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input :model-value="editRoleForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="roleValue" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in roleOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editUserRoledialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="saving" @click="editUserRole">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ArrowRight, Search, CirclePlus, UserFilled, Delete } from '@element-plus/icons-vue'

export default {
  name: 'Authc_list',
  setup() {
    return { ArrowRight, Search, CirclePlus, UserFilled, Delete }
  },
  data() {
    const checkUsername = async (rule, value, callback) => {
      try {
        const { data: res } = await this.$http.get('/checkusername', { params: { username: value } })
        if (res.meta.status !== 200) return callback(new Error(res.meta.msg || '用户名已被占用'))
        callback()
      } catch (e) {
        callback(new Error('用户名校验失败'))
      }
    }
    return {
      queryInfo: {
        query: '',
        pageNum: 1,
        pageSize: 5
      },
      userlist: [],
      total: 0,
      saving: false,
      addUserdialogVisible: false,
      addForm: {
        username: '',
        password: '',
        role: '用户'
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3到10个字符', trigger: 'blur' },
          { validator: checkUsername, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在5到15个字符', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      editUserRoledialogVisible: false,
      editRoleForm: {
        id: '',
        username: ''
      },
      roleOptions: ['超级管理员', '管理员', '用户'],
      roleValue: '用户'
    }
  },
  methods: {
    async getUserList() {
      try {
        const { data: res } = await this.$http.get('/userlist', { params: this.queryInfo })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '获取用户列表失败')
        this.userlist = res.data.users || []
        this.total = res.data.total
      } catch (e) {
        // 错误提示已由拦截器统一处理
      }
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getUserList()
    },
    async changeState(row, value) {
      const state = value ? 1 : 0
      try {
        const { data: res } = await this.$http.put(`/userlist/${row.id}/state/${state}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '更新用户状态失败')
        row.state = state
        this.$message.success('更新状态成功')
      } catch (e) {
        // 错误提示已由拦截器统一处理
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        this.saving = true
        try {
          const form = new URLSearchParams()
          form.append('username', this.addForm.username)
          form.append('password', this.addForm.password)
          form.append('role', this.addForm.role)
          const { data: res } = await this.$http.post('/adduser', form)
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '添加用户失败')
          this.$message.success('添加用户成功')
          this.addUserdialogVisible = false
          this.getUserList()
        } catch (e) {
          // 错误提示已由拦截器统一处理
        } finally {
          this.saving = false
        }
      })
    },
    async deleteUserByid(row) {
      try {
        await this.$confirm(`确定要删除用户「${row.username}」吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch (e) {
        return
      }
      try {
        const { data: res } = await this.$http.delete('/deleteUserByid/' + row.id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '删除用户失败')
        this.$message.success('删除用户成功')
        this.getUserList()
      } catch (e) {
        // 错误提示已由拦截器统一处理
      }
    },
    openRoleDialog(row) {
      this.editRoleForm = { id: row.id, username: row.username }
      this.roleValue = row.role || '用户'
      this.editUserRoledialogVisible = true
    },
    async editUserRole() {
      this.saving = true
      try {
        const { data: res } = await this.$http.put('/edituserrole/' + this.editRoleForm.id, null, {
          params: { role: this.roleValue }
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '修改用户角色失败')
        this.$message.success('修改用户角色成功')
        this.editUserRoledialogVisible = false
        this.getUserList()
      } catch (e) {
        // 错误提示已由拦截器统一处理
      } finally {
        this.saving = false
      }
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style scoped>
  .toolbar {
    margin-bottom: 15px;
  }

  .pagination {
    margin-top: 15px;
  }
</style>
