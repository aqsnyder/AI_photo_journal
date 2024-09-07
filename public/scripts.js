import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";

// Your Firebase config (from the information you provided)
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
const auth = getAuth();
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
  console.log("scripts.js is loaded");

  const googleSignInBtn = document.getElementById('google-signin-btn');
  const signOutBtn = document.getElementById('signout-btn');
  const journalForm = document.getElementById('journal-form');
  const album = document.getElementById('photo-album');
  const journalEntry = document.getElementById('journal-entry');

  // Handle Google sign-in
  googleSignInBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // Successfully signed in
        console.log('User signed in:', result.user);
        // Hide the sign-in button, show the sign-out button and form
        googleSignInBtn.style.display = 'none';
        signOutBtn.style.display = 'block';
        journalForm.style.display = 'block';
      })
      .catch((error) => {
        console.error('Sign-in error:', error);
      });
  });

  // Handle Google sign-out
  signOutBtn.addEventListener('click', () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        // Show the sign-in button, hide the sign-out button and form
        googleSignInBtn.style.display = 'block';
        signOutBtn.style.display = 'none';
        journalForm.style.display = 'none';
      })
      .catch((error) => {
        console.error('Sign-out error:', error);
      });
  });

  // Listen for authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      console.log('User is signed in:', user);
      googleSignInBtn.style.display = 'none';
      signOutBtn.style.display = 'block';
      journalForm.style.display = 'block';
    } else {
      // User is signed out
      console.log('User is signed out');
      googleSignInBtn.style.display = 'block';
      signOutBtn.style.display = 'none';
      journalForm.style.display = 'none';
    }
  });

  // Fetch the photos and journal entries from the Heroku backend
  fetch('https://aiphotojournal-e7c0ce8be0d6.herokuapp.com/journal-entries')
    .then(response => response.json())
    .then(entries => {
      // Loop through entries and add photos and journal text to the DOM
      entries.forEach(entry => {
        // For each entry, create a section for the day
        const section = document.createElement('section');
        section.innerHTML = `<h2>${entry.date}</h2><p>${entry.text}</p>`;

        // Create a photo album for each entry
        const photoAlbum = document.createElement('div');
        entry.photos.forEach(photoUrl => {
          const img = document.createElement('img');
          img.src = photoUrl;
          photoAlbum.appendChild(img);
        });

        section.appendChild(photoAlbum);
        album.appendChild(section);
      });
    })
    .catch(error => console.error('Error fetching journal entries:', error));

  // Handle form submission to save a new journal entry
  journalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const entryText = journalEntry.value;
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD

    fetch('https://aiphotojournal-e7c0ce8be0d6.herokuapp.com/journal-entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: today, text: entryText }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Journal entry saved:', data);
        // Optionally refresh or give feedback to the user
      })
      .catch(error => console.error('Error saving journal entry:', error));
  });
});
