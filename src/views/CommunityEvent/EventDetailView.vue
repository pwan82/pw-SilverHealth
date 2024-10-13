<template>
  <div class="all-events">
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <h1 class="text-center">Event Detail</h1>
          <p class="text-center">Detail of an event. Option to register.</p>
          <p>{{ communityEvent }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'
import { redirectToLogin as baseRedirectToLogin } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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

const isSubmitting = ref(false)
const submissionMessage = ref('')
const submissionSuccess = ref(false)

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

    const response = await axios.get(
      `https://geteventbyid-s3vwdaiioq-uc.a.run.app?id=${eventId}`
    )
    console.log('response.data', response.data)
    communityEvent.value = response.data
  } catch (error) {
    console.error('Error fetching event:', error)
    router.push({ name: 'EventNotFound' })
  } finally {
    loading.value = false // Set loading to false after fetching data, regardless of success or failure
  }
}

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
})

// Clean up auth state listener
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
