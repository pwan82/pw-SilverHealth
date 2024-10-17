<template>
  <!-- Navigation Bar with Dropdowns -->
  <nav class="navbar navbar-expand-lg navbar-light bg-light border-top border-bottom">
    <div class="container">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <!-- Home link -->
        <li class="nav-item">
          <router-link to="/" class="nav-link" :class="{ active: activeParent === 'home' }">
            <i class="bi bi-house-door-fill"></i> Home
          </router-link>
        </li>

        <!-- Information & Advice Dropdown -->
        <li
          class="nav-item dropdown"
          :class="{ active: activeParent === 'info' }"
          @mouseover="showDropdown('infoDropdown')"
          @mouseleave="hideDropdown('infoDropdown')"
        >
          <span
            class="nav-link dropdown-toggle"
            id="infoDropdown"
            role="button"
            tabindex="0"
            aria-haspopup="true"
            :aria-expanded="dropdownStates.infoDropdown"
            @click="toggleDropdown('infoDropdown')"
            @keydown.enter="toggleDropdown('infoDropdown')"
            @keydown.space="toggleDropdown('infoDropdown')"
          >
            Information & Advice
          </span>
          <ul
            class="dropdown-menu"
            :class="{ show: dropdownStates.infoDropdown }"
            aria-labelledby="infoDropdown"
          >
            <li>
              <router-link to="/article" class="dropdown-item" active-class="active"
                >Articles</router-link
              >
            </li>
            <li>
              <router-link to="/news" class="dropdown-item" active-class="active">News</router-link>
            </li>
          </ul>
        </li>

        <!-- Community Events Dropdown -->
        <li
          class="nav-item dropdown"
          :class="{ active: activeParent === 'events' }"
          @mouseover="showDropdown('eventsDropdown')"
          @mouseleave="hideDropdown('eventsDropdown')"
        >
          <span
            class="nav-link dropdown-toggle"
            id="eventsDropdown"
            role="button"
            tabindex="0"
            aria-haspopup="true"
            :aria-expanded="dropdownStates.eventsDropdown"
            @click="toggleDropdown('eventsDropdown')"
            @keydown.enter="toggleDropdown('eventsDropdown')"
            @keydown.space="toggleDropdown('eventsDropdown')"
          >
            Community Events
          </span>
          <ul
            class="dropdown-menu"
            :class="{ show: dropdownStates.eventsDropdown }"
            aria-labelledby="eventsDropdown"
          >
            <li>
              <router-link to="/event" class="dropdown-item" active-class="active"
                >All Events</router-link
              >
            </li>
            <li>
              <router-link to="/event/registered" class="dropdown-item" active-class="active"
                >My Event Registrations</router-link
              >
            </li>
          </ul>
        </li>

        <!-- Get Support Dropdown -->
        <li
          class="nav-item dropdown"
          :class="{ active: activeParent === 'support' }"
          @mouseover="showDropdown('supportDropdown')"
          @mouseleave="hideDropdown('supportDropdown')"
        >
          <span
            class="nav-link dropdown-toggle"
            id="supportDropdown"
            role="button"
            tabindex="0"
            aria-haspopup="true"
            :aria-expanded="dropdownStates.supportDropdown"
            @click="toggleDropdown('supportDropdown')"
            @keydown.enter="toggleDropdown('supportDropdown')"
            @keydown.space="toggleDropdown('supportDropdown')"
          >
            Get Support
          </span>
          <ul
            class="dropdown-menu"
            :class="{ show: dropdownStates.supportDropdown }"
            aria-labelledby="supportDropdown"
          >
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
                to="/get-support/book-by-phone"
                class="dropdown-item"
                active-class="active"
                >Book by Telephone</router-link
              >
            </li>
          </ul>
        </li>

        <!-- Get Involved Dropdown -->
        <li
          class="nav-item dropdown"
          :class="{ active: activeParent === 'involved' }"
          @mouseover="showDropdown('involvedDropdown')"
          @mouseleave="hideDropdown('involvedDropdown')"
        >
          <span
            class="nav-link dropdown-toggle"
            id="involvedDropdown"
            role="button"
            tabindex="0"
            aria-haspopup="true"
            :aria-expanded="dropdownStates.involvedDropdown"
            @click="toggleDropdown('involvedDropdown')"
            @keydown.enter="toggleDropdown('involvedDropdown')"
            @keydown.space="toggleDropdown('involvedDropdown')"
          >
            Get Involved
          </span>
          <ul
            class="dropdown-menu"
            :class="{ show: dropdownStates.involvedDropdown }"
            aria-labelledby="involvedDropdown"
          >
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

        <!-- Admin Dropdown -->
        <li
          v-if="isLoggedIn && isAdmin"
          class="nav-item dropdown"
          :class="{ active: activeParent === 'admin' }"
          @mouseover="showDropdown('adminDropdown')"
          @mouseleave="hideDropdown('adminDropdown')"
        >
          <span
            class="nav-link dropdown-toggle"
            id="adminDropdown"
            role="button"
            tabindex="0"
            aria-haspopup="true"
            :aria-expanded="dropdownStates.adminDropdown"
            @click="toggleDropdown('adminDropdown')"
            @keydown.enter="toggleDropdown('adminDropdown')"
            @keydown.space="toggleDropdown('adminDropdown')"
          >
            Admin
          </span>
          <ul
            class="dropdown-menu"
            :class="{ show: dropdownStates.adminDropdown }"
            aria-labelledby="adminDropdown"
          >
            <li>
              <router-link to="/admin" class="dropdown-item" active-class="active"
                >Admin Dashboard</router-link
              >
            </li>
            <li>
              <router-link to="/admin/user-analytics" class="dropdown-item" active-class="active"
                >User Analytics</router-link
              >
            </li>
            <li>
              <router-link
                to="/admin/article-management"
                class="dropdown-item"
                active-class="active"
                >Article Management</router-link
              >
            </li>
            <li>
              <router-link to="/admin/event-management" class="dropdown-item" active-class="active"
                >Event Management</router-link
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
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isAdmin = computed(() => authStore.isAdmin)

