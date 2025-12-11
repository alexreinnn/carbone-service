const express = require('express');
const router = express.Router();
const {validateGenerateRequest} = require('../middleware/validation');
const carboneService = require('../services/carbone.service');
const logger = require('../utils/logger');

router.post('/generate', validateGenerateRequest, async (req, res, next) => {
    try {
        const {template} = req.files;
        const {data, options} = req.body;

        logger.info(`Processing document generation request`, {
            templateName: template.name,
            templateSize: template.size,
            dataFields: Object.keys(data).length
        });
        const result = await carboneService.generateDocument(
            template.data, template.name, data, options);
        const outputFileName = template.name.replace(/\.[^/.]+$/, '.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
        res.setHeader('Content-Length', result.length);

        logger.info(`Document generated and sent successfully: ${outputFileName}`);
        res.send(result);

    } catch (error) {
        logger.error('Error in generate route:', error);
        next(error);
    }
});

router.get('/health', (req, res) => {
    const healthInfo = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        carbone: carboneService.getCarboneInfo()
    };

    logger.debug('Health check requested');
    res.json(healthInfo);
});

router.get('/info', (req, res) => {
    const info = {
        service: 'carbone-service',
        version: require('../../package.json').version,
        node: process.version,
        carbone: carboneService.getCarboneInfo()
    };

    res.json(info);
});

module.exports = router;