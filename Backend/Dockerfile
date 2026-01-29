# File Upload / Download Service – Backend (Railway-ready)
# Railway sets PORT automatically; the app uses process.env.PORT (default 3001).
# Build: docker build -t file-upload-backend -f Backend/Dockerfile Backend/
# Run:   docker run -p 3001:3001 -e MONGODB_URI=... -e JWT_SECRET=... -e FRONTEND_ORIGIN=... -e BASE_URL=... file-upload-backend

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
# Railway injects PORT at runtime; fallback for local runs
ENV PORT=3001

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Railway expects the container to listen on PORT
EXPOSE 3001

CMD ["node", "dist/index.js"]
