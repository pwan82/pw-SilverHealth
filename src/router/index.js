import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { computed } from 'vue'

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
    component: () => import('../views/Account/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Account/RegisterView.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/Admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: () => import('../views/Error/AccessDeniedView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const currentUser = computed(() => userStore.currentUser)

  if (
    to.matched.some(
      (record) =>
        record.meta.requiresAdmin && (!isLoggedIn.value || currentUser.value.role != 'admin')
    )
  ) {
    // Handle admin route
    next({ name: 'AccessDenied' })
  } else if (to.matched.some((record) => record.meta.requiresAuth && !isLoggedIn.value)) {
    // Handle authentication
    next({ name: 'Login' })
  } else if (isLoggedIn.value && to.name == 'Login') {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
