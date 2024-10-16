<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">My Event Registrations</h1>
        <p class="text-center">Check your events calendar and the list of all registered events.</p>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else>
          <!-- FullCalendar -->
          <div class="row mt-5">
            <div class="event-calendar-container mx-auto">
              <UserRegisteredEventCalendar
                :events="formattedRegistrations"
                :downloadPDF="downloadPDF"
                :showQRCode="showQRCode"
                :showCancelConfirmation="showCancelConfirmation"
              />
            </div>
          </div>

          <!-- Search and filter controls -->
          <div
            class="search-controls d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-2 mb-3"
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
              <div v-if="selectedSearchColumn.field === 'eventTitle'">
                <span class="p-input-icon-left w-100">
                  <i class="bi bi-search"></i>
                  <InputText
                    v-model="searchValue"
                    placeholder="Search Event Title"
                    @input="onSearchInput"
                    class="w-100"
                  />
                </span>
              </div>
              <div
                v-else-if="
                  ['startTime', 'endTime', 'bookingTime'].includes(selectedSearchColumn.field)
                "
              >
                <DatePicker
                  v-model="dateRange"
                  selectionMode="range"
                  :manualInput="false"
                  @date-select="onDateRangeChange"
                  placeholder="Select date range"
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
            :value="formattedRegistrations"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :filters="filters"
            filterDisplay="menu"
            removableSort
            responsive-layout="scroll"
          >
            <Column field="eventTitle" header="Event Title" :sortable="true" filter>
              <template #body="slotProps">
                <router-link
                  class="fw-bold"
                  :to="{ name: 'EventDetail', params: { eventId: slotProps.data.eventId } }"
                >
                  {{ slotProps.data.eventTitle }}
                </router-link>
              </template>
            </Column>
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
            <Column
              field="endTime"
              header="End Time"
              :sortable="true"
              filter
              filterMatchMode="between"
            >
              <template #body="slotProps">
                {{ formatDate(slotProps.data.endTime) }}
              </template>
            </Column>
            <Column field="duration" header="Duration" :sortable="true">
              <template #body="slotProps">
                {{ formatDuration(slotProps.data.duration) }}
              </template>
            </Column>
            <Column
              field="bookingTime"
              header="Booked At"
              :sortable="true"
              filter
              filterMatchMode="between"
            >
              <template #body="slotProps">
                {{ formatDate(slotProps.data.bookingTime) }}
              </template>
            </Column>

            <Column field="manage" header="Manage" :sortable="false">
              <template #body="slotProps">
                <div class="manage-buttons-container gap-3">
                  <div v-if="slotProps.data.isLoading" class="loading-overlay">
                    <div class="spinner-border spinner-border-sm text-light" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  <button
                    class="btn btn-sm btn-primary"
                    @click="downloadPDF(slotProps.data)"
                    :disabled="slotProps.data.isLoading"
                  >
                    <i class="bi bi-file-earmark-pdf-fill"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-primary"
                    @click="showQRCode(slotProps.data)"
                    :disabled="slotProps.data.isLoading"
                  >
                    <i class="bi bi-qr-code"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    @click="showCancelConfirmation(slotProps.data)"
                    :disabled="
                      new Date(slotProps.data.endTime) <= new Date() || slotProps.data.isLoading
                    "
                  >
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </template>
            </Column>

            <!-- Empty state template -->
            clearFilters
            <template #empty>
              <div class="text-center p-4">
                <template v-if="userRegistrations.length === 0">
                  <i class="bi bi-calendar-x fs-1 text-muted"></i>
                  <p class="mt-3">You haven't registered for any events yet.</p>
                  <div class="d-flex justify-content-center">
                    <router-link to="/event" class="btn btn-primary custom-button mt-2">
                      <i class="bi bi-list-task mr-2"></i>
                      <div class="button-text">Browse All Events</div>
                    </router-link>
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

  <!-- QR Code Modal -->
  <div
    class="modal fade"
    id="qrCodeModal"
    tabindex="-1"
    aria-labelledby="qrCodeModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="qrCodeModalLabel">QR Code for Event Entry</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body text-center">
          <qrcode-vue :value="qrCodeText" :size="200" level="H" render-as="canvas" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Cancel Confirmation Modal -->
  <div
    class="modal fade"
    id="cancelConfirmModal"
    tabindex="-1"
    aria-labelledby="cancelConfirmModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="cancelConfirmModalLabel">Confirm Cancellation</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to cancel your registration for this event?</p>
          <p><strong>Event:</strong> {{ selectedEvent?.eventTitle }}</p>
          <p><strong>Start Time:</strong> {{ formatDate(selectedEvent?.startTime) }}</p>
          <p><strong>End Time:</strong> {{ formatDate(selectedEvent?.endTime) }}</p>
          <p><strong>Booked At:</strong> {{ formatDate(selectedEvent?.bookingTime) }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            No, Keep My Registration
          </button>
          <button type="button" class="btn btn-danger" @click="confirmCancel">
            Yes, Cancel My Registration
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Modal } from 'bootstrap'
import QrcodeVue from 'qrcode.vue'
import axios from 'axios'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { useToast } from 'primevue/usetoast'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'

