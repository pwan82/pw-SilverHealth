import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/init'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/article',
    name: 'ArticleList',
    component: () => import('../views/Article/ArticleListView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/article/:articleId',
    name: 'ArticleDetail',
    component: () => import('../views/Article/ArticleDetailView.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/Article/NewsView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/event',
    name: 'Event',
    component: () => import('../views/CommunityEvent/AllCommunityEventsView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/event/all-events',
    name: 'AllEvents',
    component: () => import('../views/CommunityEvent/AllCommunityEventsView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/event/calendar',
    name: 'MyEventCalendar',
    component: () => import('../views/CommunityEvent/MyEventCalendarView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/event/registered',
    name: 'MyRegistrations',
    component: () => import('../views/CommunityEvent/MyRegistrationsView.vue'),
    meta: { requiresAuth: true }
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
    path: '/get-support/find-services',
    name: 'FindServices',
    component: () => import('../views/GetSupport/FindServicesView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/get-support/book-online',
    name: 'BookOnline',
    component: () => import('../views/GetSupport/BookOnlineView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/get-support/book-by-phone',
    name: 'BookByTelephone',
    component: () => import('../views/GetSupport/BookByTelephoneView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/get-support/my-bookings',
    name: 'MyBookings',
    component: () => import('../views/GetSupport/MyBookingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search/SearchView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account',
    name: 'MyAccount',
    component: () => import('../views/Account/AccountView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/settings',
    name: 'Settings',
    component: () => import('../views/Account/SettingsView.vue'),
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
    component: () => import('../views/About/SitemapView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/about/contact-us',
    name: 'Contact',
    component: () => import('../views/About/ContactView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/about/terms-and-policy',
    name: 'Policy',
    component: () => import('../views/About/PolicyView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Account/LoginView.vue')
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Account/SignupView.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/Account/ForgotPasswordView.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/Admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/user-analytics',
    name: 'AdminUserAnalytics',
    component: () => import('../views/Admin/AdminUserAnalyticsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/content-management',
    name: 'AdminContentManagement',
    component: () => import('../views/Admin/AdminContentManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/booking-record',
    name: 'AdminBookingRecord',
    component: () => import('../views/Admin/AdminBookingRecordView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/bulk-email-management',
    name: 'AdminBulkEmailManagementView',
    component: () => import('../views/Admin/AdminBulkEmailManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: () => import('../views/Error/AccessDeniedView.vue')
  },
  {
    path: '/:pathMatch(.*)',
    name: 'PageNotFound',
    component: () => import('../views/Error/NotFoundView.vue')
  },
  {
    path: '/article-not-found',
    name: 'ArticleNotFound',
    component: () => import('../views/Error/ArticleNotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Use cached status first, then check with Firebase
  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const isAdmin = computed(() => authStore.isAdmin)

  if (to.matched.some((record) => record.meta.requiresAuth || record.meta.requiresAdmin)) {
    // If login state is not cached, check Firebase auth state
    await authStore.checkAuthState()

    if (
      to.matched.some(
        (record) => record.meta.requiresAdmin && (!isLoggedIn.value || !isAdmin.value)
      )
    ) {
      next({ name: 'AccessDenied' })
    } else if (to.matched.some((record) => record.meta.requiresAuth && !isLoggedIn.value)) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else if (isLoggedIn.value && (to.name == 'Login' || to.name == 'register')) {
    // If the user is logged in and tries to access the login or register page, redirect to Home
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
