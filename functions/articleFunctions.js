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
      const authCheck = await checkUserRole(req, 'admin')
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
            const data = doc.data()
            const articleCategories = data.category.map((cat) => cat.toLowerCase()) // Ensure all categories are lowercase for comparison

            // Check if article's categories contain all the queried categories
            if (categoryArray.every((cat) => articleCategories.includes(cat))) {
              if (data.isVisible === true || isAdmin) {
                // Ensure the article is added only once
                if (!articlesList.find((article) => article.articleId === data.articleId)) {
                  articlesList.push({
                    articleId: data.articleId,
                    author: data.author,
                    publicationTime: data.publicationTime,
                    modificationTime: data.modificationTime,
                    category: data.category,
                    title: data.title,
                    requireAuth: data.requireAuth,
                    averageRating: data.averageRating
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
        const data = doc.data()
        if (data.isVisible === true || isAdmin) {
          articlesList.push({
            articleId: data.articleId,
            author: data.author,
            publicationTime: data.publicationTime,
            modificationTime: data.modificationTime,
            category: data.category,
            title: data.title,
            requireAuth: data.requireAuth,
            averageRating: data.averageRating
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

// GET /{articleId} - Fetch specific article by ID
exports.getArticleById = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    console.log(`Full URL received: ${req.url}`)
    const articleId = req.url.split('/')[1].split('?')[0]
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

      // If the article is visible to everyone, skip the auth & role check.
      if (articleData.isVisible === true) {
        console.log('Article is visible to all users, skipping authorization check.')
      } else {
        // If the article is not visible, must check for admin access
        const authCheck = await checkUserRole(req, 'admin')
        console.log(`Authorization check result: ${authCheck.status}`)

        if (authCheck.status !== 200) {
          console.error(`Authorization failed for articleId ${articleId}: ${authCheck.message}`)
          return res.status(authCheck.status).send(authCheck.message)
        }
      }

      // If the article requires authentication, check for logged-in user
      if (articleData.requireAuth) {
        const authCheck = await checkUserRole(req, null)
        if (authCheck.status !== 200) {
          console.warn(`Unauthorized access attempt for articleId ${articleId}`)
          return res.status(401).send('Unauthorized')
        }
      }

      console.log(`Returning article details for articleId ${articleId}`)
      res.status(200).json({
        articleId: articleData.articleId, // Use the articleId from the document
        author: articleData.author,
        publicationTime: articleData.publicationTime,
        modificationTime: articleData.modificationTime,
        category: articleData.category,
        title: articleData.title,
        body: articleData.body, // Article content
        requireAuth: articleData.requireAuth,
        averageRating: articleData.averageRating
      })
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
        .select('isVisible', 'requireAuth')
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

      // If the article is visible to everyone, skip the auth & role check.
      if (articleData.isVisible === true) {
        console.log('Article is visible to all users, skipping authorization check.')
      } else {
        // If the article is not visible, must check for admin access
        const authCheck = await checkUserRole(req, 'admin')
        console.log(`Authorization check result: ${authCheck.status}`)

        if (authCheck.status !== 200) {
          console.error(`Authorization failed for articleId ${articleId}: ${authCheck.message}`)
          return res.status(authCheck.status).send(authCheck.message)
        }
      }

      // If the article requires authentication, check for logged-in user
      if (articleData.requireAuth) {
        const authCheck = await checkUserRole(req, null)
        if (authCheck.status !== 200) {
          console.warn(`Unauthorized access attempt for articleId ${articleId}`)
          return res.status(401).send('Unauthorized')
        }
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
        ratingsList.push(doc.data())
      })

      console.log(`Returning ${ratingsList.length} ratings for articleId ${articleId}`)
      res.status(200).json(ratingsList)
    } catch (error) {
      console.error(`Error fetching ratings for articleId ${articleId}:`, error)
      res.status(500).send('Error fetching ratings')
    }
  })
})
