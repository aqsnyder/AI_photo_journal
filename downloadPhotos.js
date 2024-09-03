require('dotenv').config();  // Load environment variables from .env file
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const { Pool } = require('pg');  // PostgreSQL client

// Load configurations from environment variables
const CREDENTIALS_PATH = path.join(__dirname, process.env.CREDENTIALS_PATH || 'credentials.json');
const TOKEN_PATH = path.join(__dirname, process.env.TOKEN_PATH || 'token.json');
const SCOPES = process.env.SCOPES ? process.env.SCOPES.split(',') : ['https://www.googleapis.com/auth/photoslibrary.readonly'];
const PORT = process.env.PORT || 8080;

// PostgreSQL setup
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

async function authorize() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const { client_secret, client_id, redirect_uris } = credentials.web;

    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        `http://localhost:${PORT}/oauth2callback`
    );

    if (fs.existsSync(TOKEN_PATH)) {
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8')));
    } else {
        const token = await getAccessToken(oAuth2Client);
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to', TOKEN_PATH);
    }
    return oAuth2Client;
}

function getAccessToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this URL:', authUrl);

        const server = http.createServer(async (req, res) => {
            if (req.url.indexOf('/oauth2callback') > -1) {
                const qs = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
                res.end('Authentication successful! Please return to the console.');
                const { tokens } = await oAuth2Client.getToken(qs.get('code'));
                oAuth2Client.setCredentials(tokens);
                resolve(tokens);
                server.close();  // Cleanly close the server
            }
        }).listen(PORT, () => {
            console.log(`Listening on port ${PORT} for the OAuth callback...`);
        });
    });
}

async function downloadPhotos() {
    const auth = await authorize();
    const accessToken = auth.credentials.access_token;

    // Get today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JS months are 0-indexed
    const day = today.getDate();

    console.log(`Using date filter for: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

    const axioConfig = {
        method: 'get',
        url: 'https://photoslibrary.googleapis.com/v1/mediaItems',
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    };

    try {
        const response = await axios(axioConfig);
        const mediaItems = response.data.mediaItems;

        if (!mediaItems || mediaItems.length === 0) {
            console.log('No photos found.');
            return;
        }

        // Filter photos by today's date
        const filteredItems = mediaItems.filter(item => {
            const creationTime = new Date(item.mediaMetadata.creationTime);
            return creationTime.getFullYear() === year &&
                creationTime.getMonth() + 1 === month &&
                creationTime.getDate() === day;
        });

        if (filteredItems.length === 0) {
            console.log('No photos found for today.');
            return;
        }

        for (const item of filteredItems) {
            const photoUrl = `${item.baseUrl}=d`;  // Appending `=d` to get the download URL
            const imageName = item.filename || `${item.id}.jpg`;
            const imageData = await downloadPhoto(photoUrl);

            await pool.query(
                'INSERT INTO journal_images (image_data, image_name, created_at) VALUES ($1, $2, NOW())',
                [imageData, imageName]
            );
        }

        console.log(`Downloaded and stored ${filteredItems.length} photos to the database.`);

    } catch (error) {
        console.error('Error fetching photos:', error.message);
        console.error('Error details:', error.response?.data || error);
    }
}

async function downloadPhoto(photoUrl) {
    try {
        const response = await axios({
            url: photoUrl,
            method: 'GET',
            responseType: 'arraybuffer',
        });
        return response.data;
    } catch (error) {
        console.error(`Error downloading photo:`, error.message);
        return null;
    }
}

// Run the script
downloadPhotos().catch(console.error);
