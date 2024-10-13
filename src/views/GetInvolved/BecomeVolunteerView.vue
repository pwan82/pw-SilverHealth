<template>
  <ArticleDetailView :articleId="5" class="custom-article-view" />
  <div class="container">
    <div class="col-md-10 offset-md-1">
      <div class="row mt-2 mb-5 iframe-container">
        <Transition name="fade">
          <iframe
            v-if="showIframe"
            src="https://docs.google.com/forms/d/e/1FAIpQLSc1Vd8sGrnk59Ltmou7o05O3EzRRTv8rIL1_8msLqGxZ3DOIg/viewform?embedded=true"
            height="600"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >
            Loading form...
          </iframe>
          <div v-else class="loading-placeholder">Loading form...</div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ArticleDetailView from '@/views/Article/ArticleDetailView.vue'

const showIframe = ref(false)

onMounted(() => {
  window.scrollTo(0, 0)
  setTimeout(() => {
    showIframe.value = true
  }, 1000)
})
</script>

<style scoped>
.custom-article-view {
  margin-bottom: 0 !important;
}

.iframe-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding-top: 100%;
}

.iframe-container iframe,
.loading-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  font-size: 18px;
  color: #666;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
