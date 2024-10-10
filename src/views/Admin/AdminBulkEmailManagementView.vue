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

              <div v-if="
                !['gender', 'role', 'birthday', 'subscribeToNewsletter'].includes(
                  selectedSearchColumn.field
                )
              ">
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
            <Column field="email" header="Email" :sortable="true"></Column>
            <Column field="username" header="Username" :sortable="true"></Column>
            <Column field="gender" header="Gender" :sortable="true">
              <template #body="slotProps">
                {{ getGenderLabel(slotProps.data.gender) }}
              </template>
            </Column>
            <Column field="role" header="Role" :sortable="true">
              <template #body="slotProps">
                {{
                  roleOptions.find((option) => option.value === slotProps.data.role)?.label ||
                  'Unknown'
                }}
              </template>
            </Column>
            <Column field="birthday" header="Birthday" :sortable="true"></Column>
            <Column field="subscribeToNewsletter" header="Newsletter" :sortable="true">
              <template #body="slotProps">
                {{
                  newsletterOptions.find(
                    (option) => option.value === slotProps.data.subscribeToNewsletter
                  )?.label || 'Unknown'
                }}
              </template>
            </Column>
          </DataTable>

          <!-- Send Email Button -->
          <Button @click="openEmailEditor" :disabled="!selectedUsers.length" class="mt-3">
            <i class="bi bi-envelope-plus mr-2"></i>
            {{
              `Send Email to ${selectedUsers.length > 0 ? selectedUsers.length : ''}
            Selected ${selectedUsers.length > 1 ? 'Users' : 'User'}`
            }}
          </Button>

          <!-- Email Editor Dialog -->
          <Dialog v-model:visible="displayEmailEditor" header="Compose Email" :modal="true">
            <div class="mb-3 field">
              <h5>Recipients</h5>
              <div class="p-inputtext p-component p-inputtext-sm" style="max-height: 100px; overflow-y: auto">
                <Chip v-for="user in selectedUsers" :key="user.userId" :label="user.email" />
                <!-- removable @remove="removeUser(user)" /> -->
              </div>
            </div>

            <div class="p-fluid">
              <div class="mb-3 field">
                <h5>Subject</h5>
                <InputText id="subject" v-model="emailSubject" required="true" autofocus
                  placeholder="Enter email subject" />
              </div>

              <div class="mb-3 field">
                <h5>Content</h5>
                <Editor v-model="emailContent" editorStyle="height: 200px" />
              </div>

              <div class="mb-3 field">
                <h5>Attachment</h5>
                <p>Up to 5 files, maximum 10MB each.</p>
                <FileUpload mode="advanced" :multiple="true" :maxFileSize="10000000" @select="onFileSelect"
                  @remove="onFileRemove" :auto="true" chooseLabel="Choose Files" :showUploadButton="false"
                  :showCancelButton="false" :fileLimit="5" @error="onError">
                  <template #empty>
                    <p>Drag and drop files here to upload.</p>
                  </template>
                </FileUpload>
              </div>
            </div>
            <template #footer>
              <Button @click="sendBulkEmails" :disabled="!selectedUsers.length" :loading="sending">
                <i class="bi bi-send mr-2"></i>
                {{
                  `Send to ${selectedUsers.length > 0 ? selectedUsers.length : ''}
                ${selectedUsers.length > 1 ? 'Users' : 'User'}`
                }}
              </Button>
              <Button label="Cancel" icon="bi bi-x-lg" @click="closeEmailEditor" class="p-button-text" />
            </template>
          </Dialog>
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
const selectedFiles = ref([])
const sending = ref(false)
const sendingProgress = ref(0)
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

const getGenderLabel = (gender) => {
  if (gender === null || gender.trim() === '') {
    return 'Unknown'
  } else {
    const option = genderOptions.find((option) => option.value === gender)
    return option ? option.label : gender
  }
}

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
    filters.value.birthday.value = birthdayRange.value.map(
      (date) => date.toISOString().split('T')[0]
    )
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
  // emailContent.value = ''
}

const removeUser = (user) => {
  selectedUsers.value = selectedUsers.value.filter((u) => u.email !== user.email)
}

const onFileSelect = async (event) => {
  const convertedFiles = await convertFilesToBase64(event.files);
  selectedFiles.value = convertedFiles;
};

const onFileRemove = (event) => {
  selectedFiles.value = selectedFiles.value.filter((file) => file.name !== event.file.name)
}

const convertFilesToBase64 = async (files) => {
  const convertedFiles = await Promise.all(files.map(async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Content = e.target.result.split(',')[1];
        resolve({
          name: file.name,
          type: file.type || 'application/octet-stream',
          content: base64Content
        });
      };
      reader.readAsDataURL(file);
    });
  }));
  return convertedFiles;
};

const onError = (event) => {
  if (event.type === 'max-file-size') {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'File size exceeds 1MB limit',
      life: 3000
    })
  } else if (event.type === 'max-files') {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Maximum 5 files allowed',
      life: 3000
    })
  }
}

const sendBulkEmails = async () => {
  if (!selectedUsers.value.length || !emailSubject.value || !emailContent.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please fill in all required fields',
      life: 3000
    })
    return
  }

  sending.value = true
  sendingProgress.value = 0

  try {
    const token = await auth.currentUser.getIdToken()
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }

    const payload = {
      emails: selectedUsers.value.map((user) => user.email),
      subject: emailSubject.value,
      content: emailContent.value,
      attachments: selectedFiles.value.map((file) => ({
        content: file.content,
        filename: file.name,
        type: file.type
      }))
    }

    const response = await axios.post(
      'https://sendbulkemails-s3vwdaiioq-uc.a.run.app',
      payload,
      config
    )

    if (response.data && response.data.message === 'Emails sent successfully') {
      console.log('response.data ', response.data)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Sent ${response.data.count} emails successfully`,
        life: 3000
      })
      closeEmailEditor()
    } else {
      throw new Error('Unexpected response from server')
    }
  } catch (error) {
    console.error('Error sending emails:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to send emails. Please try again.',
      life: 3000
    })
  } finally {
    sending.value = false
    sendingProgress.value = 100
  }
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
.email-compose-dialog {
  max-width: 600px;
  margin: 0 auto;
}

.email-compose-dialog .field {
  margin-bottom: 1.5rem;
}

.email-compose-dialog h3 {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.recipients-container {
  max-height: 100px;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.p-chip {
  margin: 2px;
}

:deep(.p-dialog-content) {
  padding-top: 1rem;
}

:deep(.p-inputtext) {
  width: 100%;
}
</style>
