<template>
  <div>
    <!-- Search and Filter Controls -->
    <div class="search-controls d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
      <div class="d-flex flex-column flex-md-row mb-2 mb-md-0">
        <div class="mb-2 mb-md-0 me-md-2">
          <Select v-model="selectedSearchColumn" :options="searchColumns" optionLabel="label"
            placeholder="Select column" class="w-100 w-md-auto" @change="onSearchColumnChange" />
        </div>

        <div v-if="
            ![
              'gender',
              'role',
              'birthday',
              'subscribeToNewsletter',
              'creationTime',
              'lastSignInTime',
              'lastRefreshTime'
            ].includes(selectedSearchColumn.field)
          ">
          <span class="p-input-icon-left w-100">
            <i class="bi bi-search"></i>
            <InputText v-model="searchValue" placeholder="Keyword Search" @input="onSearchInput" class="w-100" />
          </span>
        </div>
        <div v-else-if="selectedSearchColumn.field === 'gender'">
          <Select v-model="genderFilter" :options="genderOptions" optionLabel="label" optionValue="value"
            placeholder="Select Gender" class="w-100 w-md-auto" @change="onGenderFilterChange" />
        </div>
        <div v-else-if="selectedSearchColumn.field === 'role'">
          <Select v-model="roleFilter" :options="roleOptions" optionLabel="label" optionValue="value"
            placeholder="Select Role" class="w-100 w-md-auto" @change="onRoleFilterChange" />
        </div>
        <div v-else-if="selectedSearchColumn.field === 'birthday'">
          <DatePicker v-model="birthdayRange" selectionMode="range" :manualInput="true"
            @date-select="onBirthdayRangeChange" placeholder="Select birthday range" class="w-100 w-md-auto" />
        </div>
        <div v-else-if="selectedSearchColumn.field === 'subscribeToNewsletter'">
          <Select v-model="newsletterFilter" :options="newsletterOptions" optionLabel="label" optionValue="value"
            placeholder="Select Newsletter Status" class="w-100 w-md-auto" @change="onNewsletterFilterChange" />
        </div>
        <div v-else-if="
            ['creationTime', 'lastSignInTime', 'lastRefreshTime'].includes(
              selectedSearchColumn.field
            )
          ">
          <DatePicker v-model="currentDateRange" selectionMode="range" :manualInput="false"
            @date-select="onDateRangeChange" :placeholder="`Select ${selectedSearchColumn.label} range`"
            class="wide-date-picker" />
        </div>
      </div>
      <div>
        <button @click="clearFilters" class="btn btn-outline-primary custom-button">
          <i class="bi bi-x-lg mr-2"></i>
          <div class="button-text">Clear Search</div>
        </button>
      </div>
    </div>

    <!-- User List Table -->
    <DataTable :value="props.users" v-model:selection="selectedUsers" :paginator="true" :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]" dataKey="userId" :filters="filters" filterDisplay="menu"
      :loading="props.loading" @sort="onSort" :sortField="sortField" :sortOrder="sortOrder" removableSort>
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="email" header="Email" :sortable="true"></Column>
      <Column field="username" header="Username" :sortable="true">
        <template #body="slotProps">
          <span v-if="slotProps.data.username && slotProps.data.username.trim()">
            {{ slotProps.data.username }}
          </span>
          <span v-else class="text-muted fst-italic">No Record</span>
        </template>
      </Column>
      <Column field="gender" header="Gender" :sortable="true">
        <template #body="slotProps">
          <span v-if="slotProps.data.gender && slotProps.data.gender.trim()">
            {{ getGenderLabel(slotProps.data.gender) }}
          </span>
          <span v-else class="text-muted fst-italic">No Record</span>
        </template>
      </Column>
      <Column field="role" header="Role" :sortable="true">
        <template #body="slotProps">
          <span v-if="roleOptions.find((option) => option.value === slotProps.data.role)">
            {{ roleOptions.find((option) => option.value === slotProps.data.role).label }}
          </span>
          <span v-else class="text-muted fst-italic">No Record</span>
        </template>
      </Column>
      <Column field="birthday" header="Birthday" :sortable="true">
        <template #body="slotProps">
          <span v-if="slotProps.data.birthday && slotProps.data.birthday.trim()">
            {{ slotProps.data.birthday }}
          </span>
          <span v-else class="text-muted fst-italic">No Record</span>
        </template>
      </Column>
      <Column field="subscribeToNewsletter" header="Newsletter" :sortable="true">
        <template #body="slotProps">
          <span v-if="
              newsletterOptions.find(
                (option) => option.value === slotProps.data.subscribeToNewsletter
              )
            ">
            {{
            newsletterOptions.find(
            (option) => option.value === slotProps.data.subscribeToNewsletter
            ).label
            }}
          </span>
          <span v-else class="text-muted fst-italic">No Record</span>
        </template>
      </Column>
      <Column field="creationTime" header="Creation Time" :sortable="true">
        <template #body="slotProps">
          <span v-if="slotProps.data.creationTime">
            {{ formatDate(slotProps.data.creationTime) }}
          </span>
          <span v-else class="text-muted fst-italic">No Record</span>
        </template>
      </Column>
      <Column field="lastSignInTime" header="Last Sign In" :sortable="true">
        <template #body="slotProps">
          <span v-if="slotProps.data.lastSignInTime">
            {{ formatDate(slotProps.data.lastSignInTime) }}
          </span>
          <span v-else class="text-muted fst-italic">No Record</span>
        </template>
      </Column>
      <Column field="lastRefreshTime" header="Last Refresh" :sortable="true">
        <template #body="slotProps">
          <span v-if="slotProps.data.lastRefreshTime">
            {{ formatDate(slotProps.data.lastRefreshTime) }}
          </span>
          <span v-else class="text-muted fst-italic">No Record</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  users: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:selectedUsers'])

