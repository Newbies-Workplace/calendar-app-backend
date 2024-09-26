FROM node:18.16.0 AS builder

WORKDIR /build
COPY . ./

RUN npm ci
RUN npm run build

FROM node:18.16.0-alpine as calendar-api

COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package*.json ./
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma

CMD [ "npm", "run", "start:migrate:prod" ]
