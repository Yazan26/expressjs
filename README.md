# 🎬 Movies Express Rentals

A comprehensive movie rental management system built with Node.js, Express.js, and MySQL. This application provides a complete solution for managing film rentals with role-based access control for customers, staff, and administrators.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [User Roles](#user-roles)
- [API Routes](#api-routes)
- [Testing](#testing)
- [Security Features](#security-features)
- [Development Standards](#development-standards)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Movies Express Rentals is a full-stack web application that manages a movie rental business. The system supports three distinct user roles with tailored functionalities:

- **Customers**: Browse films, manage rentals, track spending
- **Staff**: Access employee film offers, make selections  
- **Administrators**: Manage inventory, staff, and business operations

The application is built following enterprise-grade development practices with layered architecture, comprehensive security measures, and thorough testing coverage.

## ✨ Features

### 🎭 Customer Features
- **Film Discovery**: Search and filter movies by title, category, rating
- **Detailed Film Information**: View cast, plot, ratings, and availability
- **Personal Dashboard**: Track active rentals and spending history
- **Spending Analytics**: Analyze rental patterns over time periods
- **Personalized Recommendations**: Based on rental history and preferences

### 👥 Staff Features
- **Employee Film Offers**: Browse films offered by management
- **Benefit Selection**: Select multiple films for employee perks
- **Selection Management**: Track and manage current selections
- **Staff Dashboard**: Overview of personal activity and benefits

### 🛡️ Administrator Features
- **Inventory Management**: Add, edit, and manage film catalog
- **Staff Administration**: Create and manage staff accounts
- **Film Offers Management**: Control employee benefit offerings
- **Business Reports**: Staff performance and revenue analytics
- **System Configuration**: Manage roles and permissions

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js with Express.js framework
- **Database**: MySQL with extended Sakila schema
- **Authentication**: express-session with role-based access control
- **Template Engine**: Pug for server-side rendering
- **Password Security**: bcrypt with salt rounds

### Frontend
- **UI Framework**: Bootstrap 5 responsive design
- **Icons**: Font Awesome for consistent visual language
- **Styling**: Custom CSS with Bootstrap customization
- **JavaScript**: Minimal client-side JS with progressive enhancement

### Development & Testing
- **Testing Framework**: Cypress for end-to-end testing
- **Logging**: Winston with file rotation and levels
- **Environment**: dotenv for configuration management
- **Code Quality**: Prettier for consistent formatting

## 🏗️ Architecture

The application follows a **strict layered architecture** pattern:

```
Controller → Service → DAO → Database
```

### Key Architectural Principles:
- **No layer skipping**: Each layer only communicates with adjacent layers
- **Callback-only pattern**: Node.js style (err, result) error handling
- **No ORM**: Direct MySQL queries with parameterized statements
- **Server-side rendering**: Pug templates with no SPA behavior
- **Role-based security**: Middleware-enforced authorization

### Directory Structure:
```
src/
├── controllers/     # HTTP request handling and routing logic
├── services/        # Business logic and validation
├── dao/             # Database access objects and SQL queries
├── middleware/      # Authentication, authorization, logging
├── routes/          # Express route definitions
├── views/           # Pug template files
├── public/          # Static assets (CSS, client-side JS)
└── util/            # Helper functions and utilities
```

## 🚀 Installation

### Prerequisites
- Node.js (version 14 or higher)
- MySQL Server (version 8.0 recommended)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expressjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Install MySQL and create a database
   - Import the Sakila sample database schema
   - Create additional custom tables for authentication and offers
   - Configure database connection in `.env` file

4. **Environment Configuration**
   Create a `.env` file in the project root:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=sakila
   SESSION_SECRET=your_session_secret_key
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the Application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

## 👤 User Roles

### Customer Account
- **Registration**: Create account with email and password
- **Login**: Secure session-based authentication
- **Profile**: Manage personal information and preferences

### Staff Account
- **Company Email**: Enforced domain `@moviesexpressrentals.com`
- **Role Assignment**: Staff or Manager level permissions
- **Employee Benefits**: Access to discounted film offers

### Administrator Account
- **Full System Access**: Complete administrative privileges
- **User Management**: Create, modify, and deactivate accounts
- **Business Intelligence**: Access to all reports and analytics

## 🛣️ API Routes

### Public Routes
- `GET /` - Home page with featured films
- `GET /films` - Browse film catalog with filtering
- `GET /films/:id` - Individual film details and recommendations
- `GET /auth/login` - User login page
- `POST /auth/login` - Process login credentials
- `GET /about` - Company information and user stories

### Customer Routes (Authentication Required)
- `GET /customer/dashboard` - Personal rental dashboard
- `GET /customer/spending` - Spending analysis and history

### Staff Routes (Staff Role Required)
- `GET /staff/offers` - Available employee film offers
- `POST /staff/offers/select` - Select films for employee benefits
- `GET /staff/dashboard` - Personal staff activity overview

### Admin Routes (Admin Role Required)
- `GET /admin/films` - Film inventory management
- `POST /admin/films` - Add new films to catalog
- `GET /admin/staff` - Staff account management
- `POST /admin/staff` - Create new staff accounts
- `GET /admin/offers` - Manage employee film offers
- `GET /reports/staff-performance` - Business analytics and reports

## 🧪 Testing

The application includes comprehensive end-to-end testing using Cypress:

### Test Suites
- **Authentication Tests**: Login/logout flows for all user roles
- **Integration Tests**: Cross-feature workflows and data consistency
- **Rental Tests**: Complete rental process from search to completion

### Running Tests

```bash
# Run all tests headlessly
npm run test

# Open Cypress test runner GUI
npm run test:open

# Run specific test suites
npm run test:auth        # Authentication tests only
npm run test:rental      # Rental process tests
npm run test:integration # Cross-feature integration tests

# CI/CD pipeline testing
npm run test:ci
```

### Test Environment Configuration
Tests use environment variables for user credentials and can be configured in `cypress.config.js` or through environment variables:

```bash
CYPRESS_ADMIN_USERNAME=admin
CYPRESS_ADMIN_PASSWORD=admin123
CYPRESS_STAFF_USERNAME=staff
CYPRESS_STAFF_PASSWORD=staff123
```

## 🔒 Security Features

### Authentication & Authorization
- **Session Management**: Secure express-session configuration
- **Role-Based Access Control**: Middleware-enforced permissions
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Remember Me**: Optional persistent login functionality

### Data Protection
- **SQL Injection Prevention**: Parameterized queries only
- **Input Validation**: Comprehensive sanitization and validation
- **Error Handling**: No sensitive information exposed to users
- **Logging**: Secure logging without exposing credentials

### Additional Security Measures
- **Company Email Enforcement**: Staff accounts require company domain
- **Session Configuration**: HTTP-only cookies with appropriate expiration
- **CSRF Protection**: Form-based attack prevention
- **Environment Isolation**: Sensitive configuration in environment variables

## 📏 Development Standards

### Code Quality Principles
- **Layered Architecture**: Strict separation of concerns
- **Callback Pattern**: Node.js style error handling throughout
- **No ORM Policy**: Direct SQL with security best practices
- **English Only**: All code, comments, and documentation in English
- **Open Source Libraries**: Prefer established, maintained dependencies

### Error Handling Standards
- **Consistent Error Flow**: Early return on callback errors
- **Centralized Logging**: Winston logger with appropriate log levels
- **User-Friendly Messages**: No stack traces exposed to end users
- **HTTP Status Codes**: Proper codes for different error types

### Database Standards
- **Parameterized Queries**: Always use `?` for values, `??` for identifiers
- **No String Interpolation**: Never concatenate user input into SQL
- **Connection Management**: Proper connection pooling and error handling
- **Transaction Support**: Rollback capability for complex operations

## 📁 Project Structure

```
expressjs/
├── app.js                 # Express application configuration
├── package.json           # Project dependencies and scripts
├── cypress.config.js      # Cypress testing configuration
├── .env                   # Environment variables (not in repo)
├── bin/
│   └── www               # Application server entry point
├── cypress/              # End-to-end testing suite
│   ├── e2e/             # Test specifications
│   └── support/         # Test utilities and commands
├── logs/                 # Application log files
│   ├── app.log          # General application logs
│   └── error.log        # Error-specific logs
├── src/
│   ├── controllers/     # Request handling and HTTP logic
│   ├── services/        # Business logic and validation
│   ├── dao/            # Database access objects
│   ├── routes/         # Express route definitions
│   ├── middleware/     # Authentication, authorization, logging
│   ├── views/          # Pug template files
│   ├── public/         # Static assets (CSS, JS, images)
│   ├── db/            # Database connection and configuration
│   └── util/          # Utility functions and helpers
└── scripts/           # Database setup and maintenance scripts
```

## 🔄 Development Workflow

### Local Development
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Configure MySQL database with Sakila schema
4. Run in development mode: `npm run dev`
5. Access application at `http://localhost:3000`

### Testing Workflow
1. Ensure application is running locally
2. Run test suite: `npm run test`
3. Review test results and coverage
4. Fix any failing tests before committing changes

### Code Standards
- Follow the layered architecture pattern strictly
- Use callbacks for all asynchronous operations
- Write parameterized SQL queries only
- Include proper error handling in all functions
- Add appropriate logging at service and controller levels
- Write meaningful commit messages

## 🤝 Contributing

This project is part of an academic assignment. For educational purposes, contributions should follow these guidelines:

1. **Architecture Compliance**: Maintain the layered architecture pattern
2. **Security First**: All database queries must use parameterization
3. **Callback Pattern**: No promises or async/await patterns
4. **Testing Coverage**: Include Cypress tests for new features
5. **Documentation**: Update this README for significant changes

## 📄 License

This project is created for educational purposes as part of a software development course. It demonstrates enterprise-level web application development practices and is not intended for commercial use.

---

**Movies Express Rentals System v2.0.0**  
Built with ❤️ using Node.js, Express.js, MySQL, and modern web development practices.

For questions or support, please contact: `support@moviesexpressrentals.com`