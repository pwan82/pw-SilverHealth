<template>
  <div class="search">
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <h1 class="text-center">Search Results</h1>
          <p class="text-center" v-if="searchQuery">
            You searched for: <strong>{{ searchQuery }}</strong>
          </p>
          <p class="text-center" v-else>No search query provided.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const searchQuery = computed(() => route.query.q || '')
</script>

<style scoped></style>
