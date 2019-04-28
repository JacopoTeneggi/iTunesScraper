FROM node:10.15-alpine as node_modules

WORKDIR /app
COPY . ./
RUN npm ci 

FROM node:10.15-alpine as builder

COPY --from=node_modules /app /app
WORKDIR /app
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist/web /usr/share/nginx/html/