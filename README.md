# Construction Site Attendance & Payments API

This is the fully refactored, production-ready backend for the Construction Site Attendance and Payments management system. It employs a clean **Controller-Service-Data Access Layer (DAL)** architecture, written entirely in **TypeScript**, using **PostgreSQL**, **TypeORM**, and **Express.js**.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **PostgreSQL**: v13 or higher

### 1. Installation

Clone the repository and install the dependencies:

```bash
cd final-backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and ensure the following variables are set (you can use defaults for local development):

```env
NODE_ENV=development
PORT=5000

# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=construction_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here

# Session Configuration
SESSION_SECRET=CHANGE_ME_USE_RANDOM_32_CHARS

# Seed Admin Configuration
ADMIN_EMAIL=admin@constructsite.com
ADMIN_SEED_PASSWORD=your_secure_admin_password_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

PostgreSQL must be running before proceeding. Follow these steps to set up the database:

#### Step 1: Create the Database

```bash
# Create the database using psql
psql -U postgres -c "CREATE DATABASE construction_db;"
```

Alternatively, in the PostgreSQL interactive terminal:
```sql
CREATE DATABASE construction_db;
```

#### Step 2: Run Migrations

Migrations create all database tables and schemas:

```bash
npm run migration:run
```

This will create the following tables and apply schema updates:
- `users` - System users table
- `sites` - Construction sites (includes unique constraint)
- `employees` - Construction workers
- `employee_sites` - Many-to-many relationship
- `attendance` - Daily attendance records (includes balance_amount)
- `session` - Express session store
- `migrations` - TypeORM migration tracking table

Recent migrations also applied:
- `AddBalanceAmountToAttendance`
- `AddUniqueConstraintToSiteName`

#### Step 3: Seed the Database ✅ **IMPORTANT**

**On first setup, you MUST seed the database to create the default admin user:**

```bash
npm run db:seed
```

This will:
- ✅ Create default admin user
- 🔐 Hash the password using bcrypt
- 📧 Log credentials to console

**Default Admin Credentials:**
```
📧 Email: admin@constructsite.com
🔑 Password: [Value of ADMIN_SEED_PASSWORD in .env]
👤 Role: admin
```

> ⚠️ **Important**: The seed script is idempotent (safe to run multiple times). It only creates the admin user if it doesn't already exist.

#### Step 4: Full Database Reset (Development Only)

To reset the entire database (revert migrations + re-run + reseed):

```bash
npm run db:reset
```

> ⚠️ **WARNING**: This command will delete all data. Use only in development!

---

### Database Management Commands

| Command | Purpose |
|---------|---------|
| `npm run migration:generate` | Auto-generate a new migration from entity changes |
| `npm run migration:run` | Execute all pending migrations |
| `npm run migration:revert` | Undo the last migration batch |
| `npm run migration:show` | Display migration status |
| `npm run db:seed` | Seed database with default admin user |
| `npm run db:reset` | Revert all migrations, re-run them, and reseed |

#### Example: Generate a New Migration

If you modify an entity and want to auto-generate migration SQL:

```bash
npm run migration:generate -- src/migrations/AddNewColumn
```

This creates `src/migrations/[timestamp]-AddNewColumn.ts` with the generated SQL.

#### Troubleshooting Migrations

**Issue: "Migration failed"**
```bash
# Check migration status
npm run migration:show

# Undo the failed migration
npm run migration:revert

# Try again
npm run migration:run
```

**Issue: "Duplicate key error during seed"**

The seed script handles this automatically (idempotent). Safe to re-run:
```bash
npm run db:seed
```

---

### 4. Running the Application

To run the development server with hot-reloading (via nodemon & ts-node):

```bash
npm run dev
```

The server starts at `http://localhost:5000`

To build and run in production:

```bash
npm run build
npm start
```

---

## 🔐 Password Management

### Admin Password Hashing

The seed script uses **bcryptjs** for secure password hashing:

- **Algorithm**: bcrypt with 10 salt rounds
- **Plain Password**: Pulled from `ADMIN_SEED_PASSWORD` in `.env`
- **Stored Hash**: `$2a$10$...` (bcrypt format)

The same hashing is used in the auth service for login password verification.

---

## 🔗 Internal API Docs (Swagger)

A full Swagger UI instance is available when running the server:
Open `http://localhost:5000/api-docs`

