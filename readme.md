# Backend Engineer Technical Test

## Scripts

### Development
docker compose -f docker-compose.dev.yml up --build --force-recreate
docker exec otaqku-technical-test-app-dev-1 npm run db:seed         
docker compose -f docker-compose.dev.yml down

### Production
docker compose -f docker-compose.prod.yml up --build --force-recreate
docker exec otaqku-technical-test-app-prod-1 npm run db:seed         
docker compose -f docker-compose.prod.yml down