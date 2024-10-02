<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { auth } from '@/firebase/init'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'

const router = useRouter()
const authStore = useAuthStore()

// const currentUser = computed(() => authStore.currentUser)

const handleLogout = () => {
  if (confirm('Are you sure to logout?')) {
    authStore.logout()
    alert('You have successfully logged out!')
    router.push({ name: 'Home' })
  }
}

// const auth = getAuth()
const currentUser = ref(null)
const currentRole = ref(null)
const currentEmail = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser.value = user
      await authStore.login()
      currentRole.value = authStore.role
      currentEmail.value = authStore.email
    } else {
      authStore.clearUser()
      currentUser.value = null
      currentRole.value = null
      currentEmail.value = null
    }
  })
})
</script>

<template>
  <div class="top-bar bg-light py-md-2 py-3">
    <div class="row align-items-center mx-md-3">
      <div class="col-12 col-md-6">
        <p class="text-center text-md-start">Welcome to SilverHealth ✨</p>
      </div>

      <div class="col-12 col-md-6 text-center text-md-end">
        <p v-if="currentUser">
          <span>🌞 Hi, {{ currentUser.email || 'Guest' }} ({{ currentRole }})</span>
          <span class="mx-2 non-selectable">|</span>
          <router-link to="/account/settings" class="text-decoration-none">Settings</router-link>
          <span class="mx-2 non-selectable">|</span>
          <span @click="handleLogout" class="text-decoration-none text-danger cursor-pointer">Log out</span>
        </p>
        <p v-else>
          <router-link to="/login" class="text-decoration-none">Log In</router-link>
          <span class="mx-2 non-selectable">|</span>
          <router-link to="/register" class="text-decoration-none">Sign Up</router-link>
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
