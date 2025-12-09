const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    const statusCode = err.statusCode || err.status || 500;
    const response = {
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
    };
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
}

function notFoundHandler(req, res) {
    logger.warn(`Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};