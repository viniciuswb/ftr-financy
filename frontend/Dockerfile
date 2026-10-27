# Build stage: compile the static bundle.
FROM node:22-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Vite inlines this at build time; the browser calls the API from the host.
ARG VITE_BACKEND_URL=http://localhost:4000/graphql
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

COPY . .
RUN npm run build

# Runtime stage: serve dist/ with nginx.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173
