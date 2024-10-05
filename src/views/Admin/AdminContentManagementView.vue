<template>
  <div class="admin-content-management">
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <h1 class="text-center">Admin Content Management</h1>
          <p class="text-center">Add / edit articles and events.</p>
        </div>
      </div>

      <uploadArticlesAndRatings />
    </div>
  </div>
</template>

<script setup>
import uploadArticlesAndRatings from '@/components/temp/UploadArticlesAndRatings.vue'
</script>