// Component state
const selectedUsers = ref([])
watch(selectedUsers, (newValue) => {
  emit('update:selectedUsers', newValue)
})

// Filter and search state
const searchValue = ref('')
const genderFilter = ref(null)
const roleFilter = ref(null)
const birthdayRange = ref(null)
const newsletterFilter = ref(null)
const creationTimeRange = ref(null)
const lastSignInTimeRange = ref(null)
const lastRefreshTimeRange = ref(null)

const filters = ref({
  global: { value: null, matchMode: 'contains' },
  email: { value: null, matchMode: 'contains' },
  username: { value: null, matchMode: 'contains' },
  gender: { value: null, matchMode: 'equals' },
  role: { value: null, matchMode: 'equals' },
  birthday: { value: null, matchMode: 'between' },
  subscribeToNewsletter: { value: null, matchMode: 'equals' },
  creationTime: { value: null, matchMode: 'between' },
  lastSignInTime: { value: null, matchMode: 'between' },
  lastRefreshTime: { value: null, matchMode: 'between' }
})

const searchColumns = ref([
  { label: 'Search all columns', field: 'global' },
  { label: 'Email', field: 'email' },
  { label: 'Username', field: 'username' },
  { label: 'Gender', field: 'gender' },
  { label: 'Role', field: 'role' },
  { label: 'Birthday', field: 'birthday' },
  { label: 'Newsletter', field: 'subscribeToNewsletter' },
  { label: 'Creation Time', field: 'creationTime' },
  { label: 'Last Sign In Time', field: 'lastSignInTime' },
  { label: 'Last Refresh Time', field: 'lastRefreshTime' }
])

const genderOptions = [
  { label: 'All', value: null },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' }
]

const getGenderLabel = (gender) => {
  if (gender === null || gender.trim() === '') {
    return 'No Record'
  } else {
    const option = genderOptions.find((option) => option.value === gender)
    return option ? option.label : gender
  }
}

const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
]

const newsletterOptions = [
  { label: 'Subscribed', value: true },
  { label: 'Not Subscribed', value: false }
]

const selectedSearchColumn = ref(searchColumns.value[0])

const sortField = ref(null)
const sortOrder = ref(null)

// Filter and search functions
const onSearchColumnChange = () => {
  clearFilters()
}

const onSearchInput = () => {
  Object.keys(filters.value).forEach((key) => {
    if (key !== selectedSearchColumn.value.field) {
      filters.value[key].value = null
    }
  })
  filters.value[selectedSearchColumn.value.field].value = searchValue.value
}

const onGenderFilterChange = () => {
  filters.value.gender.value = genderFilter.value
}

const onRoleFilterChange = () => {
  filters.value.role.value = roleFilter.value
}

const onBirthdayRangeChange = () => {
  if (birthdayRange.value && birthdayRange.value.length === 2) {
    filters.value.birthday.value = birthdayRange.value.map(
      (date) => date.toISOString().split('T')[0]
    )
    filters.value.birthday.matchMode = 'between'
  } else {
    filters.value.birthday.value = null
    filters.value.birthday.matchMode = 'between'
  }
}

const currentDateRange = ref(null)

const onDateRangeChange = () => {
  if (currentDateRange.value && currentDateRange.value.length === 2) {
    const [start, end] = currentDateRange.value
    filters.value[selectedSearchColumn.value.field].value = [start.getTime(), end.getTime()]
    filters.value[selectedSearchColumn.value.field].matchMode = 'between'
  } else {
    filters.value[selectedSearchColumn.value.field].value = null
    filters.value[selectedSearchColumn.value.field].matchMode = 'between'
  }
}

const onNewsletterFilterChange = () => {
  filters.value.subscribeToNewsletter.value = newsletterFilter.value
}

const clearFilters = () => {
  searchValue.value = ''
  genderFilter.value = null
  roleFilter.value = null
  birthdayRange.value = null
  newsletterFilter.value = null
  creationTimeRange.value = null
  lastSignInTimeRange.value = null
  lastRefreshTimeRange.value = null
  currentDateRange.value = null
  Object.keys(filters.value).forEach((key) => {
    filters.value[key].value = null
  })
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

// Sort function
const onSort = (event) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
}

// Data fetching function (to be overridden by parent component)
const fetchUsers = async () => {
  // Default implementation (can be overridden by parent)
  console.log('Fetching users...')
}

// Watch for changes in selectedSearchColumn
watch(selectedSearchColumn, (newValue) => {
  clearFilters()
})

// Expose fetchUsers method to parent component
defineExpose({ fetchUsers })

// Optionally, you can call fetchUsers when the component is mounted
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.wide-date-picker {
  min-width: 250px;
  width: 100%;
}

@media (max-width: 768px) {
  .wide-date-picker {
    min-width: 100%;
  }
}
</style>
