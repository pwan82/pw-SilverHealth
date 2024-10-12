import { defineStore } from 'pinia'
import { auth, db } from '@/firebase/init'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export const useAuthStore = defineStore('user', {
  state: () => ({
    userId: null,
    role: null,
    email: null,
    isLoggedIn: false,
    isAdmin: false,
    userInfo: null // Full user info from Firestore
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
        const userRole = idTokenResult.claims.role || 'unknown' // Default role to 'user' if not defined

        this.setUser(user.uid, userRole, user.email)
        this.fetchUserData(user.uid)
        console.log(`Uid: ${user.uid}, User Role: ${userRole}, Email: ${user.email}`)
      } else {
        console.error('You have not logged in!')
      }
    },
    logout() {
      signOut(auth)
        .then(() => {
          this.clearUser()
          // window.location.href = '/'
          console.log('Successfully logged out!')
          console.log(auth.currentUser)
        })
        .catch((error) => {
          console.error('Logout failed:', error)
        })
    },
    async fetchUserData(userId) {
      // Fetch the user document from Firestore
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        this.userInfo = userData // Store user information from Firestore
        console.log('Fetched user data from Firestore:', userData)
      } else {
        console.log('No user data found in Firestore for this user.')
      }
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
      this.userInfo = null

      this.isLoggedIn = false
      this.isAdmin = false
    }
  }
})
