# Multi-stage production build for Guidely Server
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
COPY ../shared/ ../shared/

RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/../shared ../shared

# Data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "dist/server.js"]
