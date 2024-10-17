<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase/init'
import { onAuthStateChanged } from 'firebase/auth'

import Header from './components/sharedComponents/header/Header.vue'
import Footer from './components/sharedComponents/footer/Footer.vue'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (!authStore.isLoggedIn) {
        await authStore.login()
        const token = await user.getIdToken()
        console.log(`getIdToken Bearer ${token}`)
      }
    } else {
      if (authStore.isLoggedIn) {
        authStore.logout()
        // If user logs out (newUser is null), navigate to the home page
        // router.push({ name: 'Home' })
        window.location.href = '/'
      }
    }
  })
})
</script>

<template>
  <Toast />
  <div class="layout-container">
    <header>
      <Header />
    </header>

    <main class="main-content">
      <router-view></router-view>
      <!-- <HomeView /> -->
    </main>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  height: 100vh;
}

/* header,
footer {
  width: 100%;
} */

.main-content {
  flex: 1 0 auto;
  overflow-y: auto;
}

/* header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}
 */
/* @media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
} */
</style>
