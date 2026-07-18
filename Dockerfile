# =============================================================================
# Form2Sign - Dockerfile
# Multi-stage build for Node.js application
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build stage
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Chrome dependencies for Puppeteer
RUN apk add --no-cache \
    ca-certificates \
    ttf-liberation \
    alsa-lib \
    atk \
    at-spi2-core \
    cups \
    dbus \
    libdrm \
    mesa-gbm \
    gtk+3.0 \
    nspr \
    nss \
    libxcomposite \
    libxdamage \
    libxfixes \
    libxkbcommon \
    libxrandr \
    xdg-utils \
    ttf-freefont

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy all source files
COPY . .

# -----------------------------------------------------------------------------
# Stage 2: Production stage
# -----------------------------------------------------------------------------
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install Chrome dependencies for Puppeteer (production)
RUN apk add --no-cache \
    ca-certificates \
    ttf-liberation \
    alsa-lib \
    atk \
    at-spi2-core \
    cups \
    dbus \
    libdrm \
    mesa-gbm \
    gtk+3.0 \
    nspr \
    nss \
    libxcomposite \
    libxdamage \
    libxfixes \
    libxkbcommon \
    libxrandr \
    xdg-utils \
    ttf-freefont \
    chromium \
    freetype \
    harfbuzz

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend ./frontend

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "backend/app.js"]
