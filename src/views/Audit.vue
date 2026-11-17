<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>待审核列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20" class="toolbar">
        <el-col :span="8">
          <el-input placeholder="请输入文档名称" v-model="queryInfo.query" clearable @clear="getDocList">
            <template #append>
              <el-button :icon="Search" @click="getDocList"></el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="doclist" style="width: 100%" border stripe>
        <el-table-column label="文档名称" min-width="200" prop="docname" show-overflow-tooltip></el-table-column>
        <el-table-column label="标签" width="120" prop="doclabel"></el-table-column>
        <el-table-column label="大小" width="100" :formatter="sizeFormatter"></el-table-column>
        <el-table-column label="下载次数" width="100" prop="downloadfrequency"></el-table-column>
        <el-table-column label="上传时间" width="120" :formatter="dateFormatter" prop="uploadtime"></el-table-column>
        <el-table-column label="上传者ID" width="100" prop="uid"></el-table-column>
        <el-table-column label="描述" min-width="180" prop="docdescribe" show-overflow-tooltip></el-table-column>
        <el-table-column label="审核状态" width="110" align="center">
          <template #default>
            <el-tag type="warning" size="small">待审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center">
          <template #default="scope">
            <el-button size="small" type="success" :loading="auditingId === scope.row.id"
                       @click="approve(scope.row)">通过审核</el-button>
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
  </div>
</template>

<script>
import { ArrowRight, Search } from '@element-plus/icons-vue'
import { formatDate, formatFileSize } from '../utils/format'

export default {
  name: 'Audit',
  setup() {
    return { ArrowRight, Search }
  },
  data() {
    return {
      queryInfo: {
        query: '',
        pageNum: 1,
        pageSize: 5
      },
      doclist: [],
      total: 0,
      auditingId: null
    }
  },
  methods: {
    async getDocList() {
      try {
        const { data: res } = await this.$http.get('/auditdoclist', { params: this.queryInfo })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '获取文档列表失败')
        this.doclist = res.data.docs || []
        this.total = res.data.total
      } catch (e) {
        // 错误提示已由拦截器统一处理
      }
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getDocList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getDocList()
    },
    async approve(row) {
      this.auditingId = row.id
      try {
        const { data: res } = await this.$http.put(`/auditdoclist/${row.id}/audit/1`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '审核失败')
        this.$message.success('审核通过')
        this.getDocList()
      } catch (e) {
        // 错误提示已由拦截器统一处理
      } finally {
        this.auditingId = null
      }
    },
    dateFormatter(row) {
      return formatDate(row.uploadtime)
    },
    sizeFormatter(row) {
      return formatFileSize(row.docsize)
    }
  },
  created() {
    this.getDocList()
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
