# Identity API Service

This is the highly-structured ASP.NET Core 8 Identity API for ShiftCore Mission Control. It handles authentication, authorization, session management, and user provisioning.

---

## 🛠 Setup & Configuration

**Local Execution (via Docker):**
The simplest way to run the service is to run Docker Compose from the repository root:
```bash
docker compose up --build -d
```
This automatically provisions the PostgreSQL database, applies schema creation, and seeds the default **Lead** account.

**Native Execution (.NET CLI):**
```bash
dotnet restore
dotnet build
dotnet run
```
*Note: Ensure `appsettings.Development.json` points to an active PostgreSQL database.*

---

## 📖 API Reference & Testing Guide

This API strictly adheres to a standard JSON envelope response pattern:
- **Success (`200 OK`)**: `{ "success": true, "message": "...", "data": { ... } }`
- **Error (`400/401`)**: `{ "success": false, "message": "...", "errorCode": "...", "traceId": "..." }`

You can test all endpoints manually using `curl` (assuming the service is running locally on port `5001` via Docker).

### 1. Health Check
Verifies the service is alive and running.

- **URL:** `GET /health/identity`
- **Auth Required:** No
- **Test Command:**
  ```bash
  curl -s http://localhost:5001/health/identity
  ```
- **Success Response:**
  ```json
  {
    "status": "ok",
    "service": "identity-api",
    "version": "0.1.0",
    "timestamp": "2026-08-06T10:00:00.000Z"
  }
  ```

### 2. User Login
Authenticates a user and sets an `HttpOnly` secure cookie (`sc_token`) for subsequent requests.

- **URL:** `POST /api/identity/v1/auth/login`
- **Auth Required:** No
- **Test Command:** (Saves the cookie to a local `cookies.txt` file)
  ```bash
  curl -c cookies.txt -s -X POST http://localhost:5001/api/identity/v1/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email": "lead@shiftcore.local", "password": "dummy_hash_pass"}'
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "expiresAt": "2026-08-06T11:00:00.000Z",
      "user": {
        "id": "1",
        "name": "Mohmed Mostafa",
        "email": "lead@shiftcore.local",
        "role": "Lead",
        "teamId": "3b5f3ec5-cc27-4d68-8f4d-d80545d6b9c1"
      }
    }
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Sign-in failed. Check your details or contact the workspace administrator.",
    "errorCode": "AUTH_INVALID",
    "traceId": "0HN123ABCD"
  }
  ```

### 3. Get Current User Profile (`/me`)
Validates the secure cookie and retrieves the current user's profile and permissions.

- **URL:** `GET /api/identity/v1/auth/me`
- **Auth Required:** Yes (Cookie)
- **Test Command:** (Reads from `cookies.txt`)
  ```bash
  curl -b cookies.txt -s http://localhost:5001/api/identity/v1/auth/me
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Operation completed",
    "data": {
      "user": {
        "id": "1",
        "name": "Mohmed Mostafa",
        "email": "lead@shiftcore.local",
        "role": "Lead",
        "teamId": "3b5f3ec5-cc27-4d68-8f4d-d80545d6b9c1"
      }
    }
  }
  ```
- **Error Response (401 Unauthorized - Missing/Invalid Cookie):**
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errorCode": "AUTH_REQUIRED",
    "traceId": "0HN123ABCE"
  }
  ```

### 4. Logout
Invalidates the current session and instructs the browser to delete the `sc_token` cookie.

- **URL:** `POST /api/identity/v1/auth/logout`
- **Auth Required:** Yes (Cookie)
- **Test Command:**
  ```bash
  curl -b cookies.txt -s -X POST http://localhost:5001/api/identity/v1/auth/logout
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Operation completed",
    "data": {}
  }
  ```

---

## 🏛 Architecture documentation
For detailed diagrams about how this API is structured (Vertical Slices, Database Schema, and Cookie Auth Flow), please see [ARCHITECTURE.md](ARCHITECTURE.md).
