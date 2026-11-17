<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>文件管理</el-breadcrumb-item>
      <el-breadcrumb-item>文件列表</el-breadcrumb-item>
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
        <el-table-column label="描述" min-width="180" prop="docdescribe" show-overflow-tooltip></el-table-column>
        <el-table-column label="共享" width="90" align="center">
          <template #default="scope">
            <el-switch :model-value="scope.row.isshared === '1'"
                       @change="value => changeShared(scope.row, value)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="审核" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isaudit === '1' ? 'success' : 'info'" size="small">
              {{ scope.row.isaudit === '1' ? '已通过' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="Download"
                       :loading="downloadingId === scope.row.id"
                       @click="downloadDoc(scope.row)"></el-button>
            <el-button size="small" type="danger" :icon="Delete"
                       @click="deleteDocById(scope.row)"></el-button>
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
import { ArrowRight, Search, Download, Delete } from '@element-plus/icons-vue'
import { formatDate, formatFileSize } from '../utils/format'

export default {
  name: 'Doc_list',
  setup() {
    return { ArrowRight, Search, Download, Delete }
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
      downloadingId: null
    }
  },
  methods: {
    async getDocList() {
      try {
        const { data: res } = await this.$http.get('/doclist', { params: this.queryInfo })
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
    async changeShared(row, value) {
      const flag = value ? 1 : 0
      try {
        const { data: res } = await this.$http.put(`/doclist/${row.id}/shared/${flag}`)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '更新共享状态失败')
        }
        row.isshared = String(flag)
        this.$message.success(flag ? '已开启共享' : '已关闭共享')
      } catch (e) {
        // 错误提示已由拦截器统一处理
      }
    },
    async downloadDoc(row) {
      this.downloadingId = row.id
      try {
        const res = await this.$http.get('/download', {
          params: { id: row.id },
          responseType: 'blob'
        })
        // 后端返回业务错误时是 JSON 内容
        if (res.data.type && res.data.type.indexOf('application/json') !== -1) {
          const payload = JSON.parse(await res.data.text())
          return this.$message.error((payload.meta && payload.meta.msg) || '下载失败')
        }
        const url = window.URL.createObjectURL(res.data)
        const link = document.createElement('a')
        link.href = url
        link.download = `${row.docname}.${row.perfix}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        row.downloadfrequency = (row.downloadfrequency || 0) + 1
      } catch (e) {
        // 错误提示已由拦截器统一处理
      } finally {
        this.downloadingId = null
      }
    },
    async deleteDocById(row) {
      try {
        await this.$confirm(`确定要删除文档「${row.docname}」吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch (e) {
        return
      }
      try {
        const { data: res } = await this.$http.delete('/deleteDocById/' + row.id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg || '删除文档失败')
        this.$message.success('删除文档成功')
        this.getDocList()
      } catch (e) {
        // 错误提示已由拦截器统一处理
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
