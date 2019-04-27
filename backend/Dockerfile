FROM scratch as base

WORKDIR /app/lib
COPY lib ./

FROM node:10.15-alpine as node_modules

COPY --from=base /app /app
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

FROM node:10.15-alpine as builder
 
COPY --from=node_modules /app /app
WORKDIR /app/backend
COPY backend/tsconfig.json .
COPY backend/src ./src/
RUN npm install typescript -g && tsc
EXPOSE 3003
WORKDIR /app/backend/dist/backend/src/
CMD ["node", "server.js"]