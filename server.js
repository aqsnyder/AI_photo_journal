const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Serve the photos directory
const photoBasePath = path.join('C:', 'Users', 'Aaron', 'OneDrive', 'Pictures', 'journal_photos');
app.use('/photos', express.static(photoBasePath));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/photos', (req, res) => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = today.getFullYear();
    const folderName = `${day}${month}${year}`;

    const photoDirectory = path.join(photoBasePath, folderName);

    fs.readdir(photoDirectory, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }

        const photos = files.map(file => `/photos/${folderName}/${file}`);
        res.json(photos);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
