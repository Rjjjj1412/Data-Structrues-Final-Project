// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore"; // Firestore
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Authentication
import { getStorage } from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAKiOjEUVWF-_oLfFodGtYObv9k52gDeDw",
  authDomain: "caretech-aa0e0.firebaseapp.com",
  projectId: "caretech-aa0e0",
  storageBucket: "caretech-aa0e0.firebasestorage.app",
  messagingSenderId: "947615409284",
  appId: "1:947615409284:web:7f60bd5e7f617e8ef3ced1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore
const auth = getAuth(app); // Authentication
const storage = getStorage(app); // Initialize Firebase Storage

export { db, collection, addDoc, auth, storage, createUserWithEmailAndPassword };
