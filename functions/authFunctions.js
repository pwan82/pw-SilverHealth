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
