# Stage 1: Build Angular app
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent --no-audit --no-fund

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve app with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist/angular-17-crud/browser /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
