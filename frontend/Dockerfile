# Stage 1: Compile React assets
FROM node:20-slim AS build-stage

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy source repository
COPY . .

# Inject build arguments for runtime API URLs
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Compile code into optimization bundle
RUN npm run build

# Stage 2: Expose static files using Nginx
FROM nginx:alpine-slim

# Copy compiled directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Replace Nginx default server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web server port
EXPOSE 80

# Execute Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
