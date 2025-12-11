const carbone = require('carbone');
const config = require('../config/app.config');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const os = require('os');

function initCarbone() {
    // Set LibreOffice path if not already set (e.g., in Docker)
    if (!process.env.LIBREOFFICE_BIN) {
        const platform = os.platform();
        if (platform === 'darwin') {
            // macOS - both Intel and Apple Silicon
            process.env.LIBREOFFICE_BIN = '/Applications/LibreOffice.app/Contents/MacOS/soffice';
        } else if (platform === 'win32') {
            // Windows
            process.env.LIBREOFFICE_BIN = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
        } else {
            // Linux - default path
            process.env.LIBREOFFICE_BIN = '/usr/lib/libreoffice/program/soffice';
        }
    }

    carbone.set({
        factories: config.carbone.factories,
        startFactory: config.carbone.startFactory
    });

    logger.info(`Carbone initialized with ${config.carbone.factories} factories`);
    logger.info(`LibreOffice path: ${process.env.LIBREOFFICE_BIN}`);
    logger.info(`Platform: ${os.platform()}`);
}

function generateDocument(templateBuffer, templateName, data, options = {}) {
    return new Promise((resolve, reject) => {
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `carbone-${Date.now()}-${templateName}`);

        try {
            fs.writeFileSync(tempFilePath, templateBuffer);
            const renderOptions = {
                ...config.carbone.defaultOptions,
                ...options
            };

            logger.info('Starting document generation', {
                tempFile: tempFilePath,
                dataKeys: Object.keys(data),
                options: renderOptions
            });
            carbone.render(tempFilePath, data, renderOptions, (err, result) => {
                try {
                    if (fs.existsSync(tempFilePath)) {
                        fs.unlinkSync(tempFilePath);
                    }
                } catch (cleanupErr) {
                    logger.warn(`Failed to delete temp file: ${cleanupErr.message}`);
                }

                if (err) {
                    logger.error('Carbone rendering failed:', err);
                    return reject(new Error(`Failed to generate document: ${err.message}`));
                }

                if (!result || result.length === 0) {
                    logger.error('Carbone returned empty result');
                    return reject(new Error('Generated document is empty'));
                }

                logger.info(`Document generated successfully, size: ${result.length} bytes`);
                resolve(result);
            });
        } catch (error) {
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (cleanupErr) {
            }
            logger.error('Error creating temp file:', error);
            reject(new Error(`Failed to prepare template: ${error.message}`));
        }
    });
}

function getCarboneInfo() {
    return {
        version: carbone.version || 'unknown',
        factories: config.carbone.factories,
        status: 'running'
    };
}

module.exports = {
    initCarbone,
    generateDocument,
    getCarboneInfo
};