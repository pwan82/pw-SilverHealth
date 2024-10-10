<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">Admin Bulk Email Management</h1>
        <p class="text-center">Select the users you want to send bulk emails to.</p>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else>
          <!-- Search and Filter Controls -->
          <div
            class="search-controls d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
            <div class="d-flex flex-column flex-md-row mb-2 mb-md-0">
              <div class="mb-2 mb-md-0 me-md-2">
                <Select v-model="selectedSearchColumn" :options="searchColumns" optionLabel="label"
                  placeholder="Select column" class="w-100 w-md-auto" @change="onSearchColumnChange" />
              </div>

              <div v-if="!['gender', 'role', 'birthday', 'subscribeToNewsletter'].includes(selectedSearchColumn.field)">
                <span class="p-input-icon-left w-100">
                  <i class="bi bi-search"></i>
                  <InputText v-model="searchValue" placeholder="Keyword Search" @input="onSearchInput" class="w-100" />
                </span>
              </div>
              <div v-else-if="selectedSearchColumn.field === 'gender'">
                <Select v-model="genderFilter" :options="genderOptions" optionLabel="label" optionValue="value"
                  placeholder="Select Gender" class="w-100 w-md-auto" @change="onGenderFilterChange" />
              </div>
              <div v-else-if="selectedSearchColumn.field === 'role'">
                <Select v-model="roleFilter" :options="roleOptions" optionLabel="label" optionValue="value"
                  placeholder="Select Role" class="w-100 w-md-auto" @change="onRoleFilterChange" />
              </div>
              <div v-else-if="selectedSearchColumn.field === 'birthday'">
                <DatePicker v-model="birthdayRange" selectionMode="range" :manualInput="false"
                  @date-select="onBirthdayRangeChange" placeholder="Select birthday range" />
              </div>
              <div v-else-if="selectedSearchColumn.field === 'subscribeToNewsletter'">
                <Select v-model="newsletterFilter" :options="newsletterOptions" optionLabel="label" optionValue="value"
                  placeholder="Select Newsletter Status" class="w-100 w-md-auto" @change="onNewsletterFilterChange" />
              </div>
            </div>
            <div>
              <Button type="button" outlined @click="clearFilters" class="w-100 w-md-auto">
                <i class="bi bi-x-lg mr-2"></i>
                Clear Search
              </Button>
            </div>
          </div>

          <!-- User List Table -->
          <DataTable :value="users" v-model:selection="selectedUsers" :paginator="true" :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]" dataKey="userId" :filters="filters" filterDisplay="menu"
            :loading="loading" @sort="onSort" :sortField="sortField" :sortOrder="sortOrder" removableSort>
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="email" header="Email" :sortable="true">
              <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter"
                  placeholder="Search by email" />
              </template>
            </Column>
            <Column field="username" header="Username" :sortable="true">
              <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter"
                  placeholder="Search by username" />
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
                <Select v-model="filterModel.value" :options="roleOptions" placeholder="Select Role"
                  class="p-column-filter" :showClear="true" />
              </template>
            </Column>
            <Column field="birthday" header="Birthday" :sortable="true">
              <template #filter="{ filterModel }">
                <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="Select Birthday"
                  class="p-column-filter" />
              </template>
            </Column>
            <Column field="subscribeToNewsletter" header="Newsletter" :sortable="true">
              <template #body="slotProps">
                {{ slotProps.data.subscribeToNewsletter ? 'Yes' : 'No' }}
              </template>
              <template #filter="{ filterModel }">
                <Select v-model="filterModel.value" :options="newsletterOptions" placeholder="Select Status"
                  class="p-column-filter" :showClear="true" />
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
              <div class="field">
                <label for="attachment">Attachment</label>
                <FileUpload mode="basic" name="attachment" url="./upload" @upload="onUpload" :auto="true"
                  chooseLabel="Choose" />
              </div>
            </div>
            <template #footer>
              <Button label="Send" icon="bi bi-send" @click="sendEmail" :loading="sending" />
              <Button label="Cancel" icon="bi bi-x-lg" @click="closeEmailEditor" class="p-button-text" />
            </template>
          </Dialog>

          <!-- Send Email Button -->
          <Button label="Send Email to Selected Users" icon="bi bi-envelope-plus" @click="openEmailEditor"
            :disabled="!selectedUsers.length" class="mt-3" />
        </div>
      </div>
    </div>
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
const genderFilter = ref(null)
const roleFilter = ref(null)
const birthdayRange = ref(null)
const newsletterFilter = ref(null)
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  email: { value: null, matchMode: 'contains' },
  username: { value: null, matchMode: 'contains' },
  gender: { value: null, matchMode: 'equals' },
  role: { value: null, matchMode: 'equals' },
  birthday: { value: null, matchMode: 'between' },
  subscribeToNewsletter: { value: null, matchMode: 'equals' }
})

const searchColumns = ref([
  { label: 'Search all columns', field: 'global' },
  { label: 'Email', field: 'email' },
  { label: 'Username', field: 'username' },
  { label: 'Gender', field: 'gender' },
  { label: 'Role', field: 'role' },
  { label: 'Birthday', field: 'birthday' },
  { label: 'Newsletter', field: 'subscribeToNewsletter' }
])

const genderOptions = [
  { label: 'All', value: null },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' }
]

const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
]

const newsletterOptions = [
  { label: 'Subscribed', value: true },
  { label: 'Not Subscribed', value: false }
]

const selectedSearchColumn = ref(searchColumns.value[0])

const sortField = ref(null)
const sortOrder = ref(null)

// Filter and search functions
const onSearchColumnChange = () => {
  clearFilters()
}

const onSearchInput = () => {
  Object.keys(filters.value).forEach((key) => {
    if (key !== selectedSearchColumn.value.field) {
      filters.value[key].value = null
    }
  })
  filters.value[selectedSearchColumn.value.field].value = searchValue.value
}

const onGenderFilterChange = () => {
  filters.value.gender.value = genderFilter.value
}

const onRoleFilterChange = () => {
  filters.value.role.value = roleFilter.value
}

const onBirthdayRangeChange = () => {
  if (birthdayRange.value && birthdayRange.value.length === 2) {
    filters.value.birthday.value = birthdayRange.value.map(date => date.toISOString().split('T')[0])
    filters.value.birthday.matchMode = 'between'
  } else {
    filters.value.birthday.value = null
    filters.value.birthday.matchMode = 'between'
  }
}

const onNewsletterFilterChange = () => {
  filters.value.subscribeToNewsletter.value = newsletterFilter.value
}

const clearFilters = () => {
  searchValue.value = ''
  genderFilter.value = null
  roleFilter.value = null
  birthdayRange.value = null
  newsletterFilter.value = null
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

const onUpload = (event) => {
  // Handle file upload logic here
  toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 })
}

// Watch for changes in selectedSearchColumn
watch(selectedSearchColumn, (newValue) => {
  clearFilters()
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