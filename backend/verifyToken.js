const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (Assuming this is already done)
admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "your_project_id",
        "private_key_id": "your_private_key_id",
        "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-abc@your-project-id.iam.gserviceaccount.com",
        "client_id": "your_client_id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-abc%40your-project-id.iam.gserviceaccount.com"
    })
});

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, token required' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
