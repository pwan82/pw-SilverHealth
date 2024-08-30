<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: searchQuery.value.trim() }
    })
  }
}
</script>

<template>
  <div class="search-bar d-flex align-items-center justify-content-center">
    <input type="text" v-model="searchQuery" class="form-control-lg me-2 w-100" placeholder="Search what you want"
      @keyup.enter="handleSearch" />
    <button @click="handleSearch" class="btn btn-lg btn-primary">
      <i class="bi bi-search"></i>
    </button>
  </div>
</template>