---

## 📂 Project Structure

This API follows a strict layered architecture pattern for maximum maintainability:

```text
final-backend/
├── database/                   # Raw SQL schema files
│   └── schema.sql              # Core database schema reference
├── src/                        # TypeScript source code
│   ├── app.ts                  # Express application setup, middleware, and route registration
│   ├── server.ts               # Server entry point (starts listener & connects DB)
│   ├── config/                 # Application configuration
│   │   ├── data-source.ts      # TypeORM DataSource for CLI migrations
│   │   ├── database.ts         # TypeORM AppDataSource configuration
│   │   ├── env.ts              # Strongly typed environment variable validation
│   │   └── swagger.ts          # Swagger/OpenAPI documentation setup
│   ├── controllers/            # HTTP layer (Req/Res handling, calling services)
│   │   ├── attendance.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── employees.controller.ts
│   │   ├── reports.controller.ts
│   │   ├── sites.controller.ts
│   │   └── users.controller.ts
│   ├── entities/               # TypeORM models representing database tables
│   │   ├── Attendance.ts
│   │   ├── Employee.ts
│   │   ├── Site.ts
│   │   └── User.ts
│   ├── errors/                 # Custom error classes
│   │   └── AppError.ts
│   ├── middleware/             # Express middlewares
│   │   ├── auth.ts             # Route protection (requireAuth, requireAdmin)
│   │   └── validate.ts         # express-validator result handler
│   ├── migrations/             # TypeORM database migrations
│   │   ├── 1742428646001-InitUsers.ts
│   │   ├── 1742428646003-InitSites.ts
│   │   ├── 1742428646005-InitEmployees.ts
│   │   ├── 1742428646007-InitAttendance.ts
│   │   ├── 1742428646009-InitSession.ts
│   │   ├── 1774001171720-AddBalanceAmountToAttendance.ts
│   │   └── 1774004406512-AddUniqueConstraintToSiteName.ts
│   ├── routes/                 # API route definitions and request validation rules
│   │   ├── attendance.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── employees.routes.ts
│   │   ├── index.ts
│   │   ├── reports.routes.ts
│   │   ├── sites.routes.ts
│   │   └── users.routes.ts
│   ├── seeds/                  # Database seeding scripts
│   │   └── seed.ts             # Seed initial admin user with hashed password
│   ├── services/               # Core business logic (called by controllers)
│   │   ├── attendance.service.ts
│   │   ├── auth.service.ts
│   │   ├── employees.service.ts
│   │   ├── reports.service.ts
│   │   ├── sites.service.ts
│   │   └── users.service.ts
│   └── utils/                  # Helper utilities and constants
│       ├── handleErrorResponse.ts # Global standardized error handler mapping
│       ├── knownError.ts       # Maps specific string errors to HTTP Status Codes
│       ├── logger.ts           # Winston structured logger
│       └── properties.ts       # Central dictionary for all app strings/error messages
├── dist/                       # Compiled JavaScript output (generated by tsc)
├── .env                        # Environment variables (ignored in Git)
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore rules
├── tsconfig.json               # TypeScript compiler options
├── nodemon.json                # Nodemon configuration for development
├── package.json                # NPM scripts and dependencies
└── README.md                   # This file
```

---

## 🛠 Features & Improvements Over Previous Versions
- **TypeScript & TypeORM**: Replaced plain JavaScript and raw `mysql2` strings with strict typing and robust ORM modeling.
- **Layered Controller-Service Architecture**: Business logic decouple from HTTP payload logic.
- **Strong Global Error Handling**: Custom `AppError`, mapped known errors (`knownError.ts`), and standardized responses.
- **Session Auth in PostgreSQL**: More robust session store using `connect-pg-simple`.
- **Winston Logging**: Console and daily rotating file logs.
- **Security Middleware**: Includes `helmet`, `hpp`, and `compression`.
- **Separated Migrations & Seeds**: Clean separation of schema creation (migrations) from data seeding (seed script).
- **Bcrypt Password Hashing**: Secure password hashing in seed script with 10 salt rounds.
- **Idempotent Seeding**: Safe to run `npm run db:seed` multiple times without errors.

---

## 📚 API Documentation

A full Swagger UI instance is available when running the server:

Open `http://localhost:5000/api-docs` in your browser to explore all endpoints interactively.

---
