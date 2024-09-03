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

// Route to get the list of photo URLs and journal entries for all days
app.get('/journal-entries', (req, res) => {
    const entries = [];

    fs.readdir(photoBasePath, (err, folders) => {
        if (err) {
            console.log('Failed to read photos base directory', err);
            return res.status(500).json({ error: 'Failed to read photos base directory' });
        }

        folders.forEach(folderName => {
            const photoDir = path.join(photoBasePath, folderName);
            const journalFilePath = path.join(photoDir, 'journal.json');
            const photos = fs.readdirSync(photoDir).filter(file => file !== 'journal.json').map(file => `/photos/${folderName}/${file}`);

            let journalEntry = '';
            if (fs.existsSync(journalFilePath)) {
                journalEntry = JSON.parse(fs.readFileSync(journalFilePath, 'utf-8')).entry;
            }

            entries.push({
                date: formatDate(folderName),
                photos,
                text: journalEntry
            });
        });

        res.json(entries);
    });
});

// Route to save the journal entry for a specific day
app.post('/journal-entry', (req, res) => {
    const { date, text } = req.body;
    const folderName = parseDate(date);
    const journalFilePath = path.join(photoBasePath, folderName, 'journal.json');

    fs.writeFile(journalFilePath, JSON.stringify({ entry: text }), err => {
        if (err) {
            console.error('Failed to save journal entry', err);
            return res.status(500).json({ error: 'Failed to save journal entry' });
        }
        res.json({ message: 'Journal entry saved' });
    });
});

// Utility functions to format and parse dates
function formatDate(folderName) {
    const day = folderName.slice(0, 2);
    const month = folderName.slice(2, 4);
    const year = folderName.slice(4);
    return `${year}-${month}-${day}`;
}

function parseDate(date) {
    const [year, month, day] = date.split('-');
    return `${day}${month}${year}`;
}

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
