<template>
  <div class="container mt-5 mb-5">
    <div class="row align-items-center">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">Log In</h1>
        <p class="text-center">
          Welcome to SilverHealth.<br />
          Log in to access more exciting content.
        </p>
        <form @submit.prevent="handleLogin">
          <div class="row">
            <div class="col-sm-6 offset-sm-3">
              <!-- Email Input -->
              <label for="email" class="form-label mt-3 fw-bold">Email</label>
              <input type="text " class="form-control" id="email" @blur="() => validateEmail(true)"
                @input="() => validateEmail(false)" v-model="formData.email" placeholder="Enter email" />
              <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>

              <!-- Password Input -->
              <label for="password" class="form-label mt-3 fw-bold">Password</label>
              <input type="password" class="form-control" id="password" @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)" v-model="formData.password" placeholder="Enter password" />
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>

              <!-- Login and Register Button -->
              <div class="mt-3 d-grid gap-2">
                <button type="submit" class="btn btn-primary button-text">
                  <i v-if="isLogging" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></i>
                  Log In
                </button>
                <router-link :to="{ name: 'Signup' }" class="btn btn-outline-primary button-text">Sign Up</router-link>
                <div class="mt-1 text-center">
                  <router-link :to="{ name: 'ForgotPassword' }" class="text-muted">
                    Forgot password?
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div class="row mb-3">
          <div class="col-sm-6 offset-sm-3">
            <!-- Login with Google Button -->
            <div class="position-relative my-4">
              <Divider align="center">
                <b>Or</b>
              </Divider>
            </div>
            <div class="mt-3 d-grid gap-2">
              <button @click="handleLoginWithGoogle" class="btn btn-outline-dark custom-button">
                <i v-if="isLoggingWithGoogle" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></i>
                <i v-else class="bi bi-google"></i>
                <div class="button-text">Login with Google</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth, db } from '@/firebase/init'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import {
  validateInputEmail,
  validateInputPassword
} from '@/utils/inputValidators'
import DOMPurify from 'dompurify'

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const authStore = useAuthStore()
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

const isLogging = ref(false)

// Function to handle email-password sign-in
const handleLogin = async () => {
  let filteredEmail = sanitizeInput(formData.value.email).trim()
  let filteredPassword = sanitizeInput(formData.value.password)

  validateEmail(true)
  validatePassword(true)
  if (!errors.value.email && !errors.value.password) {
    try {
      isLogging.value = true

      signInWithEmailAndPassword(auth, filteredEmail, filteredPassword)
        .then(async (data) => {
          console.log('Firebase Login Successful!', data.user)
          await authStore.login()
          toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Welcome to SilverHealth!\n\nYou logged in as: ${filteredEmail.toLowerCase()}`,
            life: 3000
          })

          // redirect to previous page or home page
          const redirectTo = route.query.redirect || '/'
          router.push(redirectTo)
        })
        .catch((error) => {
          console.error(error)
          handleFirebaseError(error)
        })
    } catch (error) {
      console.error('Error during login:', error)
    } finally {
      isLogging.value = false
    }
  }
}

const handleFirebaseError = (error) => {
  // Map Firebase auth errors to user-friendly messages
  switch (error.code) {
    // case 'auth/user-not-found':
    //   errors.value.email = 'Email address not found. Please sign up first.'
    //   break
    // case 'auth/wrong-password':
    //   errors.value.password = 'Incorrect password. Please try again.'
    //   break
    // case 'auth/invalid-email':
    //   errors.value.email = 'The email address is not valid.'
    //   break
    // case 'auth/user-disabled':
    //   errors.value.email = 'This account has been disabled. Please contact support.'
    //   break
    default:
      errors.value.password = 'Incorrect email or password. Please try again.'
  }
}

const isLoggingWithGoogle = ref(false)

// Function to handle Google sign-in
const handleLoginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()

  try {
    isLoggingWithGoogle.value = true

    // Sign in the user with Google
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log('Google Sign-In Successful!', user)

    const userId = user.uid
    const userDocRef = doc(db, 'users', userId)

    // Check if the user document already exists in Firestore
    const userDoc = await getDoc(userDocRef)

    // If the user does not exist in Firestore, call the updateUserInfo API
    if (!userDoc.exists()) {
      try {
        // Get a fresh token
        const token = await user.getIdToken(true)

        // Prepare the user data
        const userData = {
          username: user.displayName || '',
          gender: '',
          birthday: '',
          address: {
            streetAddress: '',
            building: '',
            suburb: '',
            state: '',
            postcode: ''
          },
          subscribeToNewsletter: false
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        }

        // Call the updateUserInfo API
        const response = await axios.post(
          'https://updateuserinfo-s3vwdaiioq-ts.a.run.app',
          userData,
          config
        )

        console.log('New user created in Firestore using updateUserInfo:', response.data)

        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Welcome to SilverHealth!\n\nYou signed up with Google: ${user.email}\n\nPlease go to My Account page to change your personal information.`,
          life: 3000
        })
      } catch (error) {
        console.error('Error calling updateUserInfo:', error.message)
        if (error.response) {
          console.error('Error response:', error.response.data)
        }
      }
    } else {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Welcome to SilverHealth!\nYou logged in with Google: ${user.email}`,
        life: 3000
      })
    }

    await authStore.login()

    // Redirect to the previous page or homepage after successful sign-in
    const redirectTo = route.query.redirect || '/'
    router.push(redirectTo)
  } catch (error) {
    console.error('Error during Google sign-in:', error)
  } finally {
    isLoggingWithGoogle.value = false
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
</script>

<style scoped>
.container {
  max-width: 90%;
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
