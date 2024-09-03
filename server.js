const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Serve the photos directory
const photoBasePath = process.env.DOWNLOAD_DIR_BASE || path.join(__dirname, 'photos');
app.use('/photos', express.static(photoBasePath));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to get the list of photo URLs
app.get('/photos', (req, res) => {
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

        const photoUrls = files.map(file => `/photos/${folderName}/${file}`);
        res.json(photoUrls);
    });
});

// Path to store the journal entry
const journalFilePath = path.join(__dirname, 'journal.json');

// Route to save the journal entry
app.post('/journal-entry', (req, res) => {
    const { entry } = req.body;
    fs.writeFile(journalFilePath, JSON.stringify({ entry }), err => {
        if (err) {
            console.error('Failed to save journal entry', err);
            return res.status(500).json({ error: 'Failed to save journal entry' });
        }
        res.json({ message: 'Journal entry saved' });
    });
});

// Route to load the journal entry
app.get('/journal-entry', (req, res) => {
    if (fs.existsSync(journalFilePath)) {
        const data = JSON.parse(fs.readFileSync(journalFilePath, 'utf-8'));
        res.json(data);
    } else {
        res.json({ entry: '' });
    }
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
