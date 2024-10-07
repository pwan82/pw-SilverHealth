<template>
  <div>
    Manually delete the article collection in Firestore before uploading.

    <!-- Display list of files with checkboxes to be uploaded -->
    <ul style="margin: 10px 0;">
      <li v-for="(file, index) in articleFiles" :key="file.name">
        <input type="checkbox" v-model="selectedFiles" :value="index"> {{ file.name }}
      </li>
    </ul>
    <!-- Buttons for selecting and clearing files, and uploading -->
    <div style="margin: 10px 0;">
      <button class="btn btn-secondary" @click="selectAllFiles" style="margin-right: 10px;">Select All</button>
      <button class="btn btn-secondary" @click="clearSelectedFiles" style="margin-right: 10px;">Clear Selection</button>
      <button class="btn btn-primary" @click="uploadData">Upload Articles to Firestore</button>
    </div>

  </div>
</template>

<script setup>
// Import necessary Firestore functions from Firebase configuration
import { db } from '@/firebase/init'
import { collection, addDoc, updateDoc } from 'firebase/firestore'

// Import article data from JSON files
import articles from '@/assets/json/articles.json'
import articles2 from '@/assets/json/articles2.json'
import documentArticles from '@/assets/json/documentArticles.json'

// Create an array of article files for extensibility
const articleFiles = [
  { name: 'articles.json', data: articles },
  { name: 'articles2.json', data: articles2 },
  { name: 'documentArticles.json', data: documentArticles }
]

// Selected files for uploading
import { ref } from 'vue'
const selectedFiles = ref([])

// Function to select all files
const selectAllFiles = () => {
  selectedFiles.value = articleFiles.map((_, index) => index)
}

// Function to clear selected files
const clearSelectedFiles = () => {
  selectedFiles.value = []
}

// Function to upload articles and their ratings as subcollections to Firestore
const uploadData = async () => {
  try {
    // Loop through each selected file in the list
    for (const index of selectedFiles.value) {
      const file = articleFiles[index]
      // Loop through each article in the current file
      for (const article of file.data) {
        // Add each article as a new document in the 'articles' collection
        const articleData = {
          articleId: article.articleId,
          author: article.author,
          publicationTime: article.publicationTime,
          modificationTime: article.modificationTime,
          category: article.category,
          title: article.title,
          body: article.body,

          // Control attributes
          // Add requireAuth if it exists, default to false
          requireAuth: article.requireAuth !== undefined ? article.requireAuth : false,
          // Add isVisible if it exists, default to true
          isVisible: article.isVisible !== undefined ? article.isVisible : true,
          // Add showInList if it exists, default to true
          showInList: article.showInList !== undefined ? article.showInList : true,
          // Add showMetadata if it exists, default to true
          showMetadata: article.showMetadata !== undefined ? article.showMetadata : true,
          // Add showCategories if it exists, default to true
          showCategories: article.showCategories !== undefined ? article.showCategories : true,
          // Add isRatable if it exists, default to true
          isRatable: article.isRatable !== undefined ? article.isRatable : true,
        }

        const articleRef = await addDoc(collection(db, 'articles'), articleData)

        console.log(`Article added from ${file.name} with ID: ${articleRef.id}`)

        // Now add each rating as a document in the 'ratings' subcollection
        if (article.ratings && article.ratings.length > 0) {
          let totalRating = 0

          for (const rating of article.ratings) {
            totalRating += rating.rating

            await addDoc(collection(db, `articles/${articleRef.id}/ratings`), {
              userId: rating.userId,
              publicationTime: rating.publicationTime,
              rating: rating.rating,
              comment: rating.comment || '' // Handle optional comment field
            })
            console.log(`Rating added for article ${article.articleId} from ${file.name}`)
          }

          // Recalculate averageRating with two decimal precision
          articleData.averageRating
            = parseFloat((totalRating / article.ratings.length).toFixed(2))
          // Update the article document with the new averageRating
          await updateDoc(articleRef, { averageRating: articleData.averageRating })
        }
      }
      console.log(`${file.name} articles and ratings uploaded successfully!`)
    }
    alert('All articles and ratings from all selected files uploaded successfully!')
  } catch (error) {
    console.error('Error uploading articles and ratings:', error)
    alert('Failed to upload articles and ratings.')
  }
}
</script>