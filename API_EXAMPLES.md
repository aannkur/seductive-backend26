# API Endpoints - cURL Examples

## Base URL

```
http://localhost:3010/api/auth
```

---

## 1. Login - Authenticate User and Send OTP

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user with their email and password, then sends a login OTP to their email. This is the first step of the two-step login process.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

### Request Body Parameters

| Parameter  | Type   | Required | Description          | Constraints               |
| ---------- | ------ | -------- | -------------------- | ------------------------- |
| `email`    | string | Yes      | User's email address | Valid email format        |
| `password` | string | Yes      | User's password      | Min 1, Max 100 characters |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login OTP sent to your email. Please verify to complete login.",
  "data": {
    "message": "Login OTP sent to your email. Please verify to complete login."
  }
}
```

**Note:** After receiving this response, check your email for the 6-digit OTP code, then use the **Verify Login OTP** endpoint to complete the login process.

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Email must be a valid email, Password is required"
}
```

**Invalid Credentials (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid email or password.",
  "error": "Invalid email or password."
}
```

**Account Not Verified (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Account not verified. Please verify your email first.",
  "error": "Account not verified. Please verify your email first."
}
```

**Account Blocked (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Your account has been blocked. Please contact support.",
  "error": "Your account has been blocked. Please contact support."
}
```

**Account Suspended (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Your account has been suspended. Please contact support.",
  "error": "Your account has been suspended. Please contact support."
}
```

**Account Inactive (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Your account is inactive. Please contact support.",
  "error": "Your account is inactive. Please contact support."
}
```

**OTP Cooldown Active (400 Bad Request):**

```json
{
  "success": false,
  "message": "Please wait 3 minute(s) before requesting another OTP.",
  "error": "Please wait 3 minute(s) before requesting another OTP."
}
```

---

## 1.1. Verify Login OTP - Complete Login

**Endpoint:** `POST /api/auth/verify-login-otp`

**Description:** Verifies the login OTP sent to the user's email and returns a JWT token and user details upon successful verification. This is the second step of the two-step login process.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/auth/verify-login-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

### Request Body Parameters

| Parameter | Type   | Required | Description          | Constraints                                |
| --------- | ------ | -------- | -------------------- | ------------------------------------------ |
| `email`   | string | Yes      | User's email address | Valid email format (same as used in login) |
| `otp`     | string | Yes      | 6-digit OTP code     | Exactly 6 digits, numbers only             |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "profile_name": "John Doe",
      "username": "john.doe_1234567890",
      "role": "Client",
      "status": "Pending",
      "is_verified": true,
      "isId_verified": false
    }
  }
}
```

**Note:** The JWT token is also set as an HTTP-only cookie named `session`.

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "otp",
      "message": "OTP must be exactly 6 digits",
      "code": "invalid_type"
    }
  ]
}
```

**Invalid OTP (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid OTP. Please check and try again.",
  "error": "Invalid OTP. Please check and try again."
}
```

**OTP Not Found (400 Bad Request):**

```json
{
  "success": false,
  "message": "OTP not found. Please request a new OTP.",
  "error": "OTP not found. Please request a new OTP."
}
```

**OTP Expired (400 Bad Request):**

```json
{
  "success": false,
  "message": "OTP has expired. Please request a new OTP.",
  "error": "OTP has expired. Please request a new OTP."
}
```

**OTP Max Attempts Reached (429 Too Many Requests):**

```json
{
  "success": false,
  "message": "Invalid OTP. Maximum attempts reached. Please try again in 12 minute(s).",
  "error": "Invalid OTP. Maximum attempts reached. Please try again in 12 minute(s)."
}
```

**Email Not Found (400 Bad Request):**

```json
{
  "success": false,
  "message": "Email not found. Please check your email address.",
  "error": "Email not found. Please check your email address."
}
```

---

## 1.2. Resend Login OTP - Request New Login OTP

**Endpoint:** `POST /api/auth/resend-login-otp`

**Description:** Resends a login OTP to the user's email address. This is useful if the user didn't receive the OTP or it expired. The same OTP limits and cooldown rules apply.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/auth/resend-login-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

### Request Body Parameters

| Parameter | Type   | Required | Description          | Constraints        |
| --------- | ------ | -------- | -------------------- | ------------------ |
| `email`   | string | Yes      | User's email address | Valid email format |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login OTP sent to your email. Please verify to complete login.",
  "data": {
    "message": "Login OTP sent to your email. Please verify to complete login.",
    "email": "john.doe@example.com"
  }
}
```

### Error Responses

**Validation Error (422 Unprocessable Entity):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    }
  ]
}
```

**Email Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "Email not found. Please check your email address.",
  "error": "Email not found. Please check your email address."
}
```

**Account Not Verified (404 Not Found):**

```json
{
  "success": false,
  "message": "Account not verified. Please verify your email first.",
  "error": "Account not verified. Please verify your email first."
}
```

**Account Blocked (400 Bad Request):**

```json
{
  "success": false,
  "message": "Your account has been blocked. Please contact support.",
  "error": "Your account has been blocked. Please contact support."
}
```

**Account Suspended (400 Bad Request):**

```json
{
  "success": false,
  "message": "Your account has been suspended. Please contact support.",
  "error": "Your account has been suspended. Please contact support."
}
```

**Account Inactive (400 Bad Request):**

```json
{
  "success": false,
  "message": "Your account is inactive. Please contact support.",
  "error": "Your account is inactive. Please contact support."
}
```

**OTP Cooldown Active (400 Bad Request):**

```json
{
  "success": false,
  "message": "Please wait 3 minute(s) before requesting another OTP.",
  "error": "Please wait 3 minute(s) before requesting another OTP."
}
```

**OTP Max Attempts Reached (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid OTP. Maximum attempts reached. Please try again in 12 minute(s).",
  "error": "Invalid OTP. Maximum attempts reached. Please try again in 12 minute(s)."
}
```

**Email Send Failed (400 Bad Request):**

```json
{
  "success": false,
  "message": "Failed to send OTP email. Please try again.",
  "error": "Failed to send OTP email. Please try again."
}
```

---

## 2. Signup - Create Temp User and Send OTP

**Endpoint:** `POST /api/auth/signup`

**Description:** Creates a temporary user account and sends an OTP to the provided email address.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "account_type": "Client",
    "display_name": "John Doe",
    "email": "john.doe@example.com",
    "city": "New York",
    "password": "SecurePass123",
    "adult_policy": true
  }'
```

### Request Body Parameters

| Parameter      | Type    | Required | Description          | Valid Values                                   |
| -------------- | ------- | -------- | -------------------- | ---------------------------------------------- |
| `account_type` | string  | Yes      | Type of account      | `"Client"`, `"Escort"`, `"Creator"`, `"Admin"` |
| `display_name` | string  | Yes      | User's display name  | Min 2, Max 100 characters                      |
| `email`        | string  | Yes      | User's email address | Valid email format                             |
| `city`         | string  | Yes      | User's city          | Min 1, Max 100 characters                      |
| `password`     | string  | Yes      | User's password      | Min 8, Max 100 characters                      |
| `adult_policy` | boolean | No       | Accept adult policy  | Default: `true`                                |

### Example with Different Account Types

**Escort Account:**

```bash
curl -X POST http://localhost:3010/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "account_type": "Escort",
    "display_name": "Jane Smith",
    "email": "jane.smith@example.com",
    "city": "Los Angeles",
    "password": "MySecurePass456",
    "adult_policy": true
  }'
```

**Creator Account:**

```bash
curl -X POST http://localhost:3010/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "account_type": "Creator",
    "display_name": "Mike Johnson",
    "email": "mike.johnson@example.com",
    "city": "Chicago",
    "password": "CreatorPass789",
    "adult_policy": true
  }'
```

**Admin Account:**

```bash
curl -X POST http://localhost:3010/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "account_type": "Admin",
    "display_name": "Admin User",
    "email": "admin@example.com",
    "city": "San Francisco",
    "password": "AdminPass123!",
    "adult_policy": true
  }'
```

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {
    "email": "john.doe@example.com"
  }
}
```

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Email must be a valid email, Password must be at least 8 characters"
}
```

**Email Already Registered (409 Conflict):**

```json
{
  "success": false,
  "message": "Email already registered. Please login instead.",
  "error": "Email already registered. Please login instead."
}
```

**OTP Cooldown (400 Bad Request):**

```json
{
  "success": false,
  "message": "Please wait 3 minute(s) before requesting another OTP.",
  "error": "Please wait 3 minute(s) before requesting another OTP."
}
```

**OTP Limit Reached (400 Bad Request):**

```json
{
  "success": false,
  "message": "OTP limit reached. Please try again in 12 minute(s).",
  "error": "OTP limit reached. Please try again in 12 minute(s)."
}
```

---

## 3. Verify OTP - Verify Email and Create User Account

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verifies the OTP sent to the user's email and creates the user account. Returns a JWT token upon successful verification.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

### Request Body Parameters

| Parameter | Type   | Required | Description          | Constraints                                 |
| --------- | ------ | -------- | -------------------- | ------------------------------------------- |
| `email`   | string | Yes      | User's email address | Valid email format (same as used in signup) |
| `otp`     | string | Yes      | 6-digit OTP code     | Exactly 6 digits, numbers only              |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Email verified successfully. Account created.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "Client",
      "is_verified": true
    }
  }
}
```

**Note:** The JWT token is also set as an HTTP-only cookie named `session`.

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "OTP must be exactly 6 digits, Email must be a valid email"
}
```

**Invalid Email or OTP (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid email or OTP. Please sign up again.",
  "error": "Invalid email or OTP. Please sign up again."
}
```

**Email Already Verified (400 Bad Request):**

```json
{
  "success": false,
  "message": "Email already verified. Please login.",
  "error": "Email already verified. Please login."
}
```

**Invalid OTP (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid OTP. Please check and try again.",
  "error": "Invalid OTP. Please check and try again."
}
```

**OTP Expired (400 Bad Request):**

```json
{
  "success": false,
  "message": "OTP has expired. Please request a new OTP.",
  "error": "OTP has expired. Please request a new OTP."
}
```

**Maximum Attempts Reached (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid OTP. Maximum attempts reached. Please try again in 10 minute(s).",
  "error": "Invalid OTP. Maximum attempts reached. Please try again in 10 minute(s)."
}
```

**Email Already Registered (409 Conflict):**

```json
{
  "success": false,
  "message": "Email already registered. Please login instead.",
  "error": "Email already registered. Please login instead."
}
```

---

