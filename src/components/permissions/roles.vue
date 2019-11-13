<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="rolelist" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template slot-scope="props">
            <!-- {{props.row}} -->
            <!-- 一级权限 -->
            <el-row
              v-for="(item1, index1) in props.row.children"
              :key="item1.id"
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'y-center']"
            >
              <el-col :span="5">
                <el-tag closable :disable-transitions="false" @close="removeRightById(props.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 === 0 ? '' : 'bdtop', 'y-center']"
                >
                  <el-col :span="6">
                    <el-tag type="success" closable :disable-transitions="false" @close="removeRightById(props.row, item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      :disable-transitions="false"
                      @close="removeRightById(props.row, item3.id)"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightstDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
     
    </el-card>
     <div>
        <el-tree :data="rightslist" show-checkbox node-key="id" default-expand-all :expand-on-click-node="false">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ data.authName }}</span>
            <span>
               <el-button type="text" size="mini" @click="() => edit(data)">
                edit
              </el-button>
              <el-button type="text" size="mini" @click="() => append(data)">
                Append
              </el-button>
              <el-button type="text" size="mini" @click="() => remove(node, data)">
                Delete
              </el-button>
            </span>
          </span>
        </el-tree>
      </div>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClose">
      <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="50%" @close="editRoleDialogClose">
      <el-form :model="editForm" ref="editFormRef" :rules="editFormRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightstDialogVisible" width="50%" @close="setRightsDialogClose">
      <el-tree
        :data="rightslist"
        :props="treeProps"
        node-key="id"
        default-expand-all
        show-checkbox
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRightstDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRights">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
let id = 1000;
export default {
  data() {
    return {
      rolelist: [],
      setRightstDialogVisible: false,
      addRoleDialogVisible: false,
      editRoleDialogVisible: false,
      rightslist: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      editForm: {},
      editFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getRolesList()
    this.setRight()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolelist = res.data
    },
    async removeRightById(role, rightid) {
      const confirmRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes === 'cancel') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightid}`)
      if (res.meta.status !== 200) return this.$$message.error('取消权限失败！')
      // this.getRolesList()
      role.children = res.data
    },
    setRightsDialogClose() {
      this.defKeys = []
      this.setRightstDialogVisible = false
    },
    async setRight(){
// this.roleId = role.id
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败!')
      this.rightslist = res.data
      // this.addInput(this.rightslist)
      this.setLayer(this.rightslist)
      // this.rightslist.forEach(item=>{
      //   item.inputVisible=false
      //   item.inputValue=''
      // })
      console.log(this.rightslist)
      // this.getLeafNodeId(role, this.defKeys)
    },
     setLayer(obj) {
        obj.layer = false
        if(!obj) return
        obj.forEach(item=>{
          if(item.children){
            item.layer=false
          }
        })
    },
    setInput(obj){
      obj.forEach(item=>{
          if(item.children){
            item.layer=false
          }
        })
    },
    async showSetRightstDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败!')
      this.rightslist = res.data
      this.getLeafNodeId(role, this.defKeys)
      // console.log(this.defKeys);
      this.setRightstDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafNodeId(node, arr) {
      console.log(1)
      if (!node.children){
        return arr.push(node.id)
      } 
      console.log(node.children)
      node.children.forEach(element => {
        this.getLeafNodeId(element, arr)
      })
    },
    addInput(node){
      // var flag=false
     if(!node) return
     node.input=false
     node.children&&node.children.forEach(element=>{
       this.addInput(element)
     })
     return node
    },
    async saveRights() {
      // console.log(this.$refs.treeRef.getCheckedKeys());
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      // console.log(keys);
      const keysStr = keys.join(',')
      const { data: res } = await this.$http.post(`/roles/${this.roleId}`, { rids: keysStr })
      if (res.meta.status !== 200) return this.$message.error('更新用户权限失败！')
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightstDialogVisible = false
    },
    addRoleDialogClose() {
      this.addRoleDialogVisible = false
      this.$refs.addFormRef.resetFields()
    },
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败！')
        this.addRoleDialogVisible = false
        this.getRolesList()
      })
    },
    editRoleDialogClose() {
      this.editRoleDialogVisible = false
      this.$refs.editFormRef.resetFields()
    },
    async showEditRoleDialog(id) {
      const { data: res } = await this.$http.get('/roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询角色失败！')
      this.editForm = res.data
      this.editRoleDialogVisible = true
    },
    editRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('/roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('编辑角色失败！')
        this.editRoleDialogVisible = false
        this.getRolesList()
      })
    },
    async delRole(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes == 'cancel') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('/roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.getRolesList()
    },
    edit(){

    },
    append(data) {
        const newChild = { id: id++, authName: 'test', children: [] };
        if (!data.children) {
          this.$set(data, 'children', []);
        }
        data.children.push(newChild);
      },

      remove(node, data) {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      },
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.y-center {
  display: flex;
  align-items: center;
}
</style>
