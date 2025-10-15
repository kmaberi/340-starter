# CSE Motors Setup Guide

## Quick Setup for Login and Registration

### 1. Database Setup

You need a PostgreSQL database. You have two options:

#### Option A: Use a Cloud Database (Recommended for testing)
- Create a free PostgreSQL database at [ElephantSQL](https://www.elephantsql.com/) or [Render](https://render.com)
- Copy the connection URL they provide

#### Option B: Local PostgreSQL Installation
- Install PostgreSQL locally
- Create a database named `cse340`
- Use connection string: `postgresql://username:password@localhost:5432/cse340`

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```
   copy .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```
   DATABASE_URL=your_actual_database_url_here
   SESSION_SECRET=your_random_session_secret_here
   ACCESS_TOKEN_SECRET=your_random_jwt_secret_here
   PORT=5500
   DB_SSL=false
   NODE_ENV=development
   ```

   **Important:** Replace the placeholder values with real ones!

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Initialize Database

Run this command to create the required tables and sample data:

```bash
node scripts/init-dev-db.js
```

This will create:
- Account table for user registration/login
- Classification table for vehicle categories  
- Inventory table for vehicles
- Sample data to test with

### 5. Start the Server

```bash
pnpm run dev
```

The server will start on http://localhost:5500

## Testing Login and Registration

### Access the Pages
- **Home:** http://localhost:5500/
- **Login:** http://localhost:5500/account/login
- **Register:** http://localhost:5500/account/register

### Test Account Creation
1. Go to http://localhost:5500/account/register
2. Fill out the form with:
   - First Name: `Test`
   - Last Name: `User` 
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Create Account"
4. You should be redirected to login with a success message

### Test Login
1. Go to http://localhost:5500/account/login
2. Use the credentials you just created
3. After successful login, you'll be redirected to account management

## Troubleshooting

### Common Issues

**Error: "Page not found" when accessing /account/login**
- Make sure you created the `.env` file with valid DATABASE_URL
- Run `node scripts/init-dev-db.js` to set up the database
- Restart the server with `pnpm run dev`

**Database connection errors**
- Verify your DATABASE_URL is correct
- For cloud databases, make sure DB_SSL=true
- Check that your database server is running (if using local PostgreSQL)

**"utilities failed to load" warnings**
- This is normal if the database isn't set up yet
- Run the database initialization script
- Restart the server

### Manual Database Check

To verify your database connection:

```bash
node scripts/check-db.js
```

This should show your classifications and inventory data.

## Next Steps

Once login/registration is working:

1. **Add CSS styling** to `public/css/` for better appearance
2. **Test account management features** at `/account/` after logging in
3. **Explore inventory features** - add vehicles and classifications
4. **Set up proper error handling** and validation

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique secrets for SESSION_SECRET and ACCESS_TOKEN_SECRET  
- In production, set DB_SSL=true and NODE_ENV=production