FROM node:10.15-alpine as scaffold

WORKDIR /app
COPY package*.json ./
CMD ["npm", "ci"]

FROM node:10.15.1-alpine as builder

COPY --from=scaffold /app /app 
WORKDIR /app
COPY tsconfig.json .
CMD ["tsc"]

FROM node:10.15.1-alpine as server

COPY --from=builder /app /app


WORKDIR /dist
COPY --from=builder /app/dist /dist
COPY --from=builder /app/package*.json /dist/
RUN npm ci
EXPOSE 3000
CMD [ "node", "server.js" ]