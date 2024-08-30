import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useUserStore } from './stores/userStore'
import { useRatingStore } from './stores/articleRatingStore'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/custom-button.css'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import DataTable from 'primevue/datatable'
import Column from 'primevue/Column'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})

app.component('DataTable', DataTable)
app.component('Column', Column)

app.mount('#app')

// Restore user state from localStorage
const userStore = useUserStore()
userStore.restoreUser()

const articleRatingStore = useRatingStore()
articleRatingStore.restoreRatings()
