# API Documentation

## Base URL

```
http://localhost:3000/v1
```

## Authentication

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /v1/auth/login`

**Request Body:**

```json
{
  "username": "string",
  "password": "string (min 8 chars)"
}
```

**Response (200):**

```json
{
  "payload": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "role": {
        "id": "uuid",
        "name": "Admin"
      }
    }
  }
}
```

**Errors:**

- 401: Invalid credentials

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /v1/auth/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "payload": {
    "id": "uuid",
    "username": "string",
    "role": {
      "id": "uuid",
      "name": "Admin",
      "description": "string"
    },
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Errors:**

- 401: Unauthorized

---

## Response Formats

### Success Response

```json
{
  "payload": { ... }
}
```

### Paginated Response

```json
{
  "payload": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "message": "Error description",
  "error": "ErrorType",
  "statusCode": 400
}
```

---

## Error Codes

| Code | Error                 | Description                        |
| ---- | --------------------- | ---------------------------------- |
| 400  | Bad Request           | Invalid request body or parameters |
| 401  | Unauthorized          | Missing or invalid JWT token       |
| 403  | Forbidden             | Insufficient permissions           |
| 404  | Not Found             | Resource not found                 |
| 409  | Conflict              | Duplicate entry                    |
| 500  | Internal Server Error | Server error                       |

---

## Rate Limiting

The API is protected by `@nestjs/throttler`:

- **Limit:** 30 requests per 60 seconds
- **Headers:**
  - `X-RateLimit-Limit`: Max requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Example: Making Authenticated Requests

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Get current user
curl -X GET http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

### Using JavaScript

```javascript
const login = async () => {
  const response = await fetch("http://localhost:3000/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "password123" }),
  });
  const data = await response.json();
  return data.payload.token;
};

const getMe = async (token) => {
  const response = await fetch("http://localhost:3000/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

---

## API Versioning

The API uses URL versioning:

```
/v1/auth/login
/v1/users
```

All endpoints are prefixed with `/v1`.
