# Backend Engineer Technical Test - Checklist

## 📦 Project Setup
- [x] Project initialization
- [x] Dependencies installation
- [x] Environment variables (.env)
- [x] TypeScript configuration
- [x] Build scripts
- [x] Development scripts

## 🗄️ Database Setup
- [x] Database schema/migrations
- [x] users table
  - [x] id (primary key)
  - [x] email (string, required)
  - [x] password (string, required)
  - [x] created_at (timestamp)
- [x] tasks table
  - [x] id (primary key)
  - [x] title (string, required)
  - [x] description (text, optional)
  - [x] status (enum: pending/in-progress/completed)
  - [x] created_at (timestamp)
  - [x] updated_at (timestamp)
  - [x] authorId (foreign key, for user isolation)
- [x] Database instance setup
- [x] Environment configuration

## 🔐 Authentication
- [x] User registration endpoint (POST /auth/register)
- [x] User login endpoint (POST /auth/login)
- [x] Email + password validation
- [x] JWT token generation and verification
- [x] Authentication middleware
- [x] User isolation (users can only access their own data)

## 📋 Task Management API
- [x] POST /tasks → Create a new task
- [x] GET /tasks → List all tasks for authenticated user
- [x] GET /tasks/:id → Retrieve a single task
- [x] PUT /tasks/:id → Update a task
- [x] DELETE /tasks/:id → Delete a task

## ⚠️ Error Handling
- [x] Appropriate HTTP status codes
- [x] Input validation
- [x] Meaningful error messages
- [x] Global error handling middleware

## 🧪 Testing
- [x] Authentication tests
- [x] Task CRUD tests
- [x] Error handling tests
- [x] Authorization tests (user isolation)

## 🎯 Bonus Features (Optional)
- [x] Task filtering (by status, date, etc.)
- [x] Pagination in task listing
- [ ] Bulk update endpoint
- [x] API documentation (Swagger/OpenAPI)
- [x] Integration tests

## 📚 Documentation & Deployment
- [x] README.md with setup instructions
- [x] Docker setup (optional)
- [x] Database setup instructions
- [x] Environment variables documentation

## ✅ Final Checks
- [x] Local development setup works
- [x] Production environment setup works
- [ ] All endpoints tested manually