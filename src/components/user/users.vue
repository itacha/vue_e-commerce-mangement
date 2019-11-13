<template>
   <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加</el-button>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <el-table :data="userlist" border stripe style="width: 100%">
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="username" label="姓名">
                </el-table-column>
                <el-table-column prop="email" label="邮箱">
                </el-table-column>
                <el-table-column prop="mobile" label="电话">
                </el-table-column>
                <el-table-column prop="role_name" label="角色">
                </el-table-column>
                <el-table-column label="状态">
                    <template v-slot="scope">
                         <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949"
                                    @change="userStateChange(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template v-slot="scope">
                        <!-- {{scope.row}} -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
                        <el-tooltip content="分配角色" placement="top" :enterable="false" effect="dark">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRoleSetDialog(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination background layout="total,sizes,prev, pager, next,jumper" :total="total" 
                           :page-size="queryInfo.pagesize" :page-sizes="[1,2,5,10]" @size-change="handleSizeChange"
                           @current-change="handleCurrentChange" :current-page="queryInfo.pagenum">
            </el-pagination>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
            <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="addForm.mobile" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 修改用户对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
            <el-form :model="editForm" ref="editFormRef" :rules="editFormRules" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" autocomplete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 分配角色对话框 -->
         <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClose">
            <div>
                <p>当前的用户：{{userInfo.username}}</p>
                <p>当前的角色：{{userInfo.role_name}}</p>
                <p>分配新角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo(userInfo.id)">确 定</el-button>
            </div>
        </el-dialog>
   </div>
</template>

<script>
import { userInfo } from 'os';
export default {
    data(){
        var checkMobile = (rule,value,callback)=>{
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if(!regMobile.test(value)){
                callback(new Error('请输入合法的手机号'));
            }
            callback()
        }
        var checkEmail = (rule,value,callback)=>{
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if(!regEmail.test(value)){
                callback(new Error('请输入合法的邮箱'));
            }
            callback()
        }
        return {
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:2
            },
            userlist:[],
            total:0,
            addForm:{
                username:'',
                password:'',
                mobile:'',
                email:''
            },
            addDialogVisible:false,
            editDialogVisible:false,
            setRoleDialogVisible:false,
            addFormRules:{
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 2, max: 7, message: '长度在 2 到 7 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 2 到 7 个字符', trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile,  trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail,  trigger: 'blur' }
                ]
            },
            editForm:{},
            editFormRules:{
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile,  trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail,  trigger: 'blur' }
                ]
            },
            // 需要被分配角色的用户信息
            userInfo: {},
             // 所有角色的数据列表
            rolesList: [],
            //已选择的角色id
            selectedRoleId:''
        }
    },
    created(){
        this.getUserList()
    },
    methods:{
        async getUserList(){
            const {data:res}=await this.$http.get('/users',{
                params:this.queryInfo
            })
            if(res.meta.status!==200) return $message.error('获取用户列表失败')
            this.userlist=res.data.users
            this.total=res.data.total
        },
        async userStateChange(user){
            const {data:res}=await this.$http.put('/users/'+user.id+'/state/'+user.mg_state)
            if(res.meta.status!==200) {
                user.mg_state=!user.mg_state
                this.$message.error('用户状态更新失败')
            } 
            this.$message.success('用户状态更新成功')
        },
        handleSizeChange(newSize){
            console.log(newSize);           
            this.queryInfo.pagesize=newSize
            this.getUserList()
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum=newPage
            this.getUserList()
        },
        addDialogClose(){
            this.$refs.addFormRef.resetFields()
        },
        editDialogClose(){
            this.$refs.editFormRef.resetFields()
        },
        addUser(){
            // console.log(this.$refs);
            this.$refs.addFormRef.validate(async vaild=>{
                 if(!vaild) return
                const {data:res}=await this.$http.post('/users',this.addForm)
                if(res.meta.status!==201) return this.$message.error('用户创建失败')
                this.$message.success('用户创建成功')
                this.addDialogVisible=false
                this.getUserList()
            })
        },
        async showEditDialog(id){
            const {data:res}=await this.$http.get('/users/'+id)
            if(res.meta.status!==200) return this.$message.error('查询用户信息失败')
            this.editForm=res.data
            this.editDialogVisible=true
        },
        editUser(){
            this.$refs.editFormRef.validate(async vaild=>{
                if(!vaild) return
                const {data:res}=await this.$http.put('/users/'+this.editForm.id,{
                    email:this.editForm.email,
                    mobile:this.editForm.mobile
                })
                if(res.meta.status!==200) return this.$message.error('用户更新失败')
                this.$message.success('用户更新成功')
                this.editDialogVisible=false
                this.getUserList()
            })
        },
        async deleteUser(id){
            const confirmRes=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err=>err);
            if(confirmRes=='cancel') return this.$message.info('已取消删除')
            const {data:res}=await this.$http.delete('/users/'+id)           
            if(res.meta.status!==200) return this.$message.error('删除用户失败')
            this.$message.success('删除用户成功')
            this.getUserList()
        },
        async showRoleSetDialog(userInfo){
            this.userInfo=userInfo
            const {data:res}=await this.$http.get('/roles')
            if(res.meta.status!==200) return this.$message.error('获取角色列表失败！')
            this.rolesList=res.data
            this.setRoleDialogVisible=true
        },
        setRoleDialogClose(){
            this.setRoleDialogVisible=false
            this.selectedRoleId=''
            this.userInfo={}
        },
        async saveRoleInfo(id){
            if(!this.selectedRoleId) return this.$message.error('请选择要分配的角色！')          
            const {data:res}=await this.$http.put('/users/'+id+'/role',{rid:this.selectedRoleId})
            if(res.meta.status!==200) return this.$message.error('更新角色失败！')
            this.$message.success('更新角色成功！')
            this.getUserList()
            this.setRoleDialogVisible = false
        }
    }
}
</script>

<style lang="less" scoped>

</style>
