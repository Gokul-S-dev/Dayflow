# Dayflow HRMS Backend

This is the Node.js / Express.js backend for **Dayflow — Human Resource Management System (HRMS)**. It manages core resources, handles authentication, provisions employee accounts, manages registrations, and supports local company registration with custom logo uploads.

## Technologies Used
- **Node.js** & **Express.js** (v5.2+)
- **MongoDB** & **Mongoose** (v9.9+)
- **JWT (JsonWebToken)** Authentication
- **Bcrypt.js** (Password Hashing)
- **Dotenv** (Environment Configuration)
- **Multer** (Multipart File Parsing & Storage)
- **Express Rate Limit** (Security Rate Limiting)
- ES Modules (`import`/`export` syntax)

---

## 1. Project Architecture

The codebase follows a clean layered MVC architecture:

```text
app.js (Config)
  ↓
src/routes/ (Routes Mapping)
  ↓
src/validators/ (Input Validation)
  ↓
src/controller/ (Request Handlers)
  ↓
src/services/ (Business Logic & Transactions)
  ↓
src/repositories/ (Database Operations / Queries)
  ↓
src/models/ (Schemas / Mongoose Models)
```

---

## 2. Environment Variables Configuration

Create a `.env` file in the root directory. You can use the values in `.env.example` as a template:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/odoo_hackathon
CORS_ORIGIN=http://localhost:5173

JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 3. Local Media Storage Structure

All uploaded media is stored locally in the filesystem. In git, the directory structures are preserved via `.gitkeep` files, while the actual uploaded images are ignored.

```text
backend/
└── media/
    ├── companies/
    │   └── {companyId}/
    │       └── logo/
    │           └── {unique-logo-filename}.png
    └── temp/ (Used for transient file parsing)
```

---

## 4. Getting Started

### Installation
Install all package dependencies:
```bash
npm install
```

### Running Locally
To start the backend in development mode with automatic reload (using `nodemon`):
```bash
npm run dev
```

The server will start listening on the configured port (default `5000`).

---

## 5. API Testing and Verification

### Integration Tests
We have implemented a comprehensive integration test suite verifying authentication, signup flows, token refresh, company registration with logo uploads, security constraints, and static assets fetching. To run the automated test suite locally:
```bash
node test_endpoints.js
```

