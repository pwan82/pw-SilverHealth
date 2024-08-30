<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-10 offset-md-1">
        <div v-if="article">
          <h1 class="text-center">{{ article.title }}</h1>
          <p class="text-center">Author: {{ article.author }}</p>
          <p class="text-center">
            Published: {{ formatDate(article.publicationTime) }} | Last modified:
            {{ formatDate(article.modificationTime) }}
          </p>

          <!-- show averageRating -->
          <div>
            <Rating v-if="averageRating !== null" v-model="averageRating" disabled />
            <span v-else>No rating given</span>
          </div>

          <!-- render Markdown content -->
          <div v-html="renderedContent"></div>

          <!-- If not logged in, show login button -->
          <button class="btn btn-outline-primary" v-if="!isLoggedIn" @click="redirectToLogin">
            Login to rate this article
          </button>

          <!-- If logged in, show rating component -->
          <div v-else>
            <Rating v-model="userRating" :stars="5" :cancel="false" />
            <button @click="submitRatingHandler">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { fetchArticleById } from '@/services/ArticleService'
import { useUserStore } from '@/stores/userStore'
import { useRatingStore } from '@/stores/articleRatingStore'
import Rating from 'primevue/rating'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const ratingStore = useRatingStore()

const articleId = route.params.articleId
const article = ref(null)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userRating = ref(0)

const ratingData = computed(() => ratingStore.getRatingByArticleId(articleId))
console.log(`ratingData: ${ratingData.value}`)
const averageRating = computed(() => {
  return ratingData.value ? ratingData.value.averageRating : null
})

// Use MarkdownIt to parse the Markdowncontent
const md = new MarkdownIt()
const renderedContent = computed(() => (article.value ? md.render(article.value.body) : ''))

const submitRatingHandler = () => {
  if (!isLoggedIn.value) {
    redirectToLogin()
    return
  }

  const userId = userStore.currentUser.userId
  ratingStore.submitRating(articleId, userId, userRating.value)
}

const redirectToLogin = () => {
  router.push({ name: 'Login' })
}

const formatDate = (timestamp) => {
  return timestamp === -1 ? 'Never modified' : new Date(timestamp).toLocaleDateString()
}

const fetchArticleData = async () => {
  try {
    article.value = await fetchArticleById(articleId)
  } catch (error) {
    console.error('Error fetching article:', error)
  }
}

// Retrieve data during initial loading
onMounted(fetchArticleData)
</script>

<style scoped>
.rating-container {
  margin: 20px 0;
}
</style>
