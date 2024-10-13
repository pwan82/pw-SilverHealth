const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true }) // Enable CORS with any origin

const db = admin.firestore()

const { checkUserRole } = require('./authFunctions')

// GET ?limit={limit}&offset={offset}&category={category1}&category={category2} - Fetch article list with pagination and category filter
exports.getArticles = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    const { limit = 0, offset = 0 } = req.query
    const categories = req.query.category // This will return either a string or an array

    try {
      let articlesList = []

      // Check if user is admin once
      let isAdmin = false
      console.log(`getArticles: req.headers.authorization: ${req.headers.authorization}`)
      const authCheck = await checkUserRole(req.headers, 'admin')
      if (authCheck.status === 200) {
        isAdmin = true
      }

      if (categories) {
        // Convert single category to an array for uniform processing
        const categoryArray = Array.isArray(categories) ? categories : [categories.toLowerCase()]

        // Perform individual queries for each category and merge the results
        for (const cat of categoryArray) {
          let categoryQuery = db
            .collection('articles')
            .where('category', 'array-contains', cat)
            .orderBy('publicationTime', 'desc')
            .limit(Number(limit))

          const articlesSnapshot = await categoryQuery.get()

          articlesSnapshot.forEach((doc) => {
            const articleData = doc.data()
            const articleCategories = articleData.category.map((cat) => cat.toLowerCase()) // Ensure all categories are lowercase for comparison

            // Check if article's categories contain all the queried categories
            if (categoryArray.every((cat) => articleCategories.includes(cat))) {
              if (
                (articleData.isVisible === true || isAdmin) &&
                (articleData.showInList !== false || isAdmin)
              ) {
                // Ensure the article is added only once
                if (!articlesList.find((article) => article.articleId === articleData.articleId)) {
                  articlesList.push({
                    articleId: articleData.articleId,
                    author: articleData.author,
                    publicationTime: articleData.publicationTime,
                    modificationTime: articleData.modificationTime,
                    category: articleData.category,
                    title: articleData.title,
                    requireAuth: articleData.requireAuth,
                    averageRating: articleData.averageRating
                  })
                }
              }
            }
          })
        }

        console.log(`Returning ${articlesList.length} articles with category filter`)
        return res.status(200).json(articlesList) // Return articles with category filter
      }

      // If no categories filter, fetch all articles with pagination
      let articlesQuery = db
        .collection('articles')
        .orderBy('publicationTime', 'desc')
        .limit(Number(limit))
        .offset(Number(offset))

      const articlesSnapshot = await articlesQuery.get()

      articlesSnapshot.forEach((doc) => {
        const articleData = doc.data()
        if (
          (articleData.isVisible === true || isAdmin) &&
          (articleData.showInList !== false || isAdmin)
        ) {
          articlesList.push({
            articleId: articleData.articleId,
            author: articleData.author,
            publicationTime: articleData.publicationTime,
            modificationTime: articleData.modificationTime,
            category: articleData.category,
            title: articleData.title,
            requireAuth: articleData.requireAuth,
            averageRating: articleData.averageRating
          })
        }
      })

      console.log(`Returning ${articlesList.length} articles without category filter`)
      res.status(200).json(articlesList) // Return articles without category filter
    } catch (error) {
      console.error(`Error fetching articles: ${error}`)
      res.status(500).send('Error fetching articles')
    }
  })
})

