<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <tree-table
        :data="categorylist"
        :columns="columns"
        show-index
        index-text="#"
        border
        :selection-type="false"
        :expand-type="false"
      >
        <template slot="isvalid" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCat(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        background
        layout="total,sizes,prev, pager, next,jumper"
        :total="total"
        :page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
      >
      </el-pagination>
    </el-card>

    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClose">
      <el-form :model="addCartForm" ref="addCartFormRef" :rules="addCartFormRules" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCartForm.cat_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- {{parentCateList}} -->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogClose">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" ref="editFormRef" :rules="editFormRules" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategory">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      categorylist: [],
      total: 0,
      addCateDialogVisible: false,
      editDialogVisible: false,
      addCartForm: {
        cat_name: '',
        cat_level: 0,
        cat_pid: 0
      },
      addCartFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      editForm: {},
      editFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isvalid'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      parentCateList: [],
      selectedKeys: [],
      cascaderProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created() {
    this.getCategories()
    this.getParentCateList()
  },
  methods: {
    //获取所有分类，渲染到表格中
    async getCategories() {
      const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      //   console.log(res.data);
      this.categorylist = res.data.result
      this.total = res.data.total
    },
    //获取第一、二级分类，之后渲染到级联选择器的选项中
    async getParentCateList() {
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      //   console.log(res.data);
      this.parentCateList = res.data
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategories()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCategories()
    },
    showAddCateDialog() {
      // this.getParentCateList()
      this.addCateDialogVisible = true
      // console.log(this.parentCateList);
    },
    addCateDialogClose() {
      this.$refs.addCartFormRef.resetFields()
      this.selectedKeys = []
      this.addCartForm.cat_level = 0
      this.addCartForm.cat_pid = 0
      this.addCateDialogVisible = false
    },
    parentCateChanged() {
      // console.log(this.selectedKeys);
      if (this.selectedKeys.length > 0) {
        this.addCartForm.cat_level = this.selectedKeys.length
        this.addCartForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        return
      } else {
        this.addCartForm.cat_pid = 0
        this.addCartForm.cat_level = 0
      }
    },
    addCate() {
      this.$refs.addCartFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/categories', this.addCartForm)
        if (res.meta.status !== 201) return this.$message.error('创建失败')
        this.$message.success('添加分类成功')
        this.getCategories()
        this.addCateDialogVisible = false
      })
    },
    async showEditDialog(cat_id) {
      const { data: res } = await this.$http.get(`categories/${cat_id}`)
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
      this.editDialogVisible = false
    },
    editCategory() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}`, {
          cat_name: this.editForm.cat_name
        })
        if (res.meta.status !== 200) return this.$message.error('更新分类失败！')
        this.$message.success('更新分类成功！')
        this.getCategories()
        this.editDialogVisible = false
      })
    },
    async delCat(cat_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该项，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'cancel') return this.$message.info('已取消删除！')
      const { data: res } = await this.$http.delete(`categories/${cat_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败！')
      this.$message.success('删除分类成功！')
      this.getCategories()
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin: 15px;
}
</style>
