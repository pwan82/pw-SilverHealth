// stores/ratingStore.js

import { defineStore } from 'pinia'
// import mockRatings from '@/assets/json/articleRatings.json'

const mockRatings = ''

export const useRatingStore = defineStore('rating', {
  state: () => ({
    allRatings: Array.isArray(JSON.parse(localStorage.getItem('allRatings')))
      ? JSON.parse(localStorage.getItem('allRatings'))
      : mockRatings
  }),
  getters: {
    getRatingByArticleId: (state) => (articleId) => {
      return state.allRatings.find((rating) => rating.articleId == articleId) || null
    },
    getUserRatingForArticle: (state) => (articleId, userId) => {
      const articleRating = state.allRatings.find((rating) => rating.articleId == articleId)
      if (articleRating) {
        return articleRating.ratingRecords.find((record) => record.userId == userId)?.rating || null
      }
      return null
    }
  },
  actions: {
    submitRating(articleId, userId, newRating) {
      let ratingData = this.allRatings.find((rating) => rating.articleId == articleId)

      if (!ratingData) {
        // If there's no rating data for the article, create a new entry
        ratingData = {
          articleId,
          averageRating: newRating,
          ratingRecords: [{ userId, rating: newRating }]
        }
        this.allRatings.push(ratingData)
      } else {
        const userRatingIndex = ratingData.ratingRecords.findIndex(
          (record) => record.userId == userId
        )
        if (userRatingIndex !== -1) {
          // Update existing rating
          ratingData.ratingRecords[userRatingIndex].rating = newRating
        } else {
          // Add new rating
          ratingData.ratingRecords.push({ userId, rating: newRating })
        }
        // Update the average rating
        const totalRatings = ratingData.ratingRecords.reduce(
          (acc, record) => acc + record.rating,
          0
        )
        ratingData.averageRating = totalRatings / ratingData.ratingRecords.length
      }
      // Save updated ratings to localStorage
      localStorage.setItem('allRatings', JSON.stringify(this.allRatings))
    },
    restoreRatings() {
      const savedRatings = localStorage.getItem('allRatings')
      if (savedRatings) {
        this.allRatings = JSON.parse(savedRatings) // Restore ratings from localStorage
      } else {
        this.allRatings = mockRatings // Use mock data if no ratings found in localStorage
      }
    }
  }
})
