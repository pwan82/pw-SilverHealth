import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/custom-large-button.css'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import DataTable from 'primevue/datatable'
import Column from 'primevue/Column'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})

// app.component('DataTable', DataTable)
// app.component('Column', Column)

app.mount('#app')
