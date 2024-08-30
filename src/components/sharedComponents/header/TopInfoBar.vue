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
  <div class="top-bar bg-light py-md-2 py-3">
    <div class="row align-items-center mx-md-3">
      <div class="col-12 col-md-6">
        <p class="text-center text-md-start">Welcome to SilverHealth ✨</p>
      </div>

      <div class="col-12 col-md-6 text-center text-md-end">
        <p v-if="isLoggedIn">
          <span>🌞 Hi, {{ currentUser.username || 'Guest' }}</span>
          <span class="mx-2 non-selectable">|</span>
          <router-link to="/account/settings" class="text-decoration-none">Settings</router-link>
          <span class="mx-2 non-selectable">|</span>
          <span @click="handleLogout" class="text-decoration-none text-danger cursor-pointer"
            >Log out</span
          >
        </p>
        <p v-else>
          <router-link to="/login" class="text-decoration-none">Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar .row {
  height: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

p,
span,
a,
button {
  line-height: 15px;
}

@media (min-width: 992px) {
  .top-bar {
    height: 36px;
  }

  p,
  span,
  a {
    line-height: 20px;
  }
}
</style>
