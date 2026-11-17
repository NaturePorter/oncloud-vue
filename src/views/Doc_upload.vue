<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>文件管理</el-breadcrumb-item>
      <el-breadcrumb-item>文件上传</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-form ref="docUploadFormRef" :model="docUploadForm" :rules="docUploadFormRules"
               label-width="90px" status-icon class="upload_form">
        <h2>文档上传</h2>
        <el-form-item label="文档名称" prop="docname">
          <el-input v-model="docUploadForm.docname" placeholder="请输入文档名称"></el-input>
        </el-form-item>
        <el-form-item label="文档标签" prop="doclabel">
          <el-input v-model="docUploadForm.doclabel" placeholder="例如：课程资料"></el-input>
        </el-form-item>
        <el-form-item label="文档描述" prop="docdescribe">
          <el-input v-model="docUploadForm.docdescribe" type="textarea" :rows="3"
                    placeholder="选填，简单描述一下文档内容"></el-input>
        </el-form-item>
        <el-form-item label="文档文件">
          <el-upload
            ref="docUploadRef"
            class="docUpload"
            :action="uploadUrl"
            name="file"
            :data="docUploadForm"
            :headers="uploadHeaders"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :before-upload="beforeUpload"
            :on-exceed="handleExceed"
            :auto-upload="false"
            :limit="1"
            accept=".doc,.docx,.pdf,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar,7z">
            <el-button size="small" type="primary">选取文件</el-button>
            <span class="upload_tip">单个文件不超过 50MB，仅支持常用文档格式</span>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="success" :loading="uploading" @click="submitUpload">上传到服务器</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getToken } from '../utils/auth'

export default {
  name: 'Doc_upload',
  data() {
    return {
      uploading: false,
      docUploadForm: {
        docname: '',
        doclabel: '',
        docdescribe: ''
      },
      docUploadFormRules: {
        docname: [
          { required: true, message: '请输入文档名称', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在3到50个字符', trigger: 'blur' }
        ],
        doclabel: [
          { required: true, message: '请输入文档标签', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    uploadUrl() {
      return (this.axios.defaults.baseURL || '/api/') + 'docupload'
    },
    uploadHeaders() {
      return { token: getToken() }
    }
  },
  methods: {
    async beforeUpload(file) {
      try {
        await this.$refs.docUploadFormRef.validate()
      } catch (e) {
        this.$message.error('请先完整填写文档信息')
        return false
      }
      if (file.size === 0) {
        this.$message.error('不能上传空文件')
        return false
      }
      if (file.size > 50 * 1024 * 1024) {
        this.$message.error('文件大小不能超过 50MB')
        return false
      }
      return true
    },
    submitUpload() {
      if (this.$refs.docUploadRef.uploadFiles.length === 0) {
        return this.$message.error('请先选取要上传的文件')
      }
      this.uploading = true
      this.$refs.docUploadRef.submit()
    },
    handleExceed() {
      // 只允许一次上传一个文件，重新选择时先清空
      this.$refs.docUploadRef.clearFiles()
      this.$message.warning('一次只能上传一个文件，已清空重新选择')
    },
    uploadSuccess(response) {
      this.uploading = false
      const meta = response && response.meta
      if (!meta || meta.status !== 200) {
        return this.$message.error((meta && meta.msg) || '文档上传失败')
      }
      this.$message.success('文档上传成功')
      this.resetForm()
    },
    uploadError() {
      this.uploading = false
      this.$message.error('文档上传失败，请稍后重试')
    },
    resetForm() {
      this.$refs.docUploadFormRef.resetFields()
      this.$refs.docUploadRef.clearFiles()
    }
  }
}
</script>

<style scoped>
  .upload_form {
    width: 60%;
    min-width: 480px;
    margin: 0 auto;
  }

  .upload_tip {
    color: #909399;
    font-size: 12px;
    margin-left: 10px;
  }
</style>
