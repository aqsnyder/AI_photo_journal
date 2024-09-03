require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8080;

// Body parser middleware
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Serve the photos directory
const photoBasePath = process.env.PHOTO_BASE_PATH || path.join(__dirname, 'photos');
app.use('/photos', express.static(photoBasePath));

// PostgreSQL setup
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

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

// Route to save the journal entry to PostgreSQL
app.post('/journal-entry', async (req, res) => {
    const { entry } = req.body;
    const today = new Date();

    const query = {
        text: 'INSERT INTO journal_entries(date, entry) VALUES($1, $2) RETURNING *',
        values: [today, entry],
    };

    try {
        const result = await pool.query(query);
        res.json({ message: 'Journal entry saved', entry: result.rows[0] });
    } catch (err) {
        console.error('Failed to save journal entry', err);
        res.status(500).json({ error: 'Failed to save journal entry' });
    }
});

// Route to load the journal entry from PostgreSQL
app.get('/journal-entry', async (req, res) => {
    const today = new Date();
    const query = {
        text: 'SELECT entry FROM journal_entries WHERE date = $1',
        values: [today],
    };

    try {
        const result = await pool.query(query);
        if (result.rows.length > 0) {
            res.json({ entry: result.rows[0].entry });
        } else {
            res.json({ entry: '' });
        }
    } catch (err) {
        console.error('Failed to load journal entry', err);
        res.status(500).json({ error: 'Failed to load journal entry' });
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
