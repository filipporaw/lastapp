FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
# Set production environment for build
ENV NODE_ENV=production
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# Copy built application
COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server.js"]