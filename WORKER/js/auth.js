// Simple Firebase Authentication
class WorkerAuth {
    constructor() {
        this.currentUser = null;
        this.workerData = null;
    }

    async init() {
        return new Promise((resolve) => {
            console.log('[WorkerAuth.init] Starting initialization...')
            auth.onAuthStateChanged(async (user) => {
                console.log('[WorkerAuth.init] onAuthStateChanged fired. User:', user ? user.uid : 'null')
                if (user) {
                    this.currentUser = user;
                    try {
                        const doc = await db.collection('workers').doc(user.uid).get();
                        if (doc.exists) {
                            this.workerData = { id: doc.id, ...doc.data() };
                            console.log('[WorkerAuth.init] Worker data loaded:', this.workerData)
                        } else {
                            console.warn('[WorkerAuth.init] Worker document not found for UID:', user.uid)
                        }
                    } catch (err) {
                        console.error('[WorkerAuth.init] Error fetching worker data:', err)
                    }
                } else {
                    console.log('[WorkerAuth.init] No user logged in')
                }
                resolve(user);
            });
        });
    }

    async signup(email, password, data) {
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            await result.user.updateProfile({ displayName: data.fullName });
            await db.collection('workers').doc(result.user.uid).set({
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
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            this.currentUser = result.user;
            this.workerData = (await db.collection('workers').doc(result.user.uid).get()).data();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async login(email, password) {
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            const doc = await db.collection('workers').doc(result.user.uid).get();
            if (!doc.exists) {
                await auth.signOut();
                return { success: false, error: 'Worker profile not found' };
            }
            this.currentUser = result.user;
            this.workerData = { id: doc.id, ...doc.data() };
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogle() {
        // Google sign-in is disabled for this application. Use email/password authentication only.
        return { success: false, error: 'Google sign-in disabled. Use email/password authentication.' };
    }

    async logout() {
        await auth.signOut();
        this.currentUser = null;
        this.workerData = null;
        // Redirect to the correct login path depending on current location
        try {
            const target = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
            // Use replace to avoid keeping the protected page in history
            window.location.replace(target);
        } catch (e) {
            // Fallback
            window.location.href = 'pages/login.html';
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getUser() {
        console.log('[WorkerAuth.getUser] Returning currentUser:', this.currentUser ? this.currentUser.uid : 'null')
        return this.currentUser;
    }

    getWorkerData() {
        return this.workerData;
    }
}

window.workerAuth = new WorkerAuth();
console.log('✅ WorkerAuth class loaded');
