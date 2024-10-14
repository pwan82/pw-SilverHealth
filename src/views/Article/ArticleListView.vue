<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">SilverHealth Articles</h1>
        <p class="text-center">
          Check out all the high-quality senior health articles from SilverHealth.
        </p>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else>
          <!-- Search and filter controls -->
          <div
            class="search-controls d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
            <div class="d-flex flex-column flex-md-row mb-2 mb-md-0">
              <div class="mb-2 mb-md-0 me-md-2">
                <Select v-model="selectedSearchColumn" :options="searchColumns" optionLabel="label"
                  placeholder="Select column" class="w-100 w-md-auto" @change="onSearchColumnChange" />
              </div>
              <div v-if="selectedSearchColumn.field !== 'averageRating'">
                <span class="p-input-icon-left w-100">
                  <i class="bi bi-search"></i>
                  <InputText v-model="searchValue" placeholder="Keyword Search" @input="onSearchInput" class="w-100" />
                </span>
              </div>
              <div v-else>
                <Select v-model="ratingFilter" :options="ratingOptions" optionLabel="label" optionValue="value"
                  placeholder="Select min rating" class="w-100 w-md-auto" @change="onRatingFilterChange" />
              </div>
            </div>
            <div>
              <Button type="button" outlined @click="clearFilters" class="w-100 w-md-auto">
                <i class="bi bi-x-lg mr-2"></i>
                Clear Search
              </Button>
            </div>
          </div>

          <DataTable :value="articles" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" :filters="filters"
            filterDisplay="menu" responsiveLayout="scroll" :sortField="sortField" :sortOrder="sortOrder" @sort="onSort"
            removableSort>
            <Column field="title" header="Title" sortable filter filterPlaceholder="Search by title">
              <template #body="slotProps">
                <router-link class="fw-bold"
                  :to="{ name: 'ArticleDetail', params: { articleId: slotProps.data.articleId } }">
                  {{ slotProps.data.title }}
                </router-link>
              </template>
            </Column>

            <Column field="category" header="Category" sortable filter filterPlaceholder="Search by category">
              <template #body="slotProps">
                {{ slotProps.data.category.join(', ') }}
              </template>
            </Column>

            <Column field="averageRating" header="Rating" sortable filter filterPlaceholder="Search by rating">
              <template #body="slotProps">
                <div v-if="averageRating(slotProps.data) !== null" class="rating-display">
                  <span class="rating-value">{{ averageRating(slotProps.data).toFixed(1) }}</span>
                  <div class="rating-stars">
                    <Rating :modelValue="parseFloat(averageRating(slotProps.data))" readonly :stars="5" />
                  </div>
                </div>
                <span v-else class="text-muted fst-italic">No rating given</span>
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
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'
import axios from 'axios'

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

    const response = await axios.get(
      'https://us-central1-silverhealth-87f2a.cloudfunctions.net/getArticles'
    )
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
})

// Clean up auth state listener
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
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
</style>
