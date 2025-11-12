# Multi-stage build: build Angular app with Node, serve with nginx

FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies (no package-lock.json in repo, so use npm install)
COPY package*.json ./
RUN npm install --silent --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build -- --configuration production

# Production image
FROM nginx:stable-alpine

# Copy built assets from builder
COPY --from=build /app/dist/angular-17-crud /browser/index.html

# Custom nginx config to support SPA routing
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
