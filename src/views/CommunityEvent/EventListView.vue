<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">Community Events</h1>

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
              <div v-if="!['startTime', 'statusString'].includes(selectedSearchColumn.field)">
                <span class="p-input-icon-left w-100">
                  <i class="bi bi-search"></i>
                  <InputText v-model="searchValue" placeholder="Keyword Search" @input="onSearchInput" class="w-100" />
                </span>
              </div>
              <div v-else-if="selectedSearchColumn.field === 'startTime'">
                <DatePicker v-model="dateRange" selectionMode="range" :manualInput="false"
                  @date-select="onDateRangeChange" placeholder="Select date range" />
              </div>
              <div v-else>
                <Select v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value"
                  placeholder="Select status" class="w-100 w-md-auto" @change="onStatusFilterChange" />
              </div>
            </div>
            <div>
              <Button type="button" outlined @click="clearFilters" class="w-100 w-md-auto">
                <i class="bi bi-x-lg mr-2"></i>
                Clear Search
              </Button>
            </div>
          </div>

          <DataTable :value="formattedEvents" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]"
            :filters="filters" filterDisplay="menu" removableSort responsive-layout="scroll">
            <Column field="title" header="Title" :sortable="true" filter filterPlaceholder="Search by title">
              <template #body="slotProps">
                <router-link class="fw-bold" :to="{ name: 'EventDetail', params: { eventId: slotProps.data.eventId } }">
                  {{ slotProps.data.title }}
                </router-link>
              </template>
            </Column>
            <Column field="category" header="Category" :sortable="true" filter filterPlaceholder="Search by category" />
            <Column field="startTime" header="Start Time" :sortable="true" filter filterMatchMode="between">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.startTime) }}
              </template>
              <template #filter="{ filterModel }">
                <DatePicker v-model="filterModel.value" selectionMode="range" :manualInput="false"
                  @date-select="onColumnDateRangeChange($event, filterModel)" placeholder="Select date range" />
              </template>
            </Column>
            <Column field="address.addressString" header="Address" :sortable="true" filter
              filterPlaceholder="Search by address" />
            <Column field="statusString" header="Status" :sortable="true" :filter="true" filterMatchMode="equals"
              :showFilterMenu="false">
              <template #filter="{ filterModel }">
                <Select v-model="filterModel.value" :options="statusOptions" optionLabel="label" optionValue="value"
                  placeholder="Select Status" class="p-column-filter" :showClear="true">
                  <template #option="slotProps">
                    <span>{{ slotProps.option.label }}</span>
                  </template>
                </Select>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/authStore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'

const communityEvents = ref([])
const loading = ref(false)
const error = ref(null)

const searchValue = ref('')
const dateRange = ref(null)
const statusFilter = ref(null)
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  title: { value: null, matchMode: 'contains' },
  category: { value: null, matchMode: 'contains' },
  'address.addressString': { value: null, matchMode: 'contains' },
  startTime: { value: null, matchMode: 'between' },
  statusString: { value: null, matchMode: 'equals' }
})

const searchColumns = ref([
  { label: 'Search all columns', field: 'global' },
  { label: 'Title', field: 'title' },
  { label: 'Category', field: 'category' },
  { label: 'Address', field: 'address.addressString' },
  { label: 'Start Time', field: 'startTime' },
  { label: 'Status', field: 'statusString' }
])

const statusOptions = [
  { label: 'Open', value: 'Open' },
  { label: 'Closed', value: 'Closed' },
  { label: 'Full', value: 'Full' },
  { label: 'Ended', value: 'Ended' }
]

const selectedSearchColumn = ref(searchColumns.value[0])

const formattedEvents = computed(() => {
  return communityEvents.value.map((event) => {
    const category = event.category.join(', ')

    let statusString = 'Ended' // Default to 'Ended'

    if (!event.isEventEnded) {
      // Event has not ended
      if (!event.isRegistrationOpen) {
        // Registration is closed
        statusString = 'Closed'
      } else if (event.isFullyRegistered) {
        // Event is fully registered
        statusString = 'Full'
      } else {
        // Registration is open
        statusString = 'Open'
      }
    }

    return {
      ...event,
      category,
      statusString
    }
  })
})

const fetchEvents = async (token) => {
  try {
    loading.value = true

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

    const response = await axios.get('https://getevents-s3vwdaiioq-uc.a.run.app')
    communityEvents.value = response.data.map((event) => ({
      ...event,
      startTime: new Date(event.startTime)
    }))

    const currentTime = Date.now()
    communityEvents.value.forEach((communityEvent) => {
      communityEvent.isEventEnded = currentTime > communityEvent.endTime
      communityEvent.isRegistrationOpen =
        currentTime >= communityEvent.registrationStartTime &&
        currentTime <= communityEvent.registrationEndTime &&
        !communityEvent.isEventEnded
      communityEvent.isFullyRegistered = communityEvent.remainingCapacity <= 0
    })
  } catch (err) {
    console.error('Error fetching events:', err)
    error.value = 'Failed to load events. Please try again later.'
  } finally {
    loading.value = false
  }
}

const onSearchColumnChange = () => {
  // Clear all filter values
  searchValue.value = ''
  dateRange.value = null
  statusFilter.value = null

  // Reset all filters
  Object.keys(filters.value).forEach((key) => {
    filters.value[key].value = null
  })

  if (selectedSearchColumn.value.field === 'startTime') {
    filters.value.startTime.value = null
    dateRange.value = null
  } else if (selectedSearchColumn.value.field === 'statusString') {
    filters.value.statusString.value = null
    statusFilter.value = null
  } else {
    Object.keys(filters.value).forEach((key) => {
      if (key !== selectedSearchColumn.value.field && key !== 'startTime' && key !== 'statusString') {
        filters.value[key].value = null
      }
    })
    filters.value[selectedSearchColumn.value.field].value = searchValue.value
  }
}

const onSearchInput = () => {
  Object.keys(filters.value).forEach((key) => {
    if (key !== 'startTime' && key !== 'statusString') {
      filters.value[key].value = null
    }
  })
  filters.value[selectedSearchColumn.value.field].value = searchValue.value
}

const onDateRangeChange = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    filters.value.startTime.value = dateRange.value
    filters.value.startTime.matchMode = 'between'
  } else {
    filters.value.startTime.value = null
    filters.value.startTime.matchMode = 'between'
  }
}

const onColumnDateRangeChange = (event, filterModel) => {
  filterModel.value = event
}

const onStatusFilterChange = () => {
  if (statusFilter.value !== null) {
    filters.value.statusString.value = statusFilter.value
    filters.value.statusString.matchMode = 'equals'
  } else {
    filters.value.statusString.value = null
    filters.value.statusString.matchMode = 'equals'
  }
}

const clearFilters = () => {
  searchValue.value = ''
  dateRange.value = null
  statusFilter.value = null
  filters.value = {
    global: { value: null, matchMode: 'contains' },
    title: { value: null, matchMode: 'contains' },
    category: { value: null, matchMode: 'contains' },
    'address.addressString': { value: null, matchMode: 'contains' },
    startTime: { value: null, matchMode: 'between' },
    statusString: { value: null, matchMode: 'equals' }
  }
}

let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken()
      fetchEvents(token)
    } else {
      fetchEvents(null)
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

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
</script>

<style scoped>
.search-controls {
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .w-md-auto {
    width: auto !important;
  }
}
</style>