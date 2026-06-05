# --- build stage: install everything, compile shared+server+client ---
FROM node:22-slim AS build
WORKDIR /app

# Build tools in case better-sqlite3 has to compile from source.
RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Install deps first (better layer caching).
COPY package*.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci

# Build all three workspaces, then drop dev deps for a lean runtime.
COPY . .
RUN npm run build && npm prune --omit=dev

# --- runtime stage: just node + compiled output + prod deps ---
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared/package.json ./shared/package.json
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist

EXPOSE 3000
CMD ["node", "server/dist/index.js"]
