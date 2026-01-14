# Seductive Seekers Backend

A robust Node.js backend API built with Express.js, TypeScript, and PostgreSQL, featuring authentication, role-based access control, file uploads via AWS S3, and real-time capabilities with Socket.io.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3
- **Real-time**: Socket.io
- **Validation**: Zod & Express Validator
- **Security**: Helmet, CORS, bcryptjs
- **Email**: Nodemailer
- **Rate Limiting**: Express Rate Limit

## 📁 Project Structure

```
backend-new/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   └── db.ts              # Database configuration (Sequelize)
│   ├── constants/
│   │   └── endpoints.ts       # API endpoint constants
│   ├── controllers/           # Request handlers
│   │   └── index.ts
│   ├── middleware/            # Custom middleware
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── logger.middleware.ts    # Request logging
│   │   ├── pagination.middleware.ts # Pagination helpers
│   │   ├── role.middleware.ts      # Role-based access control
│   │   └── validate.middleware.ts  # Request validation
│   ├── models/                # Sequelize models
│   │   ├── index.ts
│   │   └── user.model.ts      # User model with comprehensive fields
│   ├── routes/                # API routes
│   │   └── index.ts
│   ├── schema/                # Validation schemas
│   │   └── index.ts
│   ├── services/              # Business logic layer
│   │   └── index.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── common.type.ts
│   └── utils/                 # Utility functions
│       └── s3.utils.ts        # AWS S3 operations
├── dist/                      # Compiled JavaScript (generated)
├── node_modules/              # Dependencies
├── .prettierrc.json           # Prettier configuration
├── eslint.config.js           # ESLint configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project dependencies and scripts
└── README.md                  # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **AWS Account** (for S3 file storage)

## 🔧 Installation

1. **Clone the repository** (if applicable):

   ```bash
   git clone <repository-url>
   cd backend-new
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   PORT=3010
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Database Configuration
   DB_NAME=your_database_name
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key

   # AWS S3 Configuration
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY=your_aws_access_key
   AWS_SECRET_KEY=your_aws_secret_key
   AWS_BUCKET_NAME=your_bucket_name
   AWS_SECRET_FOLDER=your_folder_name

   # Email Configuration (if using Nodemailer)
   # Add your email service credentials here
   ```

4. **Set up the database**:
   - Create a PostgreSQL database
   - Update the database credentials in your `.env` file
   - The application will automatically sync the database schema on startup

## 🏃 Running the Project

### Development Mode

Run the development server with hot-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3010` (or the port specified in your `.env` file).

### Production Mode

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

## 📜 Available Scripts

| Script                 | Description                                 |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start development server with nodemon       |
| `npm start`            | Start production server                     |
| `npm run build`        | Compile TypeScript to JavaScript            |
| `npm run format`       | Format all source files with Prettier       |
| `npm run format:check` | Check if files are formatted correctly      |
| `npm run lint`         | Run ESLint to check for code issues         |
| `npm run lint:fix`     | Fix auto-fixable ESLint errors              |
| `npm run fix`          | Format and lint all files                   |
| `npm run watch`        | Watch for file changes and auto-format/lint |

For more details on formatting and linting, see [FORMATTING.md](./FORMATTING.md).

## 🏗️ Architecture

### MVC-like Structure

The project follows a layered architecture:

- **Routes** (`src/routes/`) - Define API endpoints
- **Controllers** (`src/controllers/`) - Handle HTTP requests and responses
- **Services** (`src/services/`) - Contain business logic
- **Models** (`src/models/`) - Define database schemas using Sequelize
- **Middleware** (`src/middleware/`) - Handle cross-cutting concerns (auth, validation, logging)
- **Utils** (`src/utils/`) - Reusable utility functions

### Key Features

- **Authentication**: JWT-based authentication with cookie and header support
- **Role-Based Access Control**: Support for Admin, Client, and Advertiser roles
- **File Uploads**: AWS S3 integration for file storage with signed URLs
- **Request Validation**: Zod schemas and Express Validator
- **Security**: Helmet for security headers, CORS configuration, rate limiting
- **Logging**: Morgan for HTTP logging and custom logger middleware
- **Database**: Sequelize ORM with PostgreSQL, automatic schema synchronization

## 🔐 Authentication

The application uses JWT tokens for authentication. Tokens can be provided via:

- **Cookies**: `session` cookie
- **Headers**: `Authorization: Bearer <token>`

