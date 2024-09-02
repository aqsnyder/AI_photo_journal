document.addEventListener('DOMContentLoaded', () => {
    console.log("scripts.js is loaded");
    const album = document.getElementById('photo-album');
    const journalForm = document.getElementById('journal-form');
    const journalEntry = document.getElementById('journal-entry');

    // Fetch the photos from the server
    fetch('/photos')
        .then(response => response.json())
        .then(photoUrls => {
            console.log('Fetched photo URLs:', photoUrls);

            // Append each photo as an img element to the album
            photoUrls.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Photo';
                album.appendChild(img);
            });
        })
        .catch(error => console.error('Error fetching photos:', error));

    // Fetch the saved journal entry
    fetch('/journal-entry')
        .then(response => response.json())
        .then(data => {
            journalEntry.value = data.entry || '';
        })
        .catch(error => console.error('Error loading journal entry:', error));

    // Handle form submission
    journalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const entry = journalEntry.value;

        fetch('/journal-entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ entry })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Journal entry saved:', data);
        })
        .catch(error => console.error('Error saving journal entry:', error));
    });
});
