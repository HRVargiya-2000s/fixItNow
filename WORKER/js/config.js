// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxKS20xhl7KAR3AaeLEIT_yPTYInuDP48",
    authDomain: "fixitnow-75f80.firebaseapp.com",
    projectId: "fixitnow-75f80",
    storageBucket: "fixitnow-75f80.appspot.com",
    messagingSenderId: "645229251157",
    appId: "1:645229251157:web:00b0b6325b8dceb5d40e2dc"
};

// Initialize Firebase (guard against multiple initializations)
try {
    if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized (new app)');
    } else {
        console.log('✅ Firebase already initialized (reused existing app)');
    }
} catch (err) {
    console.error('Firebase init error:', err);
}

// Expose auth and db if available
const auth = (firebase && firebase.auth) ? firebase.auth() : null;
const db = (firebase && firebase.firestore) ? firebase.firestore() : null;

// Cloudinary Config
const cloudinaryURL = 'https://api.cloudinary.com/v1_1/dqs1kmwwy/image/upload';
const cloudinaryPreset = 'ml_default';

console.log('✅ Firebase config loaded');
