<script setup>
import logo from '@/assets/logo.webp'
import FirstAidGuideButton from '@/components/sharedComponents/buttons/FirstAidGuideButton.vue'
import TopInfoBar from '@/components/sharedComponents/header/TopInfoBar.vue'
import SearchBar from '@/components/sharedComponents/header/SearchBar.vue'
import NabBar from '@/components/sharedComponents/header/NabBar.vue'
</script>

<template>
  <header>
    <!-- Top Bar with Welcome Message -->
    <TopInfoBar />

    <!-- Logo, Search Bar, and FirstAid Guide Button -->
    <div class="container d-flex justify-content-between align-items-center py-4">
      <router-link to="/" class="logo">
        <img :src="logo" alt="SilverHealth Logo" class="logo-img" />
      </router-link>

      <!-- Search Bar -->
      <SearchBar />

      <!-- FirstAid Guide Button -->
      <div class="first-aid-guide">
        <FirstAidGuideButton />
      </div>
    </div>

    <!-- Navigation Bar with Dropdowns -->
    <NabBar />
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
