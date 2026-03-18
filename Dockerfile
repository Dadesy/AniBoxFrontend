# ─────────────────────────────────────────────────────────────────────────────
# Base — npm network hardening for Docker builds
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

WORKDIR /app

ENV NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_PROGRESS=false \
    NPM_CONFIG_LOGLEVEL=info \
    NPM_CONFIG_FOREGROUND_SCRIPTS=true \
    NPM_CONFIG_PREFER_OFFLINE=true \
    NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_FETCH_TIMEOUT=300000

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS deps

COPY package.json ./
RUN npm install --package-lock=false

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — development: полный набор зависимостей для локальной разработки
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS development

COPY package.json ./
RUN npm install --package-lock=false

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — builder
# ─────────────────────────────────────────────────────────────────────────────
FROM development AS builder

COPY . .

# NUXT_PUBLIC_API_URL прокидывается через ARG чтобы вшить в статику при сборке
ARG NUXT_PUBLIC_API_URL=http://localhost:8080/api
ENV NUXT_PUBLIC_API_URL=${NUXT_PUBLIC_API_URL}

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4 — runner
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS runner

ENV NODE_ENV=production

# Nuxt output — standalone-сервер, не нужен весь node_modules
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
