'use strict';

const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../database/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// List customers for this business
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const custStmt = db.prepare('SELECT * FROM customers WHERE business_id = ? ORDER BY last_purchase_date DESC');
    custStmt.bind([req.businessId]);

    const customers = [];
    while (custStmt.step()) {
      const c = custStmt.getAsObject();

      // Retrieve customer's purchase history summary
      const histStmt = db.prepare('SELECT id, order_number, total, amount_paid, balance_due, payment_status, items_json, created_at FROM orders WHERE business_id = ? AND (LOWER(customer_name) = ? OR (customer_phone != "" AND customer_phone = ?)) ORDER BY created_at DESC');
      histStmt.bind([req.businessId, c.name.toLowerCase().trim(), c.phone.trim()]);
      const purchaseHistory = [];
      while (histStmt.step()) {
        const o = histStmt.getAsObject();
        const items = JSON.parse(o.items_json || '[]');
        const summary = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
        purchaseHistory.push({
          orderId: o.id,
          date: o.created_at,
          total: o.total,
          amountPaid: o.amount_paid,
          balanceDue: o.balance_due,
          paymentStatus: o.payment_status,
          itemsSummary: summary,
        });
      }
      histStmt.free();

      customers.push({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        totalSpent: c.total_spent,
        totalOutstandingBalance: c.total_outstanding_balance,
        orderCount: c.order_count,
        lastPurchaseDate: c.last_purchase_date,
        purchaseHistory,
      });
    }
    custStmt.free();

    res.json({ customers });
  } catch (err) {
    console.error('Fetch customers error:', err);
    res.status(500).json({ error: 'Server error fetching customers.' });
  }
});

// Update customer notes
router.put('/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    const db = await getDb();
    const now = new Date().toISOString();

    db.run(
      'UPDATE customers SET notes = ?, updated_at = ? WHERE id = ? AND business_id = ?',
      [notes || '', now, req.params.id, req.businessId]
    );
    saveDb();

    res.json({ success: true });
  } catch (err) {
    console.error('Update customer notes error:', err);
    res.status(500).json({ error: 'Failed to update customer notes.' });
  }
});

module.exports = router;
