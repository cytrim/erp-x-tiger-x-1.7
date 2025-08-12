# © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.

FROM node:20-alpine

# Install system dependencies for better compatibility
RUN apk add --no-cache \
    bash \
    wget \
    curl \
    tini

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with better error handling
RUN npm ci --only=production --quiet 2>/dev/null || npm install --omit=dev

# Copy application code
COPY src ./src

# Create necessary directories
RUN mkdir -p /app/logs /app/temp

# Set environment
ENV NODE_ENV=production

# Add healthcheck script
RUN echo '#!/bin/sh\nwget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Copy and set permissions for entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Run with entrypoint
CMD ["/usr/local/bin/docker-entrypoint.sh"]