FROM node:18-alpine AS builder
WORKDIR /server
COPY . .
RUN npm i
RUN npm run build

FROM node:18-alpine
WORKDIR /server
COPY --from=builder /server/build .
COPY --from=builder /server/node_modules node_modules
COPY --from=builder /server/config config

CMD ["node", "index.js"]