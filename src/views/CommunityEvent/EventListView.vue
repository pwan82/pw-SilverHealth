<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">Community Events</h1>
        <p class="text-center">List of all community events</p>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <DataTable
          v-else
          :value="formattedEvents"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          removableSort
          responsive-layout="scroll"
        >
          <Column field="title" header="Title" :sortable="true">
            <template #body="slotProps">
              <router-link
                class="fw-bold"
                :to="{ name: 'EventDetail', params: { eventId: slotProps.data.eventId } }"
              >
                {{ slotProps.data.title }}
              </router-link>
            </template>
          </Column>
          <Column field="category" header="Category" :sortable="true" />
          <Column field="startTime" header="Start Time" :sortable="true">
            <template #body="slotProps">
              {{ new Date(slotProps.data.startTime).toLocaleString() }}
            </template>
          </Column>
          <Column field="address.addressString" header="Address" :sortable="true" />
          <Column field="statusString" header="Status" :sortable="true" />
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/authStore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'

const communityEvents = ref([])
const loading = ref(false)
const error = ref(null)

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
    communityEvents.value = response.data

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
</script>
