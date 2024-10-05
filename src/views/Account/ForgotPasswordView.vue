<template>
  <div class="container mt-5 mb-5">
    <div class="row align-items-center">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">Forgot Password</h1>
        <p class="text-center">
          Enter your email address,<br />
          and we will send you a link to reset your password.
        </p>
        <form @submit.prevent="handleResetPassword">
          <div class="row mb-3">
            <div class="col-sm-6 offset-sm-3">
              <!-- Email Input -->
              <label for="email" class="form-label mt-3 fw-bold">Email</label>
              <input
                type="email"
                class="form-control"
                id="email"
                @blur="() => validateEmail(true)"
                @input="() => validateEmail(false)"
                v-model="email"
                placeholder="Enter email"
              />
              <div v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>
              <div v-if="successMessage" class="text-success mt-2">{{ successMessage }}</div>

              <!-- Submit Button -->
              <div class="mt-3 d-grid gap-2">
                <button type="submit" class="btn btn-primary button-text">Send Reset Link</button>
                <router-link :to="{ name: 'Login' }" class="btn btn-outline-primary button-text">
                  Back to Login
                </router-link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '@/firebase/init'
import { sendPasswordResetEmail } from 'firebase/auth'
import DOMPurify from 'dompurify'
import * as inputValidators from '@/utils/inputValidators.js'

const email = ref('')
const errorMessage = ref(null)
const successMessage = ref(null)
const sanitizeInput = (input) => DOMPurify.sanitize(input)

const handleResetPassword = async () => {
  errorMessage.value = null
  successMessage.value = null

  let filteredEmail = sanitizeInput(email.value.trim())
  validateEmail(true)

  if (!errorMessage.value) {
    try {
      await sendPasswordResetEmail(auth, filteredEmail)
      successMessage.value = 'Password reset link sent to your email!'
    } catch (error) {
      console.error('Error sending reset email:', error)
      // switch (error.code) {
      //   case 'auth/user-not-found':
      //     errorMessage.value = 'No account found with this email.'
      //     break
      //   case 'auth/invalid-email':
      //     errorMessage.value = 'Invalid email address.'
      //     break
      //   default:
      //     errorMessage.value = 'Error occurred. Please try again later.'
      // }
    }
  }
}

const validateEmail = (blur) => {
  errorMessage.value = inputValidators.validateInputEmail(blur, email.value).message
  if (!blur) {
    successMessage.value = null
  }
}
</script>

<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
}
</style>
