<template>
  <div class="error">
    <div class="container mt-5 mb-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <h1 class="text-center text-primary">{{ title }}</h1>
          <p class="text-center">{{ message }}</p>
          <div
            class="text-center mt-4 d-flex flex-column flex-md-row align-items-center justify-content-center"
          >
            <button @click="goBack" class="btn btn-outline-primary mb-2 mb-md-0 me-md-2">
              {{ goBackButtonText }}
            </button>
            <button @click="goHome" class="btn btn-primary ms-md-2">Go to Homepage</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps({
  title: {
    type: String,
    default: 'Page Not Found'
  },
  message: {
    type: String,
    default: 'Please re-check the url.'
  }
})

const goBackButtonText = props.title === 'Article Not Found' ? 'Go Back to Article List' : 'Go Back'

const goBack = () => {
  if (props.title === 'Article Not Found') {
    router.push('/article')
  } else {
    router.go(-1)
  }
}

const goHome = () => {
  router.push('/')
}
</script>
