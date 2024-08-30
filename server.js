const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

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

// Run the downloadPhotos.js script when the server starts
exec('node downloadPhotos.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error running downloadPhotos.js: ${err}`);
        return;
    }
    console.log(stdout);
});

// API route to trigger photo download manually (optional)
app.get('/download-photos', (req, res) => {
    exec('node downloadPhotos.js', (err, stdout, stderr) => {
        if (err) {
            return res.status(500).send(`Error running downloadPhotos.js: ${err}`);
        }
        res.send(`Photos downloaded successfully:\n${stdout}`);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
