<!-- EventDetailView.vue -->
<template>
  <div class="all-events">
    <div class="container mt-5">
      <div class="row">
        <div class="col-12">
          <!-- Loading indicator -->
          <div v-if="loading" class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-else-if="communityEvent">
            <!-- Title -->
            <h1 class="text-center">{{ communityEvent.title }}</h1>
            <p class="text-center">
              <span>
                <strong>Start at:</strong>
                {{ new Date(communityEvent.startTime).toLocaleString() }}
              </span>
              <span class="mx-2 non-selectable">|</span>
              <span> <strong>Organiser:</strong> {{ communityEvent.organizerName }} </span>
            </p>

            <!-- Categories display -->
            <div class="d-flex justify-content-center flex-wrap gap-2 mb-3">
              <Chip v-for="category in communityEvent.category" :key="category" :label="category" />
            </div>

            <Divider />

            <div class="row mt-4">
              <!-- Wrapper div for reordering -->
              <div class="d-flex flex-column flex-md-row">
                <!-- Register Card -->
                <div class="col-md-4 order-1 order-md-2 mb-5">
                  <div class="card mx-auto register-card" style="width: 18rem; margin-left: 0.5rem">
                    <div class="card-body">
                      <h4 class="card-title mt-2">{{ registerCardTitle }}</h4>
                      <div v-if="isRegistrationOpen">
                        <h6 class="card-subtitle mb-2 text-muted">for free</h6>
                      </div>

                      <!-- Show Capacity -->
                      <p v-if="isRegistrationOpen" class="card-text mt-3 mb-4">
                        <strong>Remaning Capacity:</strong> {{ communityEvent.remainingCapacity }}
                        <br />
                        <strong>Total Capacity:</strong> {{ communityEvent.totalCapacity }}
                      </p>

                      <!-- Show registration and ticket -->
                      <div v-if="isUserRegistered" class="text-center mt-3 mb-2">
                        <div class="text-start mb-3">
                          <strong>You registered at: </strong>
                          <br />{{
                          new Date(communityEvent.userBooking.bookingTime).toLocaleString()
                          }}
                        </div>
                        <button class="btn btn-primary custom-button" style="min-width: 100%"
                          @click="generatePDFTicket">
                          <i class="bi bi-file-earmark-pdf-fill mr-2"></i>
                          <div class="button-text">Download PDF ticket</div>
                        </button>
                        <button @click="generateQRCode" class="btn btn-outline-primary mt-2 custom-button"
                          style="min-width: 100%">
                          <i class="bi bi-qr-code mr-2"></i>
                          <div class="button-text">
                            {{ (showQRCode ? 'Hide' : 'Show') + ' QR code for entry' }}
                          </div>
                        </button>

                        <div v-if="showQRCode" class="mt-4">
                          <qrcode-vue :value="qrCodeText" :size="200" level="H" render-as="canvas" />
                        </div>

                        <div v-if="!isEventEnded">
                          <Divider align="center" class="mb-2">Change your mind?</Divider>
                          <a href="#" @click.prevent="handleCancelRegistration" class="text-danger cursor-pointer">
                            Cancel Registration
                          </a>
                        </div>
                      </div>

                      <!-- Registration Button -->
                      <div v-else class="text-center mt-3 mb-2">
                        <button v-if="!isLoggedIn && isRegistrationOpen" class="btn btn-outline-primary custom-button"
                          style="min-width: 100%" @click="redirectToLogin">
                          <div class="button-text">Login to register</div>
                        </button>

                        <button v-else class="btn btn-primary custom-button" :class="{
                            'btn-primary': isRegistrationOpen,
                            'btn-secondary': !isRegistrationOpen
                          }" :disabled="!isRegistrationOpen || isSubmitting" style="min-width: 100%"
                          @click="handleRegisterNewEvent">
                          <i class="mr-2" :class="{
                              'bi bi-person-plus': !isSubmitting,
                              'spinner-border spinner-border-sm': isSubmitting
                            }"></i>
                          <div class="button-text">{{ registerButtonString }}</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Event Details -->
                <div class="col-md-8 order-2 order-md-1 mb-5">
                  <h2 class="mb-2">Schedule</h2>

                  <div class="row align-items-center">
                    <div class="col-auto mt-2 mb-3">
                      <i class="bi bi-clock-history" style="font-size: 24px"></i>
                    </div>
                    <div class="col-auto">
                      <strong>
                        Event lasts:
                        {{ formatTimeDifference(communityEvent.startTime, communityEvent.endTime) }}
                      </strong>
                    </div>
                  </div>

                  <p>
                    <strong>Event Duration: </strong>
                    {{ new Date(communityEvent.startTime).toLocaleString() }}
                    to {{ new Date(communityEvent.endTime).toLocaleString() }}
                  </p>

                  <p>
                    <strong>Registration Period: </strong>
                    {{ new Date(communityEvent.registrationStartTime).toLocaleString() }}
                    to {{ new Date(communityEvent.registrationEndTime).toLocaleString() }}
                  </p>

                  <h2 class="mt-4 mb-2">Location</h2>
                  <div class="row align-items-start">
                    <div class="col-auto mt-2 mb-2">
                      <i class="bi bi-geo-alt-fill" style="font-size: 24px"></i>
                    </div>
                    <div class="col mt-2 mb-2">
                      <div>
                        <strong>{{ communityEvent.address.placeName }}</strong>
                      </div>
                      <div class="text-muted">
                        {{ communityEvent.address.addressString }}
                      </div>

                      <button class="btn btn-outline-primary mt-2" @click="toggleMap">
                        {{ isMapVisible ? 'Hide map' : 'Show map' }}
                      </button>
                    </div>

                    <!-- Hidden Mapbox -->
                    <div v-if="isMapVisible" class="mt-3 mb-3">
                      <div class="card map-card-body">
                        <EventLocationMapbox v-if="communityEvent" :latitude="communityEvent.address.latitude"
                          :longitude="communityEvent.address.longitude" :placeName="communityEvent.address.placeName"
                          :addressString="communityEvent.address.addressString" />
                      </div>
                    </div>
                  </div>
                  <!-- Render Markdown content -->
                  <h2 class="mt-4 mb-3">About this event</h2>
                  <div v-html="renderedContent"></div>

                  <!-- <p>{{ communityEvent }}</p> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Register Confirmation Modal -->
  <div class="modal fade" id="registerConfirmModal" tabindex="-1" aria-labelledby="registerConfirmModalLabel"
    aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="registerConfirmModalLabel">Confirm Registration</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">Are you sure to register for this event?</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="confirmRegister">Confirm</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Cancel Confirmation Modal -->
  <div class="modal fade" id="cancelConfirmModal" tabindex="-1" aria-labelledby="cancelConfirmModalLabel"
    aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="cancelConfirmModalLabel">Confirm Cancellation</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to cancel your registration for this event?</p>
          <p><strong>Event:</strong> {{ communityEvent?.title }}</p>
          <p><strong>Start Time:</strong> {{ formatDate(communityEvent?.startTime) }}</p>
          <p><strong>End Time:</strong> {{ formatDate(communityEvent?.endTime) }}</p>
          <p><strong>Booked At:</strong> {{ formatDate(communityEvent?.bookingTime) }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No, Keep My Registration</button>
          <button type="button" class="btn btn-danger" @click="confirmCancel">Yes, Cancel My Registration</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Conflict Modal -->
  <div class="modal fade" id="conflictModal" tabindex="-1" aria-labelledby="conflictModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="conflictModalLabel">Booking Conflict</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>There is a conflict with an existing registered event:</p>
          <p>
            <strong>Event:</strong>
            <a :href="'/event/' + conflictingBooking.eventId" target="_blank">
              {{ conflictingBooking.eventTitle }}
            </a>
          </p>
          <p><strong>Start Time:</strong> {{ formatDate(conflictingBooking.startTime) }}</p>
          <p><strong>End Time:</strong> {{ formatDate(conflictingBooking.endTime) }}</p>
          <p><strong>Booked At:</strong> {{ formatDate(conflictingBooking.bookingTime) }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <a href="/event/registered" target="_blank" class="btn btn-primary">View All Registered Events</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import MarkdownIt from 'markdown-it'
import QrcodeVue from 'qrcode.vue'
import axios from 'axios'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/authStore'
import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '@/firebase/init'
import { redirectToLogin as baseRedirectToLogin } from '@/utils/helpers'
import EventLocationMapbox from '@/components/EventLocationMapbox.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const props = defineProps({
  eventId: {
    type: String,
    default: null
  }
})

