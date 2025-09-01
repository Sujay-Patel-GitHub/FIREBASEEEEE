// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMfTOMyCbgah2QDk3xN1d_4rTHotBmtb8",
  authDomain: "leafwise-ai.firebaseapp.com",
  projectId: "leafwise-ai",
  storageBucket: "leafwise-ai.firebasestorage.app",
  messagingSenderId: "1084205718072",
  appId: "1:1084205718072:web:1d572ee1554f858ded64cd"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
