const fs = require('fs');
const path = require('path');
const readline = require('readline');
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
    const { client_secret, client_id, redirect_uris } = credentials.web; // Use 'web' key for web application

    // Initialize the OAuth2 client with the credentials and redirect URI
    // const oAuth2Client = new google.auth.OAuth2(
    //     client_id,
    //     client_secret,
    //     `http://localhost:${PORT}/oauth2callback`  // Ensure this matches your Google Cloud Console configuration
    // );

    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        'http://localhost:8080/oauth2callback'  // This should match the redirect URI in the console
    );
    
    // Check if we have previously stored a token.
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

        const PORT = 8080;  // Ensure this is set to 8080

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
    const photoslibrary = google.photoslibrary({ version: 'v1', auth });

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    const response = await photoslibrary.mediaItems.search({
        requestBody: {
            filters: {
                dateFilter: {
                    dates: [{ year: parseInt(year), month: parseInt(month), day: parseInt(day) }],
                },
            },
        },
    });

    const items = response.data.mediaItems;
    if (!items || items.length === 0) {
        console.log('No photos found.');
        return;
    }

    items.forEach(item => {
        const photoUrl = item.baseUrl + '=d';
        const filePath = path.join('C:', 'Users', 'Aaron', 'OneDrive', 'Pictures', 'journal_photos', `${day}${month}${year}`, `${item.id}.jpg`);
        download(photoUrl, filePath);
    });
}

function download(url, filePath) {
    const file = fs.createWriteStream(filePath);
    require('https').get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close();
            console.log('Downloaded:', filePath);
        });
    });
}

// Run the script
downloadPhotos().catch(console.error);
