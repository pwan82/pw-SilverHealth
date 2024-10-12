<template>
  <div class="search-container">
    <div class="input-group">
      <span class="input-group-text bg-white">
        <i class="bi bi-search"></i>
      </span>
      <input v-model="searchQuery" @input="search" type="text" placeholder="Search SilverHealth locations..."
        class="form-control" />
      <button v-if="searchQuery" @click="clearSearch" class="btn btn-secondary" type="button">
        <i class="bi bi-x"></i>
      </button>
    </div>
    <ul v-if="searchResults.length > 0" class="list-group search-results">
      <li v-for="result in searchResults" :key="result.locationId" @click="selectLocation(result)"
        class="list-group-item" style="cursor: pointer">
        {{ result.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase/init'
import { collection, getDocs } from 'firebase/firestore'

const searchQuery = ref('')
const locations = ref([])
const emit = defineEmits(['locationSelected', 'locationsLoaded'])

const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return locations.value.filter(
    (location) =>
      location.name.toLowerCase().includes(query) ||
      location.type.toLowerCase().includes(query) ||
      location.description.toLowerCase().includes(query) ||
      location.address.toLowerCase().includes(query)
  )
})

async function fetchLocations() {
  try {
    const querySnapshot = await getDocs(collection(db, 'serviceLocations'))
    locations.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    emit('locationsLoaded', locations.value)
  } catch (error) {
    console.error('Error fetching locations:', error)
  }
}

function search() {
  // This function can be used to trigger additional search logic if needed
}

function selectLocation(location) {
  emit('locationSelected', location)
  searchQuery.value = ''
}

function clearSearch() {
  searchQuery.value = ''
}

onMounted(() => {
  fetchLocations()
})
</script>

<style scoped>
.search-container {
  position: relative;
  width: 300px;
  margin: 10px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 250px;
  overflow-y: auto;
}

.input-group .btn {
  z-index: 4;
}
</style>