// const eventId = Number(route.params.eventId)
const eventId = props.eventId ?? route.params.eventId

const communityEvent = ref(null)
const isLoggedIn = computed(() => authStore.isLoggedIn)
const loading = ref(true)
const isMapVisible = ref(false)

// Assistance flag values
const isRegistrationOpen = ref(false)
const isEventEnded = ref(true)
const isFullyRegistered = ref(false)
const isUserRegistered = ref(false)

const registerCardTitle = computed(() => {
  if (isEventEnded.value) return 'Event Ended'

  if (!isRegistrationOpen.value) return 'Registration Closed'

  if (isFullyRegistered.value) return 'No Available Capacity'

  if (isUserRegistered.value) return 'You have Registered'

  return 'Open to Register'
})
const registerButtonString = computed(() => {
  if (isEventEnded.value) return 'Ended'

  if (!isRegistrationOpen.value) return 'Closed'

  if (isFullyRegistered.value) return 'No Capacity'

  return 'Register this event'
})

const showQRCode = ref(false)
const qrCodeText = ref('')
const generateQRCode = () => {
  if (showQRCode.value) qrCodeText.value = ''
  else {
    const bookingInfo = communityEvent.value.userBooking
    const partialBookingInfo = {
      bookingId: bookingInfo.bookingId,
      userId: bookingInfo.userId,
      eventId: bookingInfo.eventId
    }
    qrCodeText.value = JSON.stringify(partialBookingInfo)
  }

  showQRCode.value = !showQRCode.value
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const options = {
    dateStyle: 'short',
    timeStyle: 'short'
  }
  const timeString = date.toLocaleString(undefined, options)

  // Calculate GMT offset
  const offsetMinutes = date.getTimezoneOffset()
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60))
  const offsetMinutesRemainder = Math.abs(offsetMinutes % 60)
  const offsetSign = offsetMinutes > 0 ? '-' : '+'
  const offsetString = `GMT ${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutesRemainder.toString().padStart(2, '0')}`

  return `${timeString} (${offsetString})`
}

