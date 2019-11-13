<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 将activeIndex转成数字 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" @tab-click="tabClick" :tab-position="'left'" :before-leave="tabBeforeLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格（元）" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品重量（kg）" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="categorylist"
                :props="categoryProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="element" v-for="(element, index) in item.attr_vals" :key="index" border> </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-list="picture"
              :on-success="handleSuccess"
              :headers="headerObj"
              class="upload-demo"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="add" class="btnAdd">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
//引入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_intorduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }]
        //  goods_cat:[{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      activeIndex: '0',
      categorylist: [],
      categoryProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: { Authorization: window.sessionStorage.getItem('token') },
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
    this.getCategories()
  },
  methods: {
    // 获取所有的商品分类列表
    async getCategories() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      this.categorylist = res.data
    },
    //确保级联选择器选择的是三级分类
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) return (this.addForm.goods_cat = [])
    },
    //从默认的基本信息页签切换到其它标签页时，确保有选择商品分类
    tabBeforeLeave(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length !== 3 && oldActiveName === '0') {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    //tab栏切换，切换到商品参数和商品属性时分别获取对应的数据
    async tabClick() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取商品参数失败！')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取商品属性失败！')
        this.onlyTableData = res.data
      }
    },
    //处理图片预览
    handlePreview(file) {
      // console.log(file);
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    //移除图片
    handleRemove(file) {
      //删除pic数组中对应的临时路径
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(val => val.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      //定义一个图片信息对象，设置为添加商品时需要的格式
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        //将addForm深拷贝给一个新对象form而不是直接修改addForm,因为级联选择器绑定的goods_cat需要数组数据，
        //但是添加时后台需要字符串格式,创建一个新对象，将属性拷贝给它，再修改新对象的属性数据格式，最后上传参数为新对象
        const form = _.cloneDeep(this.addForm)
        //处理goods_cat，使goods_cat符合添加的数据格式
        form.goods_cat = form.goods_cat.join(',')
        //处理动态参数，使attrs符合添加的数据格式
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性，使attrs符合添加的数据格式
        this.onlyTableData.forEach(item => {
          const newInfo = {
            arrt_id: item.attr_id,
            attr_value: item.arrt_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 10px;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
