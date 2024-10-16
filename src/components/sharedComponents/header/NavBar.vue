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
          <router-link
            to="/article"
            class="nav-link dropdown-toggle"
            id="infoDropdown"
            role="button"
            aria-expanded="false"
            @click.prevent="navigateTo('/article')"
          >
            Information & Advice
          </router-link>
          <ul class="dropdown-menu" aria-labelledby="infoDropdown">
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
          <router-link
            to="/event"
            class="nav-link dropdown-toggle"
            id="eventsDropdown"
            role="button"
            aria-expanded="false"
            @click.prevent="navigateTo('/event')"
          >
            Community Events
          </router-link>
          <ul class="dropdown-menu" aria-labelledby="eventsDropdown">
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
          <router-link
            to="/get-support"
            class="nav-link dropdown-toggle"
            id="supportDropdown"
            role="button"
            aria-expanded="false"
            @click.prevent="navigateTo('/get-support')"
          >
            Get Support
          </router-link>
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
            <!-- <li>
              <router-link to="/get-support/book-online" class="dropdown-item" active-class="active">Book
                Online</router-link>
            </li> -->
            <li>
              <router-link
                to="/get-support/book-by-phone"
                class="dropdown-item"
                active-class="active"
                >Book by Telephone</router-link
              >
            </li>
            <!-- <li>
              <router-link to="/get-support/my-bookings" class="dropdown-item" active-class="active">My
                Bookings</router-link>
            </li> -->
          </ul>
        </li>

        <!-- Get Involved Dropdown -->
        <li
          class="nav-item dropdown"
          :class="{ active: activeParent === 'involved' }"
          @mouseover="showDropdown('involvedDropdown')"
          @mouseleave="hideDropdown('involvedDropdown')"
        >
          <router-link
            to="/get-involved"
            class="nav-link dropdown-toggle"
            id="involvedDropdown"
            role="button"
            aria-expanded="false"
            @click.prevent="navigateTo('/get-involved')"
          >
            Get Involved
          </router-link>
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

        <!-- Admin Dropdown -->
        <li
          v-if="isLoggedIn && isAdmin"
          class="nav-item dropdown"
          :class="{ active: activeParent === 'admin' }"
          @mouseover="showDropdown('adminDropdown')"
          @mouseleave="hideDropdown('adminDropdown')"
        >
          <router-link
            to="/admin"
            class="nav-link dropdown-toggle"
            id="adminDropdown"
            role="button"
            aria-expanded="false"
            @click.prevent="navigateTo('/admin')"
          >
            Admin
          </router-link>
          <ul class="dropdown-menu" aria-labelledby="adminDropdown">
            <li>
              <router-link to="/admin" class="dropdown-item" active-class="active"
                >Admin AdminDashboard</router-link
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isAdmin = computed(() => authStore.isAdmin)

// Show the dropdown menu
const showDropdown = (dropdownId) => {
  const dropdownElement = document.getElementById(dropdownId)
  dropdownElement.classList.add('show')
  const menu = dropdownElement.nextElementSibling
  if (menu) menu.classList.add('show')
}

const hideDropdown = (dropdownId) => {
  const dropdownElement = document.getElementById(dropdownId)
  dropdownElement.classList.remove('show')
  const menu = dropdownElement.nextElementSibling
  if (menu) menu.classList.remove('show')
}

const navigateTo = (path) => {
  router.push(path)
}

const activeParent = computed(() => {
  if (['Home'].includes(route.name)) {
    return 'home'
  } else if (['ArticleDetail', 'ArticleList', 'NewsList'].includes(route.name)) {
    return 'info'
  } else if (['EventList', 'MyEventRegistrations'].includes(route.name)) {
    return 'events'
  } else if (
    [
      'GetSupport',
      'FirstAidGuide',
      'FindServices',
      'BookOnline',
      'BookByTelephone',
      'MyBookings'
    ].includes(route.name)
  ) {
    return 'support'
  } else if (['GetInvolved', 'BecomeVolunteer', 'Donate'].includes(route.name)) {
    return 'involved'
  } else if (
    [
      'AdminDashboard',
      'AdminUserAnalytics',
      'AdminContentManagement',
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
</style>
