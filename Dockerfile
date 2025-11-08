# Multi-stage build for backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Backend runtime
FROM node:18-alpine

WORKDIR /app/backend

# Copy built backend
COPY --from=backend-builder /app/backend .

# Expose port
EXPOSE 5001

# Start server
CMD ["node", "src/server.js"]

