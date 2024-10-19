<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <!-- Go back button -->
        <div class="mb-2">
          <button
            @click="router.push({ name: 'AdminDashboard' })"
            class="btn btn-outline-primary custom-button"
          >
            <i class="bi bi-arrow-left mr-2"></i>
            <div class="button-text">Back to Admin Dashboard</div>
          </button>
        </div>

        <h1 class="text-center">Admin Event Management</h1>
        <p class="text-center">
          Add or edit community events.
          <br />Export event registration records as .CSV file.
        </p>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else>
          <!-- Add Event Button -->
          <div class="d-flex justify-content-center mt-4 mb-4">
            <button @click="openAddModal" class="btn btn-primary custom-button">
              <i class="bi bi-plus-lg mr-2"></i>
              <div class="button-text">Add New Event</div>
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
              <div v-if="!['startTime', 'statusString'].includes(selectedSearchColumn.field)">
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
              <div v-else-if="selectedSearchColumn.field === 'startTime'">
                <DatePicker
                  v-model="dateRange"
                  selectionMode="range"
                  :manualInput="false"
                  @date-select="onDateRangeChange"
                  placeholder="Select date range"
                />
              </div>
              <div v-else>
                <Select
                  v-model="statusFilter"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select status"
                  class="w-100 w-md-auto"
                  @change="onStatusFilterChange"
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
            :value="formattedEvents"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :filters="filters"
            filterDisplay="menu"
            removableSort
            responsive-layout="scroll"
          >
            <Column field="title" header="Title" :sortable="true" filter>
              <template #body="slotProps">
                <router-link
                  class="fw-bold"
                  :to="{ name: 'EventDetail', params: { eventId: slotProps.data.eventId } }"
                >
                  {{ slotProps.data.title }}
                </router-link>
              </template>
            </Column>
            <Column field="category" header="Category" :sortable="true" filter />
            <Column
              field="startTime"
              header="Start Time"
              :sortable="true"
              filter
              filterMatchMode="between"
            >
              <template #body="slotProps">
                {{ formatDate(slotProps.data.startTime) }}
              </template>
            </Column>
            <Column field="address.addressString" header="Location" :sortable="true" filter />
            <Column
              field="statusString"
              header="Status"
              :sortable="true"
              filter
              filterMatchMode="equals"
            />

            <Column field="manage" header="Manage" :sortable="false">
              <template #body="slotProps">
                <div class="manage-buttons-container gap-2">
                  <div v-if="slotProps.data.isLoading" class="loading-overlay">
                    <div class="spinner-border spinner-border-sm text-light" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>

                  <button
                    class="btn btn-sm btn-primary"
                    @click="openEditModal(slotProps.data)"
                    :disabled="slotProps.data.isLoading"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button
                    class="btn btn-sm btn-outline-primary"
                    @click="exportBookings(slotProps.data)"
                    :disabled="slotProps.data.isLoading"
                  >
                    <i class="bi bi-download"></i>
                  </button>

                  <button
                    class="btn btn-sm btn-danger"
                    @click="confirmDelete(slotProps.data)"
                    :disabled="slotProps.data.isLoading"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </template>
            </Column>

            <!-- Empty state template -->
            <template #empty>
              <div class="text-center p-4">
                <template v-if="formattedEvents.length === 0">
                  <i class="bi bi-calendar-x fs-1 text-muted"></i>
                  <p class="mt-3">No available events.</p>
                  <div class="d-flex justify-content-center">
                    <button @click="openAddModal" class="btn btn-primary custom-button">
                      <i class="bi bi-plus-lg mr-2"></i>
                      <div class="button-text">Add New Event</div>
                    </button>
                  </div>
                </template>
                <template v-else>
                  <i class="bi bi-search fs-1 text-muted"></i>
                  <p class="mt-3">No events match your current search criteria.</p>
                  <div class="d-flex justify-content-center">
                    <button
                      @click="clearFilters"
                      class="btn btn-outline-primary custom-button mt-2"
                    >
                      <i class="bi bi-x-lg mr-2"></i>
                      <div class="button-text">Clear Search</div>
                    </button>
                  </div>
                </template>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Event Modal -->
  <EditEventModal
    :event="selectedEvent"
    v-model:show="showEditModal"
    @event-updated="fetchEvents"
    :is-new-event="isNewEvent"
  />

  <!-- Delete Event Confirmation Modal -->
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
          <p>Are you sure to <strong>delete this event</strong>?</p>
          <p>
            <strong>Event:</strong>
            <a :href="'/event/' + eventToDelete?.eventId" target="_blank">
              {{ eventToDelete?.title }}
            </a>
          </p>
          <p><strong>Start Time:</strong> {{ formatDate(eventToDelete?.startTime) }}</p>
          <p><strong>End Time:</strong> {{ formatDate(eventToDelete?.endTime) }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelDelete">Cancel</button>
          <button
            type="button"
            class="btn btn-danger"
            @click="deleteEvent"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'
import { useToast } from 'primevue/usetoast'
import { Modal } from 'bootstrap'
import { useRouter } from 'vue-router'

const router = useRouter()

import EditEventModal from '@/components/Admin/EditEventModal.vue'

const toast = useToast()

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
  { label: 'All status', value: null },
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
      statusString,
      isLoading: false
    }
  })
})