### REST Client HTTP Requests
You can also test the endpoints manually or interactively using the [`api_tests.http`](file:///d:/downloads/Dayflow%20-%20Human%20Resource%20Management%20System/backend/api_tests.http) file. Open this file in VS Code and use the **REST Client** extension to send requests and save variables dynamically.

---

## 6. API Reference Summary Table

| Method | Endpoint | Auth | Role | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/signup-company` | No | Public | Register new company & HR admin user |
| **POST** | `/api/v1/auth/signup` | No | Public | Employee activates provisioned account |
| **GET** | `/api/v1/auth/verify-email` | No | Public | Verify email verification token |
| **POST** | `/api/v1/auth/login` | No | Public | Login with Employee ID or Email |
| **POST** | `/api/v1/auth/change-password` | Yes | All | Change password (resets temporary flag) |
| **POST** | `/api/v1/auth/refresh` | No | Public | Refresh expired access tokens |
| **POST** | `/api/v1/auth/logout` | Yes | All | Terminate sessions |
| **POST** | `/api/v1/employees` | Yes | Admin, HR | Create employee and auto-generate credentials |
| **GET** | `/api/v1/employees` | Yes | Admin, HR | Retrieve all employees |
| **GET** | `/api/v1/employees/:id` | Yes | Role-based | Retrieve specific employee details |
| **PATCH** | `/api/v1/employees/:id` | Yes | Role-based | Update employee details (filtered by role constraints) |
| **GET** | `/api/v1/dashboard/employee` | Yes | All | Retrieve personal dashboard metrics |
| **GET** | `/api/v1/dashboard/admin` | Yes | Admin, HR | Retrieve company-wide admin dashboard |

---

## 7. Detailed API Endpoint Documentation

### Authentication & SignUp/SignIn

---

#### POST /api/v1/auth/signup-company

- **Authentication**: None (Public)
- **Content-Type**: `multipart/form-data`
- **Description**: Creates a new company record, processes logo upload, and registers the initial HR/Admin user account.
- **Multipart Fields**:
  - `companyName` (String, Required) - Unique name of the company.
  - `firstName` (String, Required) - User's first name.
  - `lastName` (String, Required) - User's last name.
  - `email` (String, Required) - User's email address.
  - `phone` (String, Optional) - User's phone number.
  - `password` (String, Required) - User's password (must follow security rules).
  - `confirmPassword` (String, Required) - User's password confirmation.
  - `role` (String, Optional, default `HR`) - Must be `HR` or `ADMIN`.
  - `logo` (File, Required) - Logo image file.
- **Password Strength Rules**:
  - Minimum 8 characters.
  - At least 1 uppercase letter.
  - At least 1 lowercase letter.
  - At least 1 number.
  - At least 1 special character.
- **Success Response**:
  - **Status Code**: `201 Created`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "Company and HR account created successfully. Please verify your email.",
      "data": {
        "user": {
          "id": "66c123abc438f29e1d2cbb54",
          "employeeId": "OIHRUS20260001",
          "companyName": "Odoo India Signup Test",
          "firstName": "Hr",
          "lastName": "User",
          "email": "hr@signup.com",
          "role": "HR"
        },
        "verificationToken": "e7c2f82..."
      }
    }
    ```

---

#### POST /api/v1/auth/signup

- **Authentication**: None (Public)
- **Description**: Registers and activates an employee profile previously provisioned by an HR officer or Admin.
- **Request Body**:
  ```json
  {
    "employeeId": "OIJODO20260001",
    "email": "john.doe@example.com",
    "password": "EmpPassword123!",
    "role": "EMPLOYEE"
  }
  ```
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "Signup successful. Please verify your email.",
      "data": {
        "user": {
          "id": "603d29f8c07e4d22dcaa101b",
          "employeeId": "OIJODO20260001",
          "email": "john.doe@example.com",
          "role": "EMPLOYEE"
        },
        "verificationToken": "3a7fb6d..."
      }
    }
    ```

---

#### GET /api/v1/auth/verify-email

- **Authentication**: None (Public)
- **Description**: Verifies an employee's email address using the token generated during registration.
- **Query Parameters**:
  - `token` (String, Required) - The email verification token.
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "Email verified successfully. You can now log in.",
      "data": {
        "id": "603d29f8c07e4d22dcaa101b",
        "employeeId": "OIJODO20260001",
        "email": "john.doe@example.com",
        "emailVerified": true
      }
    }
    ```
- **Error Response**:
  - **Status Code**: `400 Bad Request` (Invalid or expired token)
    ```json
    {
      "success": false,
      "message": "Invalid or expired verification token"
    }
    ```

---

#### POST /api/v1/auth/login

- **Authentication**: None (Public)
- **Description**: Log in with credentials. Email verification check is enforced.
- **Request Body**:
  ```json
  {
    "login": "john.doe@example.com",
    "password": "EmpPassword123!"
  }
  ```
- **Error Response (Unverified Email)**:
  - **Status Code**: `403 Forbidden`
  - **Body**:
    ```json
    {
      "success": false,
      "message": "Please verify your email address before logging in."
    }
    ```

---

#### POST /api/v1/auth/change-password

- **Authentication**: Required (JWT Bearer Token)
- **Description**: Changes the password for the logged-in user. Rules for password strength are strictly applied.
- **Request Body**:
  ```json
  {
    "currentPassword": "EmpPassword123!",
    "newPassword": "NewSecurePassword123!",
    "confirmPassword": "NewSecurePassword123!"
  }
  ```

