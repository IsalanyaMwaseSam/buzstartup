'use strict';

const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'business_hub_jwt_super_secure_secret_2026';

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await getDb();

    // Query user and associated business
    const userStmt = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?');
    userStmt.bind([decoded.userId]);
    let user = null;
    if (userStmt.step()) {
      user = userStmt.getAsObject();
    }
    userStmt.free();

    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    const bizStmt = db.prepare('SELECT * FROM businesses WHERE user_id = ?');
    bizStmt.bind([user.id]);
    let business = null;
    if (bizStmt.step()) {
      business = bizStmt.getAsObject();
    }
    bizStmt.free();

    req.user = user;
    req.business = business;
    req.businessId = business ? business.id : null;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = {
  authenticate,
  JWT_SECRET,
};
