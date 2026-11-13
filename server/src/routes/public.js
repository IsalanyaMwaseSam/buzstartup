'use strict';

const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

// Public electronic receipt endpoint (accessible without login)
router.get('/receipt/:orderNumber', async (req, res) => {
  try {
    const db = await getDb();
    const orderStmt = db.prepare('SELECT * FROM orders WHERE order_number = ?');
    orderStmt.bind([req.params.orderNumber]);

    let order = null;
    if (orderStmt.step()) {
      order = orderStmt.getAsObject();
      order.items = JSON.parse(order.items_json || '[]');
      order.isPaid = order.payment_status === 'Paid';
    }
    orderStmt.free();

    if (!order) {
      return res.status(404).json({ error: 'Receipt not found.' });
    }

    // Retrieve business info
    const bizStmt = db.prepare('SELECT name, owner_name, phone, phone_prefix, email, currency, currency_code, country_code, logo_url, address, tagline FROM businesses WHERE id = ?');
    bizStmt.bind([order.business_id]);
    let business = null;
    if (bizStmt.step()) {
      business = bizStmt.getAsObject();
    }
    bizStmt.free();

    res.json({ order, business });
  } catch (err) {
    console.error('Public receipt lookup error:', err);
    res.status(500).json({ error: 'Failed to retrieve receipt.' });
  }
});

module.exports = router;
