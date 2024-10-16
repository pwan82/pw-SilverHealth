<template>
  <div class="container mt-5 mb-5">
    <div class="row align-items-center">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">Sign Up</h1>
        <p class="text-center">
          Join SilverHealth today.<br />
          Fill in the details to create an account.
        </p>
        <form @submit.prevent="handleRegister">
          <div class="row">
            <div class="col-sm-6 offset-sm-3">
              <!-- Email Input -->
              <label for="email" class="form-label mt-3 fw-bold">Email *</label>
              <input
                type="text"
                class="form-control"
                id="email"
                v-model="formData.email"
                @blur="() => validateEmail(true)"
                @input="() => validateEmail(false)"
                placeholder="Enter email"
              />
              <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>

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

              <!-- Password Input -->
              <label for="password" class="form-label mt-3 fw-bold">Password *</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="formData.password"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
                placeholder="Enter password"
              />
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>

              <!-- Confirm Password Input -->
              <label for="confirmPassword" class="form-label mt-3 fw-bold"
                >Confirm Password *</label
              >
              <input
                type="password"
                class="form-control"
                id="confirmPassword"
                v-model="formData.confirmPassword"
                @blur="() => validateConfirmPassword(true)"
                @input="() => validateConfirmPassword(false)"
                placeholder="Confirm password"
              />
              <div v-if="errors.confirmPassword" class="text-danger">
                {{ errors.confirmPassword }}
              </div>

              <!-- Gender Selection -->
              <label for="gender" class="form-label mt-3 fw-bold">Gender *</label>
              <select
                class="form-select"
                @blur="() => validateGender(true)"
                v-model="formData.gender"
              >
                <option value="" disabled selected>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>

              <!-- Birthday Input -->
              <label for="birthday" class="form-label mt-3">
                <div class="fw-bold">Birthday *</div>
                <div>You should be older than 13 to sign up.</div>
              </label>
              <input
                type="date"
                class="form-control"
                v-model="formData.birthday"
                placeholder="Select your birthday"
                @blur="() => validateBirthday(true)"
                @input="() => validateBirthday(false)"
              />
              <!-- :max="maxDate" -->
              <div v-if="errors.birthday" class="text-danger">{{ errors.birthday }}</div>

              <!-- Register Button -->
              <div class="mt-3 d-grid gap-2">
                <button type="submit" class="btn btn-primary button-text" :disabled="isSubmitting">
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Register Now
                </button>
              </div>
            </div>
          </div>
        </form>

        <div class="row mb-3">
          <div class="col-sm-6 offset-sm-3">
            <!-- Login with Google Button -->
            <div class="position-relative my-4">
              <Divider align="center">
                <b>Already have an account?</b>
              </Divider>
            </div>
            <div class="mt-3 d-grid gap-2">
              <router-link :to="{ name: 'Login' }" class="btn btn-outline-primary button-text">
                Back to Login
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import axios from 'axios'
import {
  validateInputEmail,
  validateInputPassword,
  validateInputConfirmPassword,
  validateInputName,
  validateInputBirthday
} from '@/utils/inputValidators'
import DOMPurify from 'dompurify' // Import DOMPurify for sanitizing input

const router = useRouter()

const formData = ref({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  gender: '',
  birthday: '',
  address: {
    streetAddress: '',
    building: '',
    suburb: '',
    state: '',
    postcode: ''
  },
  subscribeToNewsletter: true
})

const errors = ref({
  email: null,
  username: null,
  password: null,
  confirmPassword: null,
  gender: null,
  birthday: null
})

// Helper function to sanitize inputs using DOMPurify
const sanitizeInput = (input) => DOMPurify.sanitize(input)

// Calculate the max date allowed for birthday (13 years ago from today)
const today = new Date()
const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())
  .toISOString()
  .split('T')[0]

const isSubmitting = ref(false)

const handleRegister = () => {
  // Sanitize input data
  formData.value.email = sanitizeInput(formData.value.email)
  formData.value.username = sanitizeInput(formData.value.username)
  formData.value.password = sanitizeInput(formData.value.password)
  formData.value.confirmPassword = sanitizeInput(formData.value.confirmPassword)
  formData.value.gender = sanitizeInput(formData.value.gender)
  formData.value.birthday = sanitizeInput(formData.value.birthday)

  validateEmail(true)
  validateUsername(true)
  validatePassword(true)
  validateConfirmPassword(true)
  validateGender(true)
  validateBirthday(true)

  if (
    !errors.value.email &&
    !errors.value.username &&
    !errors.value.password &&
    !errors.value.confirmPassword &&
    !errors.value.gender &&
    !errors.value.birthday
  ) {
    isSubmitting.value = true

    // Register the user with Firebase Authentication
    const auth = getAuth()
    createUserWithEmailAndPassword(auth, formData.value.email, formData.value.password)
      .then((userCredential) => {
        const user = userCredential.user
        console.log('User registered successfully!', user.uid)

        // Get a fresh token
        return user.getIdToken(true)
      })
      .then((freshToken) => {
        // Prepare the data for updating user information
        const userData = {
          email: formData.value.email,
          username: formData.value.username,
          gender: formData.value.gender,
          birthday: formData.value.birthday,
          address: formData.value.address,
          subscribeToNewsletter: formData.value.subscribeToNewsletter
        }

        const config = {
          headers: { Authorization: `Bearer ${freshToken}` }
        }

        // Call the updateUserInfo API
        return axios.post('https://updateuserinfo-s3vwdaiioq-ts.a.run.app', userData, config)
      })
      .then((response) => {
        console.log('User information updated successfully:', response.data)
        router.push('/') // Redirect after successful registration and data update
      })
      .catch((error) => {
        // Handle errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data)
          errors.value.email = error.response.data
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request)
          errors.value.email = 'No response received from server. Please try again.'
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error:', error.message)
          if (error.code === 'auth/email-already-in-use') {
            errors.value.email = 'This email is already in use. Please try another one.'
          } else if (error.code === 'auth/invalid-email') {
            errors.value.email = 'The email address is not valid.'
          } else {
            errors.value.email = 'An error occurred during registration. Please try again.'
          }
        }
      })
      .finally(() => {
        isSubmitting.value = false
      })
  }
}

const validateEmail = (blur) => {
  const email = formData.value.email
  errors.value.email = validateInputEmail(blur, email).message
}

const validatePassword = (blur) => {
  const password = formData.value.password
  errors.value.password = validateInputPassword(blur, password).message
}

const validateConfirmPassword = (blur) => {
  const password = formData.value.password
  const confirmPassword = formData.value.confirmPassword
  errors.value.confirmPassword = validateInputConfirmPassword(
    blur,
    password,
    confirmPassword
  ).message
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
</script>

<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}
</style>
