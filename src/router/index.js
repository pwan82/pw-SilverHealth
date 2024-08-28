import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/About/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import store from '../store/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/aricle',
    name: 'Article',
    component: () => import('../views/About/AboutView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/events',
    name: 'Event',
    component: () => import('../views/About/AboutView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/get-support',
    name: 'GetSupport',
    component: () => import('../views/GetSupport/GetSupportView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/get-support/first-aid-guide',
    name: 'FirstAidGuide',
    component: () => import('../views/GetSupport/FirstAidGuideView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/SearchView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account',
    name: 'MyAccount',
    component: () => import('../views/AccountView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/get-involved',
    name: 'GetInvolved',
    component: () => import('../views/GetInvolved/GetInvolvedView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/get-involved/become-a-volunteer',
    name: 'BecomeVolunteer',
    component: () => import('../views/GetInvolved/BecomeVolunteerView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/get-involved/donate',
    name: 'Donate',
    component: () => import('../views/GetInvolved/DonateView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About/AboutView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/about/sitemap',
    name: 'Sitemap',
    component: () => import('../views/About/Sitemap.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/Admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// router.beforeEach((to, from, next) => {
//   if (to.matched.some((record) => record.meta.requiresAuth && !store.state.isAuthenticated)) {
//     next({ name: 'Login' })
//   } else {
//     next()
//   }
// })

export default router
