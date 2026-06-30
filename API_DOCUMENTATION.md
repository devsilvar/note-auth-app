# Note Auth API Documentation

## 🚀 Quick Start

**Base URL:** `http://localhost:3000`

**Interactive Documentation:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get your token by registering or logging in via `/auth/register` or `/auth/login`.

## 📋 API Endpoints

### Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response (200):
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "name": "John Doe"
}
```

### Notes

#### Get All Notes
```
GET /notes
Authorization: Bearer <token>

Response (200):
{
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439010",
      "title": "My Note",
      "content": "Note content here",
      "status": false,
      "createdAt": "2026-06-26T12:00:00.000Z",
      "updatedAt": "2026-06-26T12:00:00.000Z"
    }
  ]
}
```

#### Get Single Note
```
GET /notes/{id}
Authorization: Bearer <token>

Response (200):
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439010",
    "title": "My Note",
    "content": "Note content here",
    "status": false,
    "createdAt": "2026-06-26T12:00:00.000Z",
    "updatedAt": "2026-06-26T12:00:00.000Z"
  }
}
```

#### Create Note
```
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Note",
  "content": "Note content here",
  "status": false
}

Response (201):
{
  "message": "Note created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439010",
    "title": "My Note",
    "content": "Note content here",
    "status": false,
    "createdAt": "2026-06-26T12:00:00.000Z",
    "updatedAt": "2026-06-26T12:00:00.000Z"
  }
}
```

#### Update Note
```
PUT /notes/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Note Title",
  "content": "Updated content",
  "status": true
}

Response (200):
{
  "message": "Note updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439010",
    "title": "Updated Note Title",
    "content": "Updated content",
    "status": true,
    "createdAt": "2026-06-26T12:00:00.000Z",
    "updatedAt": "2026-06-26T13:00:00.000Z"
  }
}
```

#### Delete Note
```
DELETE /notes/{id}
Authorization: Bearer <token>

Response (200):
{
  "message": "Note deleted successfully"
}
```

#### Search Notes
```
GET /notes/search?title=meeting&content=project
Authorization: Bearer <token>

Response (200):
{
  "count": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439010",
      "title": "Meeting Notes",
      "content": "Project discussion",
      "status": false,
      "createdAt": "2026-06-26T12:00:00.000Z",
      "updatedAt": "2026-06-26T12:00:00.000Z"
    }
  ]
}
```

## ⚠️ Error Responses

All endpoints may return error responses:

```json
{
  "message": "Error message here",
  "error": "Detailed error description"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `409` - Conflict (e.g., user already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🧪 Testing with Swagger UI

1. Start the server: `npm run dev`
2. Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
3. Click "Try it out" on any endpoint
4. For protected endpoints:
   - First register/login to get a token
   - Click "Authorize" button at the top
   - Enter: `Bearer <your-token>`
   - Click "Authorize"
5. Test the endpoints interactively

## 💡 Notes

- All request/response bodies use JSON format
- JWT tokens expire after 7 days (configurable)
- Rate limiting is enabled (100 requests per 15 minutes)
- Note IDs are MongoDB ObjectIDs (24-character hex strings)
- The `status` field on notes defaults to `false` if not provided
