import Vue from 'vue'
import Router from 'vue-router'
import login from './components/login.vue'
import home from './components/home.vue'
import welcome from './components/welcome.vue'
import users from './components/user/users.vue'
import roles from './components/permissions/roles.vue'
import rights from './components/permissions/rights.vue'
import params from './components/goods/category-params.vue'
import category from './components/goods/category.vue'
import list from './components/goods/list.vue'
import goodsAdd from './components/goods/add.vue'
import goodsEdit from './components/goods/edit.vue'
import order from './components/order/order.vue'
import report from './components/report/report.vue'
console.log(login)
Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: login },
    {
      path: '/home',
      component: home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: welcome },
        { path: '/users', component: users },
        { path: '/roles', component: roles },
        { path: '/rights', component: rights },
        { path: '/params', component: params },
        { path: '/categories', component: category },
        { path: '/goods', component: list },
        { path: '/goods/add', component: goodsAdd },
        { path: '/goods/edit/:goodsId', component: goodsEdit },
        { path: '/orders', component: order },
        { path: '/reports', component: report }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path == '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
console.log(login)
export default router
