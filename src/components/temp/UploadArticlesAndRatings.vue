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

// Import article data from JSON files
import articles from '@/assets/json/articles.json'
import articles2 from '@/assets/json/articles2.json' // Assuming articles2 is a different file

// Create an array of article files for extensibility
const articleFiles = [
  { name: 'articles.json', data: articles },
  { name: 'articles2.json', data: articles2 }
]

// Function to upload articles and their ratings as subcollections to Firestore
const uploadData = async () => {
  try {
    // Loop through each file in the list
    for (const file of articleFiles) {
      // Loop through each article in the current file
      for (const article of file.data) {
        // Add each article as a new document in the 'articles' collection
        const articleRef = await addDoc(collection(db, 'articles'), {
          articleId: article.articleId,
          author: article.author,
          publicationTime: article.publicationTime,
          modificationTime: article.modificationTime,
          category: article.category,
          title: article.title,
          body: article.body,
          requireAuth: article.requireAuth,
          isVisible: article.isVisible,
          averageRating: article.averageRating
        })

        console.log(`Article added from ${file.name} with ID: ${articleRef.id}`)

        // Now add each rating as a document in the 'ratings' subcollection
        if (article.ratings && article.ratings.length > 0) {
          for (const rating of article.ratings) {
            await addDoc(collection(db, `articles/${articleRef.id}/ratings`), {
              userId: rating.userId,
              publicationTime: rating.publicationTime,
              rating: rating.rating,
              comment: rating.comment || '' // Handle optional comment field
            })
            console.log(`Rating added for article ${article.articleId} from ${file.name}`)
          }
        }
      }
      console.log(`${file.name} articles and ratings uploaded successfully!`)
    }
    alert('All articles and ratings from all files uploaded successfully!')
  } catch (error) {
    console.error('Error uploading articles and ratings:', error)
    alert('Failed to upload articles and ratings.')
  }
}
</script>
