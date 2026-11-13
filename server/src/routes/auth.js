'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../database/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// Register a new business owner
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      businessName,
      ownerName,
      phone,
      phonePrefix = '+256',
      currency = 'USh',
      currencyCode = 'UGX',
      countryCode = 'UG',
      tagline = '',
      address = '',
    } = req.body;

    if (!email || !password || !businessName || !ownerName) {
      return res.status(400).json({ error: 'Email, password, business name, and owner name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const db = await getDb();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    checkStmt.bind([cleanEmail]);
    const exists = checkStmt.step();
    checkStmt.free();

    if (exists) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = `usr-${uuidv4()}`;
    const businessId = `biz-${uuidv4()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    db.run(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
      [userId, cleanEmail, passwordHash, now]
    );

    db.run(
      `INSERT INTO businesses (id, user_id, name, owner_name, phone, phone_prefix, email, currency, currency_code, country_code, logo_url, address, tagline, tax_reserve_rate, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        businessId,
        userId,
        businessName.trim(),
        ownerName.trim(),
        phone || '',
        phonePrefix || '+256',
        cleanEmail,
        currency || 'USh',
        currencyCode || 'UGX',
        countryCode || 'UG',
        '',
        address || '',
        tagline || '',
        20,
        now,
        now,
      ]
    );

    saveDb();

    // Fetch newly created business
    const bizStmt = db.prepare('SELECT * FROM businesses WHERE id = ?');
    bizStmt.bind([businessId]);
    bizStmt.step();
    const business = bizStmt.getAsObject();
    bizStmt.free();

    const user = { id: userId, email: cleanEmail, created_at: now };
    const token = jwt.sign({ userId, businessId }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, user, business });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await getDb();
    const cleanEmail = email.trim().toLowerCase();

    const userStmt = db.prepare('SELECT * FROM users WHERE email = ?');
    userStmt.bind([cleanEmail]);
    let userRecord = null;
    if (userStmt.step()) {
      userRecord = userStmt.getAsObject();
    }
    userStmt.free();

    if (!userRecord || !bcrypt.compareSync(password, userRecord.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Get business record
    const bizStmt = db.prepare('SELECT * FROM businesses WHERE user_id = ?');
    bizStmt.bind([userRecord.id]);
    let business = null;
    if (bizStmt.step()) {
      business = bizStmt.getAsObject();
    }
    bizStmt.free();

    const user = { id: userRecord.id, email: userRecord.email, created_at: userRecord.created_at };
    const token = jwt.sign({ userId: user.id, businessId: business ? business.id : null }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user, business });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Current user & business profile
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user, business: req.business });
});

module.exports = router;
