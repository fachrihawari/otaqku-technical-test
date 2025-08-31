# otaQku Tasks Management API

Backend Engineer Technical Test - A RESTful API for task management built with Express.js, TypeScript, and PostgreSQL.

## System Requirements

- **Node.js**: v22.x or higher (tested with v22.12.0)
- **Docker**: v28.x or higher (tested with v28.3.3)
- **Docker Compose**: v2.x or higher (tested with v2.39.2)
- **PostgreSQL**: v15.x (if running locally without Docker)

## How to Run Locally

### Option 1: Using Docker (Recommended)

#### Development Mode
```bash
# Start development environment with hot reloading
docker compose -f docker-compose.dev.yml up --build

# Seed the database (in another terminal)
docker exec otaqku-technical-test-app-dev-1 npm run db:seed

# Stop the services
docker compose -f docker-compose.dev.yml down
```

#### Production Mode
```bash
# Start production environment
docker compose -f docker-compose.prod.yml up --build -d

# Seed the database (in another terminal)
docker exec otaqku-technical-test-app-1 npm run db:seed

# Stop the services
docker compose -f docker-compose.prod.yml down
```

> **Note:** I've setup the `docker-compose.tunnel.yml` to run the project using proxy with traefik. It's assuming you have a domain pointing to your server also have traefik container with entrypoints web.

### Option 2: Local Development (Without Docker)

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Prepare PostgreSQL databases:**
   
   The application uses a database naming pattern based on NODE_ENV:
   - **Development**: `your_database_name_development`
   - **Production**: `your_database_name_production`
   - **Test**: `your_database_name_test`
   
   Create the required databases in PostgreSQL:
   ```sql
   -- Connect to PostgreSQL as superuser
   CREATE DATABASE otaqku_development;
   CREATE DATABASE otaqku_production;
   CREATE DATABASE otaqku_test;

   -- Grant permissions (adjust username as needed)
   GRANT ALL PRIVILEGES ON DATABASE otaqku_development TO your_username;
   GRANT ALL PRIVILEGES ON DATABASE otaqku_production TO your_username;
   GRANT ALL PRIVILEGES ON DATABASE otaqku_test TO your_username;
   ```

   **Environment Variables Pattern:**
   ```env
   NODE_ENV=development
   DATABASE_URL=postgres://username:password@localhost:5432/otaqku
   # The actual connection will be: postgres://username:password@localhost:5432/otaqku_development
   ```
   
   > **Note:** The system automatically appends `_${NODE_ENV}` to your database URL to separate development, production and test data.

4. **Run database migrations:**
```bash
npm run db:migrate
```

5. **Seed the database:**
```bash
npm run db:seed
```

6. **Start development server:**
```bash
npm run dev
```

## API Documentation

