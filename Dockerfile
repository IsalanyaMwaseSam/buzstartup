# Stage 1: Build React Frontend
FROM node:20-alpine AS web-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2: Production Fullstack Server
FROM node:20-alpine
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy server source
COPY server/ ./

# Copy built frontend from Stage 1 into /app/dist
COPY --from=web-builder /app/dist /app/dist

# Production Environment Variables
ENV NODE_ENV=production
ENV PORT=5000
ENV DATA_DIR=/app/data
ENV DB_PATH=/app/data/business_hub.db

# Cloudflare R2 Persistent Storage
ENV R2_ACCOUNT_ID=6c927077f0250b814380c346724551fb
ENV R2_ACCESS_KEY_ID=797eb78750487ed4527884fd2d2f9c1b
ENV R2_SECRET_ACCESS_KEY=47ea08c3c5e3064640690572a9376ef4ec1710719293e2c302810dbf7fb3b4a7
ENV R2_BUCKET_NAME=business

RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "src/index.js"]