The authentication middleware (`auth.middleware.ts`) checks for tokens in both locations.

## 👥 User Model

The User model includes comprehensive fields for:

- Basic information (name, username, email, profile)
- Personal details (DOB, gender, contact numbers)
- Address information (country, state, city, postcode, streets)
- Account settings (role, status, password status)
- Referral system (referral codes)
- Agency/Company information
- Identity verification fields
- Device tokens for push notifications
- Daily free unlocks feature
- Soft delete support

### User Roles

- **Admin**: Full system access
- **Client**: Standard user access
- **Advertiser**: Advertising-specific access

### User Status

- **Approved**: Account approved and active
- **Pending**: Awaiting approval
- **Block**: Account blocked
- **Suspend**: Account suspended
- **Active**: Account active
- **Inactive**: Account inactive

## 📡 API Endpoints

API endpoints are organized in the `src/routes/` directory. The structure supports:

- **Public routes**: Accessible without authentication
- **Protected routes**: Require authentication
- **Role-based routes**: Accessible based on user role (Admin, Client, Advertiser)

See `src/constants/endpoints.ts` for endpoint definitions.

## 🗄️ Database

The application uses **PostgreSQL** with **Sequelize ORM**.

- Database connection is configured in `src/config/db.ts`
- Models are defined in `src/models/`
- The database schema is automatically synchronized on server startup (`alter: true`)

**Note**: In production, consider using migrations instead of `alter: true` for better control over schema changes.

## 📦 AWS S3 Integration

The application includes utilities for AWS S3 operations:

- **Upload files**: `uploadBufferToS3()` - Upload buffer data to S3
- **Delete files**: `deleteFileFromS3()` - Delete files from S3
- **Generate signed URLs**: `generateSignedUrlFromDbUrl()` - Create temporary access URLs

See `src/utils/s3.utils.ts` for implementation details.

## 🔒 Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configured for frontend origin
- **Rate Limiting**: Protection against brute force attacks
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password encryption
- **Input Validation**: Zod and Express Validator for request validation

## 🧪 Development Guidelines

### Code Formatting

This project uses **Prettier** and **ESLint** for code consistency:

- Run `npm run format` before committing
- Use `npm run watch` for automatic formatting during development
- See [FORMATTING.md](./FORMATTING.md) for detailed formatting guidelines

### TypeScript

- Strict mode is enabled
- All files should be properly typed
- Use interfaces and types from `src/types/` for common types

### Error Handling

- Use try-catch blocks for async operations
- Return appropriate HTTP status codes
- Provide meaningful error messages

## 📝 Environment Variables

Required environment variables:

| Variable            | Description               | Required                            |
| ------------------- | ------------------------- | ----------------------------------- |
| `PORT`              | Server port               | No (default: 3010)                  |
| `DB_NAME`           | PostgreSQL database name  | Yes                                 |
| `DB_USERNAME`       | PostgreSQL username       | Yes                                 |
| `DB_PASSWORD`       | PostgreSQL password       | Yes                                 |
| `DB_HOST`           | PostgreSQL host           | Yes                                 |
| `DB_PORT`           | PostgreSQL port           | Yes                                 |
| `JWT_SECRET`        | Secret key for JWT tokens | Yes                                 |
| `AWS_REGION`        | AWS region for S3         | Yes                                 |
| `AWS_ACCESS_KEY`    | AWS access key            | Yes                                 |
| `AWS_SECRET_KEY`    | AWS secret key            | Yes                                 |
| `AWS_BUCKET_NAME`   | S3 bucket name            | Yes                                 |
| `AWS_SECRET_FOLDER` | S3 folder path            | Yes                                 |
| `FRONTEND_URL`      | Frontend application URL  | No (default: http://localhost:3000) |

## 🐛 Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure the database exists
- Check network connectivity

### S3 Upload Issues

- Verify AWS credentials are correct
- Check bucket permissions
- Ensure the bucket exists in the specified region
- Verify `AWS_SECRET_FOLDER` is correctly configured

### Port Already in Use

- Change the `PORT` in `.env`
- Or kill the process using the port:

  ```bash
  # Windows
  netstat -ano | findstr :3010
  taskkill /PID <PID> /F

  # Linux/Mac
  lsof -ti:3010 | xargs kill
  ```

## 📄 License

ISC

## 👤 Author

[Your Name/Organization]

---

**Note**: This is a backend API project. Make sure to configure your frontend application to point to the correct API endpoint.
