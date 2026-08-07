# ShiftCore Core API - Placeholder Dockerfile (R24-04)
# Owner: Abo El Ala
# Stack: Express.js
# Real build, Prisma migrate/seed, and entrypoint are owned by Abo El Ala.

FROM node:20-alpine AS placeholder
WORKDIR /app
RUN echo "Core API Dockerfile placeholder - owned by Abo El Ala" > /app/PLACEHOLDER.txt
RUN npm install express
RUN echo "const express = require('express'); const app = express(); app.get('/health', (req, res) => res.send('OK')); app.listen(4000);" > server.js
CMD ["node", "server.js"]
