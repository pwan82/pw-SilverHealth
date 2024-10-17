<template>
  <div class="admin-content-management">
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <h1 class="text-center">Admin Content Management</h1>
          <p class="text-center">Add / edit articles and events.</p>
        </div>
      </div>

      <UploadArticlesAndRatings />
      <UploadLocations />
      <UploadEventsAndBookings />
    </div>
  </div>
</template>

<script setup>
import UploadArticlesAndRatings from '@/components/temp/UploadArticlesAndRatings.vue'
import UploadLocations from '@/components/temp/UploadLocations.vue'
import UploadEventsAndBookings from '@/components/temp/UploadEventsAndBookings.vue'
</script>
