# 1. Base stage
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 2. Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build argument for site URL during build (default fallback to https://seiyuu.page)
ARG NEXT_PUBLIC_SITE_URL=https://seiyuu.page
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ICP_BEIAN_NUMBER
ARG NEXT_PUBLIC_MPS_BEIAN_NUMBER
ENV NEXT_PUBLIC_ICP_BEIAN_NUMBER=$NEXT_PUBLIC_ICP_BEIAN_NUMBER
ENV NEXT_PUBLIC_MPS_BEIAN_NUMBER=$NEXT_PUBLIC_MPS_BEIAN_NUMBER
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# 4. Production runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Keep server-rendered routes consistent with the pages generated at build time.
ARG NEXT_PUBLIC_ICP_BEIAN_NUMBER
ARG NEXT_PUBLIC_MPS_BEIAN_NUMBER
ENV NEXT_PUBLIC_ICP_BEIAN_NUMBER=$NEXT_PUBLIC_ICP_BEIAN_NUMBER
ENV NEXT_PUBLIC_MPS_BEIAN_NUMBER=$NEXT_PUBLIC_MPS_BEIAN_NUMBER

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server output
COPY --from=builder /app/public ./public

# Set permissions for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/content/media ./content/media

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
