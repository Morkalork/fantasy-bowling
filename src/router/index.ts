import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TeamView from '../views/TeamView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/team',
      name: 'team',
      component: TeamView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView
    }
  ]
})

export default router
