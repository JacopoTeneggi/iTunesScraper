FROM scratch as base

WORKDIR /app/lib
COPY lib ./

FROM node:10.15-alpine as builder

COPY --from=base /app /app
WORKDIR /app/web
COPY /web ./
RUN npm ci && npm run build-prod

FROM nginx:alpine

RUN apk add bash
COPY --from=builder /app/web/dist/web /usr/share/nginx/html/