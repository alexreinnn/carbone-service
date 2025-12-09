const fileUpload = require('express-fileupload');
const config = require('../config/app.config');
const fileUploadMiddleware = fileUpload({
    createParentPath: false, limits: {
        fileSize: config.fileUpload.maxFileSize
    }, useTempFiles: false, abortOnLimit: true, limitHandler: (req, res) => {
        res.status(413).json({
            error: 'File too large',
            message: `Maximum file size is ${config.fileUpload.maxFileSize / (1024 * 1024)}MB`
        });
    }
});

module.exports = fileUploadMiddleware;