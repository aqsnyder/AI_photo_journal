document.addEventListener('DOMContentLoaded', () => {
    console.log("scripts.js is loaded");
    const album = document.getElementById('photo-album');
    const journalForm = document.getElementById('journal-form');
    const journalEntry = document.getElementById('journal-entry');

    // Fetch the photos and journal entries from the Heroku backend
    fetch('https://aiphotojournal.herokuapp.com/journal-entries')
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

        fetch('https://your-app-name.herokuapp.com/journal-entry', {
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
