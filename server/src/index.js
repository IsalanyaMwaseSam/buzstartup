'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const { getDb } = require('./database/db');
const { isR2Configured, R2_BUCKET_NAME } = require('./services/r2Storage');

const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const expenseRoutes = require('./routes/expenses');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON and urlencoded requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (useful for Render web service monitors)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    r2Storage: {
      configured: isR2Configured,
      bucket: R2_BUCKET_NAME,
    },
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/public', publicRoutes);

// Static frontend serving in production
const DIST_PATH = path.resolve(__dirname, '../../dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
  console.log(`[Server] Serving production frontend build from ${DIST_PATH}`);
}

// Start Server & Initialize Database
async function startServer() {
  try {
    await getDb();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(` Business Hub Platform Server running on port ${PORT}`);
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Cloudflare R2 bucket: ${R2_BUCKET_NAME} (${isR2Configured ? 'Active' : 'Offline'})`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
