// Import the Firebase app and the functions you'll need for authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

// Your Firebase web app's configuration
const firebaseConfig = {
    apiKey: "AIzaSyBnVeFWwO-mn0pLrvnukqQE0vECYo3htw4",
    authDomain: "ai-photo-journal-44018.firebaseapp.com",
    projectId: "ai-photo-journal-44018",
    storageBucket: "ai-photo-journal-44018.appspot.com",
    messagingSenderId: "430077854434",
    appId: "1:430077854434:web:3c70c0d2317ff10034d4bb",
    measurementId: "G-EFZG50B1B6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// DOM content load event
document.addEventListener('DOMContentLoaded', () => {
    const album = document.getElementById('photo-album');
    const journalForm = document.getElementById('journal-form');
    const journalEntry = document.getElementById('journal-entry');
    const signInButton = document.getElementById('sign-in');
    const signOutButton = document.getElementById('sign-out');

    // Google Sign-In
    signInButton.addEventListener('click', () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log(`User ${user.displayName} signed in`);
                user.getIdToken().then((token) => {
                    // Store the user's ID token for authenticated API requests
                    localStorage.setItem('userToken', token);
                    document.getElementById('user-info').textContent = `Signed in as: ${user.displayName}`;
                    // Optionally show/hide elements based on sign-in status
                });
            })
            .catch((error) => {
                console.error('Error during sign-in:', error);
            });
    });

    // Google Sign-Out
    signOutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log('User signed out');
            localStorage.removeItem('userToken');
            document.getElementById('user-info').textContent = '';
        }).catch((error) => {
            console.error('Error during sign-out:', error);
        });
    });

    // Fetch photos from the Heroku backend
    fetch('https://aiphotojournal-e7c0ce8be0d6.herokuapp.com/photos')
        .then(response => response.json())
        .then(photoUrls => {
            photoUrls.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                album.appendChild(img);
            });
        })
        .catch(error => console.error('Error fetching photos:', error));

    // Fetch journal entries from the Heroku backend
    fetch('https://aiphotojournal-e7c0ce8be0d6.herokuapp.com/journal-entries')
        .then(response => response.json())
        .then(entries => {
            entries.forEach(entry => {
                const section = document.createElement('section');
                section.innerHTML = `<h2>${entry.date}</h2><p>${entry.text}</p>`;
                album.appendChild(section);
            });
        })
        .catch(error => console.error('Error fetching journal entries:', error));

    // Handle form submission to save a new journal entry
    journalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const entryText = journalEntry.value;
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD
        const userToken = localStorage.getItem('userToken'); // Get user token for authenticated request

        if (!userToken) {
            console.error('User is not authenticated');
            return;
        }

        fetch('https://aiphotojournal-e7c0ce8be0d6.herokuapp.com/journal-entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}` // Pass the ID token for authentication
            },
            body: JSON.stringify({ date: today, text: entryText }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Journal entry saved:', data);
            // Optionally clear the form or give feedback to the user
        })
        .catch(error => console.error('Error saving journal entry:', error));
    });
});
