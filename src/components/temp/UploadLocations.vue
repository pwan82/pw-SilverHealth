<template>
  <div>
    <h2>Upload Service Locations to Firestore</h2>
    <p>Manually delete the service locations collection in Firestore before uploading.</p>

    <!-- Display list of files with checkboxes to be uploaded -->
    <ul style="margin: 10px 0">
      <li v-for="(file, index) in locationFiles" :key="file.name">
        <input type="checkbox" v-model="selectedFiles" :value="index" /> {{ file.name }}
      </li>
    </ul>

    <!-- Buttons for selecting and clearing files, and uploading -->
    <div style="margin: 10px 0">
      <button class="btn btn-secondary" @click="selectAllFiles" style="margin-right: 10px">
        Select All
      </button>
      <button class="btn btn-secondary" @click="clearSelectedFiles" style="margin-right: 10px">
        Clear Selection
      </button>
      <button class="btn btn-primary" @click="uploadData">Upload Locations to Firestore</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from '@/firebase/init'
import { collection, addDoc } from 'firebase/firestore'

// Import service locations data from JSON file
import serviceLocations from '@/assets/json/serviceLocations.json'

// Create an array of location files for extensibility
const locationFiles = [{ name: 'serviceLocations.json', data: serviceLocations }]

// Selected files for uploading
const selectedFiles = ref([])

// Function to select all files
const selectAllFiles = () => {
  selectedFiles.value = locationFiles.map((_, index) => index)
}

// Function to clear selected files
const clearSelectedFiles = () => {
  selectedFiles.value = []
}

// Function to upload service locations to Firestore
const uploadData = async () => {
  try {
    // Loop through each selected file in the list
    for (const index of selectedFiles.value) {
      const file = locationFiles[index]
      // Loop through each location in the current file
      for (const location of file.data) {
        // Add each location as a new document in the 'serviceLocations' collection
        const locationData = {
          locationId: location.locationId,
          name: location.name,
          type: location.type,
          description: location.description,
          phoneNumber: location.phoneNumber,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          openingHours: {
            weekday: {
              open: location.openingHours.weekday.open,
              close: location.openingHours.weekday.close
            },
            saturday: {
              open: location.openingHours.saturday.open,
              close: location.openingHours.saturday.close
            },
            sunday: {
              open: location.openingHours.sunday.open,
              close: location.openingHours.sunday.close
            }
          }
        }

        const locationRef = await addDoc(collection(db, 'serviceLocations'), locationData)
        console.log(`Location added from ${file.name} with ID: ${locationRef.id}`)
      }
      console.log(`${file.name} locations uploaded successfully!`)
    }
    alert('All service locations from all selected files uploaded successfully!')
  } catch (error) {
    console.error('Error uploading service locations:', error)
    alert('Failed to upload service locations.')
  }
}
</script>
