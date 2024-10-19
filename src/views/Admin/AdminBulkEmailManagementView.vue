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

        <h1 class="text-center">Admin Bulk Email Management</h1>
        <p class="text-center">Select the users you want to send bulk emails to.</p>

        <UserList
          ref="userList"
          :users="users"
          :loading="loading"
          v-model:selectedUsers="selectedUsers"
        />

        <!-- Send Email Button -->
        <button
          class="btn btn-primary mt-3 button-text"
          @click="openEmailEditor"
          :disabled="!selectedUsers.length"
        >
          <i class="bi bi-envelope-plus mr-2"></i>
          {{
            `Send Email to ${selectedUsers.length > 0 ? selectedUsers.length : ''}
          Selected ${selectedUsers.length > 1 ? 'Users' : 'User'}`
          }}
        </button>

        <!-- Email Editor Dialog -->
        <EmailEditorDialog
          v-model="displayEmailEditor"
          :selectedUsers="selectedUsers"
          :getAuthToken="getAuthToken"
          @emailsSent="handleEmailsSent"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'
import UserList from '@/components/Admin/UserList.vue'
import EmailEditorDialog from '@/components/Admin/EmailEditorDialog.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Component state
const users = ref([])
const selectedUsers = ref([])
const loading = ref(true)
const displayEmailEditor = ref(false)
const toast = useToast()

const userList = ref(null)

// Fetch users data
const fetchUsers = async (token) => {
  try {
    loading.value = true
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
    const response = await axios.get('https://getallusers-s3vwdaiioq-ts.a.run.app', config)
    users.value = response.data

    users.value.forEach((user) => {
      user.email = user.email.toLowerCase()
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users', life: 3000 })
  } finally {
    loading.value = false
  }
}

// Email functions
const openEmailEditor = () => {
  displayEmailEditor.value = true
}

const getAuthToken = async () => {
  return await auth.currentUser.getIdToken()
}

const handleEmailsSent = () => {
  // Handle any post-email sending logic
  userList.value.fetchUsers() // Refreshing the user list
}

// Lifecycle hooks
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken()
      userList.value.fetchUsers = async () => {
        await fetchUsers(token)
      }
      userList.value.fetchUsers()
    } else {
      userList.value.fetchUsers = async () => {
        await fetchUsers(null)
      }
      userList.value.fetchUsers()
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style scoped></style>
