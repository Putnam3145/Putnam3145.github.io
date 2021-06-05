import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Helper from '../views/Helper/Helper.vue'
import Roguelike from '../views/Roguelike.vue'
import Atmospherics from '../views/Atmospherics.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/helper',
    name: 'Dwarf Fortress material helper',
    component: Helper
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/roguelike',
    name: 'Roguelike',
    component: Roguelike
  },
  {
    path: '/atmospherics',
    name: 'Atmospherics',
    component: Atmospherics
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
