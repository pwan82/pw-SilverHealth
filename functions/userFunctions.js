const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true }) // Enable CORS with any origin

const {
  // isValidEmail,
  isValidUsername,
  isValidGender,
  isValidBirthday,
  isValidAddress,
  sanitizeAllHtml
} = require('./helpers') // Import validation and sanitization functions

const { checkUserRole } = require('./authFunctions')
const { cloudFunctionsLocation: region } = require('./cloudFunctionsLocation')

const db = admin.firestore()

/**
 * Cloud Function to update user information with validation and sanitization.
 * This function uses POST method and requires authentication.
 * Users can only update their own profile information.
 *
 * @function
 * @name updateUserInfo
 * @param {Object} req - The request object from Firebase Functions.
 * @param {Object} req.body - The body of the request containing user information to update.
 * @param {string} [req.body.username] - The user's username.
 * @param {string} [req.body.gender] - The user's gender.
 * @param {string} [req.body.birthday] - The user's birthday.
 * @param {Object} [req.body.address] - The user's address information.
 * @param {boolean} [req.body.subscribeToNewsletter] - Whether the user wants to subscribe to the newsletter.
 * @param {Object} res - The response object from Firebase Functions.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 *
 * @throws {Error} If the user is not authenticated or tries to update another user's information.
 * @throws {Error} If no valid fields are provided for update.
 * @throws {Error} If any of the provided fields fail validation.
 */
exports.updateUserInfo = onRequest({ region: region }, (req, res) => {
  return cors(req, res, async () => {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      // Check user authentication and role
      const authCheck = await checkUserRole(req.headers, null)
      if (!authCheck.isLoggedIn) {
        return res.status(401).send('User must be logged in to update profile')
      }

      const { userId } = authCheck
      const data = req.body

      // Ensure the user is updating their own profile
      if (data.userId && data.userId !== userId) {
        return res.status(403).send('You can only update your own profile')
      }

      // Sanitize all input data
      const sanitizedData = Object.keys(data).reduce((acc, key) => {
        if (typeof data[key] === 'string') {
          acc[key] = sanitizeAllHtml(data[key])
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          acc[key] = Object.keys(data[key]).reduce((subAcc, subKey) => {
            subAcc[subKey] =
              typeof data[key][subKey] === 'string'
                ? sanitizeAllHtml(data[key][subKey])
                : data[key][subKey]
            return subAcc
          }, {})
        } else {
          acc[key] = data[key]
        }
        return acc
      }, {})

      // Initialize an object to hold the fields to be updated
      const updateData = {}

      // Fetch the user's email from Firebase Auth
      const userRecord = await admin.auth().getUser(userId)
      updateData.email = userRecord.email

      // Validate username
      if (sanitizedData.username) {
        if (isValidUsername(sanitizedData.username)) {
          updateData.username = sanitizedData.username
        } else {
          return res.status(400).send('Username must be between 3 and 30 characters.')
        }
      }

      // Validate gender
      if (sanitizedData.gender) {
        if (isValidGender(sanitizedData.gender)) {
          updateData.gender = sanitizedData.gender
        } else {
          return res.status(400).send('Invalid gender.')
        }
      }

      // Validate birthday
      if (sanitizedData.birthday) {
        if (isValidBirthday(sanitizedData.birthday)) {
          updateData.birthday = sanitizedData.birthday
        } else {
          return res.status(400).send('You must be at least 13 years old.')
        }
      }

      // Validate address
      if (sanitizedData.address) {
        if (isValidAddress(sanitizedData.address)) {
          updateData.address = {
            building: sanitizedData.address.building || '',
            postcode: sanitizedData.address.postcode || '',
            state: sanitizedData.address.state || '',
            streetAddress: sanitizedData.address.streetAddress || '',
            suburb: sanitizedData.address.suburb || ''
          }
        } else {
          return res.status(400).send('Invalid address details.')
        }
      }

      // Set newsletter subscription
      if (sanitizedData.subscribeToNewsletter !== undefined) {
        updateData.subscribeToNewsletter = sanitizedData.subscribeToNewsletter === true
      }

      // If no valid fields are found to update, return an error
      if (Object.keys(updateData).length === 0) {
        return res.status(400).send('No valid fields provided for update.')
      }

      // All validations passed, now perform database operation
      const userRef = db.collection('users').doc(userId)

      // Update user information
      await userRef.set(updateData, { merge: true })

      console.log(`User information updated for user ${userId}`)
      res.status(200).json({ message: 'User information updated successfully!' })
    } catch (error) {
      console.error(`Error updating user information: ${error}`)
      res.status(500).send('Failed to update user information')
    }
  })
})

/**
 * Cloud Function to get user information.
 * This function uses GET method and requires authentication.
 * Users can only retrieve their own profile information.
 * If the user document doesn't exist, it returns an empty object.
 *
 * @function
 * @name getUserInfo
 * @param {Object} req - The request object from Firebase Functions.
 * @param {Object} res - The response object from Firebase Functions.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 *
 * @throws {Error} If the user is not authenticated.
 * @throws {Error} If there's an error retrieving the user information.
 */
exports.getUserInfo = onRequest({ region: region }, (req, res) => {
  return cors(req, res, async () => {
    // Check if the request method is GET
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      // Check user authentication and role
      const authCheck = await checkUserRole(req.headers, null)
      if (!authCheck.isLoggedIn) {
        return res.status(401).send('User must be logged in to retrieve profile')
      }

      const { userId } = authCheck

      // Retrieve user information from Firestore
      const userRef = db.collection('users').doc(userId)
      const userDoc = await userRef.get()

      let userData = {}

      if (userDoc.exists) {
        const data = userDoc.data()
        userData = {
          email: data.email || '',
          gender: data.gender || '',
          birthday: data.birthday || '',
          address: {
            streetAddress: data.address?.streetAddress || '',
            building: data.address?.building || '',
            suburb: data.address?.suburb || '',
            state: data.address?.state || '',
            postcode: data.address?.postcode || ''
          },
          username: data.username || '',
          subscribeToNewsletter: data.subscribeToNewsletter || false
        }
      }

      console.log(`User information retrieved for user ${userId}`)
      res.status(200).json(userData)
    } catch (error) {
      console.error(`Error retrieving user information: ${error}`)
      res.status(500).send('Failed to retrieve user information')
    }
  })
})
