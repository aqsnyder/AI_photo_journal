const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables from .env file

const { Pool } = require('pg'); // Import PostgreSQL pool
const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL pool configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the PostgreSQL database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to the database');
    release();
});

// Create the journal_entries table if it doesn't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        entry TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    )
`, (err, res) => {
    if (err) {
        console.error('Error creating table', err);
    } else {
        console.log('Table created or already exists');
    }
});

app.use(bodyParser.json());

// Serve static files from the "public" directory located at the root level
app.use(express.static(path.join(__dirname, '..', 'public')));

// Correct path to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Route to get the list of photo URLs
app.get('/photos', (req, res) => {
    const today = new Date();
    const folderName = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
    const photoDir = path.join(__dirname, 'photos', folderName);

    console.log(`Looking for photos in directory: ${photoDir}`);

    if (!fs.existsSync(photoDir)) {
        console.log('Directory does not exist, creating it now...');
        fs.mkdirSync(photoDir, { recursive: true });
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

// Route to save a journal entry to the PostgreSQL database
app.post('/journal-entry', (req, res) => {
    const { entry } = req.body;

    // Insert the journal entry into the database
    pool.query('INSERT INTO journal_entries (entry) VALUES ($1) RETURNING id', [entry], (err, result) => {
        if (err) {
            console.error('Error saving journal entry', err);
            return res.status(500).json({ error: 'Failed to save journal entry' });
        }

        res.json({ message: 'Journal entry saved', id: result.rows[0].id });
    });
});

// Route to retrieve all journal entries from the PostgreSQL database
app.get('/journal-entry', (req, res) => {
    pool.query('SELECT * FROM journal_entries ORDER BY created_at DESC', (err, result) => {
        if (err) {
            console.error('Error retrieving journal entries', err);
            return res.status(500).json({ error: 'Failed to retrieve journal entries' });
        }

        res.json(result.rows);
    });
});

// Run the downloadPhotos.js script when the server starts
exec('node downloadPhotos.js', { cwd: __dirname }, (err, stdout, stderr) => {
    if (err) {
        console.error(`Error running downloadPhotos.js: ${err}`);
        return;
    }
    console.log(stdout);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