const dropdownStates = reactive({
  infoDropdown: false,
  eventsDropdown: false,
  supportDropdown: false,
  involvedDropdown: false,
  adminDropdown: false
})

// Show the dropdown menu
const showDropdown = (dropdownId) => {
  dropdownStates[dropdownId] = true
}

// Hide the dropdown menu
const hideDropdown = (dropdownId) => {
  dropdownStates[dropdownId] = false
}

// Toggle the dropdown menu
const toggleDropdown = (dropdownId) => {
  dropdownStates[dropdownId] = !dropdownStates[dropdownId]
}

const activeParent = computed(() => {
  if (['Home'].includes(route.name)) {
    return 'home'
  } else if (['ArticleDetail', 'ArticleList', 'NewsList'].includes(route.name)) {
    return 'info'
  } else if (['EventList', 'MyEventRegistrations'].includes(route.name)) {
    return 'events'
  } else if (
    ['FirstAidGuide', 'FindServices', 'BookOnline', 'BookByTelephone', 'MyBookings'].includes(
      route.name
    )
  ) {
    return 'support'
  } else if (['BecomeVolunteer', 'Donate'].includes(route.name)) {
    return 'involved'
  } else if (
    [
      'AdminDashboard',
      'AdminUserAnalytics',
      'AdminArticleManagement',
      'AdminEventManagement',
      'AdminBulkEmailManagementView'
    ].includes(route.name)
  ) {
    return 'admin'
  }
  return ''
})
</script>

<style scoped>
.nav-item {
  font-weight: bold;
}

.nav-item.active > .nav-link {
  color: #007bff !important;
  background-color: #e9ecef;
}

.dropdown-menu {
  position: absolute;
}

.nav-link {
  cursor: pointer;
}
</style>
