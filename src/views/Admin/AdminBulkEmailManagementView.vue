<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">Admin Bulk Email Management</h1>
        <p class="text-center">Select the users you want to send bulk emails to.</p>

        <UserList
          ref="userList"
          :users="users"
          :loading="loading"
          v-model:selectedUsers="selectedUsers"
        />

        <!-- Send Email Button -->
        <Button @click="openEmailEditor" :disabled="!selectedUsers.length" class="mt-3">
          <i class="bi bi-envelope-plus mr-2"></i>
          {{
            `Send Email to ${selectedUsers.length > 0 ? selectedUsers.length : ''}
          Selected ${selectedUsers.length > 1 ? 'Users' : 'User'}`
          }}
        </Button>

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
import UserList from '@/components/Admin/UserList.vue' // Adjust the path as needed
import EmailEditorDialog from '@/components/Admin/EmailEditorDialog.vue' // Adjust the path as needed
import Button from 'primevue/button'

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
    const response = await axios.get(
      'https://us-central1-silverhealth-87f2a.cloudfunctions.net/getAllUsers',
      config
    )
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
  // Handle any post-email sending logic, such as refreshing the user list
  userList.value.fetchUsers()
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

<style scoped>
/* You can keep any page-specific styles here */
</style>
