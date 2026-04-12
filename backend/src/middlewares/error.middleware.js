"use strict";

function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";

  res.status(status).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

