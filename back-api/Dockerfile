# Backend (Express) Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies (production-only)
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci --only=production || npm install --only=production

# Copy source
COPY src ./src

# Expose and run
ENV PORT=5000
EXPOSE 5000
CMD ["node", "src/index.js"]
