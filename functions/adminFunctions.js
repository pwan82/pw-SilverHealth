const functions = require('firebase-functions')
const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true }) // Enable CORS with any origin

const db = admin.firestore()

const { checkUserRole } = require('./authFunctions')
const { cloudFunctionsLocation: region } = require('./cloudFunctionsLocation')

// Triggered when there is a change in the adminUsers collection
exports.onAdminUserChanged = functions.firestore
  .document('adminUsers/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId
    const newValue = change.after.exists ? change.after.data() : null
    // const previousValue = change.before.exists ? change.before.data() : null

    // If the document is deleted, remove the admin role from the user
    if (!newValue) {
      try {
        await admin.auth().setCustomUserClaims(userId, { role: 'user' })
        console.log(`Admin role removed from user ${userId}`)
      } catch (error) {
        console.error('Error removing admin role:', error)
      }
      return
    }

    // If isAdmin is true, assign the admin role to the user
    if (newValue.isAdmin === true) {
      try {
        await admin.auth().setCustomUserClaims(userId, { role: 'admin' })
        console.log(`Admin role assigned to user ${userId}`)
      } catch (error) {
        console.error('Error assigning admin role:', error)
      }
      return
    }
    // If the user was previously an admin and isAdmin is now false, remove the admin role
    else {
      try {
        await admin.auth().setCustomUserClaims(userId, { role: 'user' })
        console.log(`Admin role removed from user ${userId}, set to user role.`)
      } catch (error) {
        console.error('Error setting user role:', error)
      }
    }
  })

exports.getAllUsers = onRequest({ region: region }, (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      // Verify user authentication and admin status
      const authCheck = await checkUserRole(req.headers, 'admin')
      if (!authCheck.isLoggedIn || !authCheck.isAdmin) {
        return res.status(authCheck.status).send(authCheck.message)
      }

      // Get all users from Firestore
      const usersSnapshot = await db.collection('users').get()

      const users = []

      // Process each user document
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data()
        const userId = doc.id

        // Get user's custom claims (including role) and metadata
        const userRecord = await admin.auth().getUser(userId)
        const customClaims = userRecord.customClaims || {}

        // Convert time strings to timestamps
        const creationTime = Date.parse(userRecord.metadata.creationTime) || null
        const lastSignInTime = Date.parse(userRecord.metadata.lastSignInTime) || null
        const lastRefreshTime = Date.parse(userRecord.metadata.lastRefreshTime) || null

        // Construct user object with all properties
        const user = {
          userId: userId,
          email: userData.email || null,
          gender: userData.gender || null,
          birthday: userData.birthday || null,
          username: userData.username || null,
          subscribeToNewsletter: userData.subscribeToNewsletter || false,
          address: {
            building: (userData.address && userData.address.building) || null,
            postcode: (userData.address && userData.address.postcode) || null,
            state: (userData.address && userData.address.state) || null,
            streetAddress: (userData.address && userData.address.streetAddress) || null,
            suburb: (userData.address && userData.address.suburb) || null
          },
          role: customClaims.role || null,
          creationTime: creationTime,
          lastSignInTime: lastSignInTime,
          lastRefreshTime: lastRefreshTime
        }

        users.push(user)
      }

      // Send the response
      res.status(200).json(users)
    } catch (error) {
      console.error('Error retrieving users:', error)
      res.status(500).send('Internal Server Error')
    }
  })
})

exports.getWebsiteStatistics = onRequest({ region: region }, (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      // Verify user authentication and admin status
      const authCheck = await checkUserRole(req.headers, 'admin')
      if (!authCheck.isLoggedIn || !authCheck.isAdmin) {
        return res.status(authCheck.status).send(authCheck.message)
      }

      // Initialize statistics object
      const statistics = {
        totalUsers: 0,
        adminUsers: 0,
        normalUsers: 0,
        totalArticles: 0,
        totalRatings: 0,
        totalEvents: 0,
        totalEventBookings: 0
      }

      // Get user statistics
      const userListResult = await admin.auth().listUsers()
      statistics.totalUsers = userListResult.users.length

      // Count admin and normal users
      for (const userRecord of userListResult.users) {
        if (userRecord.customClaims && userRecord.customClaims.role === 'admin') {
          statistics.adminUsers++
        } else {
          statistics.normalUsers++
        }
      }

      // Get article statistics and ratings
      const articlesSnapshot = await db.collection('articles').get()
      statistics.totalArticles = articlesSnapshot.size

      // Count ratings across all articles
      let ratingsPromises = articlesSnapshot.docs.map((doc) =>
        doc.ref.collection('ratings').count().get()
      )
      let ratingsCounts = await Promise.all(ratingsPromises)
      statistics.totalRatings = ratingsCounts.reduce((sum, count) => sum + count.data().count, 0)

      // Get event statistics
      const eventsSnapshot = await db.collection('events').count().get()
      statistics.totalEvents = eventsSnapshot.data().count

      // Get event booking statistics
      const eventBookingsSnapshot = await db.collection('eventBookings').count().get()
      statistics.totalEventBookings = eventBookingsSnapshot.data().count

      console.log('Website statistics generated successfully')
      res.status(200).json(statistics)
    } catch (error) {
      console.error('Error generating website statistics:', error)
      res.status(500).send('Error generating website statistics')
    }
  })
})