import UserRegisteredEventCalendar from '@/components/UserRegisteredEventCalendar.vue'

const toast = useToast()

const userRegistrations = ref([])
const formattedRegistrations = ref([])
const loading = ref(false)
const error = ref(null)

const searchValue = ref('')
const dateRange = ref(null)
const filters = ref({
  eventTitle: { value: null, matchMode: 'contains' },
  startTime: { value: null, matchMode: 'between' },
  endTime: { value: null, matchMode: 'between' },
  bookingTime: { value: null, matchMode: 'between' }
})

const searchColumns = ref([
  { label: 'Event Title', field: 'eventTitle' },
  { label: 'Start Time', field: 'startTime' },
  { label: 'End Time', field: 'endTime' },
  { label: 'Booked At', field: 'bookingTime' }
])

const selectedSearchColumn = ref(searchColumns.value[0])

const formatRegistrations = (registrations) => {
  return registrations.map((registration) => ({
    ...registration,
    startTime: new Date(registration.startTime),
    endTime: new Date(registration.endTime),
    bookingTime: new Date(registration.bookingTime),
    duration: new Date(registration.endTime) - new Date(registration.startTime),
    isLoading: false
  }))
}

// Watch for changes in userRegistrations and update formattedRegistrations
watch(
  userRegistrations,
  (newRegistrations) => {
    formattedRegistrations.value = formatRegistrations(newRegistrations)
  },
  { deep: true }
)

const setRegistrationLoading = (eventId, isLoading) => {
  const index = formattedRegistrations.value.findIndex((reg) => reg.eventId === eventId)
  if (index !== -1) {
    formattedRegistrations.value[index].isLoading = isLoading
  }
}

const fetchUserRegistrations = async (token) => {
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

    const response = await axios.get('https://getusereventbookings-s3vwdaiioq-ts.a.run.app')
    userRegistrations.value = response.data
  } catch (err) {
    console.error('Error fetching user registrations:', err)
    error.value = 'Failed to load registrations. Please try again later.'
  } finally {
    loading.value = false
  }
}

const onSearchColumnChange = () => {
  searchValue.value = ''
  dateRange.value = null
  Object.keys(filters.value).forEach((key) => {
    filters.value[key].value = null
  })
}

const onSearchInput = () => {
  filters.value.eventTitle.value = searchValue.value
  filters.value.eventTitle.matchMode = 'contains'
}

const onDateRangeChange = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    filters.value[selectedSearchColumn.value.field].value = dateRange.value
    filters.value[selectedSearchColumn.value.field].matchMode = 'between'
  } else {
    filters.value[selectedSearchColumn.value.field].value = null
    filters.value[selectedSearchColumn.value.field].matchMode = 'between'
  }
}

const clearFilters = () => {
  searchValue.value = ''
  dateRange.value = null
  Object.keys(filters.value).forEach((key) => {
    filters.value[key].value = null
  })
}

const qrCodeText = ref('')
const selectedEvent = ref(null)
let qrCodeModal = null
let cancelConfirmModal = null

