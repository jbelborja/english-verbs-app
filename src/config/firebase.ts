import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration for english-verbs-app
const firebaseConfig = {
    apiKey: "AIzaSyAEJ9Xe4DjXa2wiwlrz-S9RB5LXMzKSFFI",
    authDomain: "english-verbs-app.firebaseapp.com",
    projectId: "english-verbs-app",
    storageBucket: "english-verbs-app.firebasestorage.app",
    messagingSenderId: "364645965860",
    appId: "1:364645965860:web:c675335423acb4b64f78b1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth };
