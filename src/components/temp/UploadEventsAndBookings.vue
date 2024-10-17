<template>
  <div>
    <h2>Upload Events to Firestore</h2>
    <p>Manually delete the events collection in Firestore before uploading.</p>

    <!-- Display list of files with checkboxes to be uploaded -->
    <ul style="margin: 10px 0">
      <li v-for="(file, index) in eventFiles" :key="file.name">
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
      <button class="btn btn-primary" @click="uploadData">Upload Events to Firestore</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from '@/firebase/init'
import { collection, addDoc } from 'firebase/firestore'

// Import events data from JSON file
// import eventsData from '@/assets/json/events.json'
import events2 from '@/assets/json/events2.json'

// Create an array of event files for extensibility
const eventFiles = [
  // { name: 'events.json', data: eventsData },
  { name: 'events2.json', data: events2 }
]

// Selected files for uploading
const selectedFiles = ref([])

// Function to select all files
const selectAllFiles = () => {
  selectedFiles.value = eventFiles.map((_, index) => index)
}

// Function to clear selected files
const clearSelectedFiles = () => {
  selectedFiles.value = []
}

// Function to upload events to Firestore
const uploadData = async () => {
  try {
    // Loop through each selected file in the list
    for (const index of selectedFiles.value) {
      const file = eventFiles[index]
      // Loop through each event in the current file
      for (const event of file.data) {
        // Add each event as a new document in the 'events' collection
        const eventData = {
          organizerName: event.organizerName,
          title: event.title,
          description: event.description,
          category: event.category,
          address: {
            placeName: event.address.placeName,
            addressString: event.address.addressString,
            latitude: event.address.latitude,
            longitude: event.address.longitude
          },
          startTime: event.startTime,
          endTime: event.endTime,
          totalCapacity: event.totalCapacity,
          remainingCapacity: event.remainingCapacity,
          registrationStartTime: event.registrationStartTime,
          registrationEndTime: event.registrationEndTime,
          isVisible: event.isVisible
        }

        const eventRef = await addDoc(collection(db, 'events'), eventData)
        console.log(`Event added from ${file.name} with ID: ${eventRef.id}`)
      }
      console.log(`${file.name} events uploaded successfully!`)
    }
    alert('All events from all selected files uploaded successfully!')
  } catch (error) {
    console.error('Error uploading events:', error)
    alert('Failed to upload events.')
  }
}
</script>
