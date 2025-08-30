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
  - [x] createdAt (timestamp)
- [x] tasks table
  - [x] id (primary key)
  - [x] title (string, required)
  - [x] description (text, optional)
  - [x] status (enum: pending/in-progress/completed)
  - [x] createdAt (timestamp)
  - [x] updatedAt (timestamp)
  - [x] userId (foreign key, for user isolation)
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
- [ ] Authentication tests
- [ ] Task CRUD tests
- [ ] Error handling tests
- [ ] Authorization tests (user isolation)

## 🎯 Bonus Features (Optional)
- [x] Task filtering (by status, date, etc.)
- [x] Pagination in task listing
- [ ] Bulk update endpoint
- [x] API documentation (Swagger/OpenAPI)
- [ ] Integration tests

## 📚 Documentation & Deployment
- [ ] README.md with setup instructions
- [ ] Docker setup (optional)
- [ ] Database setup instructions
- [ ] Environment variables documentation

## ✅ Final Checks
- [ ] Code quality and cleanliness
- [x] Proper error handling
- [ ] Security best practices
- [ ] Performance considerations
- [ ] Documentation completeness
- [ ] Local development setup works
- [ ] All endpoints tested manually