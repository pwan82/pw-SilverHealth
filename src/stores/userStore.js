import { defineStore } from 'pinia'
import { getNewUserId } from '@/utils/getNewUserId'
import mockUsers from '@/assets/json/mockUsers.json'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    allMockUsers: JSON.parse(localStorage.getItem('allMockUsers') || JSON.stringify(mockUsers)) // Ensure users are loaded from localStorage or mock data
  }),
  getters: {
    isLoggedIn: (state) => !!state.currentUser // Check if a user is logged in
  },
  actions: {
    login(user) {
      const userIndex = this.allMockUsers.findIndex((u) => u.email === user.email) // Use allMockUsers to find the user
      if (userIndex !== -1) {
        this.allMockUsers[userIndex].lastLoginTime = Date.now() // Update the last login time to current time
        this.currentUser = { ...this.allMockUsers[userIndex] } // Store user info without password
        localStorage.setItem('allMockUsers', JSON.stringify(this.allMockUsers)) // Save updated users list to localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser)) // Save the current user to localStorage
      } else {
        throw new Error('User not found')
      }
    },
    logout() {
      this.currentUser = null
      localStorage.removeItem('currentUser')
    },
    restoreUser() {
      const savedUser = localStorage.getItem('currentUser')
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser) // Restore user from localStorage
      }
    },
    register(user) {
      const newUserId = getNewUserId()
      const newUser = {
        ...user,
        userId: newUserId,
        role: 'user',
        registrationTime: Date.now()
      }
      this.allMockUsers.push(newUser)
      localStorage.setItem('allMockUsers', JSON.stringify(this.allMockUsers)) // Save updated users list to localStorage
    }
  }
})
