<template>
  <div class="container mt-5 mb-5">
    <div class="row align-items-center">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">Register</h1>
        <p class="text-center">
          Join SilverHealth today. Fill in the details to create an account.
        </p>
        <form @submit.prevent="handleRegister">
          <div class="row mb-3">
            <div class="col-sm-6 offset-sm-3">
              <!-- Email Input -->
              <label for="email" class="form-label mt-3 fw-bold">Email *</label>
              <input type="email" class="form-control" id="email" v-model="formData.email"
                @blur="() => validateEmail(true)" @input="() => validateEmail(false)" placeholder="Enter email" />
              <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>

              <!-- Username Input -->
              <label for="username" class="form-label mt-3 fw-bold">Username *</label>
              <input type="text" class="form-control" id="username" v-model="formData.username"
                @blur="() => validateUsername(true)" @input="() => validateUsername(false)" placeholder="Enter username"
                maxlength="30" />
              <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>

              <!-- Password Input -->
              <label for="password" class="form-label mt-3 fw-bold">Password *</label>
              <input type="password" class="form-control" id="password" v-model="formData.password"
                @blur="() => validatePassword(true)" @input="() => validatePassword(false)"
                placeholder="Enter password" />
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>

              <!-- Confirm Password Input -->
              <label for="confirmPassword" class="form-label mt-3 fw-bold">Confirm Password *</label>
              <input type="password" class="form-control" id="confirmPassword" v-model="formData.confirmPassword"
                @blur="() => validateConfirmPassword(true)" @input="() => validateConfirmPassword(false)"
                placeholder="Confirm password" />
              <div v-if="errors.confirmPassword" class="text-danger">
                {{ errors.confirmPassword }}
              </div>

              <!-- Gender Selection -->
              <label for="gender" class="form-label mt-3 fw-bold">Gender *</label>
              <select class="form-select" @blur="() => validateGender(true)" @input="() => validateGender(false)"
                v-model="formData.gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>

              <!-- Birthday Input -->
              <label for="birthday" class="form-label mt-3 fw-bold">Birthday *</label>
              <input type="date" class="form-control" v-model="formData.birthday" placeholder="Select your birthday"
                @blur="() => validateBirthday(true)" @input="() => validateBirthday(false)" />
              <div v-if="errors.birthday" class="text-danger">{{ errors.birthday }}</div>

              <!-- Register Button -->
              <div class="mt-3 d-grid gap-2">
                <button type="submit" class="btn btn-primary button-text">Register Now</button>
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
import { useRouter } from 'vue-router'
import * as inputValidators from '@/utils/InputValidators.js' // Import validation functions
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
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
  }
})

const errors = ref({
  email: null,
  username: null,
  password: null,
  confirmPassword: null,
  gender: null,
  birthday: null
})

const handleRegister = () => {
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
    // Simulate registration logic
    userStore.register(formData.value)
    alert('Registration successful!')
    router.push({ name: 'Login' })
  }
}

const validateEmail = (blur) => {
  const email = formData.value.email
  errors.value.email = inputValidators.validateInputEmail(blur, email).message
  errors.value.email = inputValidators.validateExistingEmail(blur, email).message
}

const validatePassword = (blur) => {
  const password = formData.value.password
  errors.value.password = inputValidators.validateInputPassword(blur, password).message
}

const validateConfirmPassword = (blur) => {
  const password = formData.value.password
  const confirmPassword = formData.value.confirmPassword
  errors.value.confirmPassword = inputValidators.validateInputConfirmPassword(
    blur,
    password,
    confirmPassword
  ).message
}

const validateUsername = (blur) => {
  const username = formData.value.username
  errors.value.username = inputValidators.validateInputName(blur, username).message
}

const validateGender = (blur) => {
  if (!formData.value.gender) {
    errors.value.gender = blur ? 'Gender is required' : null
  } else {
    errors.value.gender = null
  }
}

const validateBirthday = (blur) => {
  if (!formData.value.birthday) {
    errors.value.birthday = blur ? 'Birthday is required' : null
  } else {
    errors.value.birthday = null
  }
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
