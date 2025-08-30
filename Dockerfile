FROM node:24.7.0-bullseye-slim AS base

WORKDIR /app

COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
CMD npm run db:migrate && npm run dev

# Production build stage
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM base AS production
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/docs ./dist/docs
EXPOSE 3000
CMD npm start