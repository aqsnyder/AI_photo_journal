const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { google } = require('googleapis');
const http = require('http');
const url = require('url');

// Path to your credentials JSON file
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/photoslibrary.readonly'];

// Port number where the server will listen
const PORT = 8080;

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

    const currentDay = {
        year: today.getFullYear(),
        month: today.getMonth() + 1, // months are 0-indexed in JavaScript
        day: today.getDate()
    };

    console.log('Using date filter for:', currentDay);

    // Create a folder for today's date (e.g., 01092024)
    const folderName = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
    const downloadDir = path.join('C:', 'Users', 'Aaron', 'OneDrive', 'Pictures', 'journal_photos', folderName);

    // Ensure the directory exists
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
    }

    // Set date filter to retrieve photos from today
    const params = {
        pageSize: 50, // Adjust as needed
        filters: {
            dateFilter: {
                dates: [currentDay]
            }
        }
    };

    const axioConfig = {
        method: 'post',
        url: 'https://photoslibrary.googleapis.com/v1/mediaItems:search',
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        data: params,
    };

    try {
        const response = await axios(axioConfig);
        const mediaItems = response.data.mediaItems;

        if (!mediaItems || mediaItems.length === 0) {
            console.log('No photos found for today.');
            return;
        }

        // Download each photo
        for (const item of mediaItems) {
            const photoUrl = `${item.baseUrl}=d`;  // Appending `=d` to get the download URL
            const filePath = path.join(downloadDir, item.filename || `${item.id}.jpg`);
            await downloadPhoto(photoUrl, filePath);
        }

        console.log(`Downloaded ${mediaItems.length} photos to ${downloadDir}`);

    } catch (error) {
        console.error('Error fetching photos:', error.message);
        console.error('Error details:', error.response?.data || error);
    }
}

async function downloadPhoto(photoUrl, filePath) {
    try {
        const response = await axios({
            url: photoUrl,
            method: 'GET',
            responseType: 'stream',
        });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Error downloading ${filePath}:`, error.message);
    }
}

// Run the script
downloadPhotos().catch(console.error);
