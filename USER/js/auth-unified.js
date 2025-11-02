// ========================================
// UNIFIED FIREBASE AUTHENTICATION SYSTEM
// ========================================

// Wait for Firebase to be available
function waitForFirebase() {
  return new Promise((resolve) => {
    if (window.firebase) {
      resolve()
    } else {
      const checkInterval = setInterval(() => {
        if (window.firebase) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    }
  })
}

// Initialize after Firebase is ready
waitForFirebase().then(() => {
  const firebase = window.firebase
  const auth = firebase.auth()
  const db = firebase.firestore()

  class UnifiedAuth {
    constructor() {
      this.currentUser = null
      this.isInitialized = false
      this.initPromise = this.init()
    }

    // Initialize auth and listen for state changes
    async init() {
      if (this.isInitialized) return Promise.resolve(this.currentUser)

      return new Promise((resolve) => {
        console.log("[v0] Initializing Firebase Auth...")

        auth.onAuthStateChanged(async (user) => {
          console.log("[v0] Auth state changed:", user ? user.email : "logged out")

          if (user) {
            this.currentUser = user
            // Store user in localStorage for persistence
            localStorage.setItem(
              "fixitnow_user",
              JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                loggedIn: true,
              }),
            )
            console.log("[v0] User logged in:", user.email)
          } else {
            this.currentUser = null
            localStorage.removeItem("fixitnow_user")
            console.log("[v0] User logged out")
          }

          this.isInitialized = true
          resolve(user)
        })
      })
    }

    // Login with email and password
    async login(email, password) {
      try {
        console.log("[v0] Attempting login for:", email)
        const result = await auth.signInWithEmailAndPassword(email, password)
        this.currentUser = result.user

        localStorage.setItem(
          "fixitnow_user",
          JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            loggedIn: true,
          }),
        )

        console.log("[v0] Login successful for:", email)
        return { success: true, user: result.user }
      } catch (error) {
        console.error("[v0] Login error:", error.code, error.message)
        return { success: false, error: error.message, code: error.code }
      }
    }

    // Sign up with email and password
    async signup(email, password, fullName, phone) {
      try {
        console.log("[v0] Attempting signup for:", email)
        const result = await auth.createUserWithEmailAndPassword(email, password)

        // Update profile
        await result.user.updateProfile({ displayName: fullName })

        // Store user data in Firestore
        await db.collection("users").doc(result.user.uid).set({
          uid: result.user.uid,
          email: email,
          displayName: fullName,
          phone: phone,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })

        this.currentUser = result.user

        localStorage.setItem(
          "fixitnow_user",
          JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            loggedIn: true,
          }),
        )

        console.log("[v0] Signup successful for:", email)
        return { success: true, user: result.user }
      } catch (error) {
        console.error("[v0] Signup error:", error.code, error.message)
        return { success: false, error: error.message, code: error.code }
      }
    }

    // Logout
    async logout() {
      try {
        await auth.signOut()
        this.currentUser = null
        localStorage.removeItem("fixitnow_user")
        console.log("[v0] Logout successful")
        return { success: true }
      } catch (error) {
        console.error("[v0] Logout error:", error.message)
        return { success: false, error: error.message }
      }
    }

    // Check if user is authenticated
    isAuthenticated() {
      return this.currentUser !== null
    }

    // Get current user
    getUser() {
      return this.currentUser
    }

    // Get user data from localStorage
    getUserData() {
      const stored = localStorage.getItem("fixitnow_user")
      return stored ? JSON.parse(stored) : null
    }

    // Wait for initialization
    async waitForInit() {
      return this.initPromise
    }
  }

  // Create global instance
  window.unifiedAuth = new UnifiedAuth()
  console.log("✅ Unified Auth System Loaded")
})
