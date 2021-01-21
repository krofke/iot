import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'


Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/home',
    name: 'home',
    component: () =>  import('../views/Home.vue')
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: () =>  import('../views/Usuarios.vue')
  },
  {
    path: '/aplicacoes',
    name: 'aplicacoes',
    component: () =>  import('../views/Aplicacoes.vue')
  },
  {
    path: '/suporte',
    name: 'suporte',
    component: () =>  import('../views/Suporte.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