// GET /id={articleId} - Fetch specific article by ID
exports.getArticleById = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    console.log(`Full URL received: ${req.url}`)
    const articleId = req.query.id
    console.log(`Received request for articleId: ${articleId}`)

    if (!articleId) {
      return res.status(400).send('Missing articleId in path')
    }

    try {
      // Find the article document by its articleId field, not Firestore document ID
      const articlesRef = db.collection('articles')
      const articleQuery = await articlesRef
        .where('articleId', '==', Number(articleId))
        .limit(1)
        .get()
      console.log(`Query result for articleId ${articleId}: ${articleQuery.size} document(s) found`)

      if (articleQuery.empty) {
        console.error(`Article with articleId ${articleId} not found`)
        return res.status(404).send('Article not found')
      }

      const articleDoc = articleQuery.docs[0]
      const articleData = articleDoc.data()
      console.log(`Fetched article data for articleId ${articleId}:`, articleData)

      let isAdmin = false

      // If the article is visible to everyone, skip the auth & role check.
      if (articleData.isVisible === true) {
        console.log('Article is visible to all users, skipping authorization check.')
      } else {
        // If the article is not visible, must check for admin access
        const authCheck = await checkUserRole(req.headers, 'admin')
        console.log(`Authorization check result: ${authCheck.status}`)

        if (!authCheck.isAdmin) {
          console.error(`Authorization failed for articleId ${articleId}: ${authCheck.message}`)
          return res.status(authCheck.status).send(authCheck.message)
        }
        isAdmin = authCheck.isAdmin
      }

      // If the article requires authentication, check for logged-in user
      if (articleData.requireAuth) {
        const authCheck = await checkUserRole(req.headers, null)
        if (!authCheck.isLoggedIn) {
          console.warn(`Unauthorized access attempt for articleId ${articleId}`)
          return res.status(401).send('Unauthorized')
        }
      }

      console.log(`Preparing article details for articleId ${articleId}`)

      // Prepare the response object
      let responseData = {
        articleId: articleData.articleId,
        title: articleData.title,
        body: articleData.body,
        requireAuth: articleData.requireAuth,
        showMetadata: articleData.showMetadata,
        showCategory: articleData.showCategory,
        isRatable: articleData.isRatable
      }

      // Add conditional fields based on article properties and user role
      if (articleData.showMetadata !== false || isAdmin) {
        responseData.author = articleData.author
        responseData.publicationTime = articleData.publicationTime
        responseData.modificationTime = articleData.modificationTime
      }

      if (articleData.showCategory !== false || isAdmin) {
        responseData.category = articleData.category
      }

      if (articleData.isRatable !== false || isAdmin) {
        responseData.averageRating = articleData.averageRating
      }

      console.log(`Returning article details for articleId ${articleId}`)
      res.status(200).json(responseData)
    } catch (error) {
      console.error(`Error fetching articleId ${articleId}:`, error)
      res.status(500).send('Error fetching article')
    }
  })
})

// GET /{articleId}?limit={limit}&offset={offset} - Fetch ratings for a specific article
exports.getArticleRatings = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    console.log(`Full URL received: ${req.url}`)
    const articleId = req.url.split('/')[1].split('?')[0]

    const { limit = 0, offset = 0 } = req.query

    console.log(
      `Received request for ratings of articleId: ${articleId} with limit ${limit} and offset ${offset}`
    )

    if (!articleId) {
      return res.status(400).send('Missing articleId in path')
    }

    try {
      // Find the article document by its articleId field, not Firestore document ID
      const articlesRef = db.collection('articles')
      const articleQuery = await articlesRef
        .where('articleId', '==', Number(articleId))
        .select('isVisible', 'requireAuth', 'isRatable')
        .limit(1)
        .get()
      console.log(`Query result for articleId ${articleId}: ${articleQuery.size} document(s) found`)

      if (articleQuery.empty) {
        console.error(`Article with articleId ${articleId} not found`)
        return res.status(404).send('Article not found')
      }

      const articleDoc = articleQuery.docs[0]
      const articleData = articleDoc.data()
      console.log(`Fetched article data for articleId ${articleId}:`, articleData)

      const authCheck = await checkUserRole(req.headers, 'admin')
      const { isAdmin, isLoggedIn } = authCheck

      // If the article is not visible to everyone, check for admin access
      if (articleData.isVisible !== true && !isAdmin) {
        console.error(`Authorization failed for articleId ${articleId}: ${authCheck.message}`)
        return res.status(authCheck.status).send(authCheck.message)
      }

      // If the article is not ratable to everyone, check for admin access
      if (articleData.isRatable === false && !isAdmin) {
        console.warn(`Forbidden access attempt for articleId ${articleId}`)
        return res.status(403).send('Forbidden')
      }

      // If the article requires authentication or we need to check login status
      if (articleData.requireAuth && !isLoggedIn) {
        console.warn(`Unauthorized access attempt for articleId ${articleId}`)
        return res.status(401).send('Unauthorized')
      }

      // Fetch ratings for the article from its subcollection "ratings"
      const ratingsRef = db
        .collection('articles')
        .doc(articleDoc.id)
        .collection('ratings')
        .orderBy('publicationTime')
        .limit(Number(limit))
        .offset(Number(offset))

      const ratingsSnapshot = await ratingsRef.get()
      console.log(`Fetched ${ratingsSnapshot.size} ratings for articleId ${articleId}`)

      const ratingsList = []
      ratingsSnapshot.forEach((doc) => {
        const ratingData = doc.data()
        ratingsList.push(ratingData)
      })

      console.log(`Returning ${ratingsList.length} ratings for articleId ${articleId}`)
      res.status(200).json(ratingsList)
    } catch (error) {
      console.error(`Error fetching ratings for articleId ${articleId}:`, error)
      res.status(500).send('Error fetching ratings')
    }
  })
})

