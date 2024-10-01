import { defineStore } from 'pinia'
import { auth } from '@/firebase/init'
import { signOut, onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('user', {
  state: () => ({
    userId: null,
    role: null,
    email: null,
    isLoggedIn: false,
    isAdmin: false
  }),
  actions: {
    async checkAuthState() {
      if (this.isLoggedIn && this.userId) {
        return
      }

      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const idTokenResult = await user.getIdTokenResult()
            const userRole = idTokenResult.claims.role || 'user' // Default role to 'user' if not defined

            this.setUser(user.uid, userRole, user.email)
            resolve(true)
          } else {
            this.clearUser()
            resolve(false)
          }
        })
      })
    },
    async login() {
      const user = auth.currentUser
      if (user) {
        // Fetch the user's token with custom claims (including role)
        const idTokenResult = await user.getIdTokenResult()
        const userRole = idTokenResult.claims.role || 'user' // Default role to 'user' if not defined

        this.setUser(user.uid, userRole, user.email)
        console.log(`Uid: ${user.uid}, User Role: ${userRole}, Email: ${user.email}`)
      } else {
        console.error('You have not logged in!')
      }
    },
    logout() {
      signOut(auth)
        .then(() => {
          this.clearUser()
          console.log('Successfully logged out!')
          console.log(auth.currentUser)
        })
        .catch((error) => {
          console.error('Logout failed:', error)
        })
    },
    setUser(userId, role, email) {
      this.userId = userId
      this.role = role
      this.email = email

      this.isLoggedIn = true
      this.isAdmin = role === 'admin'
    },
    clearUser() {
      this.userId = null
      this.role = null
      this.email = null

      this.isLoggedIn = false
      this.isAdmin = false
    }
  }
})
