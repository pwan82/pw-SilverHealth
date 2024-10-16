<template>
  <Dialog v-model:visible="visible" header="Compose Email" :modal="true">
    <div class="mb-3 field">
      <h5>{{ `Recipients (${selectedUsers.length})` }}</h5>
      <div
        class="p-inputtext p-component p-inputtext-sm"
        style="max-height: 100px; overflow-y: auto; max-width: 700px"
      >
        <Chip v-for="user in selectedUsers" :key="user.userId" :label="user.email" />
      </div>
    </div>

    <div class="p-fluid">
      <div class="mb-3 field">
        <h5>Subject</h5>
        <InputText
          id="subject"
          v-model="subject"
          required="true"
          autofocus
          placeholder="Enter email subject"
          :disabled="sending"
        />
      </div>

      <div class="mb-3 field">
        <h5>Content</h5>
        <Editor v-model="content" editorStyle="height: 200px" :disabled="sending" />
      </div>

      <div class="mb-3 field">
        <h5>Attachment</h5>
        <p>Up to 5 files, maximum 10MB each.</p>
        <FileUpload
          mode="advanced"
          :multiple="true"
          :maxFileSize="10000000"
          @select="onFileSelect"
          @remove="onFileRemove"
          :auto="true"
          chooseLabel="Choose Files"
          :showUploadButton="false"
          :showCancelButton="false"
          :fileLimit="5"
          @error="onError"
          :disabled="sending"
        >
          <template #empty>
            <p>Drag and drop files here to upload.</p>
          </template>
        </FileUpload>
      </div>
    </div>
    <template #footer>
      <Button @click="sendEmails" :disabled="!selectedUsers.length || sending" :loading="sending">
        <span
          v-if="sending"
          class="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
        <i v-else class="bi bi-send mr-2"></i>
        {{
          (sending ? `Sending` : `Send`) +
          ` to ${selectedUsers.length > 0 ? selectedUsers.length : ''}
        ${selectedUsers.length > 1 ? 'Users' : 'User'}`
        }}
      </Button>
      <Button
        label="Cancel"
        icon="bi bi-x-lg"
        @click="closeDialog"
        class="p-button-text"
        :disabled="sending"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  selectedUsers: Array,
  getAuthToken: Function
})

const emit = defineEmits(['update:modelValue', 'emailsSent'])

const toast = useToast()

const visible = ref(props.modelValue)
const subject = ref('')
const content = ref('')
const selectedFiles = ref([])
const sending = ref(false)

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
  }
)

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
  }
})

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

const sendEmails = async () => {
  if (!props.selectedUsers.length || !subject.value || !content.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please fill in all required fields',
      life: 3000
    })
    return
  }

  sending.value = true

  try {
    const token = await props.getAuthToken()
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }

    const payload = {
      emails: props.selectedUsers.map((user) => user.email),
      subject: subject.value,
      content: content.value,
      attachments: selectedFiles.value.map((file) => ({
        content: file.content,
        filename: file.name,
        type: file.type
      }))
    }

    const response = await axios.post(
      'https://sendbulkemails-s3vwdaiioq-ts.a.run.app',
      payload,
      config
    )

    if (response.data && response.data.message === 'Emails sent successfully') {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Successfully sent ${payload.emails.length} emails`,
        life: 3000
      })
      emit('emailsSent')
      closeDialog()
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
  }
}

const closeDialog = () => {
  visible.value = false
}

const resetForm = () => {
  subject.value = ''
  content.value = ''
  selectedFiles.value = []
  sending.value = false
}
</script>

<style scoped>
.email-compose-dialog {
  max-width: 600px;
  margin: 0 auto;
}

.email-compose-dialog .field {
  margin-bottom: 1.5rem;
}

.email-compose-dialog h5 {
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
