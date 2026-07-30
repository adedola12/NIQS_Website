# NIQS API — production image for Amazon ECS Express Mode (Fargate).
#
# Two stages so the runtime layer never carries npm's cache or dev dependencies.
# The container listens on $PORT (8080 by default) because Express Mode routes the
# ALB target group at the container port, and an unprivileged user cannot bind 80.

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

# curl backs the container HEALTHCHECK; the ALB probes /api/health over the network.
RUN apk add --no-cache curl

ENV NODE_ENV=production \
    PORT=8080

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# uploads/ is only touched by the local storage fallback. On Fargate the task
# filesystem is ephemeral, so anything landing here is lost on redeploy — it
# exists so a misconfigured S3 tier degrades instead of crashing. See utils/storage.js.
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/api/health" || exit 1

CMD ["node", "server.js"]
