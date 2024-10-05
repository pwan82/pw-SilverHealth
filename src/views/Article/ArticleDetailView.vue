<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-10 offset-md-1">
        <!-- Loading indicator -->
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Article content -->
        <div v-else-if="article">
          <!-- Title -->
          <h1 class="text-center">{{ article.title }}</h1>

          <!-- Misc info -->
          <p class="text-center">
            <span>Author: {{ article.author }}</span>
            <span class="mx-2 non-selectable">|</span>

            <span>Published: {{ formatDate(article.publicationTime) }}</span>
            <span class="mx-2 non-selectable">|</span>
            <span>Last modified: {{ formatDate(article.modificationTime) }}
            </span>
          </p>

          <!-- Categories display -->
          <div class="d-flex justify-content-center flex-wrap gap-2 mb-3">
            <Chip v-for="category in article.category" :key="category" :label="category" />
          </div>

          <!-- Show average rating -->
          <div class="d-flex justify-content-center align-items-center mb-3">
            <span class="me-2 fw-bold">Rating:</span>
            <span v-if="averageRating(article)" class="me-2 fw-bold">{{ averageRating(article).toFixed(1)
              }}/5</span>
            <Rating v-if="averageRating(article)" v-model="article.averageRating" disabled :stars="5" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useRatingStore } from '@/stores/articleRatingStore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const ratingStore = useRatingStore()

const articleId = Number(route.params.articleId)
const article = ref(null)
const isLoggedIn = computed(() => authStore.isLoggedIn)
const userRating = ref(null)
const userRatingSubmitted = ref(false)
const loading = ref(true)

const averageRating = (article) => {
  return article.averageRating ? article.averageRating : null
}

// Parse the markdown content using MarkdownIt
const md = new MarkdownIt()
const renderedContent = computed(() => (article.value ? md.render(article.value.body) : ''))

// Submit rating handler function
const submitRatingHandler = () => {
  if (!isLoggedIn.value) {
    redirectToLogin()
    return
  }

  const userId = authStore.currentUser.userId
  ratingStore.submitRating(articleId, userId, parseInt(userRating.value))
  userRatingSubmitted.value = true
}

// Redirect to the login page
const redirectToLogin = () => {
  router.push({ name: 'Login', query: { redirect: route.fullPath } })
}

// Format date helper function
const formatDate = (timestamp) => {
  return timestamp === -1 ? 'Never modified' : new Date(timestamp).toLocaleDateString()
}

// Fetch article data from API
const fetchArticleData = async (token) => {
  try {
    loading.value = true  // Set loading to true before fetching data

    // Setting up the Axios interceptor
    axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        console.error(`Error setting up the Axios interceptor ${error}`)
        return Promise.reject(error)
      }
    )

    const response = await axios.get(
      `https://us-central1-silverhealth-87f2a.cloudfunctions.net/getArticleById/${articleId}`
    )
    article.value = response.data
  } catch (error) {
    console.error('Error fetching article:', error)
    router.push({ name: 'ArticleNotFound' })
  } finally {
    loading.value = false  // Set loading to false after fetching data, regardless of success or failure
  }
}

// Set up auth state listener
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get the current user's Firebase token
      const token = await user.getIdToken()
      fetchArticleData(token)
    } else {
      fetchArticleData(null)
    }
  })
})

// Clean up auth state listener
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
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
