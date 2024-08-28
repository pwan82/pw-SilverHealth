import mockUsers from '@/assets/json/mockUsers.json' // Import existing mock users

/**
 * Calculate new user ID by finding the maximum current ID and adding 1.
 * @returns {number} The new user ID.
 */
export const getNewUserId = () => {
  const maxId = mockUsers.reduce((max, user) => Math.max(max, user.userId), 0) // Find max userId
  return maxId + 1 // Return max ID + 1 for the new user
}
