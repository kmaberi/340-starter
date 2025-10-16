CSE 340 – Outcome Mastery Report

Name: [Your Name]
GitHub URL: [Your GitHub Repository URL]
Deployed website URL: [Your Deployed Website URL]

Instructions:
For each of the course outcomes listed below, include 2-3 examples of the way you have demonstrated this outcome. Each example should include:
•	A reference to the specific file/function you have created.
•	A 2-3 sentence description of what you did.

Outcome 1: Develop to current web frontend standards of validity and practice.
Examples:
1.	Example: EJS Template Implementation with Proper HTML Structure
	a.	File/Function: views.backup/account/register.ejs
	b.	Description: I created semantic HTML forms with proper labels, input types (email, password), and form validation attributes. The registration form uses proper form structure with associated labels and required attributes for accessibility and HTML5 validation standards.

2.	Example: Client-Side JavaScript for Dynamic Content
	a.	File/Function: public/js/inventory.js - buildInventoryList() function
	b.	Description: I implemented client-side JavaScript that uses modern DOM manipulation and fetch API to dynamically load inventory data. The code follows current JavaScript standards with proper error handling and uses template literals for building HTML content dynamically.

Outcome 2: Use variables, arrays, functions, and control structures in server code.
1.	Example: Account Controller with Variables and Control Structures
	a.	File/Function: controllers/account-controller.js - registerAccount() function
	b.	Description: I implemented server-side functions using proper variable declarations, conditional statements (if/else), and async/await control structures. The function uses destructuring assignment for req.body variables and implements comprehensive error handling with try/catch blocks.

2.	Example: Review Model with Database Query Functions
	a.	File/Function: models/review-model.js - getReviewsByVehicleId() function
	b.	Description: I created functions that use arrays to handle database query results, implement parameterized queries with array values, and use control structures to process and return data. The function demonstrates proper use of SQL parameters array and async function control flow.

Outcome 3: Develop web applications that implement common design patterns.
1.	Example: MVC (Model-View-Controller) Architecture Implementation
	a.	File/Function: Full MVC structure - models/account-model.js, controllers/account-controller.js, routes/account.js
	b.	Description: I implemented the complete MVC design pattern separating data logic (models), business logic (controllers), and routing (routes). This separation of concerns allows for maintainable and scalable code architecture with clear responsibility boundaries.

2.	Example: Middleware Pattern Implementation
	a.	File/Function: utilities/account-validation.js - checkJWTToken() and checkLogin() middleware
	b.	Description: I created reusable middleware functions that implement the middleware pattern for authentication and authorization. These middleware functions can be chained in routes and follow the standard Express middleware pattern with (req, res, next) parameters.

Outcome 4: Design and use relational databases for CRUD interactions.
1.	Example: Database Schema Design with Relationships
	a.	File/Function: database/db-sql-code.sql - Table creation and foreign key constraints
	b.	Description: I designed a relational database with proper foreign key relationships between inventory, classification, account, and review tables. The schema includes proper data types, constraints, and referential integrity with CASCADE and NO ACTION options for maintaining data consistency.

2.	Example: Full CRUD Operations Implementation
	a.	File/Function: models/account-model.js - registerAccount(), updateAccount(), getAccountById() functions
	b.	Description: I implemented complete CRUD operations using parameterized SQL queries for security. The functions demonstrate Create (registerAccount), Read (getAccountById), Update (updateAccount), and Delete operations with proper error handling and return value management.

Outcome 5: Validate data (client-side and server-side) appropriate to the task.
1.	Example: Server-Side Validation with Express-Validator
	a.	File/Function: utilities/account-validation.js - registrationRules() and checkRegData() functions
	b.	Description: I implemented comprehensive server-side validation using express-validator for account registration, including password strength requirements, email format validation, and field length constraints. The validation includes sanitization with trim() and escape() methods for security.

2.	Example: Client-Side and Server-Side Inventory Validation
	a.	File/Function: utilities/inventory-validation.js - inventoryRules() and checkInvData() functions
	b.	Description: I created validation rules for inventory data that check for required fields, numeric validation for prices and mileage, year format validation (4-digit), and classification selection. The validation provides user-friendly error messages and maintains form data on validation failure.

Outcome 6: Demonstrate the skills of a productive team member (such as solving problems, collaborating with others, communicating clearly, fulfilling assignments, and meeting deadlines.)
1.	Example: Code Organization and Documentation
	a.	File/Function: Multiple files - Clear commenting and modular structure throughout the project
	b.	Description: I organized code into logical modules with clear naming conventions, comprehensive comments explaining complex logic, and consistent coding standards. The project structure demonstrates professional development practices that facilitate team collaboration and code maintenance.

2.	Example: Error Handling and User Experience
	a.	File/Function: server.js - Global error handler and 404 handler implementation
	b.	Description: I implemented comprehensive error handling that provides meaningful feedback to users while maintaining security. The error handling includes proper HTTP status codes, user-friendly error pages, and fallback mechanisms that ensure the application remains functional even when modules fail to load.

Additional Technical Achievements:
- Implemented JWT-based authentication system with secure cookie handling
- Created a comprehensive review system with user authorization and admin approval workflow  
- Built dynamic inventory management with AJAX functionality
- Implemented session management with PostgreSQL session store
- Created responsive navigation system with database-driven menu generation
- Established proper database connection pooling for performance optimization