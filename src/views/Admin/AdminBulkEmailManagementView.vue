<template>
  <div class="user-management">
    <h1>User Management</h1>

    <!-- Search and Filter Controls -->
    <div class="p-d-flex p-jc-between p-mb-4">
      <div class="p-d-flex p-ai-center">
        <Select v-model="selectedSearchColumn" :options="searchColumns" optionLabel="label" class="p-mr-2"
          @change="onSearchColumnChange" />
        <InputText v-if="selectedSearchColumn.field !== 'role'" v-model="searchValue" placeholder="Search..."
          @input="onSearchInput" class="p-mr-2" />
        <Select v-else v-model="roleFilter" :options="roleOptions" optionLabel="label" optionValue="value"
          placeholder="Select Role" class="p-mr-2" @change="onRoleFilterChange" />
      </div>
      <Button label="Clear Filters" icon="pi pi-filter-slash" @click="clearFilters" />
    </div>

    <!-- User List Table -->
    <DataTable :value="users" v-model:selection="selectedUsers" :paginator="true" :rows="10" dataKey="userId"
      :filters="filters" filterDisplay="menu" :loading="loading" @sort="onSort" :sortField="sortField"
      :sortOrder="sortOrder">
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="email" header="Email" :sortable="true">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by email" />
        </template>
      </Column>
      <Column field="gender" header="Gender" :sortable="true">
        <template #filter="{ filterModel }">
          <Select v-model="filterModel.value" :options="genderOptions" placeholder="Select Gender"
            class="p-column-filter" :showClear="true" />
        </template>
      </Column>
      <Column field="role" header="Role" :sortable="true">
        <template #filter="{ filterModel }">
          <Select v-model="filterModel.value" :options="roleOptions" placeholder="Select Role" class="p-column-filter"
            :showClear="true" />
        </template>
      </Column>
    </DataTable>

    <!-- Email Editor Dialog -->
    <Dialog v-model:visible="displayEmailEditor" header="Compose Email" :style="{ width: '50vw' }" :modal="true">
      <div class="p-fluid">
        <div class="field">
          <label for="subject">Subject</label>
          <InputText id="subject" v-model="emailSubject" required="true" autofocus />
        </div>
        <div class="field">
          <label for="content">Content</label>
          <Editor v-model="emailContent" editorStyle="height: 320px" />
        </div>
      </div>
      <template #footer>
        <Button label="Send" icon="pi pi-send" @click="sendEmail" :loading="sending" />
        <Button label="Cancel" icon="pi pi-times" @click="closeEmailEditor" class="p-button-text" />
      </template>
    </Dialog>

    <!-- Send Email Button -->
    <Button label="Send Email to Selected Users" icon="pi pi-envelope" @click="openEmailEditor"
      :disabled="!selectedUsers.length" class="mt-3" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'


// Component state
const users = ref([])
const selectedUsers = ref([])
const loading = ref(true)
const displayEmailEditor = ref(false)
const emailSubject = ref('')
const emailContent = ref('')
const sending = ref(false)
const toast = useToast()

// Filter and search state
const searchValue = ref('')
const roleFilter = ref(null)
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  email: { value: null, matchMode: 'contains' },
  gender: { value: null, matchMode: 'equals' },
  role: { value: null, matchMode: 'equals' }
})

const searchColumns = ref([
  { label: 'Search all columns', field: 'global' },
  { label: 'Email', field: 'email' },
  { label: 'Gender', field: 'gender' },
  { label: 'Role', field: 'role' }
])

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
]

const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
]

const selectedSearchColumn = ref(searchColumns.value[0])

const sortField = ref(null)
const sortOrder = ref(null)

// Filter and search functions
const onSearchColumnChange = () => {
  if (selectedSearchColumn.value.field === 'role') {
    filters.value.role.value = null
    roleFilter.value = null
  } else {
    Object.keys(filters.value).forEach((key) => {
      if (key !== selectedSearchColumn.value.field && key !== 'role') {
        filters.value[key].value = null
      }
    })
    filters.value[selectedSearchColumn.value.field].value = searchValue.value
  }
}

const onSearchInput = () => {
  Object.keys(filters.value).forEach((key) => {
    if (key !== 'role') {
      filters.value[key].value = null
    }
  })
  filters.value[selectedSearchColumn.value.field].value = searchValue.value
}

const onRoleFilterChange = () => {
  if (roleFilter.value !== null) {
    filters.value.role.value = roleFilter.value
  } else {
    filters.value.role.value = null
  }
}

const clearFilters = () => {
  searchValue.value = ''
  roleFilter.value = null
  Object.keys(filters.value).forEach((key) => {
    filters.value[key].value = null
  })
}

// Fetch users data
const fetchUsers = async (token) => {
  try {
    loading.value = true
    const config = {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }
    const response = await axios.get(
      'https://us-central1-silverhealth-87f2a.cloudfunctions.net/getAllUsers',
      config
    )
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users', life: 3000 })
  } finally {
    loading.value = false
  }
}

// Sort function
const onSort = (event) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
}

// Email functions
const openEmailEditor = () => {
  displayEmailEditor.value = true
}

const closeEmailEditor = () => {
  displayEmailEditor.value = false
  emailSubject.value = ''
  emailContent.value = ''
}

const sendEmail = async () => {
  // Implement email sending logic here
  sending.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  sending.value = false
  closeEmailEditor()
  toast.add({ severity: 'success', summary: 'Success', detail: 'Emails sent successfully', life: 3000 })
}

// Watch for changes in selectedSearchColumn
watch(selectedSearchColumn, (newValue) => {
  if (newValue.field === 'role') {
    searchValue.value = ''
  } else {
    roleFilter.value = null
  }
})

// Lifecycle hooks
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken()
      fetchUsers(token)
    } else {
      fetchUsers(null)
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style scoped>
.user-management {
  padding: 2rem;
}
</style>