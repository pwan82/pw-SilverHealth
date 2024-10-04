<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">SilverHealth Articles</h1>
        <div class="flex justify-between" style="margin: 8px 8px">

          <div class="display: flex">
            <span>
              <!-- <i class="bi bi-search" style="margin-right: 8px" /> -->
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </span>
          </div>
          <Button type="button" label="Clear Search" outlined @click="clearFilters" />
        </div>
        <DataTable :value="articles" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" :filters="filters"
          filterDisplay="menu" :globalFilterFields="['title', 'category', 'averageRating']" responsiveLayout="scroll"
          :sortField="sortField" :sortOrder="sortOrder" @sort="onSort" removableSort>

          <!-- Title Column -->
          <Column field="title" header="Title" sortable filter filterPlaceholder="Search by title">
            <template #body="slotProps">
              <router-link class="fw-bold"
                :to="{ name: 'ArticleDetail', params: { articleId: slotProps.data.articleId } }">
                {{ slotProps.data.title }}
              </router-link>
            </template>
          </Column>

          <!-- Rating Column -->
          <Column field="averageRating" header="Rating" sortable filter filterPlaceholder="Search by rating">
            <template #body="slotProps">
              <div v-if="averageRating(slotProps.data) !== null" class="rating-display">
                <span>{{ averageRating(slotProps.data) }} </span>
                <Rating :value="parseFloat(averageRating(slotProps.data))" readonly :stars="5" />
              </div>
              <span v-else class="me-2">No rating given</span>
            </template>
          </Column>

          <!-- Category Column -->
          <Column field="category" header="Category" sortable filter filterPlaceholder="Search by category">
            <template #body="slotProps">
              {{ slotProps.data.category.join(', ') }}
            </template>
          </Column>

        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'


const articles = ref([])
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  title: { value: null, matchMode: 'contains' },
  averageRating: { value: null, matchMode: 'contains' },
  category: { value: null, matchMode: 'contains' }
})

const sortField = ref(null)
const sortOrder = ref(null)

const averageRating = (ratingData) => {
  return ratingData.averageRating ? parseFloat(ratingData.averageRating).toFixed(1) : null
}

const fetchArticles = async () => {
  try {
    const response = await axios.get('https://us-central1-silverhealth-87f2a.cloudfunctions.net/getArticles')
    articles.value = response.data
  } catch (error) {
    console.error('Error fetching articles:', error)
  }
}

const onSort = (event) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
}

const clearFilters = () => {
  filters.value = {
    global: { value: null, matchMode: 'contains' },
    title: { value: null, matchMode: 'contains' },
    averageRating: { value: null, matchMode: 'contains' },
    category: { value: null, matchMode: 'contains' }
  }
}

onMounted(fetchArticles)
</script>

<style>
.rating-display {
  display: flex;
  align-items: center;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}
</style>