const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true }) // Enable CORS with any origin

const db = admin.firestore()

const { checkUserRole } = require('./authFunctions')

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
      let isAdmin = false
      console.log(`getEvents: req.headers.authorization: ${req.headers.authorization}`)
      const authCheck = await checkUserRole(req.headers, 'admin')
      if (authCheck.status === 200) {
        isAdmin = true
      }

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
            description: eventData.description,
            category: eventData.category,
            address: eventData.address,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            totalCapacity: eventData.totalCapacity,
            remainingCapacity: eventData.remainingCapacity,
            isRegistrationOpen: eventData.isRegistrationOpen,
            isEventEnded: eventData.isEventEnded,
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
 * Fetch a single event by ID from Firestore.
 */
exports.getEventById = onRequest((req, res) => {
  return cors(req, res, async () => {
    const eventId = req.query.id

    if (!eventId) {
      return res.status(400).send('Event ID is required')
    }

    try {
      // Check if user is admin
      let isAdmin = false
      console.log(`getEventById: req.headers.authorization: ${req.headers.authorization}`)
      const authCheck = await checkUserRole(req.headers, 'admin')
      if (authCheck.status === 200) {
        isAdmin = true
      }

      // Fetch the event
      const eventDoc = await db.collection('events').doc(eventId).get()

      if (!eventDoc.exists) {
        return res.status(404).send('Event not found')
      }

      const eventData = eventDoc.data()

      // Check visibility
      if (eventData.isVisible || isAdmin) {
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
          isRegistrationOpen: eventData.isRegistrationOpen,
          isEventEnded: eventData.isEventEnded,
          isVisible: eventData.isVisible
        }

        console.log(`Returning event with ID: ${eventId}`)
        res.status(200).json(event)
      } else {
        // If the event is not visible and the user is not an admin
        res.status(403).send('You do not have permission to view this event')
      }
    } catch (error) {
      console.error(`Error fetching event: ${error}`)
      res.status(500).send('Error fetching event')
    }
  })
})