const generatePDFTicket = () => {
  const doc = new jsPDF()
  let yPos = 20
  const lineHeight = 5

  // Set title
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('EVENT TICKET\n\n' + communityEvent.value.title, 20, yPos)
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
  const eventDetails = [
    ['Organizer', communityEvent.value.organizerName],
    ['Category', communityEvent.value.category.join(', ')],
    ['Venue', communityEvent.value.address.placeName],
    ['Address', communityEvent.value.address.addressString],
    [
      'Event Duration',
      formatTimeDifference(communityEvent.value.startTime, communityEvent.value.endTime)
    ],
    [
      'Start & End Time',
      'From ' +
        formatDate(communityEvent.value.startTime) +
        ' to ' +
        formatDate(communityEvent.value.endTime)
    ],
    ['Total Capacity', communityEvent.value.totalCapacity.toString()]
  ]
  addTable(['Attribute', 'Value'], eventDetails)

  // User Booking Information title
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('User Booking Information', 20, yPos)
  yPos += lineHeight

  // User Booking Information table
  const bookingDetails = [
    ['Your Booking ID', communityEvent.value.userBooking.bookingId],
    ['Your Booking Time', formatDate(communityEvent.value.userBooking.bookingTime)],
    ['Status', communityEvent.value.userBooking.status]
  ]
  addTable(['Attribute', 'Value'], bookingDetails)

  doc.save('Event_Ticket.pdf')
}

