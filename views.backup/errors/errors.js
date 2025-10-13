/**
 * CSE Motors Error Handling System
 * A comprehensive error handling module for the CSE Motors application
 */

/**
 * Custom Error Classes
 */

class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.status = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
    this.originalError = originalError;
  }
}

/**
 * Error Messages
 */
const errorMessages = {
  validation: {
    required: (field) => `${field} is required`,
    invalid: (field) => `Invalid ${field} format`,
    length: (field, min, max) => `${field} must be between ${min} and ${max} characters`,
    unique: (field) => `${field} already exists`,
    password: {
      weak: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
      mismatch: 'Passwords do not match'
    },
    email: 'Invalid email address format',
    date: 'Invalid date format',
    number: (field) => `${field} must be a valid number`,
    file: {
      size: 'File size exceeds maximum limit',
      type: 'Invalid file type',
      upload: 'Error uploading file'
    },
    vehicle: {
      price: 'Price must be a positive number',
      year: 'Year must be a valid 4-digit number',
      mileage: 'Mileage must be a positive number',
      vin: 'Invalid VIN format'
    }
  },
  auth: {
    invalid: 'Invalid username or password',
    expired: 'Session has expired, please log in again',
    required: 'Authentication required',
    forbidden: 'Access denied',
    token: {
      invalid: 'Invalid token',
      expired: 'Token has expired'
    }
  },
  notFound: {
    resource: (type) => `${type} not found`,
    page: 'Page not found',
    route: 'Route not found',
    vehicle: 'Vehicle not found',
    classification: 'Vehicle classification not found'
  },
  database: {
    connection: 'Database connection error',
    query: 'Database query error',
    constraint: 'Database constraint violation',
    transaction: 'Database transaction failed'
  },
  server: {
    internal: 'Internal server error',
    maintenance: 'Server is under maintenance',
    timeout: 'Request timeout'
  }
};

/**
 * Error Handler Functions
 */
const errorHandler = {
  // Validation error handler
  handleValidation: (error) => {
    if (error instanceof ValidationError) {
      return {
        status: error.status,
        message: error.message,
        field: error.field,
        type: 'validation_error'
      };
    }
    return null;
  },

  // Authentication error handler
  handleAuth: (error) => {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return {
        status: error.status,
        message: error.message,
        type: 'auth_error'
      };
    }
    return null;
  },

  // Not found error handler
  handleNotFound: (error) => {
    if (error instanceof NotFoundError) {
      return {
        status: error.status,
        message: error.message,
        type: 'not_found'
      };
    }
    return null;
  },

  // Database error handler
  handleDatabase: (error) => {
    if (error instanceof DatabaseError) {
      return {
        status: error.status,
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.originalError : undefined,
        type: 'database_error'
      };
    }
    return null;
  },

  // Generic error handler
  handleGeneric: (error) => {
    return {
      status: error.status || 500,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      type: 'server_error'
    };
  }
};

/**
 * Error Response Formatter
 */
const formatErrorResponse = (error) => {
  const handlers = [
    errorHandler.handleValidation,
    errorHandler.handleAuth,
    errorHandler.handleNotFound,
    errorHandler.handleDatabase,
    errorHandler.handleGeneric
  ];

  for (const handler of handlers) {
    const response = handler(error);
    if (response) {
      return {
        error: true,
        ...response,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7) // For tracking errors in logs
      };
    }
  }
};

/**
 * Express Error Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  const formattedError = formatErrorResponse(err);
  
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      ...formattedError,
      stack: err.stack
    });
  }

  // Set flash message for user feedback if appropriate
  if (req.session) {
    req.flash('error', formattedError.message);
  }

  // If it's an API request, send JSON response
  if (req.xhr || req.headers.accept.includes('application/json')) {
    return res.status(formattedError.status).json(formattedError);
  }

  // For regular requests, render error page
  return res.status(formattedError.status).render('errors/error', {
    title: `Error ${formattedError.status}`,
    message: formattedError.message,
    status: formattedError.status,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

// Export all error utilities
module.exports = {
  // Error Classes
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  
  // Error Messages
  errorMessages,
  
  // Error Handlers
  errorHandler,
  formatErrorResponse,
  errorMiddleware
};
