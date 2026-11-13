'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getDb, saveDb } = require('../database/db');
const { authenticate } = require('../middleware/auth');
const { isR2Configured, uploadBufferToR2, getR2SignedUrl } = require('../services/r2Storage');

// Memory storage for multer so we can directly stream / upload buffer to Cloudflare R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB logo max
});

// Update Business Profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const {
      name,
      owner_name,
      phone,
      phone_prefix,
      email,
      currency,
      currency_code,
      country_code,
      address,
      tagline,
      tax_reserve_rate,
      logo_url,
    } = req.body;

    const db = await getDb();
    const now = new Date().toISOString();

    db.run(
      `UPDATE businesses SET
        name = COALESCE(?, name),
        owner_name = COALESCE(?, owner_name),
        phone = COALESCE(?, phone),
        phone_prefix = COALESCE(?, phone_prefix),
        email = COALESCE(?, email),
        currency = COALESCE(?, currency),
        currency_code = COALESCE(?, currency_code),
        country_code = COALESCE(?, country_code),
        address = COALESCE(?, address),
        tagline = COALESCE(?, tagline),
        tax_reserve_rate = COALESCE(?, tax_reserve_rate),
        logo_url = COALESCE(?, logo_url),
        updated_at = ?
      WHERE id = ?`,
      [
        name,
        owner_name,
        phone,
        phone_prefix,
        email,
        currency,
        currency_code,
        country_code,
        address,
        tagline,
        tax_reserve_rate,
        logo_url,
        now,
        req.businessId,
      ]
    );

    saveDb();

    const stmt = db.prepare('SELECT * FROM businesses WHERE id = ?');
    stmt.bind([req.businessId]);
    stmt.step();
    const updated = stmt.getAsObject();
    stmt.free();

    res.json({ business: updated });
  } catch (err) {
    console.error('Update business profile error:', err);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// Upload Business Logo to Cloudflare R2
router.post('/logo', authenticate, upload.single('logo'), async (req, res) => {
  try {
    let imageBuffer = null;
    let mimeType = 'image/png';

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || 'image/png';
    } else if (req.body.imageBase64) {
      const matches = req.body.imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        imageBuffer = Buffer.from(req.body.imageBase64, 'base64');
      }
    }

    if (!imageBuffer) {
      return res.status(400).json({ error: 'No image file or imageBase64 data provided.' });
    }

    const fileExt = mimeType.split('/')[1] || 'png';
    const r2Key = `logos/${req.businessId}_${Date.now()}.${fileExt}`;

    let logoUrl = '';

    if (isR2Configured) {
      await uploadBufferToR2(imageBuffer, r2Key, mimeType);
      // Construct direct URL or presigned URL for R2 object
      logoUrl = `/api/business/logo-view/${r2Key}`;
      console.log(`[R2] Uploaded merchant logo to R2 key: ${r2Key}`);
    } else {
      // Local fallback: convert to base64 data URL
      logoUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    }

    // Save logo_url to business record
    const db = await getDb();
    const now = new Date().toISOString();

    db.run(
      'UPDATE businesses SET logo_url = ?, updated_at = ? WHERE id = ?',
      [logoUrl, now, req.businessId]
    );
    saveDb();

    res.json({ success: true, logo_url: logoUrl, r2Key });
  } catch (err) {
    console.error('Upload logo error:', err);
    res.status(500).json({ error: 'Failed to upload logo.' });
  }
});

// Serve logo from Cloudflare R2
router.get('/logo-view/*', async (req, res) => {
  try {
    const key = req.params[0];
    const { downloadBufferFromR2 } = require('../services/r2Storage');
    const buffer = await downloadBufferFromR2(key);

    if (!buffer) {
      return res.status(404).send('Logo not found.');
    }

    const ext = key.split('.').pop().toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'image/png';

    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Error streaming logo.');
  }
});

module.exports = router;
