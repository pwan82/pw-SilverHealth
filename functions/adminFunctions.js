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
      const authCheck = await checkUserRole(req, 'admin')
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

        // Get user's custom claims (including role)
        const userRecord = await admin.auth().getUser(userId)
        const customClaims = userRecord.customClaims || {}

        // Construct user object with all properties
        const user = {
          userId: userId,
          email: userData.email || '',
          gender: userData.gender || '',
          birthday: userData.birthday || '',
          username: userData.username || '',
          subscribeToNewsletter: userData.subscribeToNewsletter || false,
          address: {
            building: (userData.address && userData.address.building) || '',
            postcode: (userData.address && userData.address.postcode) || '',
            state: (userData.address && userData.address.state) || '',
            streetAddress: (userData.address && userData.address.streetAddress) || '',
            suburb: (userData.address && userData.address.suburb) || ''
          },
          role: customClaims.role || 'unknown'
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
