# CSRF Protection Implementation

This project implements CSRF protection using the double-submit cookie pattern. Here's how it works:

## How It Works

1. For GET requests:
   - Server generates a CSRF token
   - Sets it as an HttpOnly cookie
   - Frontend can read this cookie and include it in subsequent requests

2. For state-changing requests (POST, PUT, PATCH, DELETE):
   - Frontend must include the CSRF token in the `X-CSRF-Token` header
   - Server validates the token against the cookie value
   - If valid, processes the request and issues a new token
   - If invalid, returns 403 Forbidden

## Frontend Integration

The project uses an Axios HTTP client with built-in CSRF protection:

1. Import the configured httpClient:
```javascript
import httpClient from '../utils/httpClient';
```

2. Make API calls normally - CSRF tokens are handled automatically:
```javascript
// GET request (no CSRF token needed)
httpClient.get('/api/data');

// POST/PUT/PATCH/DELETE (CSRF token automatically added)
httpClient.post('/api/endpoint', { data });
```

3. Automatic CSRF token handling:
   - Tokens are read from the `csrf-token` cookie
   - Added to `X-CSRF-Token` header for state-changing requests
   - 403 errors trigger automatic token refresh and retry

4. Configuration:
   - `withCredentials: true` ensures cookies are sent
   - Base URL can be configured via `NEXT_PUBLIC_API_BASE_URL`

## Configuration

Environment variables required:
```
CSRF_SECRET=your-secret-key-here
```

## Implementation Details

- Tokens are HMAC-signed for verification
- Tokens automatically rotate after each use
- HttpOnly cookies prevent XSS attacks
- SameSite cookie policy provides additional protection