// Helper function: Calculate average rating
const calculateAverageRating = async (articleDocRef) => {
  const ratingsSnapshot = await articleDocRef.collection('ratings').get()
  let totalRating = 0
  let count = 0

  ratingsSnapshot.forEach((doc) => {
    const ratingData = doc.data()
    if (ratingData.rating) {
      totalRating += ratingData.rating
      count++
    }
  })

  const averageRating = count > 0 ? totalRating / count : 0
  return parseFloat(averageRating.toFixed(2)) // Round to 2 decimal places
}

// POST /{articleId} - Publish rating and comment for a specific article
exports.publishArticleRating = onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    const articleId = req.path.split('/')[1]
    console.log(`Received request to publish rating for articleId: ${articleId}`)

    if (!articleId) {
      return res.status(400).send('Missing articleId in path')
    }

    const { rating, comment } = req.body

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).send('Invalid rating. Must be a number between 1 and 5.')
    }

    if (typeof comment !== 'string') {
      return res.status(400).send('Invalid comment. Must be a string.')
    }

    try {
      // Check user authentication and role
      const authCheck = await checkUserRole(req.headers, 'admin')
      const { isAdmin, isLoggedIn, userId } = authCheck

      if (!isLoggedIn) {
        console.error(`Authorization failed for articleId ${articleId}: User not logged in`)
        return res.status(401).send('Unauthorized: User must be logged in to rate articles')
      }

      // Find the article document by its articleId field
      const articlesRef = db.collection('articles')
      const articleQuery = await articlesRef
        .where('articleId', '==', Number(articleId))
        .select('isVisible', 'isRatable')
        .limit(1)
        .get()

      if (articleQuery.empty) {
        console.error(`Article with articleId ${articleId} not found`)
        return res.status(404).send('Article not found')
      }

      const articleDoc = articleQuery.docs[0]
      const articleData = articleDoc.data()

      // If the article is not visible and user is not admin, deny access
      if (!articleData.isVisible && !isAdmin) {
        console.error(`Access denied for non-visible articleId ${articleId}`)
        return res.status(authCheck.status).send(authCheck.message)
      }

      // If the article is not ratable and user is not admin, deny access
      if (articleData.isRatable === false && !isAdmin) {
        console.error(`Rating denied for non-ratable articleId ${articleId}`)
        return res.status(403).send('Forbidden')
      }

      // Prepare the rating document
      const ratingData = {
        userId: userId,
        rating: rating,
        comment: comment,
        publicationTime: Date.now()
      }

      // Check if the user has already rated this article
      const existingRatingQuery = await articleDoc.ref
        .collection('ratings')
        .where('userId', '==', userId)
        .limit(1)
        .get()

      let ratingRef
      let isUpdate = false
      let ratingChanged = false
      let newAverageRating = null

      if (!existingRatingQuery.empty) {
        // Update existing rating
        const existingRatingDoc = existingRatingQuery.docs[0]
        const existingRatingData = existingRatingDoc.data()
        ratingRef = existingRatingDoc.ref

        // Check if the rating has changed
        ratingChanged = existingRatingData.rating !== rating

        await ratingRef.update(ratingData)
        isUpdate = true
      } else {
        // Create new rating
        ratingRef = await articleDoc.ref.collection('ratings').add(ratingData)
        ratingChanged = true // New rating always changes the average
      }

      // Only recalculate and update average rating if the rating has changed
      if (ratingChanged) {
        newAverageRating = await calculateAverageRating(articleDoc.ref)
        await articleDoc.ref.update({ averageRating: newAverageRating })
        console.log(`Updated average rating for articleId ${articleId} to ${newAverageRating}`)
      } else {
        // If rating didn't change, fetch the current average rating
        const updatedArticleDoc = await articleDoc.ref.get()
        newAverageRating = updatedArticleDoc.data().averageRating
      }

      console.log(
        `Successfully ${isUpdate ? 'updated' : 'published'} rating for articleId ${articleId} by user ${userId}`
      )

      res.status(200).json({
        message: `Rating ${isUpdate ? 'updated' : 'published'} successfully`,
        averageRating: newAverageRating
      })
    } catch (error) {
      console.error(`Error publishing rating for articleId ${articleId}:`, error)
      res.status(500).send('Error publishing rating')
    }
  })
})
