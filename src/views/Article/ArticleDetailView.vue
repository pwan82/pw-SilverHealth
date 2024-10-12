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
          <p v-if="article.showMetadata" class="text-center">
            <span>Author: {{ article.author }}</span>
            <span class="mx-2 non-selectable">|</span>

            <span>Published: {{ formatDate(article.publicationTime) }}</span>
            <span class="mx-2 non-selectable">|</span>
            <span>Last modified: {{ formatDate(article.modificationTime) }} </span>
          </p>

          <!-- Categories display -->
          <div
            v-if="article.showCategory && article.category"
            class="d-flex justify-content-center flex-wrap gap-2 mb-3"
          >
            <Chip v-for="category in article.category" :key="category" :label="category" />
          </div>

          <!-- Show average rating -->
          <div
            v-if="article.isRatable"
            class="d-flex justify-content-center align-items-center mb-3"
          >
            <span class="me-2 fw-bold">Rating:</span>
            <span v-if="averageRating(article)" class="me-2 fw-bold"
              >{{ averageRating(article).toFixed(1) }}/5</span
            >
            <Rating
              v-if="averageRating(article)"
              v-model="article.averageRating"
              readonly
              :stars="5"
            />
            <span v-else class="text-muted fst-italic">No rating given</span>
          </div>
          <Divider />
          <!-- Render Markdown content -->
          <div v-html="renderedContent"></div>

          <!-- Rating and Comment Submission -->
          <div v-if="article.isRatable" class="d-flex justify-content-center mt-5 mb-5">
            <div class="text-center" style="width: 100%; max-width: 30rem">
              <button v-if="!isLoggedIn" class="btn btn-outline-primary" @click="redirectToLogin">
                Login to leave a comment
              </button>
              <Card v-else style="max-width: 30rem; overflow: hidden">
                <template #title>Please rate this article</template>
                <template #content>
                  <div class="mt-2 d-flex flex-column align-items-center">
                    <Rating
                      v-model.number="userRating"
                      :stars="5"
                      :cancel="true"
                      :disabled="isSubmitting"
                    />
                    <textarea
                      v-model="userComment"
                      class="form-control mt-3"
                      rows="3"
                      placeholder="Leave your comment (optional)"
                      :disabled="isSubmitting"
                    ></textarea>
                    <p class="mt-2 text-muted fst-italic" v-if="!submissionMessage">not submitted</p>
                    <p
                      class="mt-2"
                      :class="{
                        'text-success': submissionSuccess,
                        'text-danger': !submissionSuccess
                      }"
                      v-else
                    >
                      {{ submissionMessage }}
                    </p>
                  </div>
                </template>
                <template #footer>
                  <button
                    @click="submitRatingAndComment"
                    class="btn"
                    :class="{
                      'btn-primary': userRating !== null,
                      'btn-secondary': userRating === null
                    }"
                    :disabled="userRating === null || isSubmitting"
                  >
                    <span
                      v-if="isSubmitting"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {{ isSubmitting ? 'Submitting...' : 'Submit' }}
                  </button>
                </template>
              </Card>
            </div>
          </div>

          <!-- Ratings and Comments Section -->
          <div v-if="article.isRatable">
            <Divider align="left">
              <h4>Ratings and Comments</h4>
            </Divider>
            <!-- <h4 class="mt-5">Ratings and Comments</h4> -->
            <div v-if="hasComments" class="">
              <DataTable
                :value="ratings"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                sortMode="multiple"
                :loading="ratingsLoading"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink  RowsPerPageDropdown"
                removableSort
              >
                <Column field="rating" header="Rating" sortable>
                  <template #body="slotProps">
                    <Rating v-model="slotProps.data.rating" :cancel="false" disabled />
                  </template>
                </Column>
                <Column field="comment" header="Comment">
                  <template #body="slotProps">
                    <span v-if="slotProps.data.comment && slotProps.data.comment.trim()">{{
                      slotProps.data.comment
                    }}</span>
                    <span v-else class="text-muted fst-italic">No comment provided</span>
                  </template>
                </Column>
                <Column field="publicationTime" header="Publication Time" sortable>
                  <template #body="slotProps">
                    {{ formatDate(slotProps.data.publicationTime) }}
                  </template>
                </Column>
              </DataTable>
            </div>

            <div v-else class="text-start">
              <p class="text-muted">No comments yet. Be the first to comment!</p>
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
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'
import { redirectToLogin as baseRedirectToLogin } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  articleId: {
    type: Number,
    default: null
  }
})

// const articleId = Number(route.params.articleId)
const articleId = props.articleId ?? route.params.articleId

const article = ref(null)
const isLoggedIn = computed(() => authStore.isLoggedIn)
const userRating = ref(null)
const userComment = ref('')
const loading = ref(true)
const ratingsLoading = ref(true)
const ratings = ref([])
const isSubmitting = ref(false)
const submissionMessage = ref('')
const submissionSuccess = ref(false)

const hasComments = computed(() => ratings.value.length > 0)

const averageRating = (article) => {
  return article.averageRating ? article.averageRating : null
}

// Parse the markdown content using MarkdownIt
const md = new MarkdownIt()
const renderedContent = computed(() => (article.value ? md.render(article.value.body) : ''))

// Redirect to the login page
const redirectToLogin = () => {
  baseRedirectToLogin(router, { route })
}

// Format date helper function
const formatDate = (timestamp) => {
  return timestamp === -1
    ? 'Never modified'
    : new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
}

// Fetch article data from API
const fetchArticleData = async (token) => {
  try {
    loading.value = true // Set loading to true before fetching data

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
    console.log('response.data', response.data)
    article.value = response.data
  } catch (error) {
    console.error('Error fetching article:', error)
    router.push({ name: 'ArticleNotFound' })
  } finally {
    loading.value = false // Set loading to false after fetching data, regardless of success or failure
  }
}

// Fetch ratings and comments
const fetchRatings = async (token) => {
  try {
    ratingsLoading.value = true
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
    const response = await axios.get(
      `https://us-central1-silverhealth-87f2a.cloudfunctions.net/getArticleRatings/${articleId}`,
      config
    )
    ratings.value = response.data.map((rating) => ({
      ...rating,
      publicationTime: new Date(rating.publicationTime)
    }))
  } catch (error) {
    console.error('Error fetching ratings:', error)
    ratings.value = []
  } finally {
    ratingsLoading.value = false
  }
}

// Submit rating and comment
const submitRatingAndComment = async () => {
  if (!isLoggedIn.value) {
    redirectToLogin()
    return
  }

  isSubmitting.value = true

  try {
    if (article.value.isRatable) {
      const token = await auth.currentUser.getIdToken()
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const payload = {
        rating: userRating.value,
        comment: userComment.value
      }
      await axios.post(
        `https://us-central1-silverhealth-87f2a.cloudfunctions.net/publishArticleRating/${articleId}`,
        payload,
        config
      )
      submissionMessage.value = 'Submitted successfully!'
      submissionSuccess.value = true
      userRating.value = null
      userComment.value = ''
      // Refresh ratings after submission
      fetchRatings(token)
    }
  } catch (error) {
    console.error('Error submitting rating and comment:', error)
    submissionMessage.value = 'Failed to submit your rating and comment. Please try again.'
    submissionSuccess.value = false
  } finally {
    isSubmitting.value = false
  }
}

// Set up auth state listener
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken()
      fetchArticleData(token)
      fetchRatings(token)
    } else {
      fetchArticleData(null)
      fetchRatings(null)
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
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
</style>
