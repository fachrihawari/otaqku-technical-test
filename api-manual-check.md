# API Testing Checklist

## 🌍 Public Endpoints

### GET /
- [x] 200 - Returns welcome message

## 🔐 Authentication

### POST /auth/register
- [x] 201 - User successfully registered
- [x] 422 - Validation failed (invalid email format)
- [x] 422 - Validation failed (password less than 6 characters)
- [x] 409 - Email already exists

### POST /auth/login
- [x] 200 - Login successful, returns access token
- [x] 422 - Validation failed (invalid email format)
- [x] 422 - Validation failed (password less than 6 characters)
- [x] 401 - Invalid email or password

## 📋 Tasks Management

### GET /tasks
- [x] 200 - Returns array of tasks
- [x] 200 - With pagination (page=1, limit=10)
- [x] 200 - With status filter (pending/in_progress/completed)
- [x] 401 - Unauthorized (missing/invalid token)

### POST /tasks
- [x] 201 - Task successfully created
- [x] 422 - Validation failed (missing title)
- [x] 422 - Validation failed (invalid status)
- [x] 401 - Unauthorized (missing/invalid token)

### GET /tasks/:id
- [x] 200 - Returns specific task
- [x] 401 - Unauthorized (missing/invalid token)
- [x] 403 - Forbidden (not task owner)
- [x] 404 - Task not found

### PUT /tasks/:id
- [x] 200 - Task successfully updated
- [x] 422 - Validation failed (missing title)
- [x] 422 - Validation failed (invalid status)
- [x] 401 - Unauthorized (missing/invalid token)
- [x] 403 - Forbidden (not task owner)
- [x] 404 - Task not found

### DELETE /tasks/:id
- [x] 200 - Task successfully deleted
- [x] 401 - Unauthorized (missing/invalid token)
- [x] 403 - Forbidden (not task owner)
- [x] 404 - Task not found

## 🔒 Security & Authorization Tests
- [x] Access protected endpoints without token
- [x] Access protected endpoints with invalid token
- [x] Access protected endpoints with expired token
- [x] User can only access their own tasks
- [x] User cannot access other users' tasks
