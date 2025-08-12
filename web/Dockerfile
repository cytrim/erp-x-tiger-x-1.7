# © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --quiet 2>/dev/null || npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install serve and wget for healthcheck
RUN npm install -g serve@14 && \
    apk add --no-cache wget

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create a simple healthcheck
RUN echo '#!/bin/sh\nwget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD /healthcheck.sh

# Start server
CMD ["serve", "-s", "dist", "-l", "5173", "--no-clipboard", "--no-port-switching"]