let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken()
      fetchUserRegistrations(token)
    } else {
      // Handle unauthenticated state
      error.value = 'Please log in to view your registrations.'
    }
  })
  qrCodeModal = new Modal(document.getElementById('qrCodeModal'))

  cancelConfirmModal = new Modal(document.getElementById('cancelConfirmModal'))
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const downloadPDF = async (event) => {
  try {
    setRegistrationLoading(event.eventId, true)

    const response = await axios.get(
      `https://geteventbyid-s3vwdaiioq-ts.a.run.app?id=${event.eventId}`,
      {
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
        }
      }
    )
    const eventDetails = response.data

    const doc = new jsPDF()
    let yPos = 20
    const lineHeight = 5

    // Set title
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('EVENT TICKET\n\n' + eventDetails.title, 20, yPos)
    yPos += lineHeight * 4

    // Function to add a table
    const addTable = (headers, data) => {
      doc.autoTable({
        startY: yPos,
        head: [headers],
        body: data,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [13, 110, 253], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { fontStyle: 'bold' } },
        margin: { left: 20 }
      })
      yPos = doc.lastAutoTable.finalY + 10
    }

    // Event details table
    const eventData = [
      ['Organizer', eventDetails.organizerName],
      ['Category', eventDetails.category.join(', ')],
      ['Venue', eventDetails.address.placeName],
      ['Address', eventDetails.address.addressString],
      ['Event Duration', formatTimeDifference(eventDetails.startTime, eventDetails.endTime)],
      [
        'Start & End Time',
        'From ' + formatDate(eventDetails.startTime) + ' to ' + formatDate(eventDetails.endTime)
      ],
      ['Total Capacity', eventDetails.totalCapacity.toString()]
    ]
    addTable(['Attribute', 'Value'], eventData)

    // User Booking Information title
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('User Booking Information', 20, yPos)
    yPos += lineHeight

    // User Booking Information table
    const bookingData = [
      ['Your Booking ID', event.bookingId],
      ['Your Booking Time', formatDate(event.bookingTime)],
      ['Status', event.status]
    ]
    addTable(['Attribute', 'Value'], bookingData)

    doc.save('Event_Ticket.pdf')
  } catch (error) {
    console.error('Error generating PDF:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate PDF. Please try again.',
      life: 3000
    })
  } finally {
    setRegistrationLoading(event.eventId, false)
  }
}

const showQRCode = (event) => {
  const partialBookingInfo = {
    bookingId: event.bookingId,
    userId: event.userId,
    eventId: event.eventId
  }
  qrCodeText.value = JSON.stringify(partialBookingInfo)
  qrCodeModal.show()
}

const showCancelConfirmation = (event) => {
  selectedEvent.value = event
  cancelConfirmModal.show()
}

const confirmCancel = async () => {
  cancelConfirmModal.hide()
  try {
    setRegistrationLoading(selectedEvent.value.eventId, true)

    const response = await axios.post(
      'https://manageeventbooking-s3vwdaiioq-ts.a.run.app',
      {
        eventId: selectedEvent.value.eventId,
        action: 'cancel'
      },
      {
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
        }
      }
    )

    if (response.status === 200) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Booking cancelled successfully',
        life: 3000
      })
      // Refetch user registrations
      const token = await auth.currentUser.getIdToken()
      await fetchUserRegistrations(token)
    } else {
      throw new Error('Unexpected response from server')
    }
  } catch (error) {
    console.error('Error cancelling registration:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data || error.message,
      life: 3000
    })
  } finally {
    setRegistrationLoading(selectedEvent.value.eventId, false)
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

const formatDuration = (milliseconds) => {
  const hours = Math.floor(milliseconds / 3600000)
  const minutes = Math.floor((milliseconds % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

const formatTimeDifference = (startTimestamp, endTimestamp) => {
  const msDiff = Math.abs(endTimestamp - startTimestamp)
  const units = [
    { label: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { label: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { label: 'day', ms: 1000 * 60 * 60 * 24 },
    { label: 'hour', ms: 1000 * 60 * 60 },
    { label: 'minute', ms: 1000 * 60 }
  ]
  let remainder = msDiff
  const result = []

  for (const unit of units) {
    const value = Math.floor(remainder / unit.ms)
    if (value > 0) {
      result.push(`${value} ${unit.label}${value > 1 ? 's' : ''}`)
      remainder %= unit.ms
    }
  }

  return result.join(' ')
}
</script>

<style scoped>
.event-calendar-container {
  margin-bottom: 2rem;
  max-width: 1000px;
}

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
  min-height: 38px;
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
