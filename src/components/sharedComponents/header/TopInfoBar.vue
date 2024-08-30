<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const currentUser = computed(() => userStore.currentUser)

const handleLogout = () => {
  if (confirm('Are you sure to logout?')) {
    userStore.logout()
    alert('You have successfully logged out!')
    router.push({ name: 'Home' })
  }
}
</script>

<template>
  <div class="top-bar bg-light py-2">
    <div class="container d-flex justify-content-between align-items-center">
      <div class="welcome-message">Welcome to SilverHealth✨</div>
      <div class="user-info d-flex align-items-center" v-if="isLoggedIn">
        <span>🌞 Hi, {{ currentUser.username || 'Guest' }}</span>
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
</template>
