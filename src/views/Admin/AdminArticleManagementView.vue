<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">Admin Article Management</h1>
        <p class="text-center">
          Add or edit articles.
          <br />Export article rating records as .CSV file.
        </p>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else>
          <!-- Add Article Button -->
          <div class="d-flex justify-content-center mt-4 mb-4">
            <button @click="openAddModal" class="btn btn-primary custom-button">
              <i class="bi bi-plus-lg mr-2"></i>
              <div class="button-text">Add New Article</div>
            </button>
          </div>

          <!-- Search and filter controls -->
          <div
            class="search-controls d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3"
          >
            <div class="d-flex flex-column flex-md-row mb-2 mb-md-0">
              <div class="mb-2 mb-md-0 me-md-2">
                <Select
                  v-model="selectedSearchColumn"
                  :options="searchColumns"
                  optionLabel="label"
                  placeholder="Select column"
                  class="w-100 w-md-auto"
                  @change="onSearchColumnChange"
                />
              </div>
              <div v-if="selectedSearchColumn.field !== 'averageRating'">
                <span class="p-input-icon-left w-100">
                  <i class="bi bi-search"></i>
                  <InputText
                    v-model="searchValue"
                    placeholder="Keyword Search"
                    @input="onSearchInput"
                    class="w-100"
                  />
                </span>
              </div>
              <div v-else>
                <Select
                  v-model="ratingFilter"
                  :options="ratingOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select min rating"
                  class="w-100 w-md-auto"
                  @change="onRatingFilterChange"
                />
              </div>
            </div>
            <div>
              <button @click="clearFilters" class="btn btn-outline-primary custom-button">
                <i class="bi bi-x-lg mr-2"></i>
                <div class="button-text">Clear Search</div>
              </button>
            </div>
          </div>

          <DataTable
            :value="articles"
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :filters="filters"
            filterDisplay="menu"
            responsiveLayout="scroll"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="onSort"
            removableSort
          >
            <Column
              field="title"
              header="Title"
              sortable
              filter
              filterPlaceholder="Search by title"
            >
              <template #body="slotProps">
                <router-link
                  class="fw-bold"
                  :to="{ name: 'ArticleDetail', params: { articleId: slotProps.data.articleId } }"
                >
                  {{ slotProps.data.title }}
                </router-link>
              </template>
            </Column>

            <Column
              field="category"
              header="Category"
              sortable
              filter
              filterPlaceholder="Search by category"
            >
              <template #body="slotProps">
                {{ slotProps.data.category.join(', ') }}
              </template>
            </Column>

            <Column
              field="averageRating"
              header="Rating"
              sortable
              filter
              filterPlaceholder="Search by rating"
            >
              <template #body="slotProps">
                <div v-if="averageRating(slotProps.data) !== null" class="rating-display">
                  <span class="rating-value">{{ averageRating(slotProps.data).toFixed(1) }}</span>
                  <div class="rating-stars">
                    <Rating
                      :modelValue="parseFloat(averageRating(slotProps.data))"
                      readonly
                      :stars="5"
                    />
                  </div>
                </div>
                <span v-else class="text-muted fst-italic">No rating given</span>
              </template>
            </Column>

            <Column field="manage" header="Manage" :sortable="false">
              <template #body="slotProps">
                <div class="manage-buttons-container gap-2">
                  <button class="btn btn-sm btn-primary" @click="openEditModal(slotProps.data)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-primary"
                    @click="exportRatings(slotProps.data)"
                  >
                    <i class="bi bi-download"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(slotProps.data)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </template>
            </Column>

            <!-- Empty state template -->
            <template #empty>
              <div class="text-center p-4">
                <i class="bi bi-calendar-x fs-1 text-muted"></i>
                <p class="mt-3">No available articles.</p>
                <p class="mt-3">Please contact administrator to add it.</p>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </div>

  <EditArticleModal
    :article="selectedArticle"
    v-model:show="showEditModal"
    @article-updated="fetchArticles"
    :is-new-article="isNewArticle"
  />

  <!-- Delete Article Confirmation Modal -->
  <div
    class="modal fade"
    id="deleteConfirmModal"
    tabindex="-1"
    aria-labelledby="deleteConfirmModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="deleteConfirmModalLabel">Confirm Deletion</h5>
          <button type="button" class="btn-close" @click="cancelDelete" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure to <strong>delete this article</strong>?</p>
          <p>
            <strong>Title:</strong>
            <a :href="'/article/' + articleToDelete?.articleId" target="_blank">
              {{ articleToDelete?.title }}
            </a>
          </p>
          <p><strong>Author:</strong> {{ articleToDelete?.author }}</p>
          <p>
            <strong>Publication Time:</strong> {{ formatDate(articleToDelete?.publicationTime) }}
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelDelete">Cancel</button>
          <button
            type="button"
            class="btn btn-danger"
            @click="deleteArticle"
            :disabled="countdownTime > 0"
          >
            Delete {{ countdownTime !== 0 ? '(' + countdownTime + ')' : '' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { Modal } from 'bootstrap'

import EditArticleModal from '@/components/Admin/EditArticleModal.vue'

const toast = useToast()
const articleToDelete = ref(null)
let deleteConfirmModal = null
const countdownTime = ref(5)
let countdownInterval = null

const articles = ref([])
const searchValue = ref('')
const ratingFilter = ref(null)
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  title: { value: null, matchMode: 'contains' },
  category: { value: null, matchMode: 'contains' },
  averageRating: { value: null, matchMode: 'gte' }
})

