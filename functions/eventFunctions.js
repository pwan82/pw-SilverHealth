const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true }) // Enable CORS with any origin

const db = admin.firestore()

const { checkUserRole } = require('./authFunctions')
const { sanitizeEmailHtml } = require('./helpers')

/**
 * // GET ?limit={limit}&offset={offset}&category={category1}&category={category2}
 * Fetch event list with pagination and category filter
 */
exports.getEvents = onRequest((req, res) => {
  return cors(req, res, async () => {
    const { limit, offset = 0 } = req.query
    const categories = req.query.category

    try {
      let eventsList = []

      // Check if user is admin
      console.log(`getEvents: req.headers.authorization: ${req.headers.authorization}`)
      const authCheck = await checkUserRole(req.headers, 'admin')
      const isAdmin = authCheck.isAdmin

      // Initialize query with sorting
      let eventsQuery = db.collection('events').orderBy('startTime', 'desc')

      // Apply category filter if provided
      if (categories) {
        const categoryArray = Array.isArray(categories) ? categories : [categories.toLowerCase()]
        eventsQuery = eventsQuery.where('category', 'array-contains-any', categoryArray)
      }

      // Apply pagination only if limit is provided and not 0
      if (limit && Number(limit) > 0) {
        eventsQuery = eventsQuery.limit(Number(limit))
      }
      if (Number(offset) > 0) {
        eventsQuery = eventsQuery.offset(Number(offset))
      }

      // Execute query
      const eventsSnapshot = await eventsQuery.get()

      // Process query results
      eventsSnapshot.forEach((doc) => {
        const eventData = doc.data()
        if (eventData.isVisible === true || isAdmin) {
          eventsList.push({
            eventId: doc.id,
            organizerName: eventData.organizerName,
            title: eventData.title,
            category: eventData.category,
            address: eventData.address,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            totalCapacity: eventData.totalCapacity,
            remainingCapacity: eventData.remainingCapacity,
            registrationStartTime: eventData.registrationStartTime,
            registrationEndTime: eventData.registrationEndTime,
            isVisible: eventData.isVisible
          })
        }
      })

      console.log(`Returning ${eventsList.length} events`)
      res.status(200).json(eventsList)
    } catch (error) {
      console.error(`Error fetching events: ${error}`)
      res.status(500).send('Error fetching events')
    }
  })
})

/**
 * // GET ?id={eventId}
 * Fetch a single event by ID from Firestore using a transaction.
 * If user is logged in and has booked the event, include booking information.
 */
exports.getEventById = onRequest((req, res) => {
  return cors(req, res, async () => {
    const eventId = req.query.id

    if (!eventId) {
      return res.status(400).send('Event ID is required')
    }

    try {
      // Check user authentication and role
      const authCheck = await checkUserRole(req.headers, null)
      const { isLoggedIn, isAdmin, userId } = authCheck

      // Use a transaction to get event and booking data
      const result = await db.runTransaction(async (transaction) => {
        const eventRef = db.collection('events').doc(eventId)
        const eventDoc = await transaction.get(eventRef)

        if (!eventDoc.exists) {
          throw new Error('Event not found')
        }

        const eventData = eventDoc.data()

        // Check visibility
        if (!eventData.isVisible && !isAdmin) {
          throw new Error('You do not have permission to view this event')
        }

        const event = {
          eventId: eventDoc.id,
          organizerName: eventData.organizerName,
          title: eventData.title,
          description: eventData.description,
          category: eventData.category,
          address: eventData.address,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          totalCapacity: eventData.totalCapacity,
          remainingCapacity: eventData.remainingCapacity,
          registrationStartTime: eventData.registrationStartTime,
          registrationEndTime: eventData.registrationEndTime,
          isVisible: eventData.isVisible
        }

        // If user is logged in, check for booking
        if (isLoggedIn) {
          const bookingQuery = db
            .collection('eventBookings')
            .where('userId', '==', userId)
            .where('eventId', '==', eventId)
            .limit(1)

          const bookingDocs = await transaction.get(bookingQuery)

          if (!bookingDocs.empty) {
            const bookingDoc = bookingDocs.docs[0]
            const bookingData = bookingDoc.data()
            event.userBooking = {
              bookingId: bookingDoc.id,
              userId: bookingData.userId,
              eventId: bookingData.eventId,
              eventTitle: bookingData.eventTitle,
              startTime: bookingData.startTime,
              endTime: bookingData.endTime,
              bookingTime: bookingData.bookingTime,
              status: bookingData.status
            }
          }
        }

        return event
      })

      console.log(`Returning event with ID: ${eventId}`)
      res.status(200).json(result)
    } catch (error) {
      console.error(`Error fetching event: ${error}`)
      if (error.message === 'Event not found') {
        res.status(404).send('Event not found')
      } else if (error.message === 'You do not have permission to view this event') {
        res.status(403).send('You do not have permission to view this event')
      } else {
        res.status(500).send('Error fetching event')
      }
    }
  })
})