## 4. Resend OTP - Resend OTP to Temp User

**Endpoint:** `POST /api/auth/resend-otp`

**Description:** Resends an OTP to a user who has already signed up but hasn't verified their email yet. This is useful when the OTP expires or the user didn't receive the initial email.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

### Request Body Parameters

| Parameter | Type   | Required | Description          | Constraints                                                  |
| --------- | ------ | -------- | -------------------- | ------------------------------------------------------------ |
| `email`   | string | Yes      | User's email address | Valid email format (must match the email used during signup) |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {
    "email": "john.doe@example.com"
  }
}
```

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Email must be a valid email"
}
```

**No Signup Found (404 Not Found):**

```json
{
  "success": false,
  "message": "No signup found for this email. Please sign up first.",
  "error": "No signup found for this email. Please sign up first."
}
```

**Email Already Registered (409 Conflict):**

```json
{
  "success": false,
  "message": "Email already registered. Please login instead.",
  "error": "Email already registered. Please login instead."
}
```

**Email Already Verified (409 Conflict):**

```json
{
  "success": false,
  "message": "Email already verified. Please login.",
  "error": "Email already verified. Please login."
}
```

**OTP Cooldown (400 Bad Request):**

```json
{
  "success": false,
  "message": "Please wait 3 minute(s) before requesting another OTP.",
  "error": "Please wait 3 minute(s) before requesting another OTP."
}
```

**OTP Limit Reached (400 Bad Request):**

```json
{
  "success": false,
  "message": "OTP limit reached. Please try again in 12 minute(s).",
  "error": "OTP limit reached. Please try again in 12 minute(s)."
}
```

---

## Complete Flow Example

### Step 1: Signup

```bash
curl -X POST http://localhost:3010/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "account_type": "Client",
    "display_name": "John Doe",
    "email": "john.doe@example.com",
    "city": "New York",
    "password": "SecurePass123",
    "adult_policy": true
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {
    "email": "john.doe@example.com"
  }
}
```

### Step 2: Check Email for OTP

Check the email inbox for the 6-digit OTP code (e.g., `123456`).

**Alternative Step 2: Resend OTP (if not received or expired)**

```bash
curl -X POST http://localhost:3010/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {
    "email": "john.doe@example.com"
  }
}
```

### Step 3: Verify OTP

```bash
curl -X POST http://localhost:3010/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully. Account created.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJDbGllbnQiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDYwNDgwMH0.xyz...",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "Client",
      "is_verified": true
    }
  }
}
```

---

## 5. Forgot Password - Request Password Reset OTP

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Sends a password reset OTP to the user's email address. This is used when a user forgets their password.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

### Request Body Parameters

| Parameter | Type   | Required | Description          | Constraints                     |
| --------- | ------ | -------- | -------------------- | ------------------------------- |
| `email`   | string | Yes      | User's email address | Valid email format (must exist) |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Password reset OTP sent to your email.",
  "data": {
    "email": "john.doe@example.com"
  }
}
```

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Email must be a valid email"
}
```

**Email Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "Email not found. Please check your email address.",
  "error": "Email not found. Please check your email address."
}
```

**OTP Cooldown (400 Bad Request):**

```json
{
  "success": false,
  "message": "Please wait 3 minute(s) before requesting another OTP.",
  "error": "Please wait 3 minute(s) before requesting another OTP."
}
```

**OTP Limit Reached (400 Bad Request):**

```json
{
  "success": false,
  "message": "OTP limit reached. Please try again in 12 minute(s).",
  "error": "OTP limit reached. Please try again in 12 minute(s)."
}
```

---

## 6. Reset Password - Reset Password with OTP

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Resets the user's password. This endpoint supports two flows:

- **Forgot Password Flow**: User forgot password and received OTP via email (requires `otp`, no `old_pass`)
- **Change Password Flow**: User is logged in and wants to change password (requires `old_pass`, no `otp` needed)

### cURL Command - Forgot Password Flow

```bash
curl -X POST http://localhost:3010/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456",
    "new_pass": "NewSecurePass123"
  }'
```

### cURL Command - Change Password Flow (After Login - No OTP Required)

```bash
curl -X POST http://localhost:3010/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "new_pass": "NewSecurePass123",
    "old_pass": "OldPassword123"
  }'
```

**Note:** When `old_pass` is provided, `otp` is not required since the user is already authenticated.

### Request Body Parameters

| Parameter  | Type   | Required    | Description                    | Constraints                                                         |
| ---------- | ------ | ----------- | ------------------------------ | ------------------------------------------------------------------- |
| `email`    | string | Yes         | User's email address           | Valid email format (must exist)                                     |
| `otp`      | string | Conditional | 6-digit OTP code               | Required if `old_pass` not provided. Exactly 6 digits, numbers only |
| `new_pass` | string | Yes         | New password                   | Min 8, Max 100 characters                                           |
| `old_pass` | string | Conditional | Old password (for change flow) | Required if `otp` not provided. Min 8, Max 100 characters           |

**Note:** Either `otp` OR `old_pass` must be provided:

- **Forgot Password**: Provide `otp` (no `old_pass`)
- **Change Password**: Provide `old_pass` (no `otp` needed)

### Success Response (200 OK)

**Forgot Password Flow:**

```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": {
    "message": "Password reset successfully."
  }
}
```

**Change Password Flow:**

```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": {
    "message": "Password changed successfully."
  }
}
```

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "OTP must be exactly 6 digits, Password must be at least 8 characters"
}
```

**Email Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "Email not found. Please check your email address.",
  "error": "Email not found. Please check your email address."
}
```

**Invalid Old Password (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid old password.",
  "error": "Invalid old password."
}
```

**Old and New Password Same (400 Bad Request):**

```json
{
  "success": false,
  "message": "Old password and new password cannot be the same.",
  "error": "Old password and new password cannot be the same."
}
```

**Invalid OTP (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid OTP. Please check and try again.",
  "error": "Invalid OTP. Please check and try again."
}
```

**OTP Expired (400 Bad Request):**

```json
{
  "success": false,
  "message": "OTP has expired. Please request a new OTP.",
  "error": "OTP has expired. Please request a new OTP."
}
```

**Maximum Attempts Reached (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid OTP. Maximum attempts reached. Please try again in 10 minute(s).",
  "error": "Invalid OTP. Maximum attempts reached. Please try again in 10 minute(s)."
}
```

---

## Complete Password Reset Flow Example

### Step 1: Request Password Reset OTP

```bash
curl -X POST http://localhost:3010/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset OTP sent to your email.",
  "data": {
    "email": "john.doe@example.com"
  }
}
```

### Step 2: Check Email for OTP

Check the email inbox for the 6-digit OTP code (e.g., `123456`).

### Step 3: Reset Password with OTP

```bash
curl -X POST http://localhost:3010/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456",
    "new_pass": "NewSecurePass123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": {
    "message": "Password reset successfully."
  }
}
```

---

## Change Password Flow Example (After Login - No OTP Required)

When a user is already logged in, they can change their password by simply providing their old password and new password. **No OTP is required** since they are already authenticated.

### Change Password (Single Step)

```bash
curl -X POST http://localhost:3010/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "new_pass": "NewSecurePass123",
    "old_pass": "OldPassword123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": {
    "message": "Password changed successfully."
  }
}
```

**Note:** Since the user is already logged in, they only need to provide:

- `email` - Their email address
- `old_pass` - Current password (for verification)
- `new_pass` - New password

**No OTP is required** for this flow.

---

## 7. Logout - Clear Session

**Endpoint:** `POST /api/auth/logout`

**Description:** Logs out the authenticated user by clearing the session cookie. This endpoint requires authentication.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

### Authentication

This endpoint requires authentication. Include the JWT token either:

- In the `Authorization` header as `Bearer YOUR_JWT_TOKEN`
- In the `Cookie` header as `session=YOUR_JWT_TOKEN`

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": {
    "message": "Logged out successfully."
  }
}
```

**Note:** The session cookie will be cleared from the client's browser after this response.

### Error Responses

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

**Invalid Token (401 Unauthorized):**

```json
{
  "error": "Unauthorized: Invalid token",
  "UA": false
}
```

**Logout Failed (400 Bad Request):**

```json
{
  "success": false,
  "message": "Logout failed",
  "error": "An error occurred during logout"
}
```

---

## 8. Get User Data - Fetch Authenticated User's Profile

**Endpoint:** `GET /api/user`

**Description:** Fetches the authenticated user's complete profile data. This is a protected endpoint that requires authentication via JWT token.

### cURL Command

```bash
curl -X GET http://localhost:3010/api/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

**Note:** You can provide the token either via:

- `Authorization` header: `Bearer <token>`
- `Cookie`: `session=<token>`

### Request Parameters

This endpoint does not require any request parameters. The user ID is extracted from the JWT token.

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "User data fetched successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "profile_name": "John Doe",
      "username": "john.doe_1234567890",
      "email": "john.doe@example.com",
      "profile": "https://example.com/profile.jpg",
      "dob": "1990-01-01",
      "gender": "Male",
      "mobile_number": "+1234567890",
      "whatsapp_number": "+1234567890",
      "country_code": "US",
      "phone_code": "+1",
      "role": "Client",
      "country": "United States",
      "b_country": "United States",
      "state": "New York",
      "city": "New York",
      "postcode": "10001",
      "street1": "123 Main St",
      "street2": "Apt 4B",
      "referral_code": null,
      "my_referral_code": "REF123456",
      "status": "Approved",
      "status_reason": null,
      "pass_status": "Changed",
      "agency": "No",
      "company_name": null,
      "company_address": null,
      "company_vat": null,
      "company_contact_number": null,
      "is_verified": true,
      "v_first_name": null,
      "v_last_name": null,
      "v_dob": null,
      "v_country": null,
      "v_are_you": null,
      "isId_verified": false,
      "isId_verified_at": null,
      "device_token": null,
      "dailyFreeUnlocks": 3,
      "lastFreeUnlockDate": null,
      "blocked_at": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses

**Unauthorized - No Token (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

**Unauthorized - Invalid Token (401 Unauthorized):**

```json
{
  "error": "Unauthorized: Invalid token",
  "UA": true
}
```

**User Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "User not found.",
  "error": "User not found."
}
```

**User ID Not Found in Token (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Failed to fetch user data",
  "error": "User ID not found in token"
}
```

### Security Notes

- **Sensitive Data Excluded**: The response excludes sensitive fields like:
  - `password`
  - `reset_password_otp`
  - `reset_password_otp_sent_at`
  - `reset_password_otp_attempts`
  - `reset_password_otp_first_attempt_at`
  - `otp_attempts`

