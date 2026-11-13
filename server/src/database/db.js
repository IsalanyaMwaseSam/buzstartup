/**
 * db.js — Multi-Tenant SQLite Database via sql.js with Cloudflare R2 Persistence
 * Manages businesses, users, orders, customers, and expenses.
 */

'use strict';

const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'business_hub.db');
const DB_R2_KEY = 'db/business_hub.db';

let _db = null;
let _saveDebounceTimer = null;

function saveDb() {
  if (_db) {
    const data = _db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);

    // Debounced automatic backup to Cloudflare R2 bucket: business
    clearTimeout(_saveDebounceTimer);
    _saveDebounceTimer = setTimeout(async () => {
      try {
        const { isR2Configured, uploadBufferToR2 } = require('../services/r2Storage');
        if (isR2Configured) {
          await uploadBufferToR2(buffer, DB_R2_KEY, 'application/x-sqlite3');
          console.log('[DB] Database snapshot successfully backed up to Cloudflare R2 (bucket: business)');
        }
      } catch (err) {
        console.warn('[DB] Could not sync snapshot to R2:', err.message);
      }
    }, 2000);
  }
}

async function getDb() {
  if (!_db) {
    const SQL = await initSqlJs();
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Cold boot check: if local db doesn't exist or is empty, try restoring from Cloudflare R2
    if (!fs.existsSync(DB_PATH) || fs.statSync(DB_PATH).size === 0) {
      try {
        const { isR2Configured, downloadBufferFromR2 } = require('../services/r2Storage');
        if (isR2Configured) {
          console.log('[DB] Checking Cloudflare R2 for existing database snapshot...');
          const r2DbBuffer = await downloadBufferFromR2(DB_R2_KEY);
          if (r2DbBuffer && r2DbBuffer.length > 0) {
            fs.writeFileSync(DB_PATH, r2DbBuffer);
            console.log(`[DB] Restored database snapshot from Cloudflare R2 (${r2DbBuffer.length} bytes)`);
          }
        }
      } catch (err) {
        console.warn('[DB] R2 restore check failed, initializing clean database:', err.message);
      }
    }

    if (fs.existsSync(DB_PATH) && fs.statSync(DB_PATH).size > 0) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      _db = new SQL.Database(fileBuffer);
      console.log('[DB] Loaded existing SQLite database from disk');
    } else {
      _db = new SQL.Database();
      console.log('[DB] Initialized fresh SQLite database in memory');
    }

    // Initialize Schema
    initSchema();
  }
  return _db;
}

