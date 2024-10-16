<template>
  <div class="container mt-5 mb-5">
    <div class="row align-items-center">
      <div class="col-md-8 offset-md-2">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Form content -->
        <div v-else>
          <h1 class="text-center">Update Personal Information</h1>
          <p class="text-center">
            Update your SilverHealth profile information here.<br />
            Fields marked with * are required.
          </p>
          <form @submit.prevent="handleUpdate">
            <div class="row">
              <div class="col-sm-6 offset-sm-3">
                <!-- Username Input -->
                <label for="username" class="form-label mt-3">
                  <div class="fw-bold">Username *</div>
                  <div>Length from 3 to 30 characters.</div>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="formData.username"
                  @blur="() => validateUsername(true)"
                  @input="() => validateUsername(false)"
                  placeholder="Enter username"
                  maxlength="30"
                />
                <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>

                <!-- Gender Selection -->
                <label for="gender" class="form-label mt-3 fw-bold">Gender *</label>
                <select
                  class="form-select"
                  @blur="() => validateGender(true)"
                  v-model="formData.gender"
                >
                  <option value="" disabled>Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>

                <!-- Birthday Input -->
                <label for="birthday" class="form-label mt-3">
                  <div class="fw-bold">Birthday *</div>
                  <div>You should be older than 13.</div>
                </label>
                <input
                  type="date"
                  class="form-control"
                  v-model="formData.birthday"
                  placeholder="Select your birthday"
                  @blur="() => validateBirthday(true)"
                  @input="() => validateBirthday(false)"
                />
                <div v-if="errors.birthday" class="text-danger">{{ errors.birthday }}</div>

                <!-- Address Inputs -->
                <div class="mt-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <label class="form-label mb-0">
                      <span class="fw-bold">Address</span>
                      (Optional)
                    </label>
                    <button type="button" class="btn btn-link p-0" @click="toggleAddressSection">
                      {{ isAddressSectionExpanded ? 'Collapse' : 'Expand' }}
                    </button>
                  </div>
                  <div v-if="isAddressSectionExpanded" class="mt-2">
                    <label for="streetAddress" class="form-label">Street Address</label>
                    <input
                      type="text"
                      id="streetAddress"
                      class="form-control mb-2"
                      v-model="formData.address.streetAddress"
                      placeholder="e.g., 123 Main St"
                      @blur="() => validateAddress(true)"
                      @input="() => validateAddress(false)"
                    />

                    <label for="building" class="form-label">Building (Optional)</label>
                    <input
                      type="text"
                      id="building"
                      class="form-control mb-2"
                      v-model="formData.address.building"
                      placeholder="e.g., Apt 4B"
                      @blur="() => validateAddress(true)"
                      @input="() => validateAddress(false)"
                    />

                    <label for="suburb" class="form-label">Suburb</label>
                    <input
                      type="text"
                      id="suburb"
                      class="form-control mb-2"
                      v-model="formData.address.suburb"
                      placeholder="e.g., Clayton"
                      @blur="() => validateAddress(true)"
                      @input="() => validateAddress(false)"
                    />

                    <label for="state" class="form-label">State</label>
                    <input
                      type="text"
                      id="state"
                      class="form-control mb-2"
                      v-model="formData.address.state"
                      placeholder="2-50 characters, letters only"
                      @blur="() => validateAddress(true)"
                      @input="() => validateAddress(false)"
                    />

                    <label for="postcode" class="form-label">Postcode</label>
                    <input
                      type="text"
                      id="postcode"
                      class="form-control mb-2"
                      v-model="formData.address.postcode"
                      placeholder="4-10 digits"
                      @blur="() => validateAddress(true)"
                      @input="() => validateAddress(false)"
                    />
                  </div>

                  <div v-if="errors.address" class="text-danger">
                    <div v-for="(error, field) in errors.address" :key="field">{{ error }}</div>
                  </div>
                </div>

                <!-- Newsletter Subscription Checkbox -->
                <div class="form-check mt-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="subscribeToNewsletter"
                    v-model="formData.subscribeToNewsletter"
                  />
                  <label class="form-check-label" for="subscribeToNewsletter">
                    Subscribe to our newsletter
                  </label>
                </div>

                <!-- Update Button -->
                <div class="mt-3 d-grid gap-2">
                  <button
                    type="submit"
                    class="btn button-text"
                    :class="{
                      'btn-primary': isFormChanged,
                      'btn-secondary': !isFormChanged
                    }"
                    :disabled="!isFormChanged || isSubmitting"
                  >
                    <i
                      v-if="isSubmitting"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></i>
                    {{ isFormChanged ? 'Update Information' : 'Information Unchanged' }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth } from '@/firebase/init'