const searchColumns = ref([
  { label: 'Search all columns', field: 'global' },
  { label: 'Title', field: 'title' },
  { label: 'Category', field: 'category' },
  { label: 'Rating', field: 'averageRating' }
])

const ratingOptions = [
  { label: 'All ratings', value: null },
  { label: '1 and above', value: 1 },
  { label: '2 and above', value: 2 },
  { label: '3 and above', value: 3 },
  { label: '4 and above', value: 4 },
  { label: '5', value: 5 }
]

const selectedSearchColumn = ref(searchColumns.value[0])

const sortField = ref(null)
const sortOrder = ref(null)

// Add loading state
const loading = ref(true)

const onSearchColumnChange = () => {
  if (selectedSearchColumn.value.field === 'averageRating') {
    // Clear only the rating filter when switching to rating
    filters.value.averageRating.value = null
    ratingFilter.value = null
    // Preserve searchValue for other columns
  } else {
    // Clear all filters except the newly selected one and preserve searchValue
    Object.keys(filters.value).forEach((key) => {
      if (key !== selectedSearchColumn.value.field && key !== 'averageRating') {
        filters.value[key].value = null
      }
    })
    // Set the value for the newly selected filter
    filters.value[selectedSearchColumn.value.field].value = searchValue.value
  }
}

const onSearchInput = () => {
  // Clear all filters except averageRating
  Object.keys(filters.value).forEach((key) => {
    if (key !== 'averageRating') {
      filters.value[key].value = null
    }
  })
  // Set the value for the current selected filter
  filters.value[selectedSearchColumn.value.field].value = searchValue.value
}

const onRatingFilterChange = () => {
  if (ratingFilter.value !== null) {
    filters.value.averageRating.value = ratingFilter.value
    filters.value.averageRating.matchMode = 'gte'
  } else {
    filters.value.averageRating.value = null
    filters.value.averageRating.matchMode = 'gte'
  }
}

const averageRating = (ratingData) => {
  return ratingData.averageRating ? parseFloat(ratingData.averageRating) : null
}

const fetchArticles = async (token) => {
  try {
    // Set loading to true before fetching data
    loading.value = true

    // Setting up the Axios interceptor, adding the Authorization header
    axios.interceptors.request.use(
      (config) => {
        if (token) {
          // console.log(`getIdToken Bearer ${token}`)
          config.headers['Authorization'] = `Bearer ${token}`
          // console.log(`config.headers ${config.headers}`)
        }
        return config
      },
      (error) => {
        console.error(`Error setting up the Axios interceptor ${error}`)
        return Promise.reject(error)
      }
    )

    const response = await axios.get('https://getarticles-s3vwdaiioq-ts.a.run.app')
    articles.value = response.data
  } catch (error) {
    console.error('Error fetching articles:', error)
  } finally {
    // Set loading to false after fetching data, regardless of success or failure
    loading.value = false
  }
}

const onSort = (event) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
}

const clearFilters = () => {
  searchValue.value = ''
  filters.value = {
    global: { value: null, matchMode: 'contains' },
    title: { value: null, matchMode: 'contains' },
    averageRating: { value: null, matchMode: 'contains' },
    category: { value: null, matchMode: 'contains' }
  }
}

