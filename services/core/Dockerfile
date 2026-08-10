# ShiftCore Core API - Placeholder Dockerfile (R24-04)
# Owner: Abo El Ala
# Stack: Express.js
# Real build, Prisma migrate/seed, and entrypoint are owned by Mohmed Mostafa.

FROM node:22-alpine
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

EXPOSE 4000

CMD ["sh", "-c", "yarn db:generate && yarn dev"]