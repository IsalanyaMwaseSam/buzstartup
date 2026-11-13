'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../database/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// List all orders for the authenticated business
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC');
    stmt.bind([req.businessId]);

    const orders = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      row.items = JSON.parse(row.items_json || '[]');
      row.isPaid = row.payment_status === 'Paid';
      orders.push(row);
    }
    stmt.free();

    res.json({ orders });
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Server error fetching orders.' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const {
      orderNumber,
      customerName,
      customerPhone = '',
      customerEmail = '',
      items = [],
      subtotal,
      discount = 0,
      total,
      amountPaid = 0,
      balanceDue = 0,
      paymentStatus = 'Paid',
      paymentMethod = 'Mobile Money',
      status = 'Received',
      notes = '',
    } = req.body;

    if (!orderNumber || !customerName || !items || items.length === 0) {
      return res.status(400).json({ error: 'Order number, customer name, and items are required.' });
    }

    const db = await getDb();
    const orderId = `ord-${Date.now()}-${uuidv4().substring(0, 5)}`;
    const now = new Date().toISOString();
    const itemsJson = JSON.stringify(items);

    db.run(
      `INSERT INTO orders (id, business_id, order_number, customer_name, customer_phone, customer_email, subtotal, discount, total, amount_paid, balance_due, payment_status, payment_method, status, notes, items_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        req.businessId,
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        subtotal,
        discount,
        total,
        amountPaid,
        balanceDue,
        paymentStatus,
        paymentMethod,
        status,
        notes,
        itemsJson,
        now,
        now,
      ]
    );

    // Sync Customer Record
    const custStmt = db.prepare('SELECT * FROM customers WHERE business_id = ? AND (LOWER(name) = ? OR (phone != "" AND phone = ?))');
    custStmt.bind([req.businessId, customerName.toLowerCase().trim(), customerPhone.trim()]);
    let existingCustomer = null;
    if (custStmt.step()) {
      existingCustomer = custStmt.getAsObject();
    }
    custStmt.free();

    if (existingCustomer) {
      const newTotalSpent = (existingCustomer.total_spent || 0) + total;
      const newBalance = (existingCustomer.total_outstanding_balance || 0) + balanceDue;
      const newCount = (existingCustomer.order_count || 0) + 1;

      db.run(
        `UPDATE customers SET total_spent = ?, total_outstanding_balance = ?, order_count = ?, last_purchase_date = ?, updated_at = ? WHERE id = ?`,
        [newTotalSpent, newBalance, newCount, now, now, existingCustomer.id]
      );
    } else {
      const custId = `cust-${Date.now()}`;
      db.run(
        `INSERT INTO customers (id, business_id, name, phone, email, notes, total_spent, total_outstanding_balance, order_count, last_purchase_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          custId,
          req.businessId,
          customerName,
          customerPhone,
          customerEmail,
          '',
          total,
          balanceDue,
          1,
          now,
          now,
          now,
        ]
      );
    }

    saveDb();

    res.status(201).json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        items,
        subtotal,
        discount,
        total,
        amountPaid,
        balanceDue,
        paymentStatus,
        paymentMethod,
        status,
        notes,
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to record order.' });
  }
});

// Update order status or payment
router.put('/:id', async (req, res) => {
  try {
    const { status, paymentStatus, amountPaid, balanceDue, paymentMethod } = req.body;
    const db = await getDb();
    const now = new Date().toISOString();

    db.run(
      `UPDATE orders SET
        status = COALESCE(?, status),
        payment_status = COALESCE(?, payment_status),
        amount_paid = COALESCE(?, amount_paid),
        balance_due = COALESCE(?, balance_due),
        payment_method = COALESCE(?, payment_method),
        updated_at = ?
      WHERE id = ? AND business_id = ?`,
      [status, paymentStatus, amountPaid, balanceDue, paymentMethod, now, req.params.id, req.businessId]
    );

    saveDb();

    res.json({ success: true, updatedAt: now });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ error: 'Failed to update order.' });
  }
});

module.exports = router;
