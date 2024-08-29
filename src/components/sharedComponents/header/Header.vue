<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import logo from '@/assets/logo.webp'
import FirstAidGuideButton from '../buttons/FirstAidGuideButton.vue'
import { routerKey } from 'vue-router'
const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAdmin = computed(() => userStore.isAdmin)
const currentUser = computed(() => userStore.currentUser)

const handleLogout = () => {
  if (confirm('Are you sure to logout?')) {
    userStore.logout()
    alert('You have successfully logged out!')
    router.push({ name: 'Home' })
  }
}

const searchQuery = ref('')
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: searchQuery.value.trim() }
    })
  }
}

const activeParent = computed(() => {
  if (['Article', 'News'].includes(router.name)) {
    return 'info'
  } else if (['AllEvents', 'MyEventCalendar', 'MyRegistrations'].includes(router.name)) {
    return 'event'
  } else if (
    ['FirstAidGuide', 'FindServices', 'BookServices', 'BookByTelephone', 'MyBookings'].includes(
      router.name
    )
  ) {
    return 'support'
  } else if (
    [
      'AdminDashboard',
      'AdminUserAnalytics',
      'AdminContentManagement',
      'AdminBookingRecord',
      'AdminBulkEmailManagement'
    ].includes(router.name)
  ) {
    return 'admin'
  } else return ''
})
</script>

