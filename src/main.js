import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/custom-button.css'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Rating from 'primevue/rating'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Divider from 'primevue/divider'
import Chip from 'primevue/chip'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Editor from 'primevue/editor'
import FileUpload from 'primevue/fileupload'
import Toast from 'primevue/toast'

import ToastService from 'primevue/toastservice'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})

app.use(ToastService)

app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Rating', Rating)
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Select', Select)
app.component('DatePicker', DatePicker)
app.component('Divider', Divider)
app.component('Chip', Chip)
app.component('Card', Card)
app.component('Editor', Editor)
app.component('Dialog', Dialog)
app.component('FileUpload', FileUpload)

app.component('Toast', Toast)

app.mount('#app')

// Restore user state from localStorage
// const authStore = useAuthStore()
// userStore.restoreUser()
