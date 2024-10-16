const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Helper function: Check if user is authenticated and has specific role
exports.checkUserRole = async (reqHeaders, expectedRole) => {
  const token = reqHeaders.authorization && reqHeaders.authorization.split('Bearer ')[1]
  if (!token) {
    return { status: 401, message: 'Unauthorized', isLoggedIn: false, isAdmin: false }
  }
  console.log(`checkUserRole: req.headers.authorization: ${reqHeaders.authorization}`)
  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    console.log(`checkUserRole: decodedToken: ${decodedToken}`)

    const role = decodedToken.role
    // User is considered logged in if the token is successfully verified
    const isLoggedIn = true

    // Check if the user has an admin role
    const isAdmin = role === 'admin'

    if (expectedRole && role !== expectedRole) {
      return { status: 403, message: 'Forbidden', isLoggedIn: isLoggedIn, isAdmin: isAdmin }
    }

    return {
      status: 200,
      userId: decodedToken.uid,
      isLoggedIn: isLoggedIn,
      isAdmin: isAdmin,
      role: decodedToken.role
    }
  } catch (error) {
    console.error('Error verifying token:', error)
    return { status: 401, message: 'Unauthorized', isLoggedIn: false, isAdmin: false }
  }
}

// Set custom claims for the user (default role is 'user')
exports.assignUserRole = functions.auth.user().onCreate(async (user) => {
  return admin.auth().setCustomUserClaims(user.uid, { role: 'user' })

  // // Check if the user's email is pwan0082@student.monash.edu
  // const whiteList = ['pwan0082@student.monash.edu']
  // if (whiteList.includes(user.email)) {
  //   // Set custom claims for the user as 'admin'
  //   return admin.auth().setCustomUserClaims(user.uid, { role: 'admin' })
  // } else {
  //   // Set custom claims for the user as 'user' (default)
  //   return admin.auth().setCustomUserClaims(user.uid, { role: 'user' })
  // }
})

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
