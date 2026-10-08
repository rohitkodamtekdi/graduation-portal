# ============================================================
# Stage 1: Build
# ============================================================
FROM node:22.21.1-alpine AS builder

WORKDIR /app

# Enable Corepack/Yarn
RUN corepack enable

# Copy dependency files first for Docker layer caching
COPY package.json yarn.lock ./

# Install all dependencies required for the build
RUN yarn install --frozen-lockfile

# Copy application source
COPY . .

# Build frontend
RUN yarn build:web


# ============================================================
# Stage 2: Production Runtime
# ============================================================
FROM node:22.21.1-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Enable Corepack
RUN corepack enable

# Copy dependency files
COPY --from=builder /app/package.json /app/yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy server
COPY --from=builder /app/server.js ./server.js

# Copy frontend build
COPY --from=builder /app/dist ./dist

# Copy entrypoint
COPY --from=builder /app/entrypoint.sh /entrypoint.sh

# Set permissions
RUN chmod 755 /entrypoint.sh && \
    chown -R appuser:appgroup /app /entrypoint.sh

# Don't run application as root
USER appuser

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
