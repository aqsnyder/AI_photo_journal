// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    const album = document.getElementById('photo-album');

    // Fetch the photos from the server
    fetch('/photos')
        .then(response => response.json())
        .then(photoUrls => {
            // Log the photo URLs for debugging purposes
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
});
