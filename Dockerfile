FROM node:10.15.1-alpine as builder

WORKDIR /app
COPY . /app
CMD [ "tsc" ]

FROM node:10.15.1-alpine

WORKDIR /dist
COPY --from=builder /app/dist /dist
COPY --from=builder /app/package.json /dist/package.json
RUN npm update
RUN npm install
EXPOSE 3000
CMD [ "node", "server.js" ]