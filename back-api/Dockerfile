# Backend Dockerfile for Node/Express
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --only=production

# Copy source
COPY src ./src
COPY scripts ./scripts

# Environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/index.js"]
