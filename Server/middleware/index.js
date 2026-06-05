const { adminAuth } = require('../config/firebase');

// Verifies a Firebase ID token taken from the Authorization: Bearer <token>
// header (preferred) or a body `access_token` field (legacy).
const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const idToken = header.startsWith('Bearer ')
    ? header.slice(7)
    : req.body && req.body.access_token;

  if (!idToken) {
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    req.user = await adminAuth.verifyIdToken(idToken);
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ error: 'Unauthorized' });
  }
};

module.exports = verifyToken;
