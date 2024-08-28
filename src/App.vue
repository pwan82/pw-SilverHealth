<script setup>
import Header from './components/sharedComponents/header/Header.vue';
import Footer from './components/sharedComponents/Footer.vue';
import HomeView from './views/Home/HomeView.vue';
</script>

<template>
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

header,
footer {
  width: 100%;
}

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
