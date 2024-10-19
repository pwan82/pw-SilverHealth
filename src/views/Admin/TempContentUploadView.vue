<template>
  <div class="admin-content-management">
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <!-- Go back button -->
          <div class="mb-2">
            <button
              @click="router.push({ name: 'AdminDashboard' })"
              class="btn btn-outline-primary custom-button"
            >
              <i class="bi bi-arrow-left mr-2"></i>
              <div class="button-text">Back to Admin Dashboard</div>
            </button>
          </div>
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
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
