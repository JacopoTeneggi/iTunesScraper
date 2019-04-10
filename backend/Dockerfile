FROM node:10.15-alpine as scaffold

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:10.15-alpine as builder

RUN npm install typescript -g
COPY --from=scaffold /app /app
WORKDIR /app
COPY tsconfig.json .
COPY ./src ./src/
RUN tsc

FROM node:10.15-alpine as server

COPY --from=builder /app /app
EXPOSE 3003
WORKDIR /app/dist
CMD ["node", "server.js"]
