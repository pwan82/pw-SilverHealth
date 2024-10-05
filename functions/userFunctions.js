const functions = require('firebase-functions')
const admin = require('firebase-admin')
const {
  isValidEmail,
  isValidUsername,
  isValidGender,
  isValidBirthday,
  isValidAddress
} = require('./validators') // Import validation functions

// Cloud Function to add or update user information with validation
exports.addOrUpdateUserInfo = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }

  const uid = context.auth.uid // Extract the user's ID from the context
  const db = admin.firestore()
  const userRef = db.collection('users').doc(uid) // Reference to the user's document

  // Initialize an object to hold the fields to be updated
  const updateData = {}

  // Conditionally add fields to the updateData object if they exist and pass validation

  if (data.email && isValidEmail(data.email)) {
    updateData.email = data.email
  } else if (data.email && !isValidEmail(data.email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid email format.')
  }

  if (data.username && isValidUsername(data.username)) {
    updateData.username = data.username
  } else if (data.username && !isValidUsername(data.username)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Username must be between 3 and 30 characters.'
    )
  }

  if (data.gender && isValidGender(data.gender)) {
    updateData.gender = data.gender
  } else if (data.gender && !isValidGender(data.gender)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid gender.')
  }

  if (data.birthday && isValidBirthday(data.birthday)) {
    updateData.birthday = data.birthday
  } else if (data.birthday && !isValidBirthday(data.birthday)) {
    throw new functions.https.HttpsError('invalid-argument', 'You must be at least 13 years old.')
  }

  // Address validation: If address object exists, validate each field
  if (data.address) {
    if (isValidAddress(data.address)) {
      updateData.address = {
        building: data.address.building || '',
        postcode: data.address.postcode || '',
        state: data.address.state || '',
        streetAddress: data.address.streetAddress || '',
        suburb: data.address.suburb || ''
      }
    } else {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid address details.')
    }
  }

  // If no valid fields are found to update, throw an error
  if (Object.keys(updateData).length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'No valid fields provided for update.')
  }

  try {
    // Set user information:
    //if the document does not exist, create it; otherwise, merge with existing data
    await userRef.set(updateData, { merge: true })

    // Update user information (excluding password)
    // await userRef.update(updateData)

    return { message: 'User information added or updated successfully!' }
  } catch (error) {
    console.error('Error adding or updating user information:', error)
    throw new functions.https.HttpsError('unknown', 'Failed to add or update user information')
  }
})
