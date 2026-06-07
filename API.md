# FocusHub API Dokumentation

## Basis URL
```
http://localhost:5000/api
```

## Authentication

Alle Protected Endpoints benötigen einen Authorization Header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Auth Endpoints

### Register
```
POST /auth/register

Body:
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response 201:
{
  "message": "Registrierung erfolgreich",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "user123",
    "email": "user@example.com"
  }
}
```

### Login
```
POST /auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "message": "Login erfolgreich",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "user123",
    "email": "user@example.com",
    "isAdmin": true
  }
}
```

### Get Current User
```
GET /auth/me (Protected)

Response 200:
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "user123",
    "email": "user@example.com",
    "isActive": true,
    "isAdmin": true,
    "hwid": "a1b2c3d4e5f6g7h8...",
    "expiresAt": "2025-06-07T00:00:00.000Z"
  }
}
```

---

## Key Endpoints

### Generate Keys (Admin)
```
POST /keys/generate (Protected, Admin)

Body:
{
  "count": 10,
  "duration": 30,
  "notes": "Test keys"
}

Response 201:
{
  "message": "10 Keys erstellt",
  "keys": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "key": "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
      "duration": 30,
      "isRedeemed": false,
      "createdAt": "2025-06-07T00:00:00.000Z"
    }
  ]
}
```

### Redeem Key
```
POST /keys/redeem

Body:
{
  "key": "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
  "discordId": "123456789",
  "discordTag": "username#1234",
  "hwid": "HARDWARE_ID_HERE"
}

Response 200:
{
  "message": "Key erfolgreich eingelöst",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "username": "User_a1b2c3d4",
    "expiresAt": "2025-07-07T00:00:00.000Z"
  }
}
```

### List Keys (Admin)
```
GET /keys/list (Protected, Admin)

Response 200:
{
  "keys": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "key": "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
      "isRedeemed": true,
      "redeemedBy": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "user123",
        "email": "user@example.com"
      },
      "redeemedAt": "2025-06-07T12:00:00.000Z",
      "createdAt": "2025-06-07T00:00:00.000Z"
    }
  ]
}
```

---

## HWID Endpoints

### Register HWID
```
POST /hwid/register (Protected)

Body:
{
  "hwid": "HARDWARE_ID_STRING_HERE",
  "userAgent": "Mozilla/5.0..."
}

Response 200:
{
  "message": "HWID registriert",
  "hwid": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

### Verify HWID
```
POST /hwid/verify (Protected)

Body:
{
  "hwid": "HARDWARE_ID_STRING_HERE"
}

Response 200:
{
  "message": "HWID verifiziert",
  "verified": true
}
```

### Get HWID Info
```
GET /hwid/info (Protected)

Response 200:
{
  "count": 1,
  "hwids": [
    {
      "id": "507f1f77bcf86cd799439013",
      "lastUsed": "2025-06-07T15:30:00.000Z",
      "isActive": true,
      "createdAt": "2025-06-07T00:00:00.000Z"
    }
  ]
}
```

---

## User Endpoints

### Get All Users (Admin)
```
GET /users/all (Protected, Admin)

Response 200:
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "user123",
      "email": "user@example.com",
      "discordId": "123456789",
      "discordTag": "username#1234",
      "isActive": true,
      "isAdmin": false,
      "expiresAt": "2025-07-07T00:00:00.000Z",
      "createdAt": "2025-06-07T00:00:00.000Z"
    }
  ]
}
```

### Get User by Discord ID
```
GET /users/discord/:discordId

Response 200:
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "user123",
  "email": "user@example.com",
  "discordId": "123456789",
  "discordTag": "username#1234",
  "isActive": true,
  "expiresAt": "2025-07-07T00:00:00.000Z"
}
```



### Ban/Unban User (Admin)
```
PUT /users/:id/ban (Protected, Admin)

Body:
{
  "ban": true  // true zum bannen, false zum freigeben
}

Response 200:
{
  "message": "Benutzer gebannt",
  "user": {...}
}
```

---

## Dashboard Endpoints

### Get Statistics
```
GET /dashboard/stats

Response 200:
{
  "totalUsers": 42,
  "activeUsers": 38,
  "totalKeys": 150,
  "redeemedKeys": 127,
  "availableKeys": 23,
  "premiumUsers": 28,
  "lifetimeUsers": 10
}
```

### Get Analytics (Admin)
```
GET /dashboard/analytics (Protected, Admin)

Response 200:
{
  "newUsersLast7": 5,
  "newUsersLast30": 18,
  "keysRedeemedLast7": 12
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Alle Felder erforderlich"
}
```

### 401 Unauthorized
```json
{
  "message": "Nicht authentifiziert"
}
```

### 403 Forbidden
```json
{
  "message": "Nur Admins"
}
```

### 404 Not Found
```json
{
  "message": "Benutzer nicht gefunden"
}
```

### 500 Internal Server Error
```json
{
  "message": "Interner Fehler"
}
```
