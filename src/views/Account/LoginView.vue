<template>
  <div class="container mt-5 mb-5">
    <div class="row align-items-center">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">Login</h1>
        <p class="text-center">
          Welcome to SilverHealth.<br />
          Please log in before visiting restricted pages.
        </p>
        <form @submit.prevent="handleLogin">
          <div class="row mb-3">
            <div class="col-sm-6 offset-sm-3">
              <!-- Email Input -->
              <label for="email" class="form-label mt-3 fw-bold">Email</label>
              <input
                type="text "
                class="form-control"
                id="email"
                @blur="() => validateEmail(true)"
                @input="() => validateEmail(false)"
                v-model="formData.email"
                placeholder="Enter email"
              />
              <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>

              <!-- Password Input -->
              <label for="password" class="form-label mt-3 fw-bold">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
                v-model="formData.password"
                placeholder="Enter password"
              />
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>

              <!-- Login and Register Button -->
              <div class="mt-3 d-grid gap-2">
                <button type="submit" class="btn btn-primary button-text">Log in</button>
                <router-link :to="{ name: 'Register' }" class="btn btn-outline-primary button-text"
                  >Sign up</router-link
                >
              </div>

              <!-- Login with Google Button -->
              <!-- <hr class="border-1 border-secondary " /> -->
              <div class="position-relative my-4">
                <div
                  class="position-absolute top-0 start-50 translate-middle bg-white px-3 text-center divider-background"
                >
                  Or
                </div>
                <hr class="border-1 border-secondary mt-3" />
              </div>
              <div class="mt-3 d-grid gap-2">
                <button type="" class="btn btn-outline-dark custom-button">
                  <i class="bi bi-google"></i><span class="button-text">Login with Google</span>
                </button>
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
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import * as inputValidators from '@/utils/InputValidators.js'
import { validateLogin } from '@/services/authService'
import DOMPurify from 'dompurify'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const formData = ref({
  email: '',
  password: ''
})

const errors = ref({
  email: null,
  password: null
})

const sanitizeInput = (input) => DOMPurify.sanitize(input)
const handleLogin = async () => {
  formData.value.email = sanitizeInput(formData.value.email)
  formData.value.password = sanitizeInput(formData.value.password)

  validateEmail(true)
  validatePassword(true)
  if (!errors.value.email && !errors.value.password) {
    try {
      const user = await validateLogin(formData.value.email.trim(), formData.value.password)
      if (user) {
        const redirectTo = route.query.redirect || '/'

        userStore.login({ ...user, password: undefined }) // Exclude password from user info
        console.log(`Login successful! Email: ${user.email}, Role: ${user.role}`)
        router.push(redirectTo)
      } else {
        console.log(
          `formData.value.email: ${formData.value.email}, formData.value.password: ${formData.value.password}`
        )
        alert('Incorrect email or password!')
      }
    } catch (error) {
      console.error('Error during login:', error)
    }
  }
}

const validateEmail = (blur) => {
  const email = formData.value.email
  errors.value.email = inputValidators.validateInputEmail(blur, email).message
}

const validatePassword = (blur) => {
  const password = formData.value.password
  errors.value.password = inputValidators.validateInputPassword(blur, password).message
}
</script>

<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  /* background-color: #e0bfbf; */
  border-radius: 10px;
}

.divider-background {
  background-color: #f0f0f0;
  padding: 0 10px;
}
</style>
