# EduGate API Documentation

**Base URL:** `https://edugate-production-7bc2.up.railway.app`

**Authentication:** JWT via `Authorization: Bearer <token>` header or `httpOnly` cookie.

**Roles:** `student` · `school_admin` · `admin`

---

## Auth

### Register
`POST /auth/register`

Public. Creates a new user and sends a verification email.

**Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
}
```
> `role` accepts `student` or `school_admin`. Attempting `admin` is ignored and defaults to `student`.

**Response `201`:**
```json
{
    "success": true,
    "message": "Verification email sent to john@example.com"
}
```

---

### Login
`POST /auth/login`

Public. Rate limited to 10 attempts per 15 minutes.

**Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response `200`:**
```json
{
    "success": true,
    "token": "<jwt_token>",
    "user": {
        "id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "isVerified": true
    }
}
```

> Returns `403` if email is not verified.

---

### Logout
`POST /auth/logout`

Requires auth.

**Response `200`:**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

### Verify Email
`GET /auth/verify/:token`

Public. Token is sent via email on registration.

**Response `200`:** Returns token and user object same as login.

---

### Resend Verification Email
`POST /auth/verify/resend`

Requires auth. User must be unverified.

**Response `200`:**
```json
{
    "success": true,
    "message": "Verification email resent successfully"
}
```

---

### Forgot Password
`POST /auth/password/forgot`

Public. Sends a password reset email.

**Body:**
```json
{
    "email": "john@example.com"
}
```

**Response `200`:**
```json
{
    "success": true,
    "message": "Password reset email sent to john@example.com"
}
```

---

### Reset Password
`PUT /auth/password/reset/:token`

Public. Token from reset email. Expires in 15 minutes.

**Body:**
```json
{
    "password": "newpassword123",
    "confirmPassword": "newpassword123"
}
```

**Response `200`:** Returns token and user object.

---

### Update Password
`PUT /auth/password/update`

Requires auth.

**Body:**
```json
{
    "oldPassword": "currentpassword",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
}
```

**Response `200`:** Returns token and user object.

---

### Get My Profile
`GET /auth/me`

Requires auth. All roles.

**Response `200`:**
```json
{
    "success": true,
    "user": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "isVerified": true,
        "createdAt": "2026-06-06T19:16:18.071Z"
    }
}
```

---

### Update Profile
`PUT /auth/me/update`

Requires auth. All roles. Changing email triggers re-verification.

**Body:**
```json
{
    "name": "John Updated",
    "email": "newemail@example.com"
}
```

**Response `200`:** Returns updated user object.

---

### Get All Users
`GET /admin/users`

Requires auth. `admin` only.

**Response `200`:**
```json
{
    "success": true,
    "count": 3,
    "users": [...]
}
```

---

### Get User By ID
`GET /admin/users/:id`

Requires auth. `admin` only.

**Response `200`:** Returns single user object.

---

### Update User Role
`PUT /admin/users/:id`

Requires auth. `admin` only.

**Body:**
```json
{
    "role": "school_admin"
}
```

**Response `200`:** Returns updated user object.

---

### Delete User
`DELETE /admin/users/:id`

Requires auth. `admin` only.

**Response `200`:**
```json
{
    "success": true,
    "message": "User deleted successfully"
}
```

---

## Schools

### Get All Schools
`GET /schools`

Public. Returns only verified active schools.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `schoolType` | string | Filter by type: `primary`, `secondary`, `combined`, `private`, `special_needs` |
| `location` | string | Filter by location (case-insensitive partial match) |
| `grade` | string | Filter by grade e.g. `Grade 8` |

**Response `200`:**
```json
{
    "success": true,
    "count": 1,
    "schools": [
        {
            "_id": "...",
            "name": "Greenfields High School",
            "description": "A top performing secondary school",
            "schoolType": "secondary",
            "location": "Johannesburg",
            "schoolFees": 15000,
            "grades": ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
            "subjects": ["Mathematics", "Science", "English"],
            "isVerified": true,
            "status": "active",
            "user": {
                "name": "School Admin",
                "email": "schooladmin@example.com"
            }
        }
    ]
}
```

---

### Get School By ID
`GET /schools/:id`

Public. Returns only if verified and active.

**Response `200`:** Returns single school object.

---

### Create School
`POST /schools`

Requires auth. `admin` or `school_admin`. A `school_admin` can only create one school.

**Body:**
```json
{
    "name": "Greenfields High School",
    "description": "A top performing secondary school",
    "schoolType": "secondary",
    "location": "Johannesburg",
    "schoolFees": 15000,
    "grades": ["Grade 8", "Grade 9", "Grade 10"],
    "subjects": ["Mathematics", "Science", "English"]
}
```

**Response `201`:** Returns created school object.

---

### Update School
`PUT /schools/:id`

Requires auth. `admin` or `school_admin`. A `school_admin` can only update their own school and cannot change `isVerified` or `status`.

**Body:** Any school fields to update.

**Response `200`:** Returns updated school object.

---

### Verify School
`PUT /schools/admin/:id/verify`

Requires auth. `admin` only. Makes school visible in public listings.

**Response `200`:**
```json
{
    "success": true,
    "message": "School verified successfully",
    "school": {...}
}
```

---

### Delete School
`DELETE /schools/:id`

Requires auth. `admin` only.

**Response `200`:**
```json
{
    "success": true,
    "message": "School deleted successfully"
}
```

---

## Applications

### Get All Applications
`GET /applications`

Requires auth. Response filtered by role:
- `admin` — sees all applications
- `school_admin` — sees applications for their school only
- `student` — sees their own applications only

**Response `200`:**
```json
{
    "success": true,
    "count": 1,
    "applications": [...]
}
```

---

### Get Application By ID
`GET /applications/:id`

Requires auth. Ownership enforced by role.

**Response `200`:** Returns single application object.

---

### Create Application
`POST /applications`

Requires auth. `student` only. One application per school per student.

**Body:**
```json
{
    "school": "<school_id>",
    "personalInfo": {
        "firstName": "Jane",
        "lastName": "Doe",
        "dateOfBirth": "2008-03-15",
        "gender": "Female",
        "address": "123 Main Street",
        "city": "Johannesburg",
        "province": "Gauteng",
        "country": "South Africa",
        "postalCode": "2000"
    },
    "contactInfo": {
        "emailAddress": "jane@example.com",
        "phoneNumber": "0731234567",
        "emergencyContactName": "Parent Name",
        "emergencyPhoneNumber": "0739876543"
    },
    "eduBackground": {
        "previousSchoolName": "Previous School",
        "previousSchoolAddress": "456 Old Street",
        "yearOfGraduation": 2024
    },
    "academicInfo": {
        "grade": "Grade 9",
        "year": 2025,
        "academicAchievements": "Honours student"
    },
    "extraCurricularActivities": "Football, Chess Club"
}
```

**Response `201`:** Returns created application. Confirmation email sent to student.

---

### Update Application
`PUT /applications/:id`

Requires auth. `student` only. Only `draft` applications can be edited. Cannot change `school`, `status`, or `user`.

**Body:** Any application fields to update.

**Response `200`:** Returns updated application object.

---

### Update Application Status
`PATCH /applications/:id/status`

Requires auth. `admin` or `school_admin`. School admin can only update applications for their own school.

**Body:**
```json
{
    "status": "approved",
    "note": "Congratulations, your application has been approved."
}
```

> `status` accepts: `under_review` · `approved` · `rejected` · `waitlisted`

**Response `200`:** Returns updated application. Status change email sent to student.

---

### Delete Application
`DELETE /applications/:id`

Requires auth. `admin` can delete any. `student` can only delete their own `draft` applications.

**Response `200`:**
```json
{
    "success": true,
    "message": "Application deleted successfully"
}
```

---

## Error Responses

All errors follow this format:

```json
{
    "success": false,
    "message": "Error description"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request — validation error or invalid input |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role permissions or unverified email |
| `404` | Not found — resource does not exist |
| `500` | Server error |

---

## Notes for MAUI Client

- Store JWT token in `SecureStorage` after login
- Send token via `Authorization: Bearer <token>` header on every authenticated request
- Cookies are not used by the MAUI client — use the token from the JSON response body
- Base URL should be stored as a constant and swapped between development and production environments