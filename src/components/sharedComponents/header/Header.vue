<script setup>
import logo from '@/assets/logo.webp'
import FirstAidGuideButton from '@/components/sharedComponents/buttons/FirstAidGuideButton.vue'
import TopInfoBar from '@/components/sharedComponents/header/TopInfoBar.vue'
import SearchBar from '@/components/sharedComponents/header/SearchBar.vue'
import NabBar from '@/components/sharedComponents/header/NavBar.vue'
</script>

<template>
  <header>
    <!-- Top Bar with Welcome Message -->
    <TopInfoBar />

    <!-- Logo, Search Bar, and First Aid Guide Button -->
    <div class="row align-items-center mx-2 py-4">
      <div class="col-12 col-md-4 py-1 text-center text-md-start">
        <router-link to="/" class="logo">
          <img :src="logo" alt="SilverHealth Logo" class="logo-img" />
        </router-link>
      </div>

      <div class="col-12 col-md-4 py-1 justify-content-center">
        <SearchBar />
      </div>
      <div
        class="col-12 col-md-4 mt-2 mt-md-0 py-1 d-flex justify-content-md-end justify-content-center"
      >
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

/* .first-aid-button{
  justify-content: end;
} */

/* .search-bar {
  justify-content: center;
} */

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

@media (max-width: 767px) {
  /* .row {
    text-align: center;
  }

  .col-12 {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  } */

  /* .first-aid-button {
    width: 100%;
  } */
}
</style>
