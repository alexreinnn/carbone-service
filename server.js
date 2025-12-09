const express = require('express');
const cors = require('cors');
const config = require('./src/config/app.config');
const logger = require('./src/utils/logger');
const fileUploadMiddleware = require('./src/middleware/file-upload');
const {errorHandler, notFoundHandler} = require('./src/middleware/error-handler');
const generateRoutes = require('./src/routes/generate.routes');
const carboneService = require('./src/services/carbone.service');

const app = express();

app.use(cors());
app.use(express.json({limit: '10MB'}));
app.use(express.urlencoded({limit: '10MB', extended: true}));
app.use(fileUploadMiddleware);

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

app.use('/api/v1', generateRoutes);

app.get('/', (req, res) => {
    res.json({
        service: 'carbone-service',
        status: 'running',
        version: require('./package.json').version,
        endpoints: {
            generate: 'POST /api/v1/generate',
            health: 'GET /api/v1/health',
            info: 'GET /api/v1/info'
        }
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const PORT = config.port;

logger.info('Initializing Carbone...');
carboneService.initCarbone();
logger.info('Waiting for LibreOffice factories to start...');

setTimeout(() => {
    const server = app.listen(PORT, () => {
        logger.info(`🚀 Carbone Service started successfully!`);
        logger.info(`📡 Server running on port ${PORT}`);
        logger.info(`🌍 Environment: ${config.env}`);
        logger.info(`📝 API Documentation: http://localhost:${PORT}`);
    });

    process.on('SIGTERM', () => {
        logger.info('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        logger.info('SIGINT signal received: closing HTTP server');
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
    });
}, 10000);

module.exports = app;