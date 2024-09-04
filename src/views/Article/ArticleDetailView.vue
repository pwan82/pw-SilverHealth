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

          <!-- Show average rating -->
          <div class="d-flex justify-content-center align-items-center mb-3">
            <span class="me-2 fw-bold">Rating:</span>
            <span v-if="averageRating !== null" class="me-2 fw-bold">{{ averageRating }}/5</span>
            <Rating v-if="averageRating !== null" v-model="averageRating" disabled :stars="5" />
            <span v-else class="me-2 fw-bold">No rating given</span>
          </div>

          <!-- Render Markdown content -->
          <div v-html="renderedContent"></div>

          <!-- If not logged in, show login button -->
          <div class="text-center mt-4">
            <button v-if="!isLoggedIn" class="btn btn-outline-primary" @click="redirectToLogin">
              Login to rate this article
            </button>

            <!-- Rating input card -->
            <div v-else class="rating-card mt-3 d-flex flex-column align-items-center">
              <p class="fw-bold">Please rate this article:</p>
              <Rating v-model.number="userRating" :stars="5" :cancel="true" />
              <p class="mt-2 text-muted" v-if="!userRatingSubmitted">not submitted</p>
              <p class="mt-2 text-success" v-else>Rating submitted successfully</p>
              <!-- <button class="btn btn-primary mt-3" @click="submitRatingHandler">Submit</button> -->

              <button @click="submitRatingHandler" class="btn mt-2" :class="{
                'btn-primary': userRating !== null,
                'btn-secondary': userRating === null
              }" :disabled="userRating === null">
                Submit
              </button>
            </div>
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
import { fetchArticleById } from '@/services/articleService'
import { useUserStore } from '@/stores/userStore'
import { useRatingStore } from '@/stores/articleRatingStore'
import Rating from 'primevue/rating'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const ratingStore = useRatingStore()

const articleId = Number(route.params.articleId)
const article = ref(null)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userRating = ref(null)
const userRatingSubmitted = ref(false) // Track if rating is submitted

// Fetching rating data from the store
const ratingData = computed(() => ratingStore.getRatingByArticleId(articleId))

const averageRating = computed(() => {
  return ratingData.value ? parseFloat(ratingData.value.averageRating).toFixed(1) : null
})

// Parse the markdown content using MarkdownIt
const md = new MarkdownIt()
const renderedContent = computed(() => (article.value ? md.render(article.value.body) : ''))

// Submit rating handler function
const submitRatingHandler = () => {
  if (!isLoggedIn.value) {
    redirectToLogin()
    return
  }

  const userId = userStore.currentUser.userId
  ratingStore.submitRating(articleId, userId, parseInt(userRating.value))
  // alert('Your rating has been submitted successfully!')
  userRatingSubmitted.value = true // Mark rating as submitted
}

// Redirect to the login page
const redirectToLogin = () => {
  router.push({ name: 'Login', query: { redirect: route.fullPath } })
}

// Format date helper function
const formatDate = (timestamp) => {
  return timestamp === -1 ? 'Never modified' : new Date(timestamp).toLocaleDateString()
}

// Fetch article data on component mount
const fetchArticleData = async () => {
  try {
    article.value = await fetchArticleById(articleId)
    if (!article.value) {
      router.push({ name: 'ArticleNotFound' })
    }
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

.rating-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 5px;
  max-width: 300px;
  margin: 0 auto;
  text-align: center;
}
</style>