- **Authentication Required**: This endpoint requires a valid JWT token. The token can be provided via:
  - Cookie: `session` cookie (preferred)
  - Header: `Authorization: Bearer <token>`

---

## Notes

1. **OTP Limits:**
   - Maximum 3 OTP attempts per 15-minute window
   - 5-minute cooldown between OTP sends
   - OTP expires after 10 minutes

2. **JWT Token:**
   - Token is returned in the response body
   - Token is also set as an HTTP-only cookie named `session`
   - Token can be used for authentication in subsequent requests

3. **Account Type Mapping:**
   - `Client` → Role: `Client`
   - `Escort` → Role: `Client`
   - `Creator` → Role: `Advertiser`
   - `Admin` → Role: `Admin`

4. **Environment Variables:**
   - Default server port: `3010`
   - Update the base URL if your server runs on a different port or domain

---

## 9. Client Preferences - Manage User Preferences

**Base Endpoint:** `/api/client-preferences`

**Description:** These endpoints allow clients to save, retrieve, and delete their preferences including city, vibe preferences, bio, and tags. All endpoints require authentication.

---

### 9.1. Save Client Preferences - Create or Update Preferences

**Endpoint:** `POST /api/client-preferences`

**Description:** Creates or updates client preferences. If preferences already exist for the user, they will be updated. Only users with the "Client" role can set preferences.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/client-preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN" \
  -d '{
    "city": "London",
    "preferences": ["GFE", "Sophisticated", "Luxury"],
    "bio": "Looking for sophisticated experiences",
    "tags": ["luxury", "discrete", "professional"]
  }'
```

### Request Body Parameters

| Parameter     | Type     | Required | Description                      | Valid Values                                                                                                                                     |
| ------------- | -------- | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `city`        | string   | No       | City where user is browsing from | Max 100 characters (optional, nullable)                                                                                                           |
| `preferences` | string[] | No       | Array of vibe preferences        | Maximum 7 values from: `"GFE"`, `"Sophisticated"`, `"Wild nights"`, `"Chilled"`, `"Luxury"`, `"Incall"`, `"Outcall"` (optional, nullable)        |
| `bio`         | string   | No       | User bio/description             | Max 1000 characters (optional, nullable)                                                                                                         |
| `tags`        | string[] | No       | Array of tags                     | Maximum 20 tags, each tag max 50 characters (optional, nullable)                                                                                |

### Valid Preference Values

- `"GFE"`
- `"Sophisticated"`
- `"Wild nights"`
- `"Chilled"`
- `"Luxury"`
- `"Incall"`
- `"Outcall"`

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Client preferences saved successfully.",
  "data": {
    "preferences": {
      "id": 1,
      "user_id": 1,
      "city": "London",
      "preferences": ["GFE", "Sophisticated", "Luxury"],
      "bio": "Looking for sophisticated experiences",
      "tags": ["luxury", "discrete", "professional"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses

**Validation Error (422 Unprocessable Entity):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "preferences",
      "message": "At least one preference must be selected",
      "code": "too_small"
    }
  ]
}
```

