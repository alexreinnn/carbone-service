module.exports = {
    port: process.env.PORT || 3001, env: process.env.NODE_ENV || 'development', fileUpload: {
        maxFileSize: 200 * 1024 * 1024,
        allowedMimeTypes: [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.oasis.opendocument.text', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.oasis.opendocument.spreadsheet'],
        allowedExtensions: ['.docx', '.odt', '.xlsx', '.ods']
    }, carbone: {
        factories: 3, startFactory: true, defaultOptions: {
            convertTo: 'pdf'
        }
    }, logging: {
        level: process.env.LOG_LEVEL || 'info', format: process.env.LOG_FORMAT || 'json'
    }
};