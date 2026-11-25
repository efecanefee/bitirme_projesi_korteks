# --- Derleme ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Üretimde sahte veri kapalıdır; API aynı origin'de /api altında nginx ile backend'e yönlenir
ARG VITE_USE_MOCKS=false
ARG VITE_API_BASE_URL=
ENV VITE_USE_MOCKS=$VITE_USE_MOCKS VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- Sunum ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
