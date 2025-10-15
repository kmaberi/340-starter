# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Package Management
- `pnpm install` - Install project dependencies (uses PNPM for faster performance)
- `pnpm run dev` - Start development server with nodemon (auto-restart on changes)
- `pnpm start` - Start production server

### Database Operations
- `node scripts/check-db.js` - Check database connection and view sample data
- `node scripts/remove-dup-classifications.js` - Clean up duplicate classifications

### Development Server
- Server runs on `http://localhost:5500` by default (configurable via PORT environment variable)
- Static files served from `public/` directory

## Architecture Overview

### Project Structure
This is a Node.js/Express web application for CSE 340 course work, implementing a vehicle inventory management system called "CSE Motors".

**Core Technologies:**
- Express.js with EJS templating
- PostgreSQL database with connection pooling
- JWT authentication with bcrypt password hashing
- Express sessions with flash messaging

### Key Architectural Components

**MVC Pattern Implementation:**
- `models/` - Database interaction layer using PostgreSQL
- `views/` - EJS templates with layouts system
- `controllers/` - Business logic and request handling
- `routes/` - URL routing and middleware application

**Database Layer:**
- Connection managed through `database/index.js` with query logging
- Models handle CRUD operations for inventory, classifications, accounts, reviews, and favourites
- Uses parameterized queries for security

**Authentication & Authorization:**
- JWT tokens stored in HTTP-only cookies
- Three access levels: Guest, Employee, Admin
- Middleware: `checkLogin`, `checkAccountType`, `checkJWTToken`

**View System:**
- Main layout: `views/layouts/layout.ejs`
- Partials for reusable components (header, footer, navigation)
- Flash messaging system for user feedback
- Dynamic navigation built from database classifications

### Important Development Patterns

**Error Handling:**
- Global error handler in `server.js`
- `utilities.handleErrors()` wrapper for async route handlers
- Graceful fallbacks when modules fail to load

**Middleware Stack:**
1. Express basics (JSON, URL encoding, static files)
2. Session management with cookie parser
3. Flash messaging setup
4. JWT token verification
5. Dynamic navigation building
6. Route-specific middleware

**Database Patterns:**
- All database operations use try/catch with proper error logging
- Connection pooling configured with SSL support
- Models return consistent data structures
- Database queries logged for debugging

### Environment Configuration
- Requires `.env` file with DATABASE_URL, SESSION_SECRET, ACCESS_TOKEN_SECRET
- SSL database connection configurable via DB_SSL environment variable
- Port configuration defaults to 5500

### Testing Approach
- Manual testing via browser at localhost:5500
- Database connectivity tested via check-db script
- No automated test framework currently configured