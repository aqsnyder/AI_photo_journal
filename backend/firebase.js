// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const auth = getAuth(app);

// Google Auth provider
const googleProvider = new GoogleAuthProvider();

// Function to sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    
    // The signed-in user info.
    const user = result.user;
    console.log("User signed in:", user);
    
    return { user, token };
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    return null;
  }
};

export { auth, signInWithGoogle };