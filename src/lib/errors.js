class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.details = details;
  }
}

class ValidationError extends AppError {
  constructor(details) {
    super(400, 'Validation failed', details);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, message);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

module.exports = { AppError, ValidationError, NotFoundError, ConflictError };