/**
 * Manages events in the system, including adding, updating, and deleting events.
 * This function handles all CRUD operations for events and is restricted to admin users.
 *
 * @function
 * @name manageEvent
 * @param {Object} req - The request object from Firebase Functions.
 * @param {Object} req.body - The body of the request.
 * @param {string} [req.body.eventId] - The ID of the event (required for update and delete operations).
 * @param {string} [req.body.action] - The action to perform ('delete' for deletion, otherwise add/update).
 * @param {Object} req.body.eventData - The event data (for add and update operations).
 * @param {string} req.body.eventData.organizerName - The name of the event organizer (max 100 characters).
 * @param {string} req.body.eventData.title - The title of the event (max 200 characters).
 * @param {string} req.body.eventData.description - The description of the event (max 3000 characters).
 * @param {string[]} req.body.eventData.category - An array of categories for the event (total max 200 characters).
 * @param {Object} req.body.eventData.address - The address details of the event.
 * @param {string} req.body.eventData.address.placeName - The name of the place.
 * @param {string} req.body.eventData.address.addressString - The full address string.
 * @param {number} req.body.eventData.address.latitude - The latitude of the event location.
 * @param {number} req.body.eventData.address.longitude - The longitude of the event location.
 * @param {number} req.body.eventData.startTime - The start time of the event (millisecond timestamp).
 * @param {number} req.body.eventData.endTime - The end time of the event (millisecond timestamp).
 * @param {number} req.body.eventData.totalCapacity - The total capacity of the event.
 * @param {number} req.body.eventData.remainingCapacity - The remaining capacity of the event.
 * @param {number} req.body.eventData.registrationStartTime - The start time for registration (millisecond timestamp).
 * @param {number} req.body.eventData.registrationEndTime - The end time for registration (millisecond timestamp).
 * @param {boolean} [req.body.eventData.isVisible=true] - Whether the event is visible to users.
 * @param {Object} res - The response object from Firebase Functions.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 *
 * @throws {Error} If the user is not authenticated as an admin.
 * @throws {Error} If required fields are missing or invalid.
 * @throws {Error} If data validation fails.
 */
