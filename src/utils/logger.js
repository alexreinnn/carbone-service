const winston = require('winston');
const config = require('../config/app.config');
const logFormat = config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.colorize(),
        winston.format.printf(({timestamp, level, message, ...meta}) => {
            let metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
            return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
    );
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports: [new winston.transports.Console()
    ]
});
if (config.env === 'development') {
    logger.format = winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    );
}

module.exports = logger;