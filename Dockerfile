FROM node:24.7.0-bullseye-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Development stage
FROM base AS development
CMD npm run db:migrate && npm run dev

# Production stage
FROM base AS production
COPY . .
RUN npm run build
CMD npm run db:migrate && npm start