**Live Deployment**: [https://otaqku-api.hawari.dev](https://otaqku-api.hawari.dev)

Once the server is running locally, you can access:
- **API Base URL**: `http://localhost:3000`
- **API Documentation**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/openapi.json`

## Project Structure

```
otaqku-technical-test/
├── docs/                           # API documentation
│   └── swagger.yml                 # OpenAPI specification
├── src/                            # Source code
│   ├── controllers/                # Route handlers
│   │   ├── auth.controller.ts      # Authentication endpoints
│   │   ├── public.controller.ts    # Public endpoints (home, openapi)
│   │   └── task.controller.ts      # Task management endpoints
│   ├── db/                         # Database related files
│   │   ├── db.ts                   # Database connection
│   │   ├── schema.ts               # Database schema definitions
│   │   ├── seed.ts                 # Database seeding script
│   │   └── migrations/             # Database migration files
│   ├── helpers/                    # Utility functions
│   │   ├── error.ts                # Error handling utilities
│   │   ├── hash.ts                 # Password hashing utilities
│   │   └── jwt.ts                  # JWT token utilities
│   ├── middlewares/                # Express middlewares
│   │   ├── auth.middleware.ts      # Authentication middleware
│   │   ├── error.middleware.ts     # Global error handler
│   │   ├── logger.middleware.ts    # Request logging
│   │   └── owner-only.middleware.ts # Resource ownership verification
│   ├── routes/                     # Route definitions
│   │   ├── auth.route.ts           # Authentication routes
│   │   ├── public.route.ts         # Public routes
│   │   └── task.route.ts           # Task management routes
│   ├── services/                   # Business logic layer
│   │   ├── auth.service.ts         # Authentication business logic
│   │   ├── public.service.ts       # Public endpoints business logic
│   │   └── task.service.ts         # Task management business logic
│   ├── server.ts                   # Main application entry point
│   └── types.d.ts                  # TypeScript type definitions
├── tests/                          # Test files
│   ├── auth-login.test.ts          # Authentication login tests
│   ├── auth-register.test.ts       # Authentication register tests
│   ├── public-home.test.ts         # Public home endpoint tests
│   ├── public-openapi.test.ts      # OpenAPI endpoint tests
│   ├── tasks-all.test.ts           # Task listing tests
│   ├── tasks-create.test.ts        # Task creation tests
│   ├── tasks-delete.test.ts        # Task deletion tests
│   ├── tasks-detail.test.ts        # Task detail tests
│   └── tasks-update.test.ts        # Task update tests
├── docker-compose.dev.yml          # Development Docker Compose
├── docker-compose.prod.yml         # Production Docker Compose
├── Dockerfile                      # Multi-stage Docker build
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── vitest.config.ts                # Test configuration
└── drizzle.config.ts               # Database ORM configuration
```

## Architecture Overview

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Logging**: Pino
- **Testing**: Vitest with Supertest
- **API Documentation**: OpenAPI/Swagger
- **Containerization**: Docker with multi-stage builds

### Layered Architecture

The application follows a **layered architecture pattern** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│           Routes Layer              │  ← HTTP routing and middleware
├─────────────────────────────────────┤
│         Controllers Layer           │  ← Request/Response handling
├─────────────────────────────────────┤
│          Services Layer             │  ← Business logic
├─────────────────────────────────────┤
│         Database Layer              │  ← Data access with Drizzle ORM
└─────────────────────────────────────┘
```

**Core Layers:**
- **Routes** (`src/routes/`) - API endpoints and middleware application
- **Controllers** (`src/controllers/`) - Request/response handling and validation
- **Services** (`src/services/`) - Business logic and data orchestration
- **Database** (`src/db/`) - Data persistence with Drizzle ORM

**Supporting Components:**
- **Middleware** (`src/middlewares/`) - Authentication, logging, error handling
- **Helpers** (`src/helpers/`) - Utility functions (JWT, hashing, error formatting)

**Why This Architecture?**
- **Organized Code** - Everything has its place, making it easy to find and fix things
- **Easy Testing** - Test each part separately without breaking others
- **Simple Updates** - Change one layer without affecting the rest
- **Reuse Code** - Use the same functions across multiple features

**Data Flow:**
```
HTTP Request → Route → Controller → Service → Database → Response
```

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
DATABASE_URL=postgres://username:password@localhost:5432/database_name
JWT_SECRET=your-super-secret-jwt-key
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reloading
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Database
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run linter and auto-fix issues
```

## Development Workflow

1. **Make code changes** - Files are automatically watched in development mode
2. **Run tests** - `npm test` to ensure everything works
3. **Check linting** - `npm run lint` to maintain code quality
4. **Database changes** - Use `npm run db:generate` and `npm run db:migrate`
5. **Update documentation** - Modify `docs/swagger.yml` for API changes

## Deployment Strategy

The application is deployed using Docker containers with the following strategy:

### Infrastructure Setup
- **Platform**: Home Server + Cloudflare tunnel
- **Reverse Proxy**: Traefik for SSL termination and routing
- **Database**: PostgreSQL Docker container with persistent volumes
- **Application**: Multi-stage Docker build
- **CI/CD**: GitHub Actions for automated testing and deployment

### SSL and Domain Setup
- **Domain**: https://otaqku-api.hawari.dev
- **SSL**: Automated with Let's Encrypt via Traefik
- **Configuration**: `docker-compose.tunnel.yml` with Traefik labels

## Database Schema

The application uses PostgreSQL with the following schema:

### Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | User registration timestamp |

### Tasks Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique task identifier |
| `title` | VARCHAR(100) | NOT NULL | Task title (max 100 characters) |
| `description` | TEXT | NULLABLE | Task description (max 500 characters) |
| `status` | task_status | NOT NULL, DEFAULT 'pending' | Task status enum |
| `author_id` | UUID | NOT NULL, FOREIGN KEY → users(id) | Task owner reference |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp (auto-updated) |

### Relationships
- **One-to-Many**: `users` → `tasks` (One user can have many tasks)
- **Foreign Key**: `tasks.author_id` references `users.id`

### Enums
- **task_status**: `'pending'`, `'in_progress'`, `'completed'`