import axios from 'axios'
import DOMPurify from 'dompurify'

import {
  validateInputName,
  validateInputBirthday,
  validateInputAddress
} from '@/helpers/inputValidators'

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const formData = ref({
  username: '',
  gender: '',
  birthday: '',
  address: {
    streetAddress: '',
    building: '',
    suburb: '',
    state: '',
    postcode: ''
  }
})

const originalFormData = ref({})

const errors = ref({
  username: null,
  gender: null,
  birthday: null,
  address: {}
})

const isLoading = ref(true)
const isSubmitting = ref(false)

const isAddressSectionExpanded = ref(false)

const toggleAddressSection = () => {
  isAddressSectionExpanded.value = !isAddressSectionExpanded.value
}

// Helper function to sanitize inputs using DOMPurify
const sanitizeInput = (input) => DOMPurify.sanitize(input)

// Fetch user data on component mount
onMounted(async () => {
  try {
    isLoading.value = true

    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      const response = await axios.get('https://getuserinfo-s3vwdaiioq-ts.a.run.app', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userData = response.data
      console.log('userData: ', userData)
      formData.value = {
        username: userData.username || '',
        gender: userData.gender || '',
        birthday: userData.birthday || '',
        address: userData.address || {
          streetAddress: '',
          building: '',
          suburb: '',
          state: '',
          postcode: ''
        },
        subscribeToNewsletter: userData.subscribeToNewsletter || false
      }
      originalFormData.value = JSON.parse(JSON.stringify(formData.value))
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    // Handle error (e.g., show error message to user)
  } finally {
    isLoading.value = false
  }
})

const isFormChanged = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalFormData.value)
})

const handleUpdate = async () => {
  if (!isFormChanged.value) {
    return // Don't submit if no changes were made
  }

  // Sanitize input data
  formData.value.username = sanitizeInput(formData.value.username)
  formData.value.gender = sanitizeInput(formData.value.gender)
  formData.value.birthday = sanitizeInput(formData.value.birthday)
  Object.keys(formData.value.address).forEach((key) => {
    formData.value.address[key] = sanitizeInput(formData.value.address[key])
  })

  validateUsername(true)
  validateGender(true)
  validateBirthday(true)
  validateAddress(true)

  if (
    !errors.value.username &&
    !errors.value.gender &&
    !errors.value.birthday &&
    Object.keys(errors.value.address).length === 0
  ) {
    isSubmitting.value = true

    try {
      const user = auth.currentUser
      if (user) {
        const token = await user.getIdToken(true)
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        }

        const response = await axios.post(
          'https://updateuserinfo-s3vwdaiioq-ts.a.run.app',
          formData.value,
          config
        )
        console.log('User information updated successfully:', response.data)
        // Update originalFormData to reflect the new state
        originalFormData.value = JSON.parse(JSON.stringify(formData.value))
        // Show success message to user
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `User information updated successfully`,
          life: 3000
        })
      }
    } catch (error) {
      console.error('Error updating user information:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      isSubmitting.value = false
    }
  }
}

const validateUsername = (blur) => {
  const username = formData.value.username
  errors.value.username = validateInputName(blur, username).message
}

const validateGender = (blur) => {
  if (!formData.value.gender) {
    errors.value.gender = blur ? 'Gender is required' : null
  } else {
    errors.value.gender = null
  }
}

const validateBirthday = (blur) => {
  const birthday = formData.value.birthday
  errors.value.birthday = validateInputBirthday(blur, birthday).message
}

const validateAddress = (blur) => {
  const address = formData.value.address
  const addressFields = Object.values(address)
  const isAnyFieldFilled = addressFields.some((field) => field.trim() !== '')

  if (isAnyFieldFilled) {
    // If any field is filled, validate all fields
    const validationResult = validateInputAddress(blur, address)
    errors.value.address = validationResult.errors
  } else {
    // If all fields are empty, clear any existing errors
    errors.value.address = {}
  }
}
</script>

<style scoped>
.container {
  max-width: 90%;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}
</style>
