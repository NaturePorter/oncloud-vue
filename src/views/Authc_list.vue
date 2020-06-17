<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>导航</el-breadcrumb-item>
      <el-breadcrumb-item>管理员列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7"><!--搜索与添加区域-->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!--添加用户按钮-->
        <el-col :span="4">
          <el-button type="primary" icon="el-icon-circle-plus-outline" @click="addUserdialogVisible = true">添加用户
          </el-button>
        </el-col>
      </el-row>
      <!--用户列表区域-->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="角色" prop="role"></el-table-column>
        <el-table-column label="状态">
          <!--获取本行内容-->
          <template v-slot="scope">
            <el-switch v-model="scope.row.state == 1 ? true : false" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!--修改按钮-->
            <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" @click="showEditUserDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--删除按钮-->
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" @click="deleteUserByid(scope.row.id)"></el-button>
            </el-tooltip>

            <!--分配角色按钮-->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-user-solid" @click="editUserRoleByid(scope.row.id)"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pageNum"
          :page-sizes="[3, 5, 10, 30]"
          :page-size="queryInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>

    <!--添加用户的对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserdialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>

    <!--修改用户的对话框-->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserdialogVisible"
      width="50%">
      <!--内容主体区域-->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-input v-model="editForm.role"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editUserdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="">确 定</el-button>
  </span>
    </el-dialog>

    <!--分配用户角色-->
    <el-dialog
      title="修改用户角色"
      :visible.sync="editUserRoledialogVisible"
      width="25%">
      <!--内容主体区域-->
      <el-form :model="editRoleForm" ref="editRoleFormRulesRef" label-width="70px">


        <el-select v-model="roleValue" placeholder="请选择">
          <el-option
            v-for="item in roleoptions"
            :key="item.roleValue"
            :label="item.roleValue"
            :value="item.roleValue">
          </el-option>
        </el-select>

      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editUserRoledialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserRole(editRoleForm.id, roleValue)">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Authc_list",

    data() {
      //验证用户名是否已被占用
      var checkUsername = async (rule, value, cb) => {
        const {data: resp} = await this.axios.get('/checkusername?username=' + value);
        if (resp.meta.status !== 200) return cb(new Error('用户名已被占用！'));
        cb()
      };
      return {
        //获取用户列表的参数对象
        queryInfo: {
          query: '',
          //当前的页数
          pageNum: 1,
          //当前每页显示多少条数据
          pageSize: 5
        },
        userlist: [],
        total: 0,
        //控制添加用户对话框的显示与隐藏
        addUserdialogVisible: false,
        //添加用户的表单数据
        addForm: {
          username: '',
          password: ''
        },
        //添加用户的表单验证
        addFormRules: {
          username: [
            {required: true, message: "请输入用户名称！", trigger: "blur"},
            {min: 3, max: 10, message: "长度在3到10个字符", trigger: "blur"},
            {validator: checkUsername, trigger: 'blur'}
          ],
          password: [
            {required: true, message: "请输入密码", trigger: "blur"},
            {min: 5, max: 15, message: "长度在5到15个字符", trigger: "blur"}
          ]
        },
        //控制修改用户对话框的显示与隐藏
        editUserdialogVisible: false,
        //查询到的用户信息对象
        editForm: {},
        //控制修改用户角色对话框的显示与隐藏
        editUserRoledialogVisible: false,
        editRoleForm: {
          id: ''
        },
        //用户角色选项数组
        roleoptions: [
          {
            roleValue: '超级管理员',
            label: '超级管理员'
          },
          {
            roleValue: '管理员',
            label: '管理员'
          },
          {
            roleValue: '用户',
            label: '用户'
          }
        ],
        roleValue: ''
      }
    },
    methods: {
      async getUserList() {
        const {data: res} = await this.axios.get('/userlist', {params: this.queryInfo});
        if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！');
        this.userlist = res.data.users;
        this.total = res.data.total
      },
      //监听 pageSize改变的事件
      handleSizeChange(newSize) {
        console.log(newSize)
        this.queryInfo.pageSize = newSize;
        this.getUserList()
      },
      //监听 pageSize改变的事件
      handleCurrentChange(newPage) {
        console.log(newPage);
        this.queryInfo.pageNum = newPage;
        this.getUserList()
      },
      //监听 用户state改变事件
      async userStateChanged(userInfo) {
        userInfo.state = (userInfo.state == 1 ? 0 : 1);
        const {data: resp} = await this.axios.put(`/userlist/${userInfo.id}/state/${userInfo.state}`);
        if (resp.meta.status !== 200) {
          userInfo.state = (userInfo.state == 1 ? 0 : 1);
          return this.$message.error('更新用户状态失败！')
        }
        this.$message.success('更新状态成功！')
      },
      //监听添加用户对话框关闭事件
      addDialogClosed() {
        //拿到表单对象，然后重置
        this.$refs.addFormRef.resetFields()
      },
      //添加用户表单按钮事件
      addUser() {
        //先进行预验证
        this.$refs.addFormRef.validate(async valid => {
          //没通过则直接返回
          if (!valid) return
          //发起添加用户的网络请求，注意转换成表单数据
          await this.axios.post('/adduser', this.$qs.stringify(this.addForm)).then((resp) => {
            if (resp.data.meta.status != 200) return this.$message.error('添加用户失败！');
            this.$message.success('添加用户成功！');
            //隐藏添加用户的对话框
            this.addUserdialogVisible = false;
            //重新获取用户列表
            this.getUserList();
          })
        })
      },
      async showEditUserDialog(id) {
        //发起数据请求
        await this.axios.get('/userlist/' + id).then((resp) => {
          if (resp.data.meta.status != 200) return this.$message.error('查询用户失败！');
          this.editForm = resp.data.data
          this.editUserdialogVisible = true;
        })
      },
      editUser() {

      },
      //删除用户按钮事件
      async deleteUserByid(id) {
        await this.axios.delete('/deleteUserByid/' + id).then((resp) => {
          if (resp.data.meta.status != 200) return this.$message.error('删除用户失败！');
          this.$message.success('删除用户成功！');
          //重新获取用户列表
          this.getUserList();
        })
      },
      //
      editUserRoleByid(id) {
        this.editUserRoledialogVisible = true;
        this.editRoleForm.id = id;
      },
      //修改用户角色事件
      async editUserRole(id, roleValue) {
        await this.axios.put(`/edituserrole/${id}/role/${roleValue}`).then((resp) => {
          if (resp.data.meta.status != 200) return this.$message.error('修改用户角色失败！');
          this.$message.success('修改用户角色成功！');
          //隐藏添加用户的对话框
          this.editUserRoledialogVisible = false;
          //重新获取用户列表
          this.getUserList();
        })
      }
    },
    created() {
      this.getUserList()
    }
  }
</script>

<style scoped>
  .el-table {
    margin-top: 15px;
  }

  .block {
    margin-top: 15px;
  }
</style>