<template>
  <header>
    <!-- Top Bar with Welcome Message -->
    <div class="top-bar bg-light py-2">
      <div class="container d-flex justify-content-between align-items-center">
        <div class="welcome-message">Welcome to SilverHealth✨</div>
        <div class="user-info d-flex align-items-center" v-if="isLoggedIn">
          <span>🌞Hi, {{ currentUser.username || 'Guest' }}</span>
          <span class="mx-2 non-selectable">|</span>
          <router-link to="/account/settings" class="text-decoration-none">Settings</router-link>
          <span class="mx-2 non-selectable">|</span>
          <button @click="handleLogout" class="btn p-0 text-decoration-none text-danger">
            Log out
          </button>
        </div>
        <div class="user-info d-flex align-items-center" v-else>
          <router-link to="/login" class="text-decoration-none">Login</router-link>
        </div>
      </div>
    </div>

    <!-- Logo, Search Bar, and FirstAid Guide Button -->
    <div class="container d-flex justify-content-between align-items-center py-4">
      <router-link to="/" class="logo">
        <img :src="logo" alt="SilverHealth Logo" class="logo-img" />
      </router-link>

      <!-- Search Bar -->
      <div class="search-bar d-flex align-items-center">
        <input
          type="text"
          v-model="searchQuery"
          class="form-control-lg me-2"
          placeholder="Search what you want"
        />
        <button @click="handleSearch" class="btn btn-lg btn-primary">
          <i class="bi bi-search"></i>
        </button>
      </div>

      <div class="first-aid-guide">
        <FirstAidGuideButton />
      </div>
    </div>

    <!-- Navigation Bar with Dropdowns -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-top border-bottom">
      <div class="container">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- Home -->
          <li class="nav-item">
            <router-link to="/" class="nav-link" :class="{ active: $route.name === 'Home' }">
              <i class="bi bi-house-door-fill"></i> Home
            </router-link>
          </li>

          <!-- Information & Advice -->
          <li class="nav-item dropdown" :class="{ active: activeParent === 'info' }">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="infoDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Information & Advice
            </a>
            <ul class="dropdown-menu" aria-labelledby="infoDropdown">
              <li>
                <router-link to="/article" class="dropdown-item" active-class="active"
                  >Articles</router-link
                >
              </li>
              <li>
                <router-link to="/news" class="dropdown-item" active-class="active"
                  >News</router-link
                >
              </li>
            </ul>
          </li>

          <!-- Community Events -->
          <li class="nav-item dropdown" :class="{ active: activeParent === 'event' }">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="eventsDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Community Events
            </a>
            <ul class="dropdown-menu" aria-labelledby="eventsDropdown">
              <li>
                <router-link to="/event/all-events" class="dropdown-item" active-class="active"
                  >All Events</router-link
                >
              </li>
              <li>
                <router-link to="/event/calendar" class="dropdown-item" active-class="active"
                  >My Event Calendar</router-link
                >
              </li>
              <li>
                <router-link to="/event/registered" class="dropdown-item" active-class="active"
                  >My Registrations</router-link
                >
              </li>
            </ul>
          </li>

          <!-- Get Support -->
          <li class="nav-item dropdown" :class="{ active: activeParent === 'support' }">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="supportDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Get Support
            </a>
            <ul class="dropdown-menu" aria-labelledby="supportDropdown">
              <li>
                <router-link
                  to="/get-support/first-aid-guide"
                  class="dropdown-item"
                  active-class="active"
                  >First Aid Guide</router-link
                >
              </li>
              <li>
                <router-link
                  to="/get-support/find-services"
                  class="dropdown-item"
                  active-class="active"
                  >Find Services Near You</router-link
                >
              </li>
              <li>
                <router-link
                  to="/get-support/book-services"
                  class="dropdown-item"
                  active-class="active"
                  >Book Online</router-link
                >
              </li>
              <li>
                <router-link
                  to="/get-support/book-by-phone"
                  class="dropdown-item"
                  active-class="active"
                  >Book by Telephone</router-link
                >
              </li>
              <li>
                <router-link
                  to="/get-support/my-bookings"
                  class="dropdown-item"
                  active-class="active"
                  >My Bookings</router-link
                >
              </li>
            </ul>
          </li>

          <!-- Get Involved -->
          <li class="nav-item dropdown" :class="{ active: activeParent === 'involved' }">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="involvedDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Get Involved
            </a>
            <ul class="dropdown-menu" aria-labelledby="involvedDropdown">
              <li>
                <router-link
                  to="/get-involved/become-a-volunteer"
                  class="dropdown-item"
                  active-class="active"
                  >Become a Volunteer</router-link
                >
              </li>
              <li>
                <router-link to="/get-involved/donate" class="dropdown-item" active-class="active"
                  >Donate</router-link
                >
              </li>
            </ul>
          </li>

          <!-- Admin -->
          <li
            class="nav-item dropdown"
            :class="{ active: activeParent === 'admin' }"
            v-if="isLoggedIn && isAdmin"
          >
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="adminDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Administration
            </a>
            <ul class="dropdown-menu" aria-labelledby="adminDropdown">
              <li>
                <router-link to="/admin" class="dropdown-item" active-class="active"
                  >Dashboard</router-link
                >
              </li>
              <li>
                <router-link to="/admin/user-analytics" class="dropdown-item" active-class="active"
                  >User Analytics</router-link
                >
              </li>
              <li>
                <router-link
                  to="/admin/content-management"
                  class="dropdown-item"
                  active-class="active"
                  >Content Management</router-link
                >
              </li>
              <li>
                <router-link to="/admin/booking-record" class="dropdown-item" active-class="active"
                  >Booking Record</router-link
                >
              </li>
              <li>
                <router-link
                  to="/admin/bulk-email-management"
                  class="dropdown-item"
                  active-class="active"
                  >Bulk Email Management</router-link
                >
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Using Bootstrap's Header template (starter code) -->
    <!-- https://getbootstrap.com/docs/5.0/examples/headers/ -->
    <!-- <div class="container">
      <header class="d-flex justify-content-center py-3">
        <ul class="nav nav-pills">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active" aria-current="page">Home (Week 5)</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link" active-class="active">About</router-link>
          </li>
          Show login or logout based on authentication status
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <button @click="handleLogout" class="nav-link btn btn-link text-danger">Logout</button>
          </li>
        </ul>
      </header>
    </div> -->
  </header>
</template>

<style scoped>
.logo-img {
  height: 60px;
  width: auto;
  max-width: 100%;
}

.search-bar {
  flex-grow: 1;
  max-width: 300px;
}

.b-example-divider {
  height: 3rem;
  background-color: rgba(0, 0, 0, 0.1);
  border: solid rgba(0, 0, 0, 0.15);
  border-width: 1px 0;
  box-shadow:
    inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1),
    inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
}

.form-control-dark {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: var(--bs-gray);
}

.form-control-dark:focus {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: #fff;
  box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
}

.bi {
  vertical-align: -0.125em;
  fill: currentColor;
}

.text-small {
  font-size: 85%;
}

.dropdown-toggle {
  outline: 0;
}

.navbar-nav .nav-link.active > .nav-link {
  font-weight: bold;
  color: #007bff !important;
  background-color: #e9ecef;
}
</style>