const isSubmitting = ref(false)
const submissionMessage = ref('')
const submissionSuccess = ref(false)

// Parse the markdown content using MarkdownIt
const md = new MarkdownIt()
const renderedContent = computed(() =>
  communityEvent.value ? md.render(communityEvent.value.description) : ''
)

// Redirect to the login page
const redirectToLogin = () => {
  baseRedirectToLogin(router, { route })
}

// Fetch communityEvent data from API
const fetchEventData = async (token) => {
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

    const response = await axios.get(`https://geteventbyid-s3vwdaiioq-uc.a.run.app?id=${eventId}`)
    console.log('response.data', response.data)
    communityEvent.value = response.data

    const currentTime = Date.now()
    isEventEnded.value = currentTime > communityEvent.value.endTime

    isRegistrationOpen.value =
      currentTime >= communityEvent.value.registrationStartTime &&
      currentTime <= communityEvent.value.registrationEndTime &&
      !isEventEnded.value

    isFullyRegistered.value = communityEvent.value.remainingCapacity <= 0
    isUserRegistered.value = communityEvent.value && communityEvent.value.userBooking != null
  } catch (error) {
    console.error('Error fetching event:', error)
    router.push({ name: 'EventNotFound' })
  } finally {
    loading.value = false // Set loading to false after fetching data, regardless of success or failure
  }
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

const toggleMap = () => {
  isMapVisible.value = !isMapVisible.value
}

let registerModal = null
let cancelModal = null

const conflictingBooking = ref({})
let conflictModal = null

// Set up auth state listener
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken()
      fetchEventData(token)
    } else {
      fetchEventData(null)
    }
  })
  // Initialize modals
  registerModal = new Modal(document.getElementById('registerConfirmModal'))
  cancelModal = new Modal(document.getElementById('cancelConfirmModal'))
  conflictModal = new Modal(document.getElementById('conflictModal'))
})

// Clean up auth state listener
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const handleRegisterNewEvent = () => {
  if (!communityEvent.value || isUserRegistered.value || !isRegistrationOpen.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Unable to register for this event',
      life: 3000
    })
    return
  }
  registerModal.show()
}

const confirmRegister = async () => {
  registerModal.hide()
  try {
    isSubmitting.value = true

    const response = await axios.post(
      'https://manageeventbooking-s3vwdaiioq-uc.a.run.app',
      {
        eventId: communityEvent.value.eventId,
        action: 'book'
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
        detail: 'Successfully registered for the event',
        life: 3000
      })

      // Fetch updated event data
      const token = await auth.currentUser.getIdToken()
      await fetchEventData(token)
    } else {
      throw new Error('Unexpected response from server')
    }
  } catch (error) {
    console.error('Error registering for event:', error)
    if (error.response && error.response.status === 409) {
      // If a 409 status code is received,
      // store the conflicting booking information in conflictingBooking and display the conflicting modal.
      conflictingBooking.value = error.response.data.conflictingBooking
      conflictModal.show()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data || error.message,
        life: 3000
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleCancelRegistration = () => {
  if (!communityEvent.value || !communityEvent.value.userBooking) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No booking found to cancel',
      life: 3000
    })
    return
  }
  cancelModal.show()
}

const confirmCancel = async () => {
  cancelModal.hide()
  try {
    isSubmitting.value = true

    const response = await axios.post(
      'https://manageeventbooking-s3vwdaiioq-uc.a.run.app',
      {
        eventId: communityEvent.value.eventId,
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

      // Fetch updated event data
      const token = await auth.currentUser.getIdToken()
      await fetchEventData(token)
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
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@media (max-width: 767px) {
  .register-card {
    width: 100% !important;
    max-width: 18rem;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 0;
  }
}

.map-card-body {
  height: 450px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .map-card-body {
    height: 450px;
  }
}
</style>
