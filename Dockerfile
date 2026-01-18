# Frontend (Vite + React) Dockerfile

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci || npm install

# Copy project files
COPY . .

# Build-time API base URL (used by Vite)
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm run build

# Serve with Nginx
FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
