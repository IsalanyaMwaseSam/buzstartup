/**
 * r2Storage.js — Cloudflare R2 Storage Adapter (S3-compatible)
 * Enables persistent cloud media storage on Render and cloud deployments
 * Stores database backups and business merchant logos in Cloudflare R2 bucket: business
 */

'use strict';

require('dotenv').config();

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const fs = require('fs');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'business';

const isR2Configured = Boolean(
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME
);

let s3Client = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  console.log(`[R2] Cloudflare R2 storage initialized for bucket: ${R2_BUCKET_NAME}`);
} else {
  console.log('[R2] R2 credentials not fully set. Running in local disk fallback mode.');
}

/**
 * Upload an in-memory Buffer directly to Cloudflare R2 (e.g. SQLite snapshot or merchant logo)
 */
async function uploadBufferToR2(buffer, key, contentType = 'application/octet-stream') {
  if (!isR2Configured) return null;
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
  return key;
}

/**
 * Download a buffer from Cloudflare R2 (returns Buffer or null)
 */
async function downloadBufferFromR2(key) {
  if (!isR2Configured) return null;
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    const res = await s3Client.send(command);
    const chunks = [];
    for await (const chunk of res.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    console.warn(`[R2] Could not fetch ${key} from R2:`, err.message);
    return null;
  }
}

/**
 * Delete an object from Cloudflare R2
 */
async function deleteFromR2(key) {
  if (!isR2Configured || !key) return;
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
  } catch (err) {
    console.warn(`[R2] Failed to delete object ${key}:`, err.message);
  }
}

/**
 * Generate a pre-signed URL for direct client access
 */
async function getR2SignedUrl(key, expiresInSeconds = 86400) {
  if (!isR2Configured || !key) return null;
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  } catch (err) {
    console.warn(`[R2] Presigned URL error for ${key}:`, err.message);
    return null;
  }
}

module.exports = {
  isR2Configured,
  s3Client,
  uploadBufferToR2,
  downloadBufferFromR2,
  deleteFromR2,
  getR2SignedUrl,
  R2_BUCKET_NAME,
};
