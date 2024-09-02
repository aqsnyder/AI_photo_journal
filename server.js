const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 8080;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Serve the photos directory
const photoBasePath = path.join('C:', 'Users', 'Aaron', 'OneDrive', 'Pictures', 'journal_photos');

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to get the list of photo URLs
app.get('/photos', (req, res) => {
    // Read the latest photos folder based on today's date
    const today = new Date();
    const folderName = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
    const photoDir = path.join(photoBasePath, folderName);

    console.log(`Looking for photos in directory: ${photoDir}`);

    if (!fs.existsSync(photoDir)) {
        console.log('Directory does not exist');
        return res.json([]);  // Return an empty array if the directory doesn't exist
    }

    fs.readdir(photoDir, (err, files) => {
        if (err) {
            console.log('Failed to read photos directory', err);
            return res.status(500).json({ error: 'Failed to read photos directory' });
        }

        console.log('Files found:', files);

        // Map files to their URLs
        const photoUrls = files.map(file => `/photos/${folderName}/${file}`);
        res.json(photoUrls);
    });
});

// Run the downloadPhotos.js script when the server starts
exec('node downloadPhotos.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error running downloadPhotos.js: ${err}`);
        return;
    }
    console.log(stdout);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