exports.manageEvent = onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      const authCheck = await checkUserRole(req.headers, 'admin')
      if (!authCheck.isAdmin) {
        return res.status(403).send('Only admins can manage events')
      }

      const { eventId, action, ...eventData } = req.body

      // Handle delete action
      if (action === 'delete') {
        if (!eventId) {
          return res.status(400).send('Event ID is required for delete action')
        }
        await db.collection('events').doc(eventId).delete()
        return res.status(200).json({ message: 'Event deleted successfully', eventId })
      }

      // For add and update actions, proceed with validation
      if (action !== 'delete') {
        // Validate and sanitize text fields
        const textFields = ['organizerName', 'title', 'description']
        for (const field of textFields) {
          if (typeof eventData[field] !== 'string') {
            return res.status(400).send(`${field} must be a string`)
          }
          eventData[field] = sanitizeEmailHtml(eventData[field])
        }

        // Validate field lengths
        if (eventData.organizerName.length > 100) {
          return res.status(400).send('organizerName must not exceed 100 characters')
        }
        if (eventData.title.length > 200) {
          return res.status(400).send('title must not exceed 200 characters')
        }
        if (eventData.description.length > 3000) {
          return res.status(400).send('description must not exceed 3000 characters')
        }

        // Validate and sanitize category
        if (!Array.isArray(eventData.category)) {
          return res.status(400).send('category must be an array of strings')
        }
        eventData.category = eventData.category.map((cat) => sanitizeEmailHtml(cat))
        const categoryTotalLength = eventData.category.join('').length
        if (categoryTotalLength > 200) {
          return res
            .status(400)
            .send('Total length of all categories must not exceed 200 characters')
        }

        // Validate isVisible
        eventData.isVisible = eventData.isVisible !== false // Default to true

        // Validate timestamps
        const timeFields = ['startTime', 'endTime', 'registrationStartTime', 'registrationEndTime']
        for (const field of timeFields) {
          if (!Number.isInteger(eventData[field])) {
            return res.status(400).send(`${field} must be an integer timestamp in milliseconds`)
          }
        }

        // Time logic checks
        if (eventData.startTime >= eventData.endTime) {
          return res.status(400).send('startTime must be earlier than endTime')
        }
        if (eventData.registrationStartTime >= eventData.registrationEndTime) {
          return res
            .status(400)
            .send('registrationStartTime must be earlier than registrationEndTime')
        }
        if (eventData.registrationEndTime > eventData.startTime) {
          return res.status(400).send('registrationEndTime must not be later than startTime')
        }

        // Validate capacity
        if (!Number.isInteger(eventData.totalCapacity) || eventData.totalCapacity <= 0) {
          return res.status(400).send('totalCapacity must be a positive integer')
        }
        if (!Number.isInteger(eventData.remainingCapacity) || eventData.remainingCapacity < 0) {
          return res.status(400).send('remainingCapacity must be a non-negative integer')
        }
        if (eventData.remainingCapacity > eventData.totalCapacity) {
          return res.status(400).send('remainingCapacity must not exceed totalCapacity')
        }

        // Validate address
        if (typeof eventData.address !== 'object' || eventData.address === null) {
          return res.status(400).send('address must be an object')
        }
        const { latitude, longitude } = eventData.address
        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
          return res.status(400).send('Invalid latitude')
        }
        if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
          return res.status(400).send('Invalid longitude')
        }

        // Sanitize address text fields
        ['placeName', 'addressString'].forEach((field) => {
          if (typeof eventData.address[field] === 'string') {
            eventData.address[field] = sanitizeEmailHtml(eventData.address[field])
          } else {
            return res.status(400).send(`address.${field} must be a string`)
          }
        })
      }

      let result
      if (eventId) {
        // Update existing event
        const eventRef = db.collection('events').doc(eventId)
        await db.runTransaction(async (transaction) => {
          const eventDoc = await transaction.get(eventRef)
          if (!eventDoc.exists) {
            throw new Error('Event not found')
          }
          transaction.update(eventRef, eventData)
        })
        result = { message: 'Event updated successfully', eventId }
      } else {
        // Add new event
        const newEventRef = await db.collection('events').add(eventData)
        result = { message: 'Event added successfully', eventId: newEventRef.id }
      }

      console.log(`Event ${eventId ? 'updated' : 'added'}: ${result.eventId}`)
      res.status(200).json(result)
    } catch (error) {
      console.error(`Error in manageEvent: ${error}`)
      res.status(500).send(`Error managing event: ${error.message}`)
    }
  })
})

/**
 * Cloud Function to get all event bookings for the current user.
 */
