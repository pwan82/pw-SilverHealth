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
// const functions = require('firebase-functions')
// const cors = require('cors')({ origin: true })

// Initialize Firebase Admin only if it hasn't been initialized already
if (admin.apps.length === 0) {
  admin.initializeApp()
}

const { cloudFunctionsLocation: region } = require('./cloudFunctionsLocation')
console.log('cloudFunctionsLocation: ', region)

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// authFunctions
const { assignUserRole } = require('./authFunctions')
// Set custom claims for the user (default role is 'user')
exports.assignUserRole = assignUserRole

// userFunctions
const { getUserInfo, updateUserInfo } = require('./userFunctions')
exports.getUserInfo = getUserInfo
exports.updateUserInfo = updateUserInfo

// adminFunctions
const { onAdminUserChanged, getAllUsers, getWebsiteStatistics } = require('./adminFunctions')
// Triggered when there is a change in the adminUsers collection
exports.onAdminUserChanged = onAdminUserChanged
exports.getAllUsers = getAllUsers
exports.getWebsiteStatistics = getWebsiteStatistics

// articleFunctions
const {
  getArticles,
  getArticleById,
  getArticleRatings,
  publishArticleRating
} = require('./articleFunctions')
exports.getArticles = getArticles
exports.getArticleById = getArticleById
exports.getArticleRatings = getArticleRatings
exports.publishArticleRating = publishArticleRating

// emailFunctions
const { sendBulkEmails } = require('./emailFunctions')
exports.sendBulkEmails = sendBulkEmails

// eventFunctions
const {
  getEvents,
  getEventById,
  getEventBookings,
  getUserEventBookings,
  manageEventBooking,
  manageEvent
} = require('./eventFunctions')
exports.getEvents = getEvents
exports.getEventById = getEventById
exports.getEventBookings = getEventBookings
exports.getUserEventBookings = getUserEventBookings
exports.manageEventBooking = manageEventBooking
exports.manageEvent = manageEvent
