# ============================================================
# Stage 1: Build
# ============================================================
FROM node:22.21.1-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn
RUN corepack enable

# Copy dependency manifests first for better layer caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application source
COPY . .

# Build frontend
RUN yarn build:web


# ============================================================
# Stage 2: Runtime
# ============================================================
FROM node:22.21.1-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Enable Corepack
RUN corepack enable

# Copy only dependency manifests
COPY --from=builder /app/package.json /app/yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy only the build output
# IMPORTANT:
# Change "/app/<build-output>" to whatever directory
# yarn build:web actually generates.
COPY --from=builder /app/dist /app/dist

# Copy entrypoint
COPY --from=builder /app/entrypoint.sh /entrypoint.sh

RUN chmod 755 /entrypoint.sh && \
    chown -R appuser:appgroup /app /entrypoint.sh

USER appuser

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
