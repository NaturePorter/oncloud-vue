<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>导航</el-breadcrumb-item>
      <el-breadcrumb-item>文件列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card class="box-card">

      <el-row :gutter="20" style="margin-top: 15px; margin-bottom: 15px">
      <el-col :span="7"><!--搜索与添加区域-->
        <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select">
          <el-button slot="append" icon="el-icon-search" @click="getDocList"></el-button>
        </el-input>
      </el-col>

      <div >
        <el-button @click="docSelection(doclist)">全选</el-button>
        <el-button @click="docSelection()">取消选择</el-button>
      </div>
      </el-row>
      <el-table ref="doclistRef" :data="doclist" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange" border stripe>
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column label="文档名称" width="240" prop="docname"></el-table-column>
        <el-table-column label="文档标签" width="120" prop="doclabel"></el-table-column>
        <el-table-column label="文档大小" width="120" prop="docsize"></el-table-column>
        <el-table-column label="文档下载次数" width="120" prop="downloadfrequency"></el-table-column>
        <el-table-column label="上传时间" width="120" :formatter="dateFormatter" prop="uploadtime"></el-table-column>
        <el-table-column label="文档描述" width="240" prop="docdescribe"></el-table-column>
        <el-table-column label="共享状态" width="80">
          <!--获取本行内容-->
          <template v-slot="scope">
            <el-switch v-model="scope.row.isshared == 1 ? true : false" @change="docSharedChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="审核" width="80">
          <!--获取本行内容-->
          <template v-slot="scope">
            {{scope.row.isaudit == 1 ? '已通过' : '未通过'}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <a :href="'http://localhost:8797/api/download?id=' + scope.row.id" download="true"><el-button size="mini" @click="downloadbut"><i class="el-icon-download"/>
            </el-button></a>
            <el-button size="mini" type="danger" @click="deleteDocById(scope.row)">删除
            </el-button>
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

  </div>
</template>

<script>
  export default {
    name: "Doc_list",
    data() {
      return {
        //获取文档列表的参数对象
        queryInfo: {
          query: '',
          //当前的页数
          pageNum: 1,
          //当前每页显示多少条数据
          pageSize: 5
        },
        doclist: [],
        total: 0,
      }
    },

    methods: {
      async getDocList() {
        const {data: res} = await this.axios.get('/doclist', {params: this.queryInfo});
        if (res.meta.status !== 200) return this.$message.error('获取文档列表失败！');

        this.doclist = res.data.docs;
        this.total = res.data.total
      },
      //监听 pageSize改变的事件
      handleSizeChange(newSize) {
        console.log(newSize)
        this.queryInfo.pageSize = newSize;
        this.getDocList()
      },
      //监听 pageSize改变的事件
      handleCurrentChange(newPage) {
        console.log(newPage);
        this.queryInfo.pageNum = newPage;
        this.getDocList()
      },
      //监听全选按钮
      docSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.doclistRef.toggleRowSelection(row);
          });
        } else {
          this.$refs.doclistRef.clearSelection();
        }
      },
      //监听 文档shared改变事件
      async docSharedChanged(docInfo){
        docInfo.isshared = (docInfo.isshared == 1 ? 0 : 1);
        const {data: resp} = await this.axios.put(`/doclist/${docInfo.id}/shared/${docInfo.isshared}`);
        if (resp.meta.status !== 200) {
          docInfo.isshared = (docInfo.isshared == 1 ? 0 : 1);
          return this.$message.error('更新状态失败！')
        }
        this.$message.success('开启共享成功！')
      },
      handleSelectionChange(val) {
        this.doclistRef = val;
        console.log(val)
      },
      //监听 下载按钮 延迟执行
      downloadbut(){
        setTimeout(function () {
          this.getDocList()
        },5000)
      },
      //格式化表格中的时间
      dateFormatter (row, column) {
        let datetime = row.uploadtime;
        if(datetime){
          datetime = new Date(datetime);
          let y = datetime.getFullYear() + '-';
          let mon = datetime.getMonth()+1 + '-';
          let d = datetime.getDate();
          return y + mon + d;
        }
        return ''
      },
      //监听 删除按钮
      async deleteDocById(docInfo){
        await this.axios.delete('/deleteDocById/' + docInfo.id).then((resp) => {
          if (resp.data.meta.status != 200) return this.$message.error('删除文档失败！');
          this.$message.success('删除文档成功！');
          //重新获取用户列表
          this.getDocList();
        })
      }
    },
    //加载时期的钩子函数
    created() {
      this.getDocList()
    }
  }
</script>

<style scoped>
  .block {
    margin-top: 15px;
  }
</style>
