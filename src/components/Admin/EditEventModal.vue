<template>
  <div
    class="modal fade"
    id="editEventModal"
    tabindex="-1"
    aria-labelledby="editEventModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editEventModalLabel">
            {{ isNewEvent ? 'Add New Event' : 'Edit Event' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEditEvent">
            <div class="mb-3">
              <label for="editTitle" class="form-label fw-bold">Title</label>
              <input
                type="text"
                class="form-control"
                id="editTitle"
                v-model="editEventData.title"
                required
                ref="titleInput"
              />
            </div>
            <div class="mb-3">
              <label for="editOrganizerName" class="form-label fw-bold">Organizer Name</label>
              <input
                type="text"
                class="form-control"
                id="editOrganizerName"
                v-model="editEventData.organizerName"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editDescription" class="form-label fw-bold">Description</label>
              <textarea
                class="form-control"
                id="editDescription"
                v-model="editEventData.description"
                rows="3"
                placeholder="in Markdown format, heading level up to 3 ###"
                required
              ></textarea>
            </div>
            <div class="mb-3">
              <label for="editCategory" class="form-label">
                <span class="fw-bold">Category</span> (separate by commas)</label
              >
              <input
                type="text"
                class="form-control"
                id="editCategory"
                v-model="editEventData.category"
                required
              />
            </div>

            <!-- Address fields -->
            <div class="mb-3">
              <label for="editPlaceName" class="form-label fw-bold">Place Name</label>
              <input
                type="text"
                class="form-control"
                id="editPlaceName"
                v-model="editEventData.address.placeName"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editAddressString" class="form-label fw-bold">Address</label>
              <input
                type="text"
                class="form-control"
                id="editAddressString"
                v-model="editEventData.address.addressString"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editLatitude" class="form-label fw-bold">Latitude</label>
              <input
                type="number"
                step="any"
                class="form-control"
                id="editLatitude"
                v-model.number="editEventData.address.latitude"
                placeholder="between -90 and 90"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editLongitude" class="form-label fw-bold">Longitude</label>
              <input
                type="number"
                step="any"
                class="form-control"
                id="editLongitude"
                v-model.number="editEventData.address.longitude"
                placeholder="between -180 and 180"
                required
              />
            </div>

            <!-- Remaining existing fields -->
            <div class="mb-3">
              <label for="editStartTime" class="form-label fw-bold">Start Time</label>
              <input
                type="datetime-local"
                class="form-control"
                id="editStartTime"
                v-model="editEventData.startTime"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editEndTime" class="form-label fw-bold">End Time</label>
              <input
                type="datetime-local"
                class="form-control"
                id="editEndTime"
                v-model="editEventData.endTime"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editTotalCapacity" class="form-label fw-bold">Total Capacity</label>
              <input
                type="number"
                class="form-control"
                id="editTotalCapacity"
                v-model.number="editEventData.totalCapacity"
                required
                min="1"
              />
            </div>
            <div class="mb-3">
              <label for="editRemainingCapacity" class="form-label fw-bold"
                >Remaining Capacity</label
              >
              <input
                type="number"
                class="form-control"
                id="editRemainingCapacity"
                v-model.number="editEventData.remainingCapacity"
                required
                min="0"
              />
            </div>
            <div class="mb-3">
              <label for="editRegistrationStartTime" class="form-label fw-bold"
                >Registration Start Time</label
              >
              <input
                type="datetime-local"
                class="form-control"
                id="editRegistrationStartTime"
                v-model="editEventData.registrationStartTime"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editRegistrationEndTime" class="form-label fw-bold"
                >Registration End Time</label
              >
              <input
                type="datetime-local"
                class="form-control"
                id="editRegistrationEndTime"
                v-model="editEventData.registrationEndTime"
                required
              />
            </div>
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="editIsVisible"
                v-model="editEventData.isVisible"
              />
              <label class="form-check-label fw-bold" for="editIsVisible"
                >Is visible to users</label
              >
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            type="submit"
            @click="submitEditEvent"
            class="btn"
            :class="{
              'btn-primary': isFormChanged,
              'btn-secondary': !isFormChanged
            }"
            :disabled="!isFormChanged"
          >
            {{ isNewEvent ? 'Add New Event' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Modal } from 'bootstrap'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { auth } from '@/firebase/init'

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  },
  isNewEvent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'event-updated'])

