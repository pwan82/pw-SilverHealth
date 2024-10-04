/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const { onRequest } = require('firebase-functions/v2/https')
// const logger = require('firebase-functions/logger')
// const { initializeApp } = require('firebase-admin/app')
const admin = require('firebase-admin')
const functions = require('firebase-functions')
// const cors = require('cors')({ origin: true })

// Initialize Firebase Admin only if it hasn't been initialized already
if (admin.apps.length === 0) {
  admin.initializeApp()
}

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

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

const { addOrUpdateUserInfo } = require('./userFunctions')
exports.addOrUpdateUserInfo = addOrUpdateUserInfo

const { getArticles, getArticleById, getArticleRatings } = require('./articleFunctions')
exports.getArticles = getArticles
exports.getArticleById = getArticleById
exports.getArticleRatings = getArticleRatings
