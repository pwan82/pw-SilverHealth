import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/init'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

import ErrorView from '@/views/Error/ErrorView.vue'

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
    name: 'NewsList',
    component: () => import('../views/Article/NewsListView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/event',
    name: 'EventList',
    component: () => import('../views/CommunityEvent/EventListView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/event/:eventId',
    name: 'EventDetail',
    component: () => import('../views/CommunityEvent/EventDetailView.vue')
  },
  // {
  //   path: '/event/calendar',
  //   name: 'MyEventCalendar',
  //   component: () => import('../views/CommunityEvent/MyEventCalendarView.vue'),
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/event/registered',
    name: 'MyEventRegistrations',
    component: () => import('../views/CommunityEvent/MyEventRegistrationsView.vue'),
    meta: { requiresAuth: true }
  },
  // {
  //   path: '/get-support',
  //   name: 'GetSupport',
  //   component: () => import('../views/GetSupport/GetSupportView.vue'),
  //   meta: { requiresAuth: false }
  // },
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
  // {
  //   path: '/get-support/book-online',
  //   name: 'BookOnline',
  //   component: () => import('../views/GetSupport/BookOnlineView.vue'),
  //   meta: { requiresAuth: false }
  // },
  {
    path: '/get-support/book-by-phone',
    name: 'BookByTelephone',
    component: () => import('../views/GetSupport/BookByTelephoneView.vue'),
    meta: { requiresAuth: false }
  },
  // {
  //   path: '/get-support/my-bookings',
  //   name: 'MyBookings',
  //   component: () => import('../views/GetSupport/MyBookingsView.vue'),
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search/SearchView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/profile',
    name: 'MyProfile',
    component: () => import('../views/Account/MyProfileView.vue'),
    meta: { requiresAuth: true }
  },
  // {
  //   path: '/account/settings',
  //   name: 'Settings',
  //   component: () => import('../views/Account/SettingsView.vue'),
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/get-involved',
  //   name: 'GetInvolved',
  //   component: () => import('../views/GetInvolved/GetInvolvedView.vue'),
  //   meta: { requiresAuth: false }
  // },
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
    path: '/admin/article-management',
    name: 'AdminArticleManagement',
    component: () => import('../views/Admin/AdminArticleManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // {
  //   path: '/admin/temp-content-upload',
  //   name: 'AdminTempContentUpload',
  //   component: () => import('../views/Admin/TempContentUploadView.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  {
    path: '/admin/event-management',
    name: 'AdminEventManagement',
    component: () => import('../views/Admin/AdminEventManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/bulk-email-management',
    name: 'AdminBulkEmailManagementView',
    component: () => import('../views/Admin/AdminBulkEmailManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/api-docs',
    name: 'AdminApiDocs',
    component: () => import('../views/Admin/AdminApiDocsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/error',
    name: 'Error',
    component: ErrorView
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: ErrorView,
    props: {
      title: 'Access Denied',
      message: 'You do not have permission to access this page.'
    }
  },
  {
    path: '/article-not-found',
    name: 'ArticleNotFound',
    component: ErrorView,
    props: {
      title: 'Article Not Found',
      message:
        'The article you are looking for does not exist, or you do not have permission to view it.'
    }
  },
  {
    path: '/event-not-found',
    name: 'EventNotFound',
    component: ErrorView,
    props: {
      title: 'Event Not Found',
      message:
        'The event you are looking for does not exist, or you do not have permission to view it.'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: ErrorView,
    props: {
      title: 'Page Not Found',
      message: 'Please re-check the url.'
    }
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
  } else if (isLoggedIn.value && (to.name == 'Login' || to.name == 'Signup')) {
    // If the user is logged in and tries to access the login or register page, redirect to Home
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
