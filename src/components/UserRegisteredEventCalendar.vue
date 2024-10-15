<template>
  <div>
    <div ref="calendarEl" class="event-calendar"></div>

    <!-- Bootstrap Modal -->
    <div class="modal fade" id="eventActionModal" tabindex="-1" aria-labelledby="eventActionModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="eventActionModalLabel">Event Actions</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>Event:</strong>
              <a :href="'/event/' + selectedEvent?.eventId" target="_blank">
                {{ selectedEvent?.eventTitle }}
              </a>
            </p>
            <p><strong>Start Time:</strong> {{ formatDate(selectedEvent?.startTime) }}</p>
            <p><strong>End Time:</strong> {{ formatDate(selectedEvent?.endTime) }}</p>
            <p><strong>Booked At:</strong> {{ formatDate(selectedEvent?.bookingTime) }}</p>
            <div class="d-grid gap-2">
              <button class="btn btn-primary custom-button" @click="handleModalAction('downloadPDF')">
                <i class="bi bi-file-earmark-pdf-fill"></i>
                <div class="button-text">Download PDF ticket</div>
              </button>
              <button class="btn btn-outline-primary custom-button" @click="handleModalAction('showQRCode')">
                <i class="bi bi-qr-code"></i>
                <div class="button-text">Show QR Code for entry</div>
              </button>
              <button class="btn btn-danger custom-button" @click="handleModalAction('showCancelConfirmation')"
                :disabled="isEventPast">
                <i class="bi bi-x-circle"></i>
                <div class="button-text">Cancel Registration</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import { Modal } from 'bootstrap'

const props = defineProps({
  events: {
    type: Array,
    required: true
  },
  downloadPDF: {
    type: Function,
    required: true
  },
  showQRCode: {
    type: Function,
    required: true
  },
  showCancelConfirmation: {
    type: Function,
    required: true
  }
})

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

const calendarEl = ref(null)
let calendar = null
let eventActionModal = null

const selectedEvent = ref(null)

const isEventPast = computed(() => {
  if (selectedEvent.value) {
    return new Date(selectedEvent.value.endTime) <= new Date()
  }
  return false
})

onMounted(() => {
  calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: formatEvents(props.events),
    eventClick: handleEventClick,
    eventContent: renderEventContent
  })

  calendar.render()

  // Initialize Bootstrap modal
  eventActionModal = new Modal(document.getElementById('eventActionModal'))
})

onUnmounted(() => {
  if (calendar) {
    calendar.destroy()
  }
})

watch(() => props.events, (newEvents) => {
  if (calendar) {
    calendar.removeAllEvents()
    calendar.addEventSource(formatEvents(newEvents))
  }
}, { deep: true })

const formatEvents = (events) => {
  return events.map(event => ({
    id: event.bookingId,
    title: event.eventTitle,
    start: event.startTime,
    end: event.endTime,
    extendedProps: {
      eventId: event.eventId
    },
    classNames: ['bg-primary', 'text-white', 'border-2', 'rounded']
  }))
}

const handleEventClick = (info) => {
  const event = props.events.find(e => e.bookingId === info.event.id)
  if (event) {
    selectedEvent.value = event
    eventActionModal.show()
  }
}

const handleModalAction = (action) => {
  // eventActionModal.hide()
  if (selectedEvent.value) {
    switch (action) {
      case 'downloadPDF':
        props.downloadPDF(selectedEvent.value)
        break
      case 'showQRCode':
        props.showQRCode(selectedEvent.value)
        break
      case 'showCancelConfirmation':
        if (!isEventPast.value) {
          props.showCancelConfirmation(selectedEvent.value)
        }
        break
    }
  }
}

const renderEventContent = (eventInfo) => {
  const timeEl = document.createElement('small')
  timeEl.classList.add('fc-event-time', 'text-white')
  timeEl.innerText = formatEventTime(eventInfo.event.start, eventInfo.event.end)

  const titleEl = document.createElement('strong')
  titleEl.classList.add('fc-event-title', 'text-white')
  titleEl.innerText = eventInfo.event.title

  const wrapperEl = document.createElement('div')
  wrapperEl.classList.add('d-flex', 'flex-column', 'h-100', 'justify-content-center')
  wrapperEl.appendChild(titleEl)
  wrapperEl.appendChild(timeEl)

  return { domNodes: [wrapperEl] }
}

const formatEventTime = (start, end) => {
  const formatOptions = { hour: 'numeric', minute: '2-digit' }
  return `${start.toLocaleTimeString([], formatOptions)} - ${end.toLocaleTimeString([], formatOptions)}`
}
</script>

<style scoped>
.event-calendar {
  max-width: 1000px;
  max-height: 700px;
  margin-bottom: 2rem;
}

:deep(.fc-button-primary) {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

:deep(.fc-button-primary:hover) {
  background-color: var(--bs-primary-dark);
  border-color: var(--bs-primary-dark);
}

:deep(.fc-daygrid-day.fc-day-today) {
  background-color: var(--bs-light);
}

:deep(.fc-event) {
  cursor: pointer;
}
</style>