// Firebase is already initialized in config.js and available globally
const firebase = window.firebase
const auth = firebase.auth()
const db = firebase.firestore()

// Simple Firebase Authentication
class WorkerAuth {
  constructor() {
    this.currentUser = null
    this.workerData = null
  }

  async init() {
    return new Promise((resolve) => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          this.currentUser = user
          const doc = await db.collection("workers").doc(user.uid).get()
          if (doc.exists) {
            this.workerData = { id: doc.id, ...doc.data() }
          }
        }
        resolve(user)
      })
    })
  }

  async signup(email, password, data) {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password)
      await result.user.updateProfile({ displayName: data.fullName })
      await db
        .collection("workers")
        .doc(result.user.uid)
        .set({
          uid: result.user.uid,
          fullName: data.fullName,
          email: email,
          phone: data.phone,
          categories: data.categories || [],
          isAvailable: false,
          rating: 0,
          completedJobs: 0,
          ongoingJobs: 0,
          totalEarnings: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
      this.currentUser = result.user
      this.workerData = (await db.collection("workers").doc(result.user.uid).get()).data()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async login(email, password) {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password)
      const doc = await db.collection("workers").doc(result.user.uid).get()
      if (!doc.exists) {
        await auth.signOut()
        return { success: false, error: "Worker profile not found" }
      }
      this.currentUser = result.user
      this.workerData = { id: doc.id, ...doc.data() }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider()
      const result = await auth.signInWithPopup(provider)
      let doc = await db.collection("workers").doc(result.user.uid).get()

      if (!doc.exists) {
        await db.collection("workers").doc(result.user.uid).set({
          uid: result.user.uid,
          fullName: result.user.displayName,
          email: result.user.email,
          phone: "",
          categories: [],
          isAvailable: false,
          rating: 0,
          completedJobs: 0,
          ongoingJobs: 0,
          totalEarnings: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        doc = await db.collection("workers").doc(result.user.uid).get()
      }

      this.currentUser = result.user
      this.workerData = { id: doc.id, ...doc.data() }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async logout() {
    await auth.signOut()
    this.currentUser = null
    this.workerData = null
    window.location.href = "pages/login.html"
  }

  isAuthenticated() {
    return this.currentUser !== null
  }

  getUser() {
    return this.currentUser
  }

  getWorkerData() {
    return this.workerData
  }
}

window.workerAuth = new WorkerAuth()
console.log("✅ Auth loaded")