exports.getUserEventBookings = onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Check user authentication
      const authCheck = await checkUserRole(req.headers, null)
      if (authCheck.status !== 200) {
        return res.status(authCheck.status).send(authCheck.message)
      }

      const { isLoggedIn, userId } = authCheck

      if (!isLoggedIn) {
        return res.status(401).send('User must be logged in to view bookings')
      }

      // Fetch bookings for the current user
      const bookingsSnapshot = await db
        .collection('eventBookings')
        .where('userId', '==', userId)
        .orderBy('bookingTime', 'desc')
        .get()

      const bookings = []
      bookingsSnapshot.forEach((doc) => {
        bookings.push({
          bookingId: doc.id,
          ...doc.data()
        })
      })

      console.log(`Returning ${bookings.length} bookings for user ${userId}`)
      res.status(200).json(bookings)
    } catch (error) {
      console.error(`Error fetching event bookings: ${error}`)
      res.status(500).send('Error fetching event bookings')
    }
  })
})

/**
 * Cloud Function to manage event bookings (book or cancel).
 * Includes user authentication, role check, visibility check, and capacity management.
 * { "eventId": "abc001", "action": "book" }
 * { "eventId": "abc001", "action": "cancel" }
 */
exports.manageEventBooking = onRequest((req, res) => {
  return cors(req, res, async () => {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    const { eventId, action } = req.body // action should be 'book' or 'cancel'

    if (!eventId || !action) {
      return res.status(400).send('Event ID and action are required')
    }

    if (action !== 'book' && action !== 'cancel') {
      return res.status(400).send('Invalid action. Use "book" or "cancel"')
    }

    try {
      // Check user role and authentication
      const authCheck = await checkUserRole(req.headers, null)
      if (authCheck.status !== 200) {
        return res.status(authCheck.status).send(authCheck.message)
      }

      const { isLoggedIn, isAdmin, userId } = authCheck

      if (!isLoggedIn) {
        return res.status(401).send('User must be logged in to manage bookings')
      }

      // Use a transaction to manage booking and update event capacity
      const result = await db.runTransaction(async (transaction) => {
        const eventRef = db.collection('events').doc(eventId)
        const eventDoc = await transaction.get(eventRef)

        if (!eventDoc.exists) {
          throw new Error('Event not found')
        }

        const eventData = eventDoc.data()

        // Check event visibility
        if (!eventData.isVisible && !isAdmin) {
          throw new Error('You do not have permission to book this event')
        }

        // New time-based validation
        const currentTime = Date.now()
        if (
          currentTime < eventData.registrationStartTime ||
          currentTime > eventData.registrationEndTime
        ) {
          throw new Error('Registration is not currently open for this event')
        }

        if (currentTime > eventData.endTime) {
          throw new Error('This event has already ended')
        }

        const bookingQuery = db
          .collection('eventBookings')
          .where('userId', '==', userId)
          .where('eventId', '==', eventId)

        const bookingDocs = await transaction.get(bookingQuery)
        const bookingExists = !bookingDocs.empty

        if (action === 'book') {
          if (bookingExists) {
            throw new Error('You have already booked this event')
          }

          if (eventData.remainingCapacity <= 0) {
            throw new Error('This event is fully booked')
          }

          // Create new booking
          const newBookingRef = db.collection('eventBookings').doc()
          transaction.set(newBookingRef, {
            userId: userId,
            eventId: eventId,
            eventTitle: eventData.title,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            bookingTime: currentTime,
            status: 'confirmed'
          })

          // Update remaining capacity
          transaction.update(eventRef, {
            remainingCapacity: admin.firestore.FieldValue.increment(-1)
          })

          return { message: 'Event booked successfully' }
        } else if (action === 'cancel') {
          if (!bookingExists) {
            throw new Error('Booking not found')
          }

          // Delete the booking
          transaction.delete(bookingDocs.docs[0].ref)

          // Update remaining capacity
          transaction.update(eventRef, {
            remainingCapacity: admin.firestore.FieldValue.increment(1)
          })

          return { message: 'Booking canceled successfully' }
        }
      })

      console.log(`Booking action ${action} completed for event ${eventId} by user ${userId}`)
      res.status(200).send(result.message)
    } catch (error) {
      console.error(`Error managing event booking: ${error}`)
      res.status(400).send(error.message)
    }
  })
})