const setEventLoading = (eventId, isLoading) => {
  const index = formattedEvents.value.findIndex((event) => event.eventId === eventId)
  if (index !== -1) {
    formattedEvents.value[index].isLoading = isLoading
  }
}

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

    const response = await axios.get('https://getevents-s3vwdaiioq-ts.a.run.app')
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

const selectedEvent = ref({})
const showEditModal = ref(false)
const isNewEvent = ref(false)

const openEditModal = async (event) => {
  isNewEvent.value = false
  try {
    const response = await axios.get(
      `https://geteventbyid-s3vwdaiioq-ts.a.run.app?id=${event.eventId}`,
      {
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
        }
      }
    )

    selectedEvent.value = response.data
    showEditModal.value = true
  } catch (error) {
    console.error('Error fetching event details:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch event details',
      life: 3000
    })
  }
}

const openAddModal = () => {
  isNewEvent.value = true
  selectedEvent.value = {
    title: 'New Community Event',
    organizerName: 'SilverHealth Team',
    description: '',
    category: [],
    address: {
      placeName: '',
      addressString: '',
      latitude: null,
      longitude: null
    },
    startTime: null,
    endTime: null,
    totalCapacity: null,
    remainingCapacity: null,
    registrationStartTime: null,
    registrationEndTime: null,
    isVisible: true
  }
  showEditModal.value = true
}

const exportBookings = async (event) => {
  try {
    setEventLoading(event.eventId, true)

    const token = await auth.currentUser.getIdToken()
    const response = await axios.get(
      `https://geteventbookings-s3vwdaiioq-ts.a.run.app?eventId=${event.eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'No Records',
        detail: 'There are no booking records for this event.',
        life: 3000
      })
      return
    }

    // Convert JSON to CSV
    const csvContent = convertToCSV(response.data)

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `bookings_${event.eventId}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    toast.add({
      severity: 'success',
      summary: 'Export Successful',
      detail: 'Booking records have been exported successfully.',
      life: 3000
    })
  } catch (error) {
    console.error('Error exporting bookings:', error)
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: 'Failed to export booking records. Please try again.',
      life: 3000
    })
  } finally {
    setEventLoading(event.eventId, false)
  }
}

const convertToCSV = (jsonData) => {
  const items = jsonData
  const replacer = (key, value) => (value === null ? '' : value)
  const header = Object.keys(items[0])
  let csv = items.map((row) =>
    header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
  )
  csv.unshift(header.join(','))
  csv = csv.join('\r\n')
  return csv
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
      if (
        key !== selectedSearchColumn.value.field &&
        key !== 'startTime' &&
        key !== 'statusString'
      ) {
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

const eventToDelete = ref(null)
let deleteConfirmModal = null
const countdownTime = ref(5)
let countdownInterval = null

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

  deleteConfirmModal = new Modal(document.getElementById('deleteConfirmModal'), {
    backdrop: 'static',
    keyboard: false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
  clearInterval(countdownInterval)
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

const confirmDelete = (event) => {
  eventToDelete.value = event
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

const deleteEvent = async () => {
  if (!eventToDelete.value) return

  clearInterval(countdownInterval)

  try {
    setEventLoading(eventToDelete.value.eventId, true)

    const token = await auth.currentUser.getIdToken()
    await axios.post(
      'https://manageevent-s3vwdaiioq-ts.a.run.app',
      {
        eventId: eventToDelete.value.eventId,
        action: 'delete'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    await fetchEvents(token)

    toast.add({
      severity: 'success',
      summary: 'Event Deleted',
      detail: 'The event has been successfully deleted.',
      life: 3000
    })

    deleteConfirmModal.hide()
  } catch (error) {
    console.error('Error deleting event:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: 'Failed to delete the event. Please try again.',
      life: 3000
    })
  } finally {
    setEventLoading(eventToDelete.value.eventId, false)
    eventToDelete.value = null
    countdownTime.value = 5
  }
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

.manage-buttons-container {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.25rem;
  z-index: 1;
}

.manage-buttons-container button {
  position: relative;
  z-index: 0;
}
</style>
