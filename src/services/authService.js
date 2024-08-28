import mockUsers from '@/assets/json/mockUsers.json' // Import user data from JSON file

/**
 * Validate user login
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise<Object|null>} - Returns the user object if found, otherwise null
 */
export const validateLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    try {
      // Simulate async behavior like fetching from a real API
      const user = mockUsers.find((u) => u.email === email && u.password === password)
      resolve(user ? { ...user } : null)
    } catch (error) {
      reject(error)
    }
  })
}
