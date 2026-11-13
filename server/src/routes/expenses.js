'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../database/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get expenses for authenticated business
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM expenses WHERE business_id = ? ORDER BY date DESC');
    stmt.bind([req.businessId]);

    const expenses = [];
    while (stmt.step()) {
      expenses.push(stmt.getAsObject());
    }
    stmt.free();

    res.json({ expenses });
  } catch (err) {
    console.error('Fetch expenses error:', err);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

// Add new expense
router.post('/', async (req, res) => {
  try {
    const { title, category, amount, date, notes = '' } = req.body;
    if (!title || !category || amount === undefined) {
      return res.status(400).json({ error: 'Title, category, and amount are required.' });
    }

    const db = await getDb();
    const expenseId = `exp-${Date.now()}`;
    const now = new Date().toISOString();

    db.run(
      'INSERT INTO expenses (id, business_id, title, category, amount, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [expenseId, req.businessId, title, category, amount, date || now.split('T')[0], notes, now]
    );
    saveDb();

    res.status(201).json({
      success: true,
      expense: {
        id: expenseId,
        title,
        category,
        amount,
        date: date || now.split('T')[0],
        notes,
      },
    });
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ error: 'Failed to record expense.' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    db.run('DELETE FROM expenses WHERE id = ? AND business_id = ?', [req.params.id, req.businessId]);
    saveDb();
    res.json({ success: true });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
});

module.exports = router;
