# Frontend multi-stage build: build with Node, serve with Nginx
FROM node:18-alpine AS build
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

# Pass Vite env at build time
ARG VITE_API_BASE=""
ENV VITE_API_BASE=${VITE_API_BASE}

# Build React app
RUN npm run build

# Serve with Nginx
FROM nginx:alpine AS runtime
# Nginx config with SPA fallback and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
