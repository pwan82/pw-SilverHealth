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

admin.initializeApp()

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// exports.assignUserRole = functions.auth.user().onCreate(async (user) => {
//   // Set custom claims for the user (default role is 'user')
//   return admin.auth().setCustomUserClaims(user.uid, { role: 'user' })
// })

exports.assignUserRole = functions.auth.user().onCreate(async (user) => {
  // Check if the user's email is pwan0082@student.monash.edu
  const whiteList = ['pwan0082@student.monash.edu']
  if (whiteList.includes(user.email)) {
    // Set custom claims for the user as 'admin'
    return admin.auth().setCustomUserClaims(user.uid, { role: 'admin' })
  } else {
    // Set custom claims for the user as 'user' (default)
    return admin.auth().setCustomUserClaims(user.uid, { role: 'user' })
  }
})