// Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnVeFwWo-mn0pLrvnukqQEQvECYo3htw4",
  authDomain: "ai-photo-journal-44018.firebaseapp.com",
  projectId: "ai-photo-journal-44018",
  storageBucket: "ai-photo-journal-44018.appspot.com",
  messagingSenderId: "430077854434",
  appId: "1:430077854434:web:3c70c0d2317ff10034d4bb",
  measurementId: "G-EFZG5D81B6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth();

// Google Sign-In provider
const provider = new GoogleAuthProvider();

// Function to handle Google Sign-In
export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

// Function to handle sign-out
export const signOutUser = () => {
  return signOut(auth);
};

// Get the current authenticated user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export { auth };
