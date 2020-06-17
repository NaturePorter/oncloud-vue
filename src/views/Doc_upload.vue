<template>
  <div>
    <!--导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>导航</el-breadcrumb-item>
      <el-breadcrumb-item>文件上传</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card class="box-card">

      <el-form ref="docUploadFormRef" :model="docUploadForm" :rules="docUploadFormRules" label-width="80px" status-icon
               style="width: 50%; margin-left: 20%;">
        <h1>文档上传</h1>
        <el-form-item label="文档名称" prop="docname">
          <el-input v-model="docUploadForm.docname"></el-input>
        </el-form-item>
        <el-form-item label="文档标签" prop="doclabel">
          <el-input v-model="docUploadForm.doclabel"></el-input>
        </el-form-item>
        <el-form-item label="文档描述" prop="docdescribe">
          <el-input v-model="docUploadForm.docdescribe"></el-input>
        </el-form-item>
        <el-upload class="docUpload" ref="docUploadRef"
                   action="http://localhost:8797/api/docupload"
                   :data="docUploadForm"
                   :headers="Authorization"
                   :on-success="uploadSuc"
                   :before-upload="beforeUpload"
                   :file-list="docList"
                   :auto-upload="false"
                   :multiple="false">
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
        </el-upload>
      </el-form>

    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Doc_upload",
    data() {
      return {
        docList: [],
        //文件上传表单
        docUploadForm: {
          docname: '',
          doclabel: '',
          docdescribe: ''
        },
        docUploadFormRules: {
          docname: [
            {required: true, message: "请输入文档名称！", trigger: "blur"},
            {min: 3, max: 10, message: "长度在3到10个字符", trigger: "blur"},
          ],
          doclabel: [
            {required: true, message: "请输入文档标签！", trigger: "blur"},
          ],
          docdescribe: [
            {required: false}
          ]
        }
      }
    },
    methods: {
      //上传
      submitUpload() {
        this.$refs.docUploadRef.submit();
      },
      //上传文件之前的钩子
      beforeUpload(file){
        //预验证表单内容
        const valid = this.$refs.docUploadFormRef.validate( valid => {
          //如果为false则给用户提示
          if (!valid) {
            this.$message.error("请填写信息！")
          }
        })
        return valid
      },
      uploadSuc(response, file, fileList){
        console.log(response.meta)
        this.$message.success("文档上传成功！")
        //清空表单和上传文件
        this.$refs.docUploadFormRef.resetFields();
        this.$refs.docUploadRef.clearFiles();
      }
    },
    computed: {
      Authorization(){
        return {
          "Authorization":window.sessionStorage.getItem('token')
        }
      }
    }
  }
</script>

<style scoped>

</style>
