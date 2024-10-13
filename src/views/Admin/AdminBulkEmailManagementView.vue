<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="text-center">Admin Bulk Email Management</h1>
        <p class="text-center">Select the users you want to send bulk emails to.</p>

        <UserList ref="userList" :users="users" :loading="loading" v-model:selectedUsers="selectedUsers" />

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
            </div>
          </div>

          <div class="p-fluid">
            <div class="mb-3 field">
              <h5>Subject</h5>
              <InputText id="subject" v-model="emailSubject" required="true" autofocus placeholder="Enter email subject"
                :disabled="sending" />
            </div>

            <div class="mb-3 field">
              <h5>Content</h5>
              <Editor v-model="emailContent" editorStyle="height: 200px" :disabled="sending" />
            </div>

            <div class="mb-3 field">
              <h5>Attachment</h5>
              <p>Up to 5 files, maximum 10MB each.</p>
              <FileUpload mode="advanced" :multiple="true" :maxFileSize="10000000" @select="onFileSelect"
                @remove="onFileRemove" :auto="true" chooseLabel="Choose Files" :showUploadButton="false"
                :showCancelButton="false" :fileLimit="5" @error="onError" :disabled="sending">
                <template #empty>
                  <p>Drag and drop files here to upload.</p>
                </template>
              </FileUpload>
            </div>
          </div>
          <template #footer>
            <Button @click="sendBulkEmails" :disabled="!selectedUsers.length || sending" :loading="sending">
              <span v-if="sending" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
              <i v-else class="bi bi-send mr-2"></i>
              {{ (sending ? `Sending` : `Send`) + ` to ${selectedUsers.length > 0 ? selectedUsers.length : ''}
              ${selectedUsers.length > 1 ? 'Users' : 'User'}` }}
            </Button>
            <Button label="Cancel" icon="bi bi-x-lg" @click="closeEmailEditor" class="p-button-text"
              :disabled="sending" />
          </template>
        </Dialog>
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
import UserList from '@/components/Admin/UserList.vue'  // Adjust the path as needed

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

const closeEmailEditor = () => {
  displayEmailEditor.value = false
  emailSubject.value = ''
  emailContent.value = ''
}

const onFileSelect = async (event) => {
  const convertedFiles = await convertFilesToBase64(event.files)
  selectedFiles.value = convertedFiles
}

const onFileRemove = (event) => {
  selectedFiles.value = selectedFiles.value.filter((file) => file.name !== event.file.name)
}

const convertFilesToBase64 = async (files) => {
  const convertedFiles = await Promise.all(
    files.map(async (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64Content = e.target.result.split(',')[1]
          resolve({
            name: file.name,
            type: file.type || 'application/octet-stream',
            content: base64Content
          })
        }
        reader.readAsDataURL(file)
      })
    })
  )
  return convertedFiles
}

const onError = (event) => {
  if (event.type === 'max-file-size') {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'File size exceeds 10MB limit',
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