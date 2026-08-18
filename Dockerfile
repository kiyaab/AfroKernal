# Multi-stage Dockerfile for AfroKernal (TanStack Start / React / Vite)

# -------------------------------------------------------------------
# Stage 1: Dependencies
# -------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# Install build dependencies if needed
RUN apk add --no-cache libc6-compat

# Copy package manifests
COPY package.json package-lock.json* ./

# Install dependencies using clean install
RUN npm ci

# -------------------------------------------------------------------
# Stage 2: Builder
# -------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Vite/client environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ARG SUPABASE_URL
ARG SUPABASE_PUBLISHABLE_KEY
ARG SUPABASE_PROJECT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY \
    SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID \
    NODE_ENV=production

# Disable telemetry and build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# -------------------------------------------------------------------
# Stage 3: Production Runner
# -------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Install curl for container health check
RUN apk add --no-cache curl

# Create unprivileged application user & group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 afrokernel

# Copy production build output and runtime files
COPY --from=builder --chown=afrokernel:nodejs /app/.output ./.output
COPY --from=builder --chown=afrokernel:nodejs /app/public ./public
COPY --from=builder --chown=afrokernel:nodejs /app/package.json ./package.json
COPY --from=builder --chown=afrokernel:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER afrokernel

# Expose standard application port
EXPOSE 3000

# Health check to ensure service availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the production Nitro SSR server
CMD ["node", ".output/server/index.mjs"]

