# Stage 1 - build
FROM node:latest
LABEL authors="foxikle"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN ls

RUN npx nuxi build --preset=node-server

RUN ls

EXPOSE 8080
EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=8080

CMD [ "node", ".output/server/index.mjs" ]
