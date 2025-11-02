// Firebase is already initialized in config.js and available globally

const firebase = window.firebase
const auth = firebase.auth()
const db = firebase.firestore()

class AuthSession {
  constructor() {
    this.currentUser = null
    this.isInitialized = false
  }

  async init() {
    if (this.isInitialized) return

    return new Promise((resolve) => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          this.currentUser = user
          // Store user in localStorage for persistence across pages
          localStorage.setItem(
            "user",
            JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              loggedIn: true,
            }),
          )
          console.log("[v0] User authenticated:", user.email)
        } else {
          this.currentUser = null
          localStorage.removeItem("user")
          console.log("[v0] User logged out")
        }
        this.isInitialized = true
        resolve(user)
      })
    })
  }

  async signup(email, password, fullName, phone) {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password)
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
        "user",
        JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          loggedIn: true,
        }),
      )

      return { success: true, user: result.user }
    } catch (error) {
      console.error("[v0] Signup error:", error)
      return { success: false, error: error.message }
    }
  }

  async login(email, password) {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password)
      this.currentUser = result.user

      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          loggedIn: true,
        }),
      )

      console.log("[v0] Login successful:", email)
      return { success: true, user: result.user }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return { success: false, error: error.message }
    }
  }

  async logout() {
    try {
      await auth.signOut()
      this.currentUser = null
      localStorage.removeItem("user")
      console.log("[v0] Logout successful")
      return { success: true }
    } catch (error) {
      console.error("[v0] Logout error:", error)
      return { success: false, error: error.message }
    }
  }

  isAuthenticated() {
    return this.currentUser !== null
  }

  getUser() {
    return this.currentUser
  }

  getCurrentUserData() {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  }
}

// Create global instance
window.authSession = new AuthSession()
console.log("✅ Auth session manager loaded")
