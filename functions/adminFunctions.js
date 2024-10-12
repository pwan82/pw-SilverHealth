const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true }) // Enable CORS with any origin

const db = admin.firestore()

const { checkUserRole } = require('./authFunctions')

exports.getAllUsers = onRequest((req, res) => {
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
