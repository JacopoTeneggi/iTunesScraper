FROM scratch as base

WORKDIR /app/lib
COPY lib ./

FROM node:10.15-alpine as node_modules

COPY --from=base /app /app
WORKDIR /app/analyzer
COPY analyzer/package*.json ./
RUN npm install ci

FROM node:10.15-alpine as builder

COPY --from=node_modules /app /app
WORKDIR /app/analyzer
COPY analyzer/tsconfig.json .
COPY analyzer/src ./src/
RUN npm install typescript -g && tsc
EXPOSE 3000
WORKDIR /app/analyzer/dist/analyzer/src/
CMD ["node", "server.js"]