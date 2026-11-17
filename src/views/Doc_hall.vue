<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>文件管理</el-breadcrumb-item>
      <el-breadcrumb-item>文件大厅</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20" class="toolbar">
        <el-col :span="8">
          <el-input placeholder="请输入文档名称" v-model="queryInfo.query" clearable @clear="getDocList">
            <el-button slot="append" icon="el-icon-search" @click="getDocList"></el-button>
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
        <el-table-column label="操作" width="120" align="center">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-download"
                       :loading="downloadingId === scope.row.id"
                       @click="downloadDoc(scope.row)"></el-button>
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
import { formatDate, formatFileSize } from '../utils/format'

export default {
  name: 'Doc_hall',
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
        const { data: res } = await this.axios.get('/halldoclist', { params: this.queryInfo })
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
    async downloadDoc(row) {
      this.downloadingId = row.id
      try {
        const res = await this.axios.get('/download', {
          params: { id: row.id },
          responseType: 'blob'
        })
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
