const admin = require("firebase-admin");
const dotenv = require('dotenv');
dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Middleware to verify Firebase ID Token
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next(); // Token is valid, proceed with the request
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(403).json({ message: "Unauthorized" });
  }
};

module.exports = verifyToken;
