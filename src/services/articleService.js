// src/services/ArticleService.js
import articles from '@/assets/json/articles.json'
// import articleRatings from '@/assets/json/articleRatings.json'
import { useRatingStore } from '@/stores/articleRatingStore'
const ratingStore = useRatingStore()
const articleRatings = ratingStore.allRatings

export const fetchAllArticles = () => {
  return Promise.resolve(articles)
}

export const fetchArticleById = (articleId) => {
  const article = articles.find((a) => a.articleId == articleId)
  return Promise.resolve(article)
}

export const fetchRatingsByArticleId = (articleId) => {
  const rating = articleRatings.find((r) => r.articleId == articleId)
  return Promise.resolve(rating)
}

export const submitRating = (articleId, userId, rating) => {
  const ratingData = articleRatings.find((r) => r.articleId == articleId)

  if (ratingData) {
    const record = ratingData.ratingRecords.find((r) => r.userId === userId)
    if (record) {
      // Update existing rating
      record.rating = rating
    } else {
      // Add new rating
      ratingData.ratingRecords.push({ userId, rating })
    }

    // Recalculate average rating
    const total = ratingData.ratingRecords.reduce((sum, r) => sum + r.rating, 0)
    ratingData.averageRating = total / ratingData.ratingRecords.length

    return Promise.resolve(ratingData)
  } else {
    return Promise.reject('Article not found for rating')
  }
}
