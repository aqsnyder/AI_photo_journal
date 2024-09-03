document.addEventListener('DOMContentLoaded', () => {
    console.log("scripts.js is loaded");
    const journalEntriesContainer = document.getElementById('journal-entries');

    // Fetch the list of available journal entries
    fetch('/journal-entries')
        .then(response => response.json())
        .then(entries => {
            console.log('Fetched journal entries:', entries);

            // Append each journal entry with its photos to the DOM
            entries.forEach(entry => {
                const entrySection = document.createElement('section');
                entrySection.classList.add('journal-entry-section');

                const dateHeading = document.createElement('h2');
                dateHeading.textContent = entry.date;
                entrySection.appendChild(dateHeading);

                const album = document.createElement('div');
                album.classList.add('photo-album');

                entry.photos.forEach(photoUrl => {
                    const img = document.createElement('img');
                    img.src = photoUrl;
                    img.alt = 'Photo';
                    album.appendChild(img);
                });

                const textarea = document.createElement('textarea');
                textarea.value = entry.text || '';
                textarea.placeholder = 'Write about your day...';

                const saveButton = document.createElement('button');
                saveButton.textContent = 'Save';
                saveButton.addEventListener('click', () => {
                    const updatedEntry = textarea.value;

                    fetch('/journal-entry', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ date: entry.date, text: updatedEntry })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Journal entry saved:', data);
                    })
                    .catch(error => console.error('Error saving journal entry:', error));
                });

                entrySection.appendChild(album);
                entrySection.appendChild(textarea);
                entrySection.appendChild(saveButton);

                journalEntriesContainer.appendChild(entrySection);
            });
        })
        .catch(error => console.error('Error fetching journal entries:', error));
});
