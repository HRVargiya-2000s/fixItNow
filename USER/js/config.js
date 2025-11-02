// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxKS20xhl7KAR3AaeLEIT_yPTYInuDP48",
  authDomain: "fixitnow-75f80.firebaseapp.com",
  projectId: "fixitnow-75f80",
  storageBucket: "fixitnow-75f80.appspot.com",
  messagingSenderId: "645229251157",
  appId: "1:645229251157:web:00b0b6325b8dceb5d40e2dc",
}

// Declare Firebase variable
const firebase = window.firebase

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const db = firebase.firestore()

console.log("✅ Firebase initialized")

// Cloudinary Config
const cloudinaryURL = "https://api.cloudinary.com/v1_1/dqs1kmwwy/image/upload"
const cloudinaryPreset = "ml_default"
