const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with the provided credentials
admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "ai-photo-journal-44018",
        "private_key_id": "271496ca4e6b8f9823012949058df9ac06b1dd9e",
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": "firebase-adminsdk-dxjst@ai-photo-journal-44018.iam.gserviceaccount.com",
        "client_id": "114270701341158485058",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dxjst%40ai-photo-journal-44018.iam.gserviceaccount.com"
    })
});

// Middleware to verify the Firebase ID token
const verifyToken = (req, res, next) => {
    const idToken = req.headers.authorization ? req.headers.authorization.split('Bearer ')[1] : null;

    if (!idToken) {
        return res.status(401).json({ message: 'Unauthorized, missing token.' });
    }

    admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            req.user = decodedToken;
            next();
        })
        .catch((error) => {
            console.error('Error verifying Firebase token:', error);
            res.status(401).json({ message: 'Unauthorized, invalid token.' });
        });
};

module.exports = verifyToken;

// change for push 