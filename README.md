# Note Auth API

A RESTful API for user authentication and note-taking functionality.

## Features

- **User Authentication**: Register, login, and protected routes with JWT
- **Note Management**: CRUD operations for notes
- **Security**: Rate limiting, CORS, Helmet, input validation
- **Production Ready**: Logging, error handling, graceful shutdown

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/note-auth-app
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

## API Endpoints

### Auth Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user profile | Yes |

### Notes Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notes` | Get all notes | Yes |
| GET | `/notes/:id` | Get single note | Yes |
| POST | `/notes` | Create new note | Yes |
| PUT | `/notes/:id` | Update note | Yes |
| DELETE | `/notes/:id` | Delete note | Yes |
| GET | `/notes/search?title=x&content=y` | Search notes | Yes |

### Request/Response Examples

**Register**
```json
POST /auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login**
```json
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Create Note**
```json
POST /notes
Headers: Authorization: Bearer <token>
{
  "title": "My Note",
  "content": "Note content here",
  "status": true
}
```

## Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with hot reload
npm test        # Run tests
npm run test:coverage  # Run tests with coverage
```

## License

ISC