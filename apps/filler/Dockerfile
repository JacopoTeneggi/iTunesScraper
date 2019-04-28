FROM node:10.15-alpine as node_modules

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:10.15-alpine as builder

COPY --from=node_modules /app /app
WORKDIR /app
COPY tsconfig.json ./
COPY src ./src/
RUN npm install typescript -g && tsc
CMD ["node", "lib/filler.js"] 