const album = document.getElementById('photo-album');

fetch('/photos')
    .then(response => response.json())
    .then(photoUrls => {
        photoUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            album.appendChild(img);
        });
    })
    .catch(error => console.error('Error fetching photos:', error));
