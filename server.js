const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const { Pool } = require('pg');  // PostgreSQL client

require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

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

// Route to get the list of photo URLs from the database
app.get('/photos', async (req, res) => {
    try {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const result = await pool.query('SELECT * FROM journal_images WHERE created_at::date = $1', [formattedDate]);

        const photoUrls = result.rows.map(row => `/photos/${row.id}`);

        res.json(photoUrls);
    } catch (err) {
        console.error('Failed to retrieve photos:', err);
        res.status(500).json({ error: 'Failed to retrieve photos' });
    }
});

// Route to get a specific photo by ID
app.get('/photos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM journal_images WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        const photo = result.rows[0];

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': photo.image_data.length,
        });

        res.end(photo.image_data);
    } catch (err) {
        console.error('Failed to retrieve photo:', err);
        res.status(500).json({ error: 'Failed to retrieve photo' });
    }
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
exec('node downloadPhotos.js', async (err, stdout, stderr) => {
    if (err) {
        console.error(`Error running downloadPhotos.js: ${err}`);
        return;
    }
    console.log(stdout);

    // After downloading photos, store them in the database
    const today = new Date();
    const folderName = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
    const photoDir = path.join(photoBasePath, folderName);

    if (fs.existsSync(photoDir)) {
        const files = fs.readdirSync(photoDir);

        for (const file of files) {
            const filePath = path.join(photoDir, file);
            const imageData = fs.readFileSync(filePath);
            const imageName = file;

            try {
                await pool.query(
                    'INSERT INTO journal_images (image_data, image_name, created_at) VALUES ($1, $2, NOW())',
                    [imageData, imageName]
                );
            } catch (err) {
                console.error('Failed to save image to database:', err);
            }
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
