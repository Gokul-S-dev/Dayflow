# Dayflow HRMS — Human Resource Management System

> **Every workday, perfectly aligned.**

A full-stack, production-ready HRMS built for the Odoo India Hackathon. Dayflow streamlines company onboarding, employee provisioning, attendance tracking, leave management, payroll processing, and role-based access control — all from one unified platform.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Quick Start](#4-quick-start)
5. [Environment Variables](#5-environment-variables)
6. [Demo Login Credentials](#6-demo-login-credentials)
7. [Authentication Flow](#7-authentication-flow)
8. [Employee ID Format](#8-employee-id-format)
9. [Password Rules](#9-password-rules)
10. [Seeding the Database](#10-seeding-the-database)
11. [API Reference](#11-api-reference)
12. [Frontend Routes](#12-frontend-routes)
13. [Role-Based Access Control](#13-role-based-access-control)
14. [Features by Module](#14-features-by-module)
15. [File Upload & Media Storage](#15-file-upload--media-storage)
16. [Security Architecture](#16-security-architecture)
17. [Testing](#17-testing)
18. [Build & Deployment](#18-build--deployment)

---

## 1. Project Overview

Dayflow HRMS is a multi-tenant HR platform supporting:

- **Company Registration** — Admin/HR registers a company with logo upload
- **Employee Provisioning** — HR creates employee accounts; IDs and temp passwords auto-generated
- **Attendance Management** — Real-time check-in/check-out with history
- **Leave Management** — Submit, approve, reject leave requests
- **Payroll Processing** — Automated salary breakdown (Basic, HRA, PF, PT, Net)
- **Intelligence Dashboard** — Company-wide workforce analytics for Admin/HR
- **Role-Based Access** — ADMIN, HR, and EMPLOYEE permissions enforced on frontend and backend

---

## 2. Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express.js | 5.2+ | HTTP Framework |
| MongoDB | 6+ | Database |
| Mongoose | 9.9+ | ODM / Schema |
| JWT (jsonwebtoken) | 9.0+ | Authentication tokens |
| Bcrypt.js | 2.4+ | Password hashing |
| Multer | 1.4.5-lts | File uploads |
| Nodemailer | 9+ | Email verification |
| Helmet | 8+ | Security headers |
| express-rate-limit | 7+ | Rate limiting |
| Dotenv | 17+ | Environment config |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19+ | UI Framework |
| Vite | 8+ | Build tool / Dev server |
| React Router DOM | 7+ | Client-side routing |
| Zustand | 5+ | Global state (auth, UI) |
| React Hook Form | 7+ | Form state management |
| Zod | 3+ | Schema validation |
| TailwindCSS | 3+ | Utility-first styling |
| shadcn/ui | — | Component library (Card, Badge, Input, etc.) |
| Lucide React | — | Icon library |
| Sonner | — | Toast notifications |
| Recharts | — | Charts / Analytics |

---

## 3. Project Structure

```
Dayflow - Human Resource Management System/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment config (env.js)
│   │   ├── controller/      # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── employee.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── leave.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   └── company.controller.js
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── company.model.js
│   │   │   ├── attendance.model.js
│   │   │   ├── leave.model.js
│   │   │   └── counter.model.js
│   │   ├── repositories/    # Database query layer
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic layer
│   │   │   ├── auth.service.js
│   │   │   ├── employee.service.js
│   │   │   ├── attendance.service.js
│   │   │   ├── company.service.js
│   │   │   └── email.service.js
│   │   ├── utils/
│   │   │   └── idGenerator.js   # Employee ID generator
│   │   └── validators/      # Input validation middleware
│   ├── media/
│   │   ├── companies/{companyId}/logo/   # Company logo uploads
│   │   └── temp/                          # Transient file parsing
│   ├── app.js               # Express app config
│   ├── server.js            # HTTP server entry point
│   ├── seed.js              # Basic seed (2 users)
│   ├── seed_test_data.js    # Full seed (7 users + attendance + leave)
│   ├── api_tests.http       # REST client test file
│   └── .env.example         # Environment variable template
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── router.jsx           # React Router configuration
│   │   ├── components/
│   │   │   ├── layout/              # AppShell, Sidebar, Header, PageContainer
│   │   │   └── ui/                  # shadcn/ui primitives
│   │   ├── constants/
│   │   │   ├── routes.js            # Centralized route paths
│   │   │   ├── endpoints.js         # API endpoint constants
│   │   │   ├── roles.js             # ROLES enum
│   │   │   └── navigation.js        # Sidebar nav items per role
│   │   ├── features/
│   │   │   ├── auth/pages/          # LoginPage, SignupPage, CompanySignupPage,
│   │   │   │                        # VerifyEmailPage, ChangePasswordPage
│   │   │   ├── employee/            # Employee dashboard, profile, attendance, leave, payroll
│   │   │   ├── admin/               # Admin dashboard, employees, attendance, leave, payroll
│   │   │   ├── intelligence/        # AI analytics page (Admin/HR)
│   │   │   └── public/              # Landing page
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx   # Auth guard + password-change gate
│   │   │   └── RoleRoute.jsx        # Role-based access guard
│   │   ├── services/
│   │   │   ├── api/apiClient.js     # Base HTTP client with JWT injection
│   │   │   └── backend/             # auth.service.js, attendance.service.js, etc.
│   │   ├── store/
│   │   │   ├── authStore.js         # Zustand auth state
│   │   │   └── uiStore.js           # UI state (mobile drawer, etc.)
│   │   └── utils/
│   │       └── attendanceCalculator.js  # Hours / overtime calculator
│   └── vite.config.js
│
└── Readme.md   ← this file
```

---

## 4. Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017 (or Atlas URI)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your values (see section 5)
```

### 3. Seed the Database

```bash
cd backend

# Option A: Basic seed (2 users — HR + Employee)
node seed.js

# Option B: Full seed (7 users + attendance + leave data) — RECOMMENDED for demo
node seed_test_data.js
```

### 4. Start the Backend

```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### 5. Start the Frontend

```bash
cd frontend
npm run dev
# App starts at http://localhost:5173
```

### 6. Open in Browser

```
http://localhost:5173
```

---

## 5. Environment Variables

Create `backend/.env` from the `.env.example` template:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/odoo_hackathon

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT Tokens
JWT_ACCESS_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (optional — for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

> **Note:** JWT secrets should be long, random strings (32+ chars) in production.

---

## 6. Demo Login Credentials

> All demo accounts use the same password: **`Password123!`**

### Full Seed (`node seed_test_data.js`) — 7 Accounts

| Role | Name | Email | Employee ID | Password |
|---|---|---|---|---|
| **ADMIN** | Admin User | `admin@odoo.com` | `OIADMI20260001` | `Password123!` |
| **HR** | Hr Manager | `hr@odoo.com` | `OIHRMA20260002` | `Password123!` |
| **HR** | Alexandra Vance | `alexandra@odoo.com` | `OIALVA20260005` | `Password123!` |
| **EMPLOYEE** | Employee User | `employee@odoo.com` | `OIEMUS20260001` | `Password123!` |
| **EMPLOYEE** | Eleanor Morgan | `eleanor@odoo.com` | `OIELMO20260002` | `Password123!` |
| **EMPLOYEE** | Marcus Chen | `marcus@odoo.com` | `OIMACH20260003` | `Password123!` |
| **EMPLOYEE** | Amina Larsson | `amina@odoo.com` | `OIAMLA20260004` | `Password123!` |

### Basic Seed (`node seed.js`) — 2 Accounts

| Role | Name | Email | Employee ID | Password |
|---|---|---|---|---|
| **HR** | Marcus Chen | `hr@odoo.com` | `OIHR0001` | `Password123!` |
| **EMPLOYEE** | Sarah Jenkins | `employee@odoo.com` | `OIEM0002` | `Password123!` |

### Login Field
The login field accepts **either** email address **or** Employee ID:
```
hr@odoo.com        ← works
OIHRMA20260002     ← also works
```

---

## 7. Authentication Flow

### Company Registration Flow
```
Company Admin/HR
      ↓
POST /api/v1/auth/signup-company
(multipart/form-data: company name, logo, name, email, phone, password, role)
      ↓
Backend creates:
  - Company record (with logo stored in /media/companies/)
  - Admin/HR user account (auto-generates Employee ID)
  - Sends email verification link
      ↓
GET /api/v1/auth/verify-email?token=...
      ↓
Email verified → account active
      ↓
POST /api/v1/auth/login
      ↓
Admin/HR Dashboard
```

### Employee Provisioning Flow
```
Admin/HR
      ↓
POST /api/v1/employees  (creates employee record)
      ↓
Backend auto-generates:
  - Employee Login ID (e.g., OIJODO20260001)
  - Temporary Password (returned once in API response)
      ↓
Admin shares credentials with employee
      ↓
Employee: POST /api/v1/auth/login
      ↓
Backend returns: requiresPasswordChange: true
      ↓
Frontend redirects to /change-password (forced — cannot skip)
      ↓
POST /api/v1/auth/change-password
      ↓
requiresPasswordChange = false → Employee Dashboard
```

### Standard Login Flow
```
POST /api/v1/auth/login
  { "login": "email_or_employee_id", "password": "..." }
      ↓
Backend validates:
  ✓ User exists
  ✓ Account is active
  ✓ Password matches (bcrypt)
  ✓ Email is verified
  ✓ Account status is APPROVED
      ↓
Returns: { accessToken, refreshToken, user, requiresPasswordChange }
      ↓
EMPLOYEE  → /employee (Employee Dashboard)
ADMIN/HR  → /admin/employees (Admin Dashboard)
requiresPasswordChange=true → /change-password (all roles)
```

### Token Refresh Flow
```
Access token expires (15 min)
      ↓
POST /api/v1/auth/refresh
  { "refreshToken": "..." }
      ↓
New access token returned (valid for 15 min)
Refresh token valid for 7 days
```

---

## 8. Employee ID Format

Employee IDs are auto-generated by the backend using this format:

```
{CompanyPrefix}{FirstName2Letters}{LastName2Letters}{JoiningYear}{4DigitSerial}
```

### Example
```
Company:  Odoo India    → Prefix: OI
Employee: John Doe      → JO + DO
Year:     2026          → 2026
Serial:   1st employee  → 0001

Result: OIJODO20260001
```

### More Examples

| Employee | Company | Joining Year | Serial | Generated ID |
|---|---|---|---|---|
| John Doe | Odoo India (OI) | 2026 | 1 | `OIJODO20260001` |
| Jane Smith | Odoo India (OI) | 2026 | 2 | `OIJASM20260002` |
| Admin User | Odoo India (OI) | 2026 | 1 | `OIADMI20260001` |
| Eleanor Morgan | Odoo India (OI) | 2026 | 2 | `OIELMO20260002` |

### Rules
- Names are uppercased automatically
- Short names (< 2 chars) are padded with `X`
- Serials are sequential **per company per year** (stored in MongoDB Counter)
- IDs are **never duplicated** (atomic MongoDB operation)
- **Only the backend generates IDs** — frontend never invents them

---

## 9. Password Rules

All passwords must meet:

| Rule | Requirement |
|---|---|
| Minimum length | 8 characters |
| Uppercase | At least 1 uppercase letter (A–Z) |
| Lowercase | At least 1 lowercase letter (a–z) |
| Number | At least 1 digit (0–9) |
| Special character | At least 1 special char (`!@#$%^&*` etc.) |

### Examples
| Password | Valid? | Reason |
|---|---|---|
| `password` | ❌ | No uppercase, number, or special char |
| `Password1` | ❌ | No special character |
| `Password123!` | ✅ | Meets all rules |
| `MyStr0ng@Pass` | ✅ | Meets all rules |

---

## 10. Seeding the Database

### Basic Seed
Creates a minimal dataset — 1 company, 1 HR user, 1 Employee, with sample attendance and leave records.

```bash
cd backend
node seed.js
```

Output credentials:
```
HR Account:
  Login: hr@odoo.com  or  OIHR0001
  Password: Password123!

Employee Account:
  Login: employee@odoo.com  or  OIEM0002
  Password: Password123!
```

### Full Test Seed
Creates a complete, realistic dataset with 1 Admin, 2 HR, 4 Employees, plus seeded attendance check-ins and pending leave requests for full demo coverage.

```bash
cd backend
node seed_test_data.js
```

> **Warning:** This script deletes existing seed users before re-creating them. It will NOT delete non-seed production data.

---

## 11. API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Header
All protected routes require:
```
Authorization: Bearer <accessToken>
```

---

### Auth Endpoints

#### `POST /auth/signup-company`
Register a new company + initial Admin/HR account.

- **Auth:** None (Public)
- **Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `companyName` | String | ✅ | Company name |
| `firstName` | String | ✅ | Admin first name |
| `lastName` | String | ✅ | Admin last name |
| `email` | String | ✅ | Admin email |
| `phone` | String | Optional | Phone number |
| `password` | String | ✅ | Must meet password rules |
| `confirmPassword` | String | ✅ | Must match password |
| `role` | String | Optional | `HR` or `ADMIN` (default: `HR`) |
| `logo` | File | Optional | PNG / JPG / WEBP image |

**Success `201`:**
```json
{
  "success": true,
  "message": "Company and HR account created successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "66c123abc438f29e1d2cbb54",
      "employeeId": "OIHRUS20260001",
      "companyName": "Odoo India",
      "firstName": "Hr",
      "lastName": "User",
      "email": "hr@signup.com",
      "role": "HR"
    }
  }
}
```

---

#### `POST /auth/signup`
Activate a pre-provisioned employee account.

- **Auth:** None (Public)

```json
{
  "employeeId": "OIJODO20260001",
  "email": "john.doe@example.com",
  "password": "EmpPassword123!",
  "role": "EMPLOYEE"
}
```

---

#### `GET /auth/verify-email?token=<token>`
Verify email using the token from the verification email.

- **Auth:** None (Public)

**Success `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in.",
  "data": {
    "email": "john.doe@example.com",
    "emailVerified": true
  }
}
```

**Error `400`:**
```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

---

#### `POST /auth/login`
Login with email or Employee ID + password.

- **Auth:** None (Public)

```json
{
  "login": "hr@odoo.com",
  "password": "Password123!"
}
```

**Success `200`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "...",
      "employeeId": "OIHRMA20260002",
      "firstName": "Hr",
      "lastName": "Manager",
      "email": "hr@odoo.com",
      "role": "HR"
    },
    "accessToken": "<JWT access token>",
    "refreshToken": "<JWT refresh token>",
    "requiresPasswordChange": false
  }
}
```

**Common Error Responses:**

| Status | Message | Cause |
|---|---|---|
| `401` | Invalid email/login ID or password | Wrong credentials |
| `403` | Please verify your email before signing in. | Email not verified |
| `403` | Your account has been deactivated. | isActive = false |
| `403` | Your account is awaiting HR approval. | accountStatus = PENDING |

---

#### `POST /auth/change-password`
Change password. Clears `isFirstLogin` flag.

- **Auth:** Required (Bearer token)

```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewSecure@Pass123",
  "confirmPassword": "NewSecure@Pass123"
}
```

**Success `200`:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "isFirstLogin": false
  }
}
```

---

#### `POST /auth/refresh`
Refresh expired access token.

- **Auth:** None (Public)

```json
{
  "refreshToken": "<refresh token>"
}
```

---

#### `POST /auth/logout`
Invalidate session.

- **Auth:** Required (Bearer token)

---

### Employee Endpoints

#### `POST /employees`
Create a new employee (auto-generates Employee ID and temporary password).

- **Auth:** Required
- **Roles:** ADMIN, HR

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "9876543210",
  "department": "Engineering",
  "designation": "Software Engineer",
  "joiningDate": "2026-08-22"
}
```

**Success `201`:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "employeeId": "OIJODO20260001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com"
    },
    "temporaryPassword": "xK7@mP2!nQ9r"
  }
}
```

> ⚠️ `temporaryPassword` is returned **only once** at creation. Store it securely and share with the employee.

---

#### `GET /employees`
Get all employees in the company.

- **Auth:** Required
- **Roles:** ADMIN, HR

---

#### `GET /employees/:id`
Get a specific employee profile.

- **Auth:** Required
- **Roles:** ADMIN, HR (any employee), EMPLOYEE (own profile only)

---

#### `PATCH /employees/:id`
Update employee details.

- **Auth:** Required
- **Roles:** ADMIN, HR (full update), EMPLOYEE (limited self-update)

---

### Dashboard Endpoints

#### `GET /dashboard/employee`
Personal employee metrics.

- **Auth:** Required
- **Roles:** All

Returns: profile, today's attendance status, leave summary counts, recent activity feed.

---

#### `GET /dashboard/admin`
Company-wide workforce metrics.

- **Auth:** Required
- **Roles:** ADMIN, HR only

Returns: summary counts (total employees, present today, absent today, on leave today, pending leaves), employee list with attendance status, pending leave requests, recent attendance records.

---

### Attendance Endpoints

#### `POST /attendance/checkin`
Clock in for the day.

- **Auth:** Required
- **Roles:** EMPLOYEE

#### `POST /attendance/checkout`
Clock out for the day.

- **Auth:** Required
- **Roles:** EMPLOYEE

#### `GET /attendance`
Get attendance history.

- **Auth:** Required

---

### Leave Endpoints

#### `POST /leaves`
Submit a new leave request.

- **Auth:** Required
- **Roles:** EMPLOYEE

#### `GET /leaves`
Get leave requests.

- **Auth:** Required

#### `PATCH /leaves/:id`
Approve or reject a leave request.

- **Auth:** Required
- **Roles:** ADMIN, HR

---

## 12. Frontend Routes

| Path | Component | Auth | Roles | Description |
|---|---|---|---|---|
| `/` | LandingPage | No | Public | Marketing landing page |
| `/login` | LoginPage | No | Public | Sign in |
| `/company-signup` | CompanySignupPage | No | Public | Register company + Admin/HR |
| `/signup` | SignupPage | No | Public | Employee account activation |
| `/verify-email` | VerifyEmailPage | No | Public | Email verification |
| `/change-password` | ChangePasswordPage | ✅ | All | Forced first-login password change |
| `/employee` | EmployeeDashboardPage | ✅ | EMPLOYEE, HR, ADMIN | Personal dashboard |
| `/employee/profile` | EmployeeProfilePage | ✅ | EMPLOYEE, HR, ADMIN | Profile view/edit |
| `/employee/attendance` | EmployeeAttendancePage | ✅ | EMPLOYEE, HR, ADMIN | Attendance history |
| `/employee/leave` | EmployeeLeavePage | ✅ | EMPLOYEE, HR, ADMIN | Leave requests |
| `/employee/payroll` | EmployeePayrollPage | ✅ | EMPLOYEE, HR, ADMIN | Salary breakdown |
| `/admin` | AdminDashboardPage | ✅ | ADMIN, HR | Company overview |
| `/admin/employees` | AdminEmployeesPage | ✅ | ADMIN, HR | Employee management |
| `/admin/employees/:id` | AdminEmployeeDetailsPage | ✅ | ADMIN, HR | Employee details |
| `/admin/attendance` | AdminAttendancePage | ✅ | ADMIN, HR | Company attendance |
| `/admin/leave` | AdminLeavePage | ✅ | ADMIN, HR | Leave approvals |
| `/admin/payroll` | AdminPayrollPage | ✅ | **ADMIN only** | Payroll processing |
| `/admin/intelligence` | AdminIntelligencePage | ✅ | ADMIN, HR | Analytics & insights |
| `/design-system` | DesignSystemShowcase | No | Dev only | Component showcase |

---

## 13. Role-Based Access Control

### Roles
| Role | Code | Description |
|---|---|---|
| Administrator | `ADMIN` | Full system access including payroll |
| HR Manager | `HR` | Employee management, leave approvals, attendance |
| Employee | `EMPLOYEE` | Own profile, attendance, leave, payroll |

### Permission Matrix

| Feature | ADMIN | HR | EMPLOYEE |
|---|---|---|---|
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ (limited) |
| View all employees | ✅ | ✅ | ❌ |
| Create employee | ✅ | ✅ | ❌ |
| Approve/reject leave | ✅ | ✅ | ❌ |
| View own leave | ✅ | ✅ | ✅ |
| Submit leave request | ✅ | ✅ | ✅ |
| View company attendance | ✅ | ✅ | ❌ |
| Check in/out | ✅ | ✅ | ✅ |
| Admin dashboard | ✅ | ✅ | ❌ |
| Payroll admin panel | ✅ | ❌ | ❌ |
| Intelligence analytics | ✅ | ✅ | ❌ |

### Frontend Guards
- **`ProtectedRoute`** — redirects unauthenticated users to `/login`; redirects users with `requiresPasswordChange=true` to `/change-password`
- **`RoleRoute`** — restricts routes by `allowedRoles` array; redirects unauthorized users

---

## 14. Features by Module

### Authentication
- Company registration with multipart logo upload
- JWT access + refresh token flow (15 min / 7 day)
- Email verification (token-based, 24hr expiry)
- Role-based post-login routing
- First-login forced password change
- Friendly error messages (no raw backend errors exposed)
- Password strength meter (Weak / Fair / Good / Strong)
- Eye toggle on all password fields

### Employee Management (Admin/HR)
- Create employee — auto-generates Employee ID + temporary password
- View/search/filter employee list
- View full employee profile
- Update employee details
- Manage employee status

### Attendance
- Daily check-in / check-out
- Attendance history with date filter
- Working hours calculation
- Overtime tracking
- Admin view of company-wide attendance

### Leave Management
- Submit leave request (type, date range, reason)
- View leave request status
- Admin/HR: approve or reject requests
- Leave balance summary

### Payroll
- Automatic salary breakdown:
  - Basic Pay (50% of monthly wage)
  - HRA (50% of Basic)
  - Standard Allowance (10% of wage)
  - Performance Bonus (10% of wage)
  - LTA (5% of wage)
  - PF Employee contribution (12% of Basic)
  - PF Employer contribution (12% of Basic)
  - Professional Tax (slab-based)
  - Net Salary
- Payable days calculation (attendance-adjusted)
- Download payslip

### Intelligence / Analytics (Admin/HR)
- Workforce overview
- Department distribution
- Attendance trends
- Leave utilization
- AI-powered workforce insights

---

## 15. File Upload & Media Storage

Company logos are stored locally on the backend filesystem:

```
backend/media/
├── companies/
│   └── {companyId}/
│       └── logo/
│           └── {unique-filename}.png
└── temp/
    └── (transient files during upload processing)
```

### Accepted Formats
- `image/png`
- `image/jpeg` / `image/jpg`
- `image/webp`

### Max File Size
- 5 MB (enforced in frontend + backend Multer config)

### Serving Static Files
Logo images are served via:
```
GET http://localhost:5000/media/companies/{companyId}/logo/{filename}
```

---

## 16. Security Architecture

| Concern | Implementation |
|---|---|
| Password storage | bcrypt with salt factor 10 |
| Authentication | JWT Bearer tokens (short-lived: 15 min) |
| Session persistence | Refresh tokens (7 days) |
| Rate limiting | express-rate-limit on auth endpoints |
| Security headers | Helmet.js (XSS, CSP, HSTS, etc.) |
| CORS | Configured to allow only `CORS_ORIGIN` |
| File uploads | Multer with file type + size validation |
| Role enforcement | Backend middleware on every protected route |
| Token rotation | Refresh endpoint issues new access tokens |
| Password change | Atomic reset of `isFirstLogin` flag in DB |
| No sensitive logs | Passwords and tokens never logged |

---

## 17. Testing

### Automated Integration Tests
```bash
cd backend
node test_endpoints.js
```
Tests: signup, login, token refresh, company registration with logo, employee creation, authentication errors, role-based access.

### REST Client (VS Code)
Open `backend/api_tests.http` with the VS Code **REST Client** extension to test all endpoints interactively.

### Manual Frontend Test Sequence
1. **`/company-signup`** → fill form + upload logo → Create Workspace
2. **Verify email** → click link in inbox → Email Verified
3. **`/login`** as Admin → lands on `/admin/employees`
4. **Create employee** → note the generated ID + temp password
5. **`/login`** as employee → forced to `/change-password`
6. **Change password** → lands on `/employee` dashboard
7. **Check in** from employee dashboard
8. **Submit leave request** from `/employee/leave`
9. **`/login`** as HR → approve leave from `/admin/leave`
10. **Logout** → session cleared

---

## 18. Build & Deployment

### Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# Runs at http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev
# Runs at http://localhost:5173
```

### Production Build

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

Build output: `0 errors`, ~1.2 MB JS bundle (348 KB gzipped).

### Vite Proxy Config
The frontend Vite config proxies `/api` requests to the backend, so CORS is not an issue in development:
```
http://localhost:5173/api/v1/... → http://localhost:5000/api/v1/...
```

---

## Appendix: Quick Credential Reference

| What | Value |
|---|---|
| **Frontend URL** | http://localhost:5173 |
| **Backend URL** | http://localhost:5000 |
| **MongoDB** | mongodb://localhost:27017/odoo_hackathon |
| **Admin login** | `admin@odoo.com` / `Password123!` |
| **HR login** | `hr@odoo.com` / `Password123!` |
| **HR login (alt)** | `alexandra@odoo.com` / `Password123!` |
| **Employee login** | `employee@odoo.com` / `Password123!` |
| **Employee (Eleanor)** | `eleanor@odoo.com` / `Password123!` |
| **Employee (Marcus)** | `marcus@odoo.com` / `Password123!` |
| **Employee (Amina)** | `amina@odoo.com` / `Password123!` |
| **All Employee IDs** | See Section 6 table |
| **JWT Access TTL** | 15 minutes |
| **JWT Refresh TTL** | 7 days |
| **Logo upload limit** | 5 MB, PNG/JPG/WEBP |

---

*Dayflow HRMS — Built for Odoo India Hackathon*