function initSchema() {
  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      phone_prefix TEXT NOT NULL,
      email TEXT,
      currency TEXT NOT NULL,
      currency_code TEXT NOT NULL,
      country_code TEXT NOT NULL,
      logo_url TEXT,
      address TEXT,
      tagline TEXT,
      tax_reserve_rate REAL DEFAULT 20,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      amount_paid REAL NOT NULL,
      balance_due REAL NOT NULL,
      payment_status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      items_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      notes TEXT,
      total_spent REAL DEFAULT 0,
      total_outstanding_balance REAL DEFAULT 0,
      order_count INTEGER DEFAULT 0,
      last_purchase_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
  `);

  // Seed default demonstration business (Perfect Scents) if no users exist
  const countStmt = _db.prepare('SELECT COUNT(*) as count FROM users');
  countStmt.step();
  const userCount = countStmt.getAsObject().count;
  countStmt.free();

  if (userCount === 0) {
    seedDefaultData();
  } else {
    saveDb();
  }
}

function seedDefaultData() {
  const defaultUserId = 'usr-perfect-scents';
  const defaultBusinessId = 'biz-perfect-scents';
  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync('demo1234', 10);

  _db.run(
    `INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)`,
    [defaultUserId, 'demo@perfectscents.com', passwordHash, now]
  );

  _db.run(
    `INSERT INTO businesses (id, user_id, name, owner_name, phone, phone_prefix, email, currency, currency_code, country_code, logo_url, address, tagline, tax_reserve_rate, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      defaultBusinessId,
      defaultUserId,
      'Perfect Scents',
      'Samuel Mwase',
      '746022116',
      '+256',
      'isalanyamwasesam@gmail.com',
      'USh',
      'UGX',
      'UG',
      '',
      'Shop 12, Victoria Mall, Entebbe Road',
      'Providing you with your affordable perfect scent.',
      20,
      now,
      now,
    ]
  );

  // Seed order INV-7215 (Paid)
  const itemsInv7215 = JSON.stringify([
    { id: 'item-1', name: 'Blueberry Perfume (50ml)', quantity: 1, unitPrice: 80000 },
  ]);
  _db.run(
    `INSERT INTO orders (id, business_id, order_number, customer_name, customer_phone, customer_email, subtotal, discount, total, amount_paid, balance_due, payment_status, payment_method, status, notes, items_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ord-7215',
      defaultBusinessId,
      'INV-7215',
      'Samuel Mwase',
      '+256 790966231',
      'samuel@example.com',
      80000,
      0,
      80000,
      80000,
      0,
      'Paid',
      'Mobile Money',
      'Completed',
      'Delivered to Nansana, Nsumbi',
      itemsInv7215,
      now,
      now,
    ]
  );

  // Seed order INV-1048 (Partially Paid)
  const itemsInv1048 = JSON.stringify([
    { id: 'item-2', name: 'Vanilla Amber Oud', quantity: 1, unitPrice: 120000 },
    { id: 'item-3', name: 'Pocket Travel Atomizer', quantity: 1, unitPrice: 20000 },
  ]);
  _db.run(
    `INSERT INTO orders (id, business_id, order_number, customer_name, customer_phone, customer_email, subtotal, discount, total, amount_paid, balance_due, payment_status, payment_method, status, notes, items_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ord-1048',
      defaultBusinessId,
      'INV-1048',
      'Marcus Vance',
      '+256 701234567',
      'marcus.v@example.com',
      140000,
      10000,
      130000,
      80000,
      50000,
      'Partially Paid',
      'Mobile Money',
      'In Progress',
      'Client paid 80k deposit, balance of 50k to be cleared on delivery.',
      itemsInv1048,
      new Date(Date.now() - 86400000).toISOString(),
      new Date(Date.now() - 86400000).toISOString(),
    ]
  );

  // Seed order INV-1049 (Unpaid)
  const itemsInv1049 = JSON.stringify([
    { id: 'item-4', name: 'Rose & Sandalwood Diffuser', quantity: 1, unitPrice: 65000 },
  ]);
  _db.run(
    `INSERT INTO orders (id, business_id, order_number, customer_name, customer_phone, customer_email, subtotal, discount, total, amount_paid, balance_due, payment_status, payment_method, status, notes, items_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ord-1049',
      defaultBusinessId,
      'INV-1049',
      'Elena Rostova',
      '+256 782345678',
      'elena@example.com',
      65000,
      0,
      65000,
      0,
      65000,
      'Unpaid',
      'Pending',
      'Ready',
      'Full payment of 65k due on pickup Friday afternoon.',
      itemsInv1049,
      new Date(Date.now() - 172800000).toISOString(),
      new Date(Date.now() - 172800000).toISOString(),
    ]
  );

  // Seed Customers
  _db.run(
    `INSERT INTO customers (id, business_id, name, phone, email, notes, total_spent, total_outstanding_balance, order_count, last_purchase_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'cust-1',
      defaultBusinessId,
      'Samuel Mwase',
      '+256 790966231',
      'samuel@example.com',
      'Prefers sweet, fruity notes like Blueberry and Citrus.',
      80000,
      0,
      1,
      now,
      now,
      now,
    ]
  );

  _db.run(
    `INSERT INTO customers (id, business_id, name, phone, email, notes, total_spent, total_outstanding_balance, order_count, last_purchase_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'cust-2',
      defaultBusinessId,
      'Marcus Vance',
      '+256 701234567',
      'marcus.v@example.com',
      'Regular customer. Has open balance of 50k on order INV-1048.',
      130000,
      50000,
      1,
      new Date(Date.now() - 86400000).toISOString(),
      new Date(Date.now() - 86400000).toISOString(),
      now,
    ]
  );

  _db.run(
    `INSERT INTO customers (id, business_id, name, phone, email, notes, total_spent, total_outstanding_balance, order_count, last_purchase_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'cust-3',
      defaultBusinessId,
      'Elena Rostova',
      '+256 782345678',
      'elena@example.com',
      'Home fragrance enthusiast. Total 65k to be paid on Friday.',
      65000,
      65000,
      1,
      new Date(Date.now() - 172800000).toISOString(),
      new Date(Date.now() - 172800000).toISOString(),
      now,
    ]
  );

  // Seed Expenses
  _db.run(
    `INSERT INTO expenses (id, business_id, title, category, amount, date, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'exp-1',
      defaultBusinessId,
      'Fragrance glass bottles & atomizers restock',
      'Supplies & Materials',
      150000,
      new Date(Date.now() - 432000000).toISOString().split('T')[0],
      '',
      now,
    ]
  );

  saveDb();
  console.log('[DB] Seeded initial demonstration business data (Perfect Scents)');
}

module.exports = {
  getDb,
  saveDb,
};
