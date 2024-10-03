<template>
  <div>
    <!-- Button to trigger upload to Firestore -->
    <button @click="uploadData">Upload Articles to Firestore</button>
  </div>
</template>

<script setup>
// Import necessary Firestore functions from Firebase configuration
import { db } from '@/firebase/init'
import { collection, addDoc } from 'firebase/firestore'

// Import article data from JSON file
import articles from '@/assets/json/articles.json'

// Function to upload articles to Firestore
const uploadData = async () => {
  try {
    // Reference to the 'articles' collection in Firestore
    const articlesCollectionRef = collection(db, 'articles')

    // Loop through each article in the JSON and upload to Firestore
    for (const article of articles) {
      // Add each article as a new document in the 'articles' collection
      await addDoc(articlesCollectionRef, article)
    }

    // Log a success message
    console.log('Articles uploaded successfully!')
    alert('Articles uploaded successfully!')
  } catch (error) {
    // Handle any errors that occur during the upload
    console.error('Error uploading articles:', error)
    alert('Failed to upload articles.')
  }
}

</script>
