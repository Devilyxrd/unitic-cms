FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json

RUN npm install

COPY . .

RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