const toast = useToast()
const editEventData = ref({
  title: '',
  organizerName: '',
  description: '',
  category: '',
  startTime: '',
  endTime: '',
  totalCapacity: 50,
  remainingCapacity: 50,
  registrationStartTime: '',
  registrationEndTime: '',
  isVisible: true,
  address: {
    placeName: '',
    addressString: '',
    latitude: 0,
    longitude: 0
  }
})

const originalEventData = ref({})

const isFormChanged = computed(() => {
  return JSON.stringify(editEventData.value) !== JSON.stringify(originalEventData.value)
})

let modalInstance = null

const initializeModal = () => {
  const modalElement = document.getElementById('editEventModal')
  modalInstance = new Modal(modalElement)
  modalElement.addEventListener('hidden.bs.modal', () => {
    emit('update:show', false)
  })
}

const showModal = () => {
  if (modalInstance) {
    modalInstance.show()
  }
}

const closeModal = () => {
  if (modalInstance) {
    modalInstance.hide()
  }
}

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      const eventData = {
        ...props.event,
        startTime: new Date(props.event.startTime).toISOString().slice(0, 16),
        endTime: new Date(props.event.endTime).toISOString().slice(0, 16),
        registrationStartTime: new Date(props.event.registrationStartTime)
          .toISOString()
          .slice(0, 16),
        registrationEndTime: new Date(props.event.registrationEndTime).toISOString().slice(0, 16),
        category: Array.isArray(props.event.category)
          ? props.event.category.join(', ')
          : props.event.category,
        address: {
          ...props.event.address
        }
      }
      editEventData.value = { ...eventData }
      originalEventData.value = { ...eventData }
      showModal()
    } else {
      closeModal()
    }
  }
)

const validateForm = () => {
  if (editEventData.value.totalCapacity < editEventData.value.remainingCapacity) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Total capacity cannot be less than remaining capacity',
      life: 3000
    })
    return false
  }

  if (
    isNaN(editEventData.value.address.latitude) ||
    editEventData.value.address.latitude < -90 ||
    editEventData.value.address.latitude > 90
  ) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Latitude must be between -90 and 90',
      life: 3000
    })
    return false
  }
  if (
    isNaN(editEventData.value.address.longitude) ||
    editEventData.value.address.longitude < -180 ||
    editEventData.value.address.longitude > 180
  ) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Longitude must be between -180 and 180',
      life: 3000
    })
    return false
  }
  return true
}

const submitEditEvent = async () => {
  if (!validateForm()) return

  try {
    const updatedEventData = {
      title: editEventData.value.title,
      organizerName: editEventData.value.organizerName,
      description: editEventData.value.description,
      category: editEventData.value.category.split(',').map((cat) => cat.trim()),
      address: {
        placeName: editEventData.value.address.placeName,
        addressString: editEventData.value.address.addressString,
        latitude: Number(editEventData.value.address.latitude),
        longitude: Number(editEventData.value.address.longitude)
      },
      startTime: new Date(editEventData.value.startTime).getTime(),
      endTime: new Date(editEventData.value.endTime).getTime(),
      totalCapacity: Number(editEventData.value.totalCapacity),
      remainingCapacity: Number(editEventData.value.remainingCapacity),
      registrationStartTime: new Date(editEventData.value.registrationStartTime).getTime(),
      registrationEndTime: new Date(editEventData.value.registrationEndTime).getTime(),
      isVisible: editEventData.value.isVisible
    }

    // Only include eventId if it's not a new event
    if (!props.isNewEvent) {
      updatedEventData.eventId = editEventData.value.eventId
    }

    const response = await axios.post(
      'https://manageevent-s3vwdaiioq-ts.a.run.app',
      updatedEventData,
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
        detail: props.isNewEvent ? 'Event created successfully' : 'Event updated successfully',
        life: 3000
      })
      emit('event-updated')
      closeModal()
    }
  } catch (error) {
    console.error('Error updating event:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data || 'Failed to update/create event',
      life: 3000
    })
  }
}

onMounted(() => {
  initializeModal()
})

onUnmounted(() => {
  if (modalInstance) {
    modalInstance.dispose()
  }
})
</script>
