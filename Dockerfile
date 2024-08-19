FROM node:20-alpine AS builder
LABEL authors="foxikle"

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npx nuxi build --preset=node-server

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output /app/.output

EXPOSE 8080

ENV HOST=0.0.0.0
ENV PORT=8080

CMD ["node", ".output/server/index.mjs"]