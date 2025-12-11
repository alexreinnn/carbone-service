const config = require('../config/app.config');
const logger = require('../utils/logger');
const path = require('path');

function validateGenerateRequest(req, res, next) {
    try {
        if (!req.files || !req.files.template) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Template file is required'
            });
        }

        const template = req.files.template;
        const fileExt = path.extname(template.name).toLowerCase();
        if (!config.fileUpload.allowedExtensions.includes(fileExt)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: `Invalid file extension. Allowed: ${config.fileUpload.allowedExtensions.join(', ')}`
            });
        }
        if (!config.fileUpload.allowedMimeTypes.includes(template.mimetype)) {
            logger.warn(`Unexpected MIME type: ${template.mimetype} for file ${template.name}`);
        }
        if (!req.body.data) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Data field is required'
            });
        }
        try {
            if (typeof req.body.data === 'string') {
                req.body.data = JSON.parse(req.body.data);
            }
        } catch (err) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Data field must be valid JSON'
            });
        }
        if (req.body.options) {
            try {
                if (typeof req.body.options === 'string') {
                    req.body.options = JSON.parse(req.body.options);
                }
            } catch (err) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Options field must be valid JSON'
                });
            }
        }
        logger.info(`Validation passed for template: ${template.name}`);
        next();

    } catch (error) {
        logger.error('Validation error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error during request validation'
        });
    }
}

module.exports = {
    validateGenerateRequest
};