**User Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "User not found.",
  "error": "User not found."
}
```

**Only Clients Can Set Preferences (404 Not Found):**

```json
{
  "success": false,
  "message": "Only clients can set preferences.",
  "error": "Only clients can set preferences."
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

---

### 9.2. Update Client Preferences - Update Existing Preferences

**Endpoint:** `PUT /api/client-preferences`

**Description:** Updates existing client preferences. This endpoint requires that preferences already exist for the user. If preferences don't exist, use the POST endpoint to create them.

### cURL Command

```bash
curl -X PUT http://localhost:3010/api/client-preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN" \
  -d '{
    "city": "Birmingham",
    "preferences": ["GFE", "Luxury", "Incall"],
    "bio": "Updated bio description",
    "tags": ["updated", "tags"]
  }'
```

### Request Body Parameters

| Parameter     | Type     | Required | Description                      | Valid Values                                                                                                                                     |
| ------------- | -------- | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `city`        | string   | No       | City where user is browsing from | Max 100 characters (optional, nullable)                                                                                                           |
| `preferences` | string[] | No       | Array of vibe preferences        | Maximum 7 values from: `"GFE"`, `"Sophisticated"`, `"Wild nights"`, `"Chilled"`, `"Luxury"`, `"Incall"`, `"Outcall"` (optional, nullable)        |
| `bio`         | string   | No       | User bio/description             | Max 1000 characters (optional, nullable)                                                                                                         |
| `tags`        | string[] | No       | Array of tags                     | Maximum 20 tags, each tag max 50 characters (optional, nullable)                                                                                |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Client preferences updated successfully.",
  "data": {
    "preferences": {
      "id": 1,
      "user_id": 1,
      "city": "Birmingham",
      "preferences": ["GFE", "Luxury", "Incall"],
      "bio": "Updated bio description",
      "tags": ["updated", "tags"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### Error Responses

**Validation Error (422 Unprocessable Entity):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "preferences",
      "message": "At least one preference must be selected",
      "code": "too_small"
    }
  ]
}
```

**Preferences Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "Client preferences not found.",
  "error": "Client preferences not found."
}
```

**User Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "User not found.",
  "error": "User not found."
}
```

**Only Clients Can Set Preferences (404 Not Found):**

```json
{
  "success": false,
  "message": "Only clients can set preferences.",
  "error": "Only clients can set preferences."
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

---

### 9.3. Get Client Preferences - Fetch User's Preferences

**Endpoint:** `GET /api/client-preferences`

**Description:** Retrieves the authenticated client's preferences.

### cURL Command

```bash
curl -X GET http://localhost:3010/api/client-preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Client preferences fetched successfully.",
  "data": {
    "preferences": {
      "id": 1,
      "user_id": 1,
      "city": "London",
      "preferences": ["GFE", "Sophisticated", "Luxury"],
      "bio": "Looking for sophisticated experiences",
      "tags": ["luxury", "discrete", "professional"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses

**Preferences Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "Client preferences not found.",
  "error": "Client preferences not found."
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

---

### 9.4. Delete Client Preferences - Remove User's Preferences

**Endpoint:** `DELETE /api/client-preferences`

**Description:** Deletes the authenticated client's preferences.

### cURL Command

```bash
curl -X DELETE http://localhost:3010/api/client-preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Client preferences deleted successfully.",
  "data": {
    "message": "Client preferences deleted successfully."
  }
}
```

### Error Responses

**Preferences Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "Client preferences not found.",
  "error": "Client preferences not found."
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

---

### Complete Flow Example

#### Step 1: Save Preferences

```bash
curl -X POST http://localhost:3010/api/client-preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "city": "Manchester",
    "preferences": ["Chilled", "Outcall"],
    "bio": "Relaxed and casual experiences",
    "tags": ["casual", "outcall"]
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Client preferences saved successfully.",
  "data": {
    "preferences": {
      "id": 1,
      "user_id": 1,
      "city": "Manchester",
      "preferences": ["Chilled", "Outcall"],
      "bio": "Relaxed and casual experiences",
      "tags": ["casual", "outcall"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Step 2: Get Preferences

```bash
curl -X GET http://localhost:3010/api/client-preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 3: Update Preferences

```bash
curl -X PUT http://localhost:3010/api/client-preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "city": "Birmingham",
    "preferences": ["GFE", "Luxury", "Incall"],
    "bio": "Premium experiences only",
    "tags": ["premium", "luxury", "incall"]
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Client preferences updated successfully.",
  "data": {
    "preferences": {
      "id": 1,
      "user_id": 1,
      "city": "Birmingham",
      "preferences": ["GFE", "Luxury", "Incall"],
      "bio": "Premium experiences only",
      "tags": ["premium", "luxury", "incall"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Note:**

- Use `POST /api/client-preferences` to create new preferences (works for both create and update)
- Use `PUT /api/client-preferences` to update existing preferences (requires preferences to exist)

---

## 10. Countries - Get Country Information

**Base Endpoint:** `/api/countries`

**Description:** These endpoints allow you to retrieve country information. All endpoints are public and do not require authentication.

---

### 10.1. Get All Countries - List All Available Countries

**Endpoint:** `GET /api/countries`

**Description:** Retrieves a list of all available countries sorted alphabetically by name.

### cURL Command

```bash
curl -X GET http://localhost:3010/api/countries
```

### Request Parameters

This endpoint does not require any parameters.

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Countries fetched successfully.",
  "data": {
    "message": "Countries fetched successfully.",
    "countries": [
      {
        "id": 1,
        "name": "Australia",
        "shortcode": "au"
      },
      {
        "id": 2,
        "name": "Canada",
        "shortcode": "ca"
      },
      {
        "id": 3,
        "name": "Ireland",
        "shortcode": "ie"
      },
      {
        "id": 4,
        "name": "United Kingdom",
        "shortcode": "uk"
      },
      {
        "id": 5,
        "name": "United States",
        "shortcode": "us"
      }
    ]
  }
}
```

### Error Responses

**Server Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Failed to fetch countries",
  "error": "An error occurred while fetching countries"
}
```

---

### 10.2. Get Country by ID - Retrieve Specific Country

**Endpoint:** `GET /api/countries/:id`

**Description:** Retrieves detailed information about a specific country by its ID.

### cURL Command

```bash
curl -X GET http://localhost:3010/api/countries/1
```

### URL Parameters

| Parameter | Type   | Required | Description | Constraints             |
| --------- | ------ | -------- | ----------- | ----------------------- |
| `id`      | number | Yes      | Country ID  | Must be a valid integer |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Country fetched successfully.",
  "data": {
    "message": "Country fetched successfully.",
    "country": {
      "id": 1,
      "name": "United Kingdom",
      "shortcode": "uk"
    }
  }
}
```

### Error Responses

**Invalid Country ID (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid country ID",
  "error": "Invalid country ID"
}
```

**Country Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "Country not found.",
  "error": "Country not found."
}
```

---

## 11. Cities - Get City Information

**Base Endpoint:** `/api/cities`

**Description:** These endpoints allow you to retrieve city information with pagination and filtering options. All endpoints are public and do not require authentication.

---

### 11.1. Get All Cities - List Cities with Pagination and Filters

**Endpoint:** `GET /api/cities`

**Description:** Retrieves a paginated list of cities with optional filtering by country ID. Supports pagination, country filtering, and search functionality.

### cURL Command - Basic Request (All Cities)

```bash
curl -X GET "http://localhost:3010/api/cities?page=1&limit=10"
```

### cURL Command - Filter by Country ID

```bash
curl -X GET "http://localhost:3010/api/cities?country_id=1&page=1&limit=20"
```

### cURL Command - Search Cities

```bash
curl -X GET "http://localhost:3010/api/cities?search=london&page=1&limit=10"
```

### Query Parameters

| Parameter    | Type   | Required | Description                   | Constraints                           |
| ------------ | ------ | -------- | ----------------------------- | ------------------------------------- |
| `page`       | number | No       | Page number for pagination    | Default: `1`                          |
| `limit`      | number | No       | Number of items per page      | Default: `10`                         |
| `country_id` | number | No       | Filter cities by country ID   | Must be a valid country ID            |
| `search`     | string | No       | Search cities by name or slug | Searches in city name and slug fields |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Cities fetched successfully.",
  "data": [
    {
      "id": 1,
      "name": "London",
      "slug": "london",
      "country_id": 4,
      "country": {
        "id": 4,
        "name": "United Kingdom",
        "shortcode": "uk"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Manchester",
      "slug": "manchester",
      "country_id": 4,
      "country": {
        "id": 4,
        "name": "United Kingdom",
        "shortcode": "uk"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalResults": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Pagination Response Structure

The pagination object includes:

- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `totalResults`: Total number of cities matching the filters
- `hasNext`: Boolean indicating if there's a next page
- `hasPrev`: Boolean indicating if there's a previous page

### Error Responses

**Server Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Failed to fetch cities",
  "error": "An error occurred while fetching cities"
}
```

---

### 11.2. Get City by ID - Retrieve Specific City

**Endpoint:** `GET /api/cities/:id`

**Description:** Retrieves detailed information about a specific city by its ID, including country information.

### cURL Command

```bash
curl -X GET http://localhost:3010/api/cities/1
```

### URL Parameters

| Parameter | Type   | Required | Description | Constraints             |
| --------- | ------ | -------- | ----------- | ----------------------- |
| `id`      | number | Yes      | City ID     | Must be a valid integer |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "City fetched successfully.",
  "data": {
    "message": "City fetched successfully.",
    "city": {
      "id": 1,
      "name": "London",
      "slug": "london",
      "country_id": 4,
      "country": {
        "id": 4,
        "name": "United Kingdom",
        "shortcode": "uk"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses

**Invalid City ID (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid city ID",
  "error": "Invalid city ID"
}
```

**City Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "City not found.",
  "error": "City not found."
}
```

---

### 11.3. Get Cities by Country ID - List Cities for a Country

**Endpoint:** `GET /api/cities/country/:countryId`

**Description:** Retrieves all cities for a specific country by country ID. Results are sorted alphabetically by city name.

### cURL Command

```bash
curl -X GET http://localhost:3010/api/cities/country/1
```

### URL Parameters

| Parameter   | Type   | Required | Description | Constraints             |
| ----------- | ------ | -------- | ----------- | ----------------------- |
| `countryId` | number | Yes      | Country ID  | Must be a valid integer |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Cities fetched successfully.",
  "data": {
    "message": "Cities fetched successfully.",
    "cities": [
      {
        "id": 1,
        "name": "London",
        "slug": "london",
        "country_id": 4
      },
      {
        "id": 2,
        "name": "Manchester",
        "slug": "manchester",
        "country_id": 4
      },
      {
        "id": 3,
        "name": "Birmingham",
        "slug": "birmingham",
        "country_id": 4
      }
    ]
  }
}
```

### Error Responses

**Invalid Country ID (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid country ID",
  "error": "Invalid country ID"
}
```

**Country Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "Country not found.",
  "error": "Country not found."
}
```

---

### Complete Flow Examples

#### Example 1: Get All Cities with Pagination

```bash
curl -X GET "http://localhost:3010/api/cities?page=1&limit=10"
```

**Response:**

```json
{
  "success": true,
  "message": "Cities fetched successfully.",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalResults": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Example 2: Get Cities in United Kingdom

```bash
curl -X GET "http://localhost:3010/api/cities?country_id=4&page=1&limit=20"
```

**Response:**

```json
{
  "success": true,
  "message": "Cities fetched successfully.",
  "data": [
    {
      "id": 1,
      "name": "London",
      "slug": "london",
      "country_id": 4,
      "country": {
        "id": 4,
        "name": "United Kingdom",
        "shortcode": "uk"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalResults": 20,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Example 3: Search for Cities

```bash
curl -X GET "http://localhost:3010/api/cities?search=new&page=1&limit=10"
```

**Response:**

```json
{
  "success": true,
  "message": "Cities fetched successfully.",
  "data": {
    "message": "Cities fetched successfully.",
    "cities": [
      {
        "id": 1,
        "name": "New York",
        "slug": "new-york",
        "country_id": 5
      },
      {
        "id": 2,
        "name": "Newcastle",
        "slug": "newcastle",
        "country_id": 4
      }
    ],
    "total": 2
  }
}
```

---

## 12. Tags - Get Tag Information

**Base Endpoint:** `/api/tags`

**Description:** This endpoint allows you to retrieve tag information with optional search functionality. The endpoint is public and does not require authentication.

---

### 12.1. Get All Tags - List Tags with Optional Search

**Endpoint:** `GET /api/tags`

**Description:** Retrieves a list of all available tags sorted alphabetically by label. Supports optional search filtering by tag label (case-insensitive partial match) and filtering by tag type.

### cURL Command - Get All Tags

```bash
curl -X GET http://localhost:3010/api/tags
```

### cURL Command - Search Tags by Label

```bash
curl -X GET "http://localhost:3010/api/tags?search=kinky"
```

### cURL Command - Filter Tags by Type

```bash
curl -X GET "http://localhost:3010/api/tags?tag_type=profile"
```

```bash
curl -X GET "http://localhost:3010/api/tags?tag_type=content"
```

### cURL Command - Search Tags with Type Filter

```bash
curl -X GET "http://localhost:3010/api/tags?search=rom&tag_type=profile"
```

### Query Parameters

| Parameter  | Type   | Required | Description                    | Constraints                                    |
| ---------- | ------ | -------- | ------------------------------ | ---------------------------------------------- |
| `search`   | string | No       | Filter tags by label           | Case-insensitive partial match                 |
| `tag_type` | string | No       | Filter tags by type            | `"profile"` or `"content"`. Default: all types |

### Success Response (200 OK)

**Get All Tags:**

```json
{
  "success": true,
  "message": "Tags fetched successfully.",
  "data": {
    "message": "Tags fetched successfully.",
    "tags": [
      {
        "id": 1,
        "label": "Adventurous",
        "description": "Open to trying new experiences and activities",
        "tag_type": "profile"
      },
      {
        "id": 2,
        "label": "Anal",
        "description": "Open to anal activities",
        "tag_type": "profile"
      },
      {
        "id": 3,
        "label": "Available Now",
        "description": "Currently available for immediate booking",
        "tag_type": "profile"
      },
      {
        "id": 4,
        "label": "BDSM",
        "description": "Bondage, Discipline, Dominance, Submission, Sadism, Masochism",
        "tag_type": "profile"
      },
      {
        "id": 5,
        "label": "Bilingual",
        "description": "Fluent in multiple languages",
        "tag_type": "profile"
      }
    ]
  }
}
```

**Search Tags (with search parameter):**

```json
{
  "success": true,
  "message": "Tags fetched successfully.",
  "data": {
    "message": "Tags fetched successfully.",
    "tags": [
      {
        "id": 1,
        "label": "Kinky",
        "description": "Open to adventurous and unconventional experiences",
        "tag_type": "profile"
      },
      {
        "id": 2,
        "label": "Kissing",
        "description": "Enjoys intimate kissing",
        "tag_type": "profile"
      }
    ]
  }
}
```

### Error Responses

**Server Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Failed to fetch tags",
  "error": "An error occurred while fetching tags"
}
```

### Complete Flow Examples

#### Example 1: Get All Tags

```bash
curl -X GET http://localhost:3010/api/tags
```

**Response:**

```json
{
  "success": true,
  "message": "Tags fetched successfully.",
  "data": {
    "message": "Tags fetched successfully.",
    "tags": [
      {
        "id": 1,
        "label": "Adventurous",
        "description": "Open to trying new experiences and activities",
        "tag_type": "profile"
      },
      {
        "id": 2,
        "label": "Anal",
        "description": "Open to anal activities",
        "tag_type": "profile"
      }
    ]
  }
}
```

#### Example 2: Search for Tags Containing "rom"

```bash
curl -X GET "http://localhost:3010/api/tags?search=rom"
```

**Response:**

```json
{
  "success": true,
  "message": "Tags fetched successfully.",
  "data": {
    "message": "Tags fetched successfully.",
    "tags": [
      {
        "id": 15,
        "label": "Romantic",
        "description": "Provides intimate and romantic experiences"
      }
    ]
  }
}
```

#### Example 3: Search for Tags Containing "GFE"

```bash
curl -X GET "http://localhost:3010/api/tags?search=GFE"
```

**Response:**

```json
{
  "success": true,
  "message": "Tags fetched successfully.",
  "data": {
    "message": "Tags fetched successfully.",
    "tags": [
      {
        "id": 17,
        "label": "GFE",
        "description": "Girlfriend Experience - provides a genuine relationship-like experience"
      }
    ]
  }
}
```

**Note:**

- The search is case-insensitive and performs a partial match on the tag label
- If no tags match the search query, an empty array is returned
- Tags are always sorted alphabetically by label (ASC)

---

## 13. User Availability - Manage User Availability Schedule

**Base Endpoint:** `/api/user-availability`

**Description:** These endpoints allow users to manage their availability schedule by day of week and time slots. All endpoints require authentication.

---

### 13.1. Create User Availability - Add New Availability Slot

**Endpoint:** `POST /api/user-availability`

**Description:** Creates a new availability slot for the authenticated user. Each availability record represents a time slot on a specific day of the week.

### cURL Command

```bash
curl -X POST http://localhost:3010/api/user-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN" \
  -d '{
    "days_of_week": "monday",
    "start_time": "09:00",
    "end_time": "17:00"
  }'
```

### Request Body Parameters

| Parameter      | Type   | Required | Description                 | Valid Values                                                                               |
| -------------- | ------ | -------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| `days_of_week` | string | Yes      | Day of the week             | `"monday"`, `"tuesday"`, `"wednesday"`, `"thursday"`, `"friday"`, `"saturday"`, `"sunday"` |
| `start_time`   | string | Yes      | Start time for availability | Time format: `HH:MM` or `HH:MM:SS` (e.g., `"09:00"`, `"14:30"`, `"18:00:00"`)              |
| `end_time`     | string | Yes      | End time for availability   | Time format: `HH:MM` or `HH:MM:SS` (e.g., `"17:00"`, `"22:30"`, `"23:59:59"`)              |

**Note:** `start_time` must be before `end_time`.

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "User availability created successfully.",
  "data": {
    "message": "User availability created successfully.",
    "availability": {
      "id": 1,
      "user_id": 1,
      "days_of_week": "monday",
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Days of week must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday"
}
```

**Invalid Time Format (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid time format. Use HH:MM or HH:MM:SS",
  "error": "Invalid time format. Use HH:MM or HH:MM:SS"
}
```

**Start Time After End Time (400 Bad Request):**

```json
{
  "success": false,
  "message": "Start time must be before end time",
  "error": "Start time must be before end time"
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

---

### 13.2. Get User Availability - Get All Availability for Authenticated User

**Endpoint:** `GET /api/user-availability`

**Description:** Retrieves all availability records for the authenticated user, sorted by day of week.

### cURL Command

```bash
curl -X GET http://localhost:3010/api/user-availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

### Request Parameters

This endpoint does not require any parameters. The user ID is extracted from the JWT token.

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "User availability fetched successfully.",
  "data": {
    "message": "User availability fetched successfully.",
    "availability": [
      {
        "id": 1,
        "user_id": 1,
        "days_of_week": "monday",
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "days_of_week": "tuesday",
        "start_time": "10:00:00",
        "end_time": "18:00:00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 3,
        "user_id": 1,
        "days_of_week": "wednesday",
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Error Responses

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

**User Not Found (400 Bad Request):**

```json
{
  "success": false,
  "message": "User not found.",
  "error": "User not found."
}
```

---

### 13.3. Get User Availability by ID - Get Specific Availability Record

**Endpoint:** `GET /api/user-availability/:id`

**Description:** Retrieves a specific availability record by its ID. The record must belong to the authenticated user.

### cURL Command

```bash
curl -X GET http://localhost:3010/api/user-availability/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

### URL Parameters

| Parameter | Type   | Required | Description     | Constraints             |
| --------- | ------ | -------- | --------------- | ----------------------- |
| `id`      | number | Yes      | Availability ID | Must be a valid integer |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "User availability fetched successfully.",
  "data": {
    "message": "User availability fetched successfully.",
    "availability": {
      "id": 1,
      "user_id": 1,
      "days_of_week": "monday",
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses

**Invalid Availability ID (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid availability ID",
  "error": "Invalid availability ID"
}
```

**Availability Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "User availability not found.",
  "error": "User availability not found."
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

---

### 13.4. Update User Availability - Update Existing Availability

**Endpoint:** `PUT /api/user-availability/:id`

**Description:** Updates an existing availability record. All fields are optional - only provide the fields you want to update.

### cURL Command

```bash
curl -X PUT http://localhost:3010/api/user-availability/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN" \
  -d '{
    "start_time": "10:00",
    "end_time": "18:00"
  }'
```

### URL Parameters

| Parameter | Type   | Required | Description     | Constraints             |
| --------- | ------ | -------- | --------------- | ----------------------- |
| `id`      | number | Yes      | Availability ID | Must be a valid integer |

### Request Body Parameters

| Parameter      | Type   | Required | Description                 | Valid Values                                                                               |
| -------------- | ------ | -------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| `days_of_week` | string | No       | Day of the week             | `"monday"`, `"tuesday"`, `"wednesday"`, `"thursday"`, `"friday"`, `"saturday"`, `"sunday"` |
| `start_time`   | string | No       | Start time for availability | Time format: `HH:MM` or `HH:MM:SS`                                                         |
| `end_time`     | string | No       | End time for availability   | Time format: `HH:MM` or `HH:MM:SS`                                                         |

**Note:** All fields are optional. Only include the fields you want to update.

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "User availability updated successfully.",
  "data": {
    "message": "User availability updated successfully.",
    "availability": {
      "id": 1,
      "user_id": 1,
      "days_of_week": "monday",
      "start_time": "10:00:00",
      "end_time": "18:00:00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Invalid time format. Use HH:MM or HH:MM:SS"
}
```

**Availability Not Found (400 Bad Request):**

```json
{
  "success": false,
  "message": "User availability not found.",
  "error": "User availability not found."
}
```

**Start Time After End Time (400 Bad Request):**

```json
{
  "success": false,
  "message": "Start time must be before end time",
  "error": "Start time must be before end time"
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

---

### 13.5. Delete User Availability - Remove Availability Record

**Endpoint:** `DELETE /api/user-availability/:id`

**Description:** Deletes a specific availability record. The record must belong to the authenticated user.

### cURL Command

```bash
curl -X DELETE http://localhost:3010/api/user-availability/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

### URL Parameters

| Parameter | Type   | Required | Description     | Constraints             |
| --------- | ------ | -------- | --------------- | ----------------------- |
| `id`      | number | Yes      | Availability ID | Must be a valid integer |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "User availability deleted successfully.",
  "data": {
    "message": "User availability deleted successfully."
  }
}
```

### Error Responses

**Invalid Availability ID (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid availability ID",
  "error": "Invalid availability ID"
}
```

**Availability Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "User availability not found.",
  "error": "User availability not found."
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized: No token provided",
  "UA": false
}
```

---

### Complete Flow Example

#### Step 1: Create Availability for Monday

```bash
curl -X POST http://localhost:3010/api/user-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "days_of_week": "monday",
    "start_time": "09:00",
    "end_time": "17:00"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User availability created successfully.",
  "data": {
    "message": "User availability created successfully.",
    "availability": {
      "id": 1,
      "user_id": 1,
      "days_of_week": "monday",
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Step 2: Create Availability for Tuesday

```bash
curl -X POST http://localhost:3010/api/user-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "days_of_week": "tuesday",
    "start_time": "10:00",
    "end_time": "18:00"
  }'
```

#### Step 3: Get All Availability

```bash
curl -X GET http://localhost:3010/api/user-availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "User availability fetched successfully.",
  "data": {
    "message": "User availability fetched successfully.",
    "availability": [
      {
        "id": 1,
        "user_id": 1,
        "days_of_week": "monday",
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "days_of_week": "tuesday",
        "start_time": "10:00:00",
        "end_time": "18:00:00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Step 4: Update Monday Availability

```bash
curl -X PUT http://localhost:3010/api/user-availability/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "start_time": "08:00",
    "end_time": "16:00"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User availability updated successfully.",
  "data": {
    "message": "User availability updated successfully.",
    "availability": {
      "id": 1,
      "user_id": 1,
      "days_of_week": "monday",
      "start_time": "08:00:00",
      "end_time": "16:00:00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

#### Step 5: Delete Availability

```bash
curl -X DELETE http://localhost:3010/api/user-availability/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "User availability deleted successfully.",
  "data": {
    "message": "User availability deleted successfully."
  }
}
```

**Notes:**

- All endpoints require authentication via JWT token
- Time format accepts both `HH:MM` and `HH:MM:SS` formats
- `start_time` must always be before `end_time`
- Users can have multiple availability records (one per day of week)
- Availability records are sorted by day of week (monday, tuesday, etc.)

---

## 14. User Tags - Manage User Profile Tags

User tags allow users to add and remove tags from their profile. When adding a tag, if the tag doesn't exist in the tags table, it will be automatically created. Tags can only be removed from the user's profile (user_tags table), never from the tags table itself.

**Base URL:** `/api/user-tags`

**Authentication:** All endpoints require JWT authentication via Bearer token.

### 14.1. Add Tag to User Profile - Add a Tag to Authenticated User

Add a tag to the authenticated user's profile. If the tag doesn't exist in the tags table, it will be created automatically.

**Endpoint:** `POST /api/user-tags`

**Headers:**

- `Content-Type: application/json`
- `Authorization: Bearer YOUR_JWT_TOKEN`

**Request Body:**

```json
{
  "tag_label": "Kinky",
  "tag_description": "Open to adventurous and unconventional experiences",
  "tag_type": "profile"
}
```

**Request Body Parameters:**

| Parameter         | Type   | Required | Description                     | Constraints                                                      |
| ----------------- | ------ | -------- | ------------------------------- | ---------------------------------------------------------------- |
| `tag_label`       | string | Yes      | Label/name of the tag           | Min length: 1, Max length: 100, trimmed                          |
| `tag_description` | string | No       | Optional description of the tag | Max length: 500, trimmed, nullable                               |
| `tag_type`        | string | No       | Type of the tag                 | `"profile"` or `"content"`. Default: `"profile"` if not provided |

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Tag added to user profile successfully.",
  "data": {
    "message": "Tag added to user profile successfully.",
    "tag": {
      "id": 1,
      "label": "Kinky",
      "description": "Open to adventurous and unconventional experiences",
      "tag_type": "profile"
    }
  }
}
```

**Error Responses:**

- **400 Bad Request** - User already has this tag:

  ```json
  {
    "success": false,
    "message": "User already has this tag.",
    "error": "User already has this tag."
  }
  ```

- **401 Unauthorized** - Missing or invalid token:
  ```json
  {
    "success": false,
    "message": "Failed to add tag to user profile",
    "error": "User ID not found in token"
  }
  ```

### 14.2. Get User Tags - Get All Tags for Authenticated User

Retrieve all tags associated with the authenticated user's profile.

**Endpoint:** `GET /api/user-tags`

**Headers:**

- `Authorization: Bearer YOUR_JWT_TOKEN`

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "User tags fetched successfully.",
  "data": {
    "message": "User tags fetched successfully.",
    "tags": [
      {
        "id": 1,
        "label": "Kinky",
        "description": "Open to adventurous and unconventional experiences",
        "tag_type": "profile",
        "addedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "label": "Romantic",
        "description": "Provides intimate and romantic experiences",
        "tag_type": "profile",
        "addedAt": "2024-01-02T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

- **401 Unauthorized** - Missing or invalid token:

  ```json
  {
    "success": false,
    "message": "Failed to fetch user tags",
    "error": "User ID not found in token"
  }
  ```

- **404 Not Found** - User not found:
  ```json
  {
    "success": false,
    "message": "User not found.",
    "error": "User not found."
  }
  ```

### 14.3. Remove Tag from User Profile - Remove a Tag from Authenticated User

Remove a tag from the authenticated user's profile. This only removes the tag from the user_tags table, not from the tags table.

**Endpoint:** `DELETE /api/user-tags/:tag_id`

**Headers:**

- `Authorization: Bearer YOUR_JWT_TOKEN`

**URL Parameters:**

| Parameter | Type   | Required | Description             | Constraints                |
| --------- | ------ | -------- | ----------------------- | -------------------------- |
| `tag_id`  | number | Yes      | ID of the tag to remove | Must be a positive integer |

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Tag removed from user profile successfully.",
  "data": {
    "message": "Tag removed from user profile successfully."
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid tag ID:

  ```json
  {
    "success": false,
    "message": "Invalid tag ID",
    "error": "Invalid tag ID"
  }
  ```

- **404 Not Found** - Tag or user tag not found:

  ```json
  {
    "success": false,
    "message": "User tag not found.",
    "error": "User tag not found."
  }
  ```

- **401 Unauthorized** - Missing or invalid token:
  ```json
  {
    "success": false,
    "message": "Failed to remove tag from user profile",
    "error": "User ID not found in token"
  }
  ```

### Example Usage Flow

#### Step 1: Add First Tag

```bash
curl -X POST http://localhost:3010/api/user-tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tag_label": "Kinky",
    "tag_description": "Open to adventurous and unconventional experiences",
    "tag_type": "profile"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Tag added to user profile successfully.",
  "data": {
    "message": "Tag added to user profile successfully.",
    "tag": {
      "id": 1,
      "label": "Kinky",
      "description": "Open to adventurous and unconventional experiences",
      "tag_type": "profile"
    }
  }
}
```

#### Step 2: Add Another Tag

```bash
curl -X POST http://localhost:3010/api/user-tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tag_label": "Romantic",
    "tag_description": "Provides intimate and romantic experiences",
    "tag_type": "content"
  }'
```

#### Step 3: Get All User Tags

```bash
curl -X GET http://localhost:3010/api/user-tags \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "User tags fetched successfully.",
  "data": {
    "message": "User tags fetched successfully.",
    "tags": [
      {
        "id": 2,
        "label": "Romantic",
        "description": "Provides intimate and romantic experiences",
        "tag_type": "profile",
        "addedAt": "2024-01-02T00:00:00.000Z"
      },
      {
        "id": 1,
        "label": "Kinky",
        "description": "Open to adventurous and unconventional experiences",
        "tag_type": "profile",
        "addedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Step 4: Remove a Tag

```bash
curl -X DELETE http://localhost:3010/api/user-tags/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Tag removed from user profile successfully.",
  "data": {
    "message": "Tag removed from user profile successfully."
  }
}
```

**Notes:**

- All endpoints require authentication via JWT token
- When adding a tag, if the tag doesn't exist in the tags table, it will be automatically created
- Tags can only be removed from the user's profile (user_tags table), never from the tags table itself
- Users cannot add the same tag twice to their profile
- Tag labels are case-sensitive and must be unique
- Tags are returned in descending order by creation date (newest first)
- **Tag Types:** Tags have a `tag_type` field that can be either `"profile"` (default) or `"content"`. When creating a new tag, if `tag_type` is not provided, it defaults to `"profile"`. You can filter tags by type using the `tag_type` query parameter in the Get All Tags endpoint.

---

## 15. Gallery - Upload Images

### 15.1. Upload Gallery Images - Upload Multiple Images to S3

**Endpoint:** `POST /api/gallery/upload`

**Description:** Uploads multiple images to AWS S3 immediately and returns their URLs. Images are uploaded in parallel for better performance. The URLs are returned in the same order as uploaded. Supports both gallery images and profile photos.

### cURL Command - Upload Gallery Images (Public)

```bash
curl -X POST http://localhost:3010/api/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg" \
  -F "type=gallery" \
  -F "access_type=public"
```

### cURL Command - Upload Gallery Images (Private)

```bash
curl -X POST http://localhost:3010/api/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "type=gallery" \
  -F "access_type=private"
```

### cURL Command - Upload Profile Photo

```bash
curl -X POST http://localhost:3010/api/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/profile-photo.jpg" \
  -F "type=profile"
```

### Request Parameters

| Parameter     | Type   | Required | Description                    | Constraints                                                                    |
| ------------- | ------ | -------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `images`      | File[] | Yes      | Array of image files to upload | 1-20 files, max 10MB per file                                                  |
| `type`        | string | No       | Type of image upload           | `"gallery"` or `"profile"` (default: `"gallery"`)                              |
| `access_type` | string | No       | Access type for gallery images | `"public"` or `"private"` (default: `"public"`). Only used when `type=gallery` |

### File Constraints

- **File Types:** Only image files are allowed (JPEG, PNG, GIF, WebP, etc.)
- **File Size:** Maximum 10MB per file
- **File Count:** Maximum 20 files per request
- **MIME Types:** Must start with `image/`

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Images uploaded successfully.",
  "data": {
    "message": "Images uploaded successfully.",
    "images": [
      "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-0.jpg",
      "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-1.jpg",
      "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-2.jpg"
    ],
    "uploadDetails": [
      {
        "url": "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-0.jpg",
        "s3_key": "gallery/public/user_1-1234567890-abc123-0.jpg",
        "originalName": "image1.jpg"
      },
      {
        "url": "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-1.jpg",
        "s3_key": "gallery/public/user_1-1234567890-abc123-1.jpg",
        "originalName": "image2.jpg"
      },
      {
        "url": "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-2.jpg",
        "s3_key": "gallery/public/user_1-1234567890-abc123-2.jpg",
        "originalName": "image3.jpg"
      }
    ]
  }
}
```

### Success Response - Profile Photo Upload (200 OK)

```json
{
  "success": true,
  "message": "Images uploaded successfully.",
  "data": {
    "message": "Images uploaded successfully.",
    "images": [
      "https://bucket.s3.region.amazonaws.com/profile/user_1-1234567890-abc123-0.jpg"
    ],
    "uploadDetails": [
      {
        "url": "https://bucket.s3.region.amazonaws.com/profile/user_1-1234567890-abc123-0.jpg",
        "s3_key": "profile/user_1-1234567890-abc123-0.jpg",
        "originalName": "profile-photo.jpg"
      }
    ]
  }
}
```

### Error Responses

**No Images Provided (400 Bad Request):**

```json
{
  "success": false,
  "message": "No images provided.",
  "error": "No images provided."
}
```

**Too Many Images (400 Bad Request):**

```json
{
  "success": false,
  "message": "Too many images. Maximum 20 images allowed.",
  "error": "Too many images. Maximum 20 images allowed."
}
```

**Invalid Image File (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid image file. Only image files are allowed.",
  "error": "Invalid image file. Only image files are allowed."
}
```

**Image File Too Large (400 Bad Request):**

```json
{
  "success": false,
  "message": "Media file is too large. Maximum size is of Image is 10MB and Video is 100MB.",
  "error": "Media file is too large. Maximum size is of Image is 10MB and Video is 100MB."
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Failed to upload images",
  "error": "User ID not found in token"
}
```

### Notes

- Images are uploaded to S3 immediately upon request
- URLs are returned in the same order as uploaded files
- **Folder Structure:**
  - `type=profile` → Images stored in `profile/` folder
  - `type=gallery` with `access_type=public` → Images stored in `gallery/public/` folder
  - `type=gallery` with `access_type=private` → Images stored in `gallery/private/` folder
- Each file gets a unique filename: `{user_id}-{timestamp}-{random}-{index}.{extension}`
- Uploaded images are not saved to the database until the profile is updated with these URLs
- For profile photos: Upload with `type=profile`, then use the returned URL in the `profile_photo` field when updating the profile

### Usage Examples

#### Example 1: Upload Profile Photo

```bash
curl -X POST http://localhost:3010/api/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/profile-photo.jpg" \
  -F "type=profile"
```

**Response:**

```json
{
  "success": true,
  "message": "Images uploaded successfully.",
  "data": {
    "images": [
      "https://bucket.s3.region.amazonaws.com/profile/user_1-1234567890-abc123-0.jpg"
    ]
  }
}
```

**Then update profile:**

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "profile_photo": "https://bucket.s3.region.amazonaws.com/profile/user_1-1234567890-abc123-0.jpg"
  }'
```

#### Example 2: Upload Public Gallery Images

```bash
curl -X POST http://localhost:3010/api/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "type=gallery" \
  -F "access_type=public"
```

#### Example 3: Upload Private Gallery Images

```bash
curl -X POST http://localhost:3010/api/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/private-image.jpg" \
  -F "type=gallery" \
  -F "access_type=private"
```

---

## 16. Profile - Get and Update User Profile

### 16.1. Get User Profile - Fetch Complete User Profile

**Endpoint:** `GET /api/user`

**Description:** Fetches the complete user profile including user details, availability, tags, and gallery images.

### cURL Command

```bash
curl -X GET http://localhost:3010/api/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile fetched successfully.",
  "data": {
    "message": "Profile fetched successfully.",
    "user": {
      "id": 1,
      "name": "John Doe",
      "profile_name": "John",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "profile_photo": "https://bucket.s3.region.amazonaws.com/profile/user_1-photo.jpg",
      "profile_bio": "Experienced professional",
      "dob": "1990-01-15",
      "age": 34,
      "city": "London",
      "country": "United Kingdom",
      "extra": "Additional information",
      "note": "Personal notes",
      "timezone": "Europe/London",
      "live_status": "Available",
      "role": "Client",
      "status": "Approved",
      "is_verified": true,
      "unlock_price": null,
      "platform_url": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    },
    "availability": [
      {
        "id": 1,
        "user_id": 1,
        "days_of_week": "monday",
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "days_of_week": "tuesday",
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "tags": [
      {
        "user_id": 1,
        "tag_id": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "tag": {
          "id": 1,
          "label": "Romantic",
          "description": "Provides intimate and romantic experiences"
        }
      }
    ],
    "gallery": [
      {
        "id": 1,
        "user_id": 1,
        "image_url": "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-image1.jpg",
        "access_type": "public",
        "caption": "Profile photo",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "image_url": "https://bucket.s3.region.amazonaws.com/gallery/private/user_1-image2.jpg",
        "access_type": "private",
        "caption": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Error Responses

**Unauthorized (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Failed to fetch profile",
  "error": "User ID not found in token"
}
```

**User Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "User not found.",
  "error": "User not found."
}
```

---

### 16.2. Update User Profile - Update Profile with Partial Updates

**Endpoint:** `PUT /api/user`

**Description:** Updates user profile with support for partial updates. You can update user fields, availability, tags, and gallery separately or together. All fields are optional, allowing you to update only the sections you need.

**Client Preferences Integration:**
- **Client Role Only:** If the user has the "Client" role and the request body contains a `client_preferences` object, the client preferences will be automatically saved/updated in the client preferences table. This allows clients to update both their profile and preferences in a single API call.

**User Rates Integration:**
- **Escort Role Only:** If the user has the "Escort" role and the request body contains a `user_rates` array, the user rates will be automatically saved/updated in the user rates table. Each rate object with a matching `type` will be updated, and new rates will be created. Rates not included in the array will be deleted.

**Role-Based Field Restrictions:**
- **Creator Role Only:** The fields `unlock_price` and `platform_url` can only be updated by users with the "Creator" role. For all other roles (Admin, Client, Escort), these fields are automatically set to `null` when updating the profile, regardless of the values provided in the request.
- **Available Roles:** Admin, Creator, Client, Escort

### cURL Command - Update User Fields Only

**Note:** This example only updates fields in the user table. It does not update related data like availability, tags, gallery, client_preferences, or user_rates.

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe Updated",
    "profile_name": "John",
    "username": "johndoe_updated",
    "profile_bio": "Updated bio text with more information about the user",
    "dob": "1990-05-15",
    "age": 34,
    "city": "Manchester",
    "country": "United Kingdom",
    "extra": "Additional information about the user",
    "note": "Personal notes",
    "timezone": "Europe/London",
    "live_status": "Available",
    "profile_photo": "https://bucket.s3.region.amazonaws.com/profile/user_1-photo.jpg"
  }'
```

**Success Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "message": "Profile updated successfully.",
    "user": {
      "id": 1,
      "name": "John Doe Updated",
      "profile_name": "John",
      "username": "johndoe_updated",
      "email": "john.doe@example.com",
      "profile_photo": "https://bucket.s3.region.amazonaws.com/profile/user_1-photo.jpg",
      "profile_bio": "Updated bio text with more information about the user",
      "dob": "1990-05-15",
      "age": 34,
      "city": "Manchester",
      "country": "United Kingdom",
      "extra": "Additional information about the user",
      "note": "Personal notes",
      "timezone": "Europe/London",
      "live_status": "Available",
      "role": "Client",
      "status": "Approved",
      "is_verified": true,
      "unlock_price": null,
      "platform_url": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    },
    "availability": [],
    "tags": [],
    "gallery": {
      "public": [],
      "private": []
    },
    "user_rates": [],
    "client_preferences": null
  }
}
```

**Note:** This payload only updates fields directly in the `users` table. Related data (availability, tags, gallery, client_preferences, user_rates) remains unchanged.

### cURL Command - Update Availability Only

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "availability": [
      {
        "days_of_week": "monday",
        "start_time": "09:00",
        "end_time": "17:00"
      },
      {
        "days_of_week": "tuesday",
        "start_time": "10:00",
        "end_time": "18:00"
      }
    ]
  }'
```

### cURL Command - Update Tags Only

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tags": [
      { "tag_id": 1 },
      { "tag_id": 2 },
      { "tag_label": "New Tag", "tag_type": "profile" },
      { "tag_label": "Content Tag", "tag_type": "content" }
    ]
  }'
```

### cURL Command - Update Gallery Only

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "gallery": {
      "public": [
        "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-image1.jpg",
        "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-image2.jpg"
      ],
      "private": [
        "https://bucket.s3.region.amazonaws.com/gallery/private/user_1-image3.jpg"
      ],
      "captions": {
        "public": ["Public image 1", "Public image 2"],
        "private": ["Private image 1"]
      }
    }
  }'
```

### cURL Command - Update Multiple Sections

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "profile_bio": "Updated bio",
    "availability": [
      {
        "days_of_week": "monday",
        "start_time": "09:00",
        "end_time": "17:00"
      }
    ],
    "tags": [
      { "tag_id": 1 },
      { "tag_label": "New Content Tag", "tag_type": "content" }
    ],
    "gallery": {
      "public": ["https://bucket.s3.region.amazonaws.com/gallery/public/user_1-image1.jpg"],
      "private": []
    }
  }'
```

### cURL Command - Update Client Preferences (Client Role Only)

**Note:** This example is only applicable for users with the "Client" role. When a client includes `client_preferences` in the update request, the preferences will be automatically saved/updated in the client preferences table.

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "profile_bio": "Updated profile bio",
    "client_preferences": {
      "city": "London",
      "preferences": ["GFE", "Sophisticated", "Luxury"],
      "bio": "Looking for sophisticated experiences",
      "tags": ["luxury", "discrete", "professional"]
    }
  }'
```

**Success Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "message": "Profile updated successfully.",
    "user": {
      "id": 1,
      "name": "John Doe",
      "profile_name": "Client",
      "username": "client123",
      "email": "client@example.com",
      "profile_photo": "https://bucket.s3.region.amazonaws.com/profile/user_1-photo.jpg",
      "profile_bio": "Updated profile bio",
      "dob": "1990-01-15",
      "age": 34,
      "city": "London",
      "country": "United Kingdom",
      "extra": null,
      "note": null,
      "timezone": "Europe/London",
      "live_status": "Available",
      "role": "Client",
      "status": "Approved",
      "is_verified": true,
      "unlock_price": null,
      "platform_url": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    },
    "availability": [],
    "tags": [],
    "gallery": {
      "public": [],
      "private": []
    }
  }
}
```

**Note:** The client preferences are saved/updated automatically when the user role is "Client" and `client_preferences` is included in the request. The preferences are not returned in the response, but you can retrieve them using the `GET /api/client-preferences` endpoint.

### cURL Command - Update User Rates (Escort Role Only)

**Note:** This example is only applicable for users with the "Escort" role. When an escort includes `user_rates` in the update request, the rates will be automatically saved/updated in the user rates table. If a rate with the same `type` already exists, it will be updated with the new `duration` and `price`. If a rate with that `type` doesn't exist, a new rate will be created. Rates not included in the array will be deleted.

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Jane Doe",
    "profile_bio": "Professional escort",
    "user_rates": [
      {
        "type": "hourly",
        "duration": "1 hour",
        "price": 200.00
      },
      {
        "type": "overnight",
        "duration": "12 hours",
        "price": 1500.00
      },
      {
        "type": "weekly",
        "duration": "7 days",
        "price": 8000.00
      }
    ]
  }'
```

**Success Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "message": "Profile updated successfully.",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "profile_name": "Escort",
      "username": "escort123",
      "email": "escort@example.com",
      "profile_photo": "https://bucket.s3.region.amazonaws.com/profile/user_1-photo.jpg",
      "profile_bio": "Professional escort",
      "dob": "1990-01-15",
      "age": 34,
      "city": "London",
      "country": "United Kingdom",
      "extra": null,
      "note": null,
      "timezone": "Europe/London",
      "live_status": "Available",
      "role": "Escort",
      "status": "Approved",
      "is_verified": true,
      "unlock_price": null,
      "platform_url": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    },
    "availability": [],
    "tags": [],
    "gallery": {
      "public": [],
      "private": []
    },
    "user_rates": [
      {
        "id": 1,
        "user_id": 1,
        "type": "hourly",
        "duration": "1 hour",
        "price": "200.00",
        "createdAt": "2024-01-15T12:30:00.000Z",
        "updatedAt": "2024-01-15T12:30:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "type": "overnight",
        "duration": "12 hours",
        "price": "1500.00",
        "createdAt": "2024-01-15T12:30:00.000Z",
        "updatedAt": "2024-01-15T12:30:00.000Z"
      },
      {
        "id": 3,
        "user_id": 1,
        "type": "weekly",
        "duration": "7 days",
        "price": "8000.00",
        "createdAt": "2024-01-15T12:30:00.000Z",
        "updatedAt": "2024-01-15T12:30:00.000Z"
      }
    ]
  }
}
```

**Note:** The user rates are saved/updated automatically when the user role is "Escort" and `user_rates` is included in the request. The rates are returned in the response. If a rate with the same `type` already exists, it will be updated; otherwise, a new rate will be created. Rates not included in the array will be deleted.

### cURL Command - Update Creator-Specific Fields (Creator Role Only)

**Note:** This example is only applicable for users with the "Creator" role. For other roles (Admin, Client, Escort), these fields will be automatically set to `null` even if provided.

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "unlock_price": 25.99,
    "platform_url": "https://example.com/creator-profile"
  }'
```

**Success Response for Creator:**

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "message": "Profile updated successfully.",
    "user": {
      "id": 1,
      "name": "Creator Name",
      "profile_name": "Creator",
      "username": "creator123",
      "email": "creator@example.com",
      "profile_photo": "https://bucket.s3.region.amazonaws.com/profile/user_1-photo.jpg",
      "profile_bio": "Professional creator",
      "dob": "1990-01-15",
      "age": 34,
      "city": "London",
      "country": "United Kingdom",
      "extra": null,
      "note": null,
      "timezone": "Europe/London",
      "live_status": "Available",
      "role": "Creator",
      "status": "Approved",
      "is_verified": true,
      "unlock_price": 25.99,
      "platform_url": "https://example.com/creator-profile",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    },
    "availability": [],
    "tags": [],
    "gallery": {
      "public": [],
      "private": []
    }
  }
}
```

**Note for Non-Creator Roles:** If a user with role "Admin", "Client", or "Escort" attempts to update `unlock_price` or `platform_url`, these fields will be automatically set to `null` in the database, regardless of the values provided in the request.

### Request Body Parameters

#### User Fields (All Optional)

| Parameter       | Type   | Required | Description                  | Constraints                                      |
| --------------- | ------ | -------- | ---------------------------- | ------------------------------------------------ |
| `name`          | string | No       | User's full name             | Max 255 characters                               |
| `profile_name`  | string | No       | User's display name          | Max 255 characters                               |
| `username`      | string | No       | User's username              | Max 255 characters, unique                       |
| `profile_bio`   | string | No       | User's biography/description | Text field                                       |
| `dob`           | string | No       | Date of birth                | Format: `YYYY-MM-DD`                             |
| `age`           | number | No       | User's age                   | Integer                                          |
| `city`          | string | No       | User's city                  | Max 255 characters                               |
| `country`       | string | No       | User's country               | Max 255 characters                               |
| `extra`         | string | No       | Additional information       | Text field                                       |
| `note`          | string | No       | Personal notes               | Text field                                       |
| `timezone`      | string | No       | User's timezone              | Max 255 characters                               |
| `live_status`   | string | No       | Live status                  | `"Not Available"`, `"Available"`, `"By Request"` |
| `profile_photo` | string | No       | Profile photo URL            | Valid URL                                        |
| `unlock_price`  | number | No       | Unlock price (Creator only) | Decimal (e.g., 10.50). Only updatable if role is "Creator". For other roles, this field is automatically set to null. |
| `platform_url`  | string | No       | Platform URL (Creator only) | Valid URL. Only updatable if role is "Creator". For other roles, this field is automatically set to null. |

#### Availability (Optional)

| Parameter      | Type  | Required | Description                   | Constraints                        |
| -------------- | ----- | -------- | ----------------------------- | ---------------------------------- |
| `availability` | array | No       | Array of availability objects | Replaces all existing availability |

**Availability Object:**

| Parameter      | Type   | Required | Description     | Constraints                                                                                |
| -------------- | ------ | -------- | --------------- | ------------------------------------------------------------------------------------------ |
| `days_of_week` | string | Yes      | Day of the week | `"monday"`, `"tuesday"`, `"wednesday"`, `"thursday"`, `"friday"`, `"saturday"`, `"sunday"` |
| `start_time`   | string | Yes      | Start time      | Format: `HH:MM` or `HH:MM:SS`                                                              |
| `end_time`     | string | Yes      | End time        | Format: `HH:MM` or `HH:MM:SS`                                                              |

#### Tags (Optional)

| Parameter | Type  | Required | Description          | Constraints                |
| --------- | ----- | -------- | -------------------- | -------------------------- |
| `tags`    | array | No       | Array of tag objects | Replaces all existing tags |

**Tag Object:**

| Parameter   | Type   | Required | Description                              | Constraints                                                      |
| ----------- | ------ | -------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `tag_id`    | number | No\*     | Existing tag ID                          | Must exist in tags table                                         |
| `tag_label` | string | No\*     | Tag label (creates tag if doesn't exist) | Max 255 characters                                               |
| `tag_type`  | string | No       | Type of the tag                          | `"profile"` or `"content"`. Default: `"profile"` if not provided |

\* Either `tag_id` or `tag_label` must be provided

#### Gallery (Optional)

| Parameter | Type   | Required | Description                                   | Constraints                   |
| --------- | ------ | -------- | --------------------------------------------- | ----------------------------- |
| `gallery` | object | No       | Gallery object with public and private arrays | Replaces all existing gallery |

**Gallery Object:**

| Parameter  | Type   | Required | Description                                | Constraints                  |
| ---------- | ------ | -------- | ------------------------------------------ | ---------------------------- |
| `public`   | array  | No       | Array of public image URLs                 | URLs from upload API         |
| `private`  | array  | No       | Array of private image URLs                | URLs from upload API         |
| `captions` | object | No       | Captions object with public/private arrays | Optional captions for images |

**Captions Object:**

| Parameter | Type  | Required | Description                          | Constraints                       |
| --------- | ----- | -------- | ------------------------------------ | --------------------------------- |
| `public`  | array | No       | Array of captions for public images  | One caption per public image URL  |
| `private` | array | No       | Array of captions for private images | One caption per private image URL |

#### Client Preferences (Optional - Client Role Only)

| Parameter           | Type   | Required | Description                                                                 | Constraints                                                                                                                                    |
| ------------------- | ------ | -------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `client_preferences` | object | No       | Client preferences object (only processed if user role is "Client")         | Only applicable for users with "Client" role                                                                                                   |

**Client Preferences Object:**

| Parameter     | Type     | Required | Description                      | Valid Values                                                                                                                                     |
| ------------- | -------- | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `city`        | string   | No       | City where user is browsing from | Max 100 characters (optional, nullable)                                                                                                           |
| `preferences` | string[] | No       | Array of vibe preferences        | Maximum 7 values from: `"GFE"`, `"Sophisticated"`, `"Wild nights"`, `"Chilled"`, `"Luxury"`, `"Incall"`, `"Outcall"` (optional, nullable)        |
| `bio`         | string   | No       | User bio/description             | Max 1000 characters (optional, nullable)                                                                                                         |
| `tags`        | string[] | No       | Array of tags                     | Maximum 20 tags, each tag max 50 characters (optional, nullable)                                                                                |

**Note:** When `client_preferences` is included in the request and the user has the "Client" role, the preferences will be automatically saved/updated in the client preferences table. The preferences are not returned in the response, but can be retrieved using the `GET /api/client-preferences` endpoint.

#### User Rates (Optional - Escort Role Only)

| Parameter   | Type  | Required | Description                                                                 | Constraints                                                                    |
| ----------- | ----- | -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `user_rates` | array | No       | Array of rate objects (only processed if user role is "Escort")             | Only applicable for users with "Escort" role                                   |

**User Rate Object:**

| Parameter  | Type   | Required | Description                          | Constraints                                    |
| ---------- | ------ | -------- | ------------------------------------ | ---------------------------------------------- |
| `type`     | string | Yes      | Type of rate (e.g., "hourly", "daily") | Must be unique per user (if type exists, it will be updated) |
| `duration` | string | Yes      | Duration description                  | Text description (e.g., "1 hour", "12 hours") |
| `price`    | number | Yes      | Price for this rate type             | Must be a non-negative number                 |

**Note:** When `user_rates` is included in the request and the user has the "Escort" role, the rates will be automatically saved/updated in the user rates table. If a rate with the same `type` already exists, it will be updated with the new `duration` and `price`. If a rate with that `type` doesn't exist, a new rate will be created. Rates not included in the array will be deleted. The rates are returned in the response.

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "message": "Profile updated successfully.",
    "user": {
      "id": 1,
      "name": "John Doe Updated",
      "profile_name": "John",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "profile_photo": "https://bucket.s3.region.amazonaws.com/profile/user_1-photo.jpg",
      "profile_bio": "Updated bio text",
      "dob": "1990-01-15",
      "age": 34,
      "city": "Manchester",
      "country": "United Kingdom",
      "extra": "Additional information",
      "note": "Personal notes",
      "timezone": "Europe/London",
      "live_status": "Available",
      "role": "Client",
      "status": "Approved",
      "is_verified": true,
      "unlock_price": null,
      "platform_url": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    },
    "availability": [
      {
        "id": 1,
        "user_id": 1,
        "days_of_week": "monday",
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "createdAt": "2024-01-15T12:30:00.000Z",
        "updatedAt": "2024-01-15T12:30:00.000Z"
      }
    ],
    "tags": [
      {
        "user_id": 1,
        "tag_id": 1,
        "createdAt": "2024-01-15T12:30:00.000Z",
        "updatedAt": "2024-01-15T12:30:00.000Z",
        "tag": {
          "id": 1,
          "label": "Romantic",
          "description": "Provides intimate and romantic experiences",
          "tag_type": "profile"
        }
      }
    ],
    "gallery": {
      "public": [
        {
          "id": 1,
          "image_url": "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-image1.jpg",
          "access_type": "public",
          "caption": "Public image 1",
          "createdAt": "2024-01-15T12:30:00.000Z",
          "updatedAt": "2024-01-15T12:30:00.000Z"
        }
      ],
      "private": []
    },
    "user_rates": [],
    "client_preferences": null
  }
}
```

**Note:** The response includes:
- `user_rates`: Array of rate objects (only populated for Escort users, empty array for others)
- `client_preferences`: Client preferences object (only populated for Client users, null for others)

### Error Responses

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid time format. Use HH:MM or HH:MM:SS",
  "error": "Invalid time format. Use HH:MM or HH:MM:SS"
}
```

**User Not Found (400 Bad Request):**

```json
{
  "success": false,
  "message": "User not found.",
  "error": "User not found."
}
```

**Tag Not Found (400 Bad Request):**

```json
{
  "success": false,
  "message": "Tag with ID 999 not found",
  "error": "Tag with ID 999 not found"
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Failed to update profile",
  "error": "User ID not found in token"
}
```

### Important Notes

#### Partial Updates

- **All fields are optional** - You can update only the sections you need
- **If a section is not provided** - It remains unchanged
- **If a section is provided** - It replaces the entire section (e.g., providing `availability` replaces all existing availability records)

#### Gallery Update Behavior

- **Smart Sync:** The API compares existing gallery URLs with new URLs
- **Automatic Cleanup:** Images not in the new array are automatically deleted from S3 and database
- **Order Preservation:** URLs are saved in the same order as provided
- **Separate Public/Private:** Public and private images are managed separately
- **Empty Arrays:** Providing empty arrays (`[]`) will delete all images of that type

#### Availability Update Behavior

- **Replacement:** Providing `availability` array replaces ALL existing availability records
- **Empty Array:** Providing empty array (`[]`) deletes all availability records
- **Validation:** All time entries are validated before saving

#### Tags Update Behavior

- **Replacement:** Providing `tags` array replaces ALL existing tags
- **Empty Array:** Providing empty array (`[]`) removes all tags
- **Auto-Create:** If `tag_label` is provided and tag doesn't exist, it's automatically created

### Complete Flow Example

#### Step 1: Upload Profile Photo

```bash
curl -X POST http://localhost:3010/api/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/profile-photo.jpg" \
  -F "type=profile"
```

**Response:**

```json
{
  "success": true,
  "message": "Images uploaded successfully.",
  "data": {
    "images": [
      "https://bucket.s3.region.amazonaws.com/profile/user_1-1234567890-abc123-0.jpg"
    ]
  }
}
```

#### Step 2: Upload Gallery Images

```bash
curl -X POST http://localhost:3010/api/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "type=gallery" \
  -F "access_type=public"
```

**Response:**

```json
{
  "success": true,
  "message": "Images uploaded successfully.",
  "data": {
    "images": [
      "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-1.jpg",
      "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-2.jpg"
    ]
  }
}
```

#### Step 3: Update Profile with Uploaded Images

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "profile_bio": "Updated profile",
    "profile_photo": "https://bucket.s3.region.amazonaws.com/profile/user_1-1234567890-abc123-0.jpg",
    "gallery": {
      "public": [
        "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-1.jpg",
        "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-2.jpg"
      ],
      "captions": {
        "public": ["First image", "Second image"]
      }
    }
  }'
```

#### Step 4: Remove an Image (Update Gallery)

```bash
curl -X PUT http://localhost:3010/api/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "gallery": {
      "public": [
        "https://bucket.s3.region.amazonaws.com/gallery/public/user_1-1234567890-abc123-1.jpg"
      ]
    }
  }'
```

**Note:** The second image will be automatically deleted from S3 and database.

---

## Notes