---

#### POST /api/v1/auth/refresh
- **Authentication**: None (Public)
- **Description**: Refresh expired access token.

---

#### POST /api/v1/auth/logout
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Invalidate session.

---

### Employees Management

---

#### POST /api/v1/employees
- **Authentication**: Required (JWT Bearer Token)
- **Role Permissions**: `ADMIN` or `HR`
- **Description**: Provisions a new employee record. The employee will then register/activate their account via `POST /auth/signup`.

---

#### GET /api/v1/employees
- **Authentication**: Required (JWT Bearer Token)
- **Role Permissions**: `ADMIN` or `HR`

---

#### GET /api/v1/employees/:id
- **Authentication**: Required (JWT Bearer Token)
- **Role Permissions**: `ADMIN`, `HR`, or the target `EMPLOYEE` themselves.

---

#### PATCH /api/v1/employees/:id
- **Authentication**: Required (JWT Bearer Token)
- **Role Permissions**: `ADMIN`, `HR`, or the target `EMPLOYEE` themselves.
- **Description**: Update profile details.

---

### Dashboard APIs

---

#### GET /api/v1/dashboard/employee

- **Authentication**: Required (JWT Bearer Token)
- **Role Permissions**: Any authenticated user
- **Description**: Compiles personal employee metrics: profile details, current daily attendance status, leaves count summary, and a combined feed of the 5 most recent activities (clock-ins/outs, leave submissions/approvals).
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "Employee dashboard data retrieved successfully",
      "data": {
        "profile": {
          "id": "OIJODO20260002",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "phone": "9876543210",
          "role": "EMPLOYEE",
          "avatar": null,
          "company": "Odoo India Signup Test",
          "joiningDate": "2026-08-22T00:00:00.000Z"
        },
        "attendance": {
          "status": "CHECKED_IN",
          "checkInTime": "2026-08-22T09:12:00.000Z",
          "checkOutTime": null
        },
        "leave": {
          "pending": 1,
          "approved": 1,
          "rejected": 0
        },
        "recentActivity": [
          {
            "type": "ATTENDANCE",
            "message": "Checked in",
            "date": "2026-08-22T09:12:00.000Z"
          }
        ],
        "alerts": []
      }
    }
    ```

---

#### GET /api/v1/dashboard/admin

- **Authentication**: Required (JWT Bearer Token)
- **Role Permissions**: `ADMIN` or `HR` only
- **Description**: Compiles company-wide employee metrics: summary counts (total, present today, absent today, on leave today, pending leaves), detailed employee lists with status flags, pending leaves list, and recent daily attendance. All calculations are dynamically segmented by `companyId`.
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "Admin dashboard data retrieved successfully",
      "data": {
        "summary": {
          "totalEmployees": 1,
          "presentToday": 1,
          "absentToday": 0,
          "onLeaveToday": 0,
          "pendingLeaveRequests": 1
        },
        "employees": [
          {
            "id": "6a8929ff5383a54c286d4e61",
            "employeeId": "OIJODO20260002",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "avatar": null,
            "attendanceStatus": "CHECKED_IN"
          }
        ],
        "pendingLeaves": [
          {
            "id": "6a892a005383a54c286d4e64",
            "employee": {
              "id": "6a8929ff5383a54c286d4e61",
              "name": "John Doe"
            },
            "leaveType": "SICK",
            "startDate": "2026-08-23T00:00:00.000Z",
            "endDate": "2026-08-23T00:00:00.000Z",
            "status": "PENDING"
          }
        ],
        "recentAttendance": [
          {
            "id": "6a892a005383a54c286d4e62",
            "employee": {
              "id": "6a8929ff5383a54c286d4e61",
              "name": "John Doe"
            },
            "checkInTime": "2026-08-22T09:12:00.000Z",
            "checkOutTime": null,
            "status": "CHECKED_IN"
          }
        ]
      }
    }
    ```
