# File Upload / Download Service – Frontend (Railway-ready)
# Uses Next.js standalone output for minimal production image.
# Build: docker build -t file-upload-frontend .
# Run:   docker run -p 3000:3000 -e API_URL=https://backend-fuds.up.railway.app file-upload-frontend
# API_URL is read at runtime (no rebuild needed). Or set NEXT_PUBLIC_API_URL at build time.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN mkdir -p /app/public

# Production image with standalone output
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