// Watch for changes in selectedSearchColumn and clear the other input
watch(selectedSearchColumn, (newValue) => {
  if (newValue.field === 'averageRating') {
    searchValue.value = ''
  } else {
    ratingFilter.value = null
  }
})

// Set up auth state listener
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get the current user's Firebase token
      const token = await user.getIdToken()
      fetchArticles(token)
    } else {
      fetchArticles(null)
    }
  })

  deleteConfirmModal = new Modal(document.getElementById('deleteConfirmModal'), {
    backdrop: 'static',
    keyboard: false
  })
})

// Clean up auth state listener
onUnmounted(() => {
  if (unsubscribe) unsubscribe()

  clearInterval(countdownInterval)
})

const selectedArticle = ref({})
const showEditModal = ref(false)
const isNewArticle = ref(false)

const openEditModal = async (article) => {
  isNewArticle.value = false
  try {
    const response = await axios.get(
      `https://getarticlebyid-s3vwdaiioq-ts.a.run.app?id=${article.articleId}`,
      {
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
        }
      }
    )

    selectedArticle.value = response.data
    showEditModal.value = true
  } catch (error) {
    console.error('Error fetching article details:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch article details',
      life: 3000
    })
  }
}

const openAddModal = () => {
  isNewArticle.value = true
  selectedArticle.value = {
    title: '',
    author: 'SilverHealth Team',
    body: '',
    category: [],
    isRatable: true,
    isVisible: true,
    requireAuth: false,
    showCategory: true,
    showInList: true,
    showMetadata: true,
    publicationTime: new Date().toISOString().slice(0, 16)
  }
  showEditModal.value = true
}

const exportRatings = async (article) => {
  try {
    const token = await auth.currentUser.getIdToken()
    const response = await axios.get(
      `https://getarticleratings-s3vwdaiioq-ts.a.run.app?id=${article.articleId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const ratings = response.data

    // Check if there is a rating record
    if (ratings.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'No Records',
        detail: 'There are no rating/comment records for this article.',
        life: 3000
      })
      return
    }

    // Prepare CSV data
    let csvContent = 'articleId,title,ratingId,userId,publicationTime,rating,comment\n'

    ratings.forEach((rating, index) => {
      const ratingId = `rating_${index + 1}` // Generate a unique ratingId
      const row = [
        article.articleId,
        article.title,
        ratingId,
        rating.userId,
        rating.publicationTime,
        rating.rating,
        `"${rating.comment.replace(/"/g, '""')}"` // Escaping quotes in comments
      ]
      csvContent += row.join(',') + '\n'
    })

    // Create and download CSV files
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `ratings_${article.articleId}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    toast.add({
      severity: 'success',
      summary: 'Export Successful',
      detail: 'Ratings have been exported successfully.',
      life: 3000
    })
  } catch (error) {
    console.error('Error exporting ratings:', error)
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: 'Failed to export ratings. Please try again.',
      life: 3000
    })
  }
}

const formatDate = (value) => {
  if (value) {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return ''
}

const confirmDelete = (article) => {
  articleToDelete.value = article
  countdownTime.value = 5
  startDeleteCountdown()
  deleteConfirmModal.show()
}

const startDeleteCountdown = () => {
  countdownInterval = setInterval(() => {
    countdownTime.value--
    if (countdownTime.value === 0) {
      clearInterval(countdownInterval)
    }
  }, 1000)
}

const cancelDelete = () => {
  clearInterval(countdownInterval)
  countdownTime.value = 5
  deleteConfirmModal.hide()
}

const deleteArticle = async () => {
  if (!articleToDelete.value) return

  clearInterval(countdownInterval)

  try {
    const token = await auth.currentUser.getIdToken()
    await axios.post(
      'https://managearticle-s3vwdaiioq-ts.a.run.app',
      {
        articleId: articleToDelete.value.articleId,
        action: 'delete'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    await fetchArticles(token)

    toast.add({
      severity: 'success',
      summary: 'Article Deleted',
      detail: 'The article has been successfully deleted.',
      life: 3000
    })

    deleteConfirmModal.hide()
  } catch (error) {
    console.error('Error deleting article:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: 'Failed to delete the article. Please try again.',
      life: 3000
    })
  } finally {
    articleToDelete.value = null
    countdownTime.value = 5
  }
}
</script>

<style>
.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.w-100 {
  width: 100%;
}

.manage-buttons-container {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.manage-buttons-container button {
  position: relative;
  z-index: 0;
}
</style>
