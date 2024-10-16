<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">Admin User Analytics</h1>
        <p class="text-center">
          View information about registered users, or export to JSON for further analysis.
        </p>

        <UserList
          ref="userList"
          :users="users"
          :loading="loading"
          v-model:selectedUsers="selectedUsers"
        />

        <div class="mt-3 d-flex justify-content-start gap-2">
          <button
            class="btn"
            :class="{
              'btn-primary': selectedUsers.length,
              'btn-secondary': !selectedUsers.length
            }"
            @click="exportSelectedUsers"
            :disabled="!selectedUsers.length"
          >
            <i class="bi bi-download mr-2"></i>
            Export Selected Users ({{ selectedUsers.length }})
          </button>
          <button class="btn btn-outline-primary" @click="exportAllUsers" :disabled="!users.length">
            <i class="bi bi-download mr-2"></i>
            Export All Users ({{ users.length }})
          </button>
        </div>
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

// Component state
const users = ref([])
const selectedUsers = ref([])
const loading = ref(true)
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

// Export functions
const exportToJson = (data, filename) => {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const exportSelectedUsers = () => {
  if (selectedUsers.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'No users selected', life: 3000 })
    return
  }
  exportToJson(selectedUsers.value, 'selected_users.json')
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Selected users exported successfully',
    life: 3000
  })
}

const exportAllUsers = () => {
  if (users.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'No users available', life: 3000 })
    return
  }
  exportToJson(users.value, 'all_users.json')
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'All users exported successfully',
    life: 3000
  })
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
.gap-2 {
  gap: 0.5rem;
}
</style>
