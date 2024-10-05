<template>
  <div class="container mt-5 mb-5">
    <div class="row align-items-center">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">Log In</h1>
        <p class="text-center">
          Welcome to SilverHealth.<br />
          Please log in before visiting restricted pages.
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
                <button type="submit" class="btn btn-primary button-text">Log In</button>
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
                <i class="bi bi-google"></i><span class="button-text">Login with Google</span>
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
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useAuthStore } from '@/stores/authStore'
import * as inputValidators from '@/utils/inputValidators.js'
import DOMPurify from 'dompurify'

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

// Function to handle email-password sign-in
const handleLogin = async () => {
  let filteredEmail = sanitizeInput(formData.value.email).trim()
  let filteredPassword = sanitizeInput(formData.value.password)

  validateEmail(true)
  validatePassword(true)
  if (!errors.value.email && !errors.value.password) {
    try {
      signInWithEmailAndPassword(auth, filteredEmail, filteredPassword)
        .then(async (data) => {
          console.log('Firebase Login Successful!', data.user)
          await authStore.login()

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

// Function to handle Google sign-in
const handleLoginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()

  try {
    // Sign in the user with Google
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log('Google Sign-In Successful!', user)

    const userId = user.uid
    const userDocRef = doc(db, 'users', userId)

    // Check if the user document already exists in Firestore
    const userDoc = await getDoc(userDocRef)

    // If the user does not exist in Firestore, call the addOrUpdateUserInfo Cloud Function
    if (!userDoc.exists()) {
      const functions = getFunctions()
      const addOrUpdateUserInfo = httpsCallable(functions, 'addOrUpdateUserInfo')

      try {
        // Call the addOrUpdateUserInfo Cloud Function to add the user
        await addOrUpdateUserInfo({
          email: user.email,
          username: user.displayName || '',
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

        console.log('New user created in Firestore using addOrUpdateUserInfo.')
      } catch (error) {
        console.error('Error calling addOrUpdateUserInfo:', error.message)
      }
    }

    await authStore.login()

    // Redirect to the previous page or homepage after successful sign-in
    const redirectTo = route.query.redirect || '/'
    router.push(redirectTo)
  } catch (error) {
    console.error('Error during Google sign-in:', error)
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
