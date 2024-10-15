<template>
  <ArticleDetailView
    :articleId="articleId"
    class="custom-article-view"
    @loadingChange="handleLoadingChange"
  />
  <div v-if="!articleLoading" class="container">
    <div class="col-md-10 offset-md-1">
      <div class="button-container">
        <router-link :to="{ name: 'Donate' }" class="btn btn-primary btn-lg custom-lg-button">
          <i class="bi bi-geo-alt-fill"></i>
          <span class="button-lg-text">Find Nearby Service Centres</span>
        </router-link>
        <a :href="telLink" class="btn btn-outline-primary btn-lg custom-lg-button">
          <i class="bi bi-telephone-fill"></i>
          <span class="button-lg-text">Call Our Main Booking Line</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ArticleDetailView from '@/views/Article/ArticleDetailView.vue'

const articleId = 7
const telLink = 'tel:+61312345678'

const articleLoading = ref(true)

const handleLoadingChange = (isLoading) => {
  articleLoading.value = isLoading
  console.log('Article loading state:', isLoading)
}
</script>

<style scoped>
.custom-article-view {
  margin-bottom: 0 !important;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .button-container {
    flex-direction: row;
  }
}

.custom-lg-button {
  flex: 1;
}
</style>
