FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json

RUN npm install

COPY . .

RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npm --workspace api run build
RUN mkdir -p /app/apps/api/uploads

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
