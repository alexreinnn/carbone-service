# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Carbone Service is a Node.js microservice that generates PDF documents from templates (.docx, .odt, .xlsx, .ods) using
the [Carbone](https:
**Important Platform Limitation**: LibreOffice does not work natively on Mac M1/M2. Always use Docker for local
development and testing on Apple Silicon.

## Development Commands

### Running the Service

```bash
# Start with nodemon (development mode with auto-reload)
npm run dev

# Start normally
npm start
```

### Docker

```bash
# Build Docker image
docker build -t carbone-service .

# Run container
docker run -p 3001:3001 carbone-service

# Use docker-compose
docker-compose up -d
```

### Testing the API

```bash
# Health check
curl http:
# Generate document from template
curl -X POST http:  -F "template=@template.docx" \
  -F 'data={"name":"Иван","date":"2025-11-18"}' \
  --output result.pdf
```

## Architecture

### Request Flow

1. **server.js** - Entry point that initializes Express app, sets up middleware chain, and waits 10 seconds for
   LibreOffice factories to start before accepting requests
2. **File Upload** (`src/middleware/file-upload.js`) - Handles multipart/form-data with 200MB limit
3. **Validation** (`src/middleware/validation.js`) - Validates template file extension, MIME type, and parses JSON
   data/options
4. **Route Handler** (`src/routes/generate.routes.js`) - Extracts template file, data, and options from request
5. **Carbone Service** (`src/services/carbone.service.js`) - Core business logic:
    - Writes template Buffer to temp file in `/tmp`
    - Calls `carbone.render()` with template path, data, and options
    - LibreOffice workers convert template to PDF
    - Cleans up temp file and returns PDF Buffer
6. **Response** - PDF sent back with appropriate headers (`Content-Type: application/pdf`, `Content-Disposition`)

### Key Components

**Carbone Service** (`src/services/carbone.service.js`):

- Manages LibreOffice factory workers (configurable via `config.carbone.factories`, default 3)
- Uses temp files because Carbone requires file paths, not Buffers directly
- Always converts to PDF (configured in `config.carbone.defaultOptions`)

**Configuration** (`src/config/app.config.js`):

- `factories: 3` - Number of LibreOffice worker processes
- `maxFileSize: 200MB` - Matches document-core limit
- Environment variables: `PORT`, `NODE_ENV`, `LOG_LEVEL`, `LOG_FORMAT`

**LibreOffice Integration**:

- Path hardcoded in Dockerfile: `LIBREOFFICE_BIN=/usr/lib/libreoffice/program/soffice`
- 10-second startup delay in server.js to ensure factories are ready
- Increase `factories` count for better performance under load

### Template Syntax

Templates use Carbone's marker syntax:

- Variables: `{d.fieldName}` (e.g., `{d.name}`, `{d.date}`)
- The `d` prefix stands for "data" and is required by Carbone

## Deployment

### GitLab CI/CD

Pipeline triggers only on version tags matching `v*.*.*`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This builds a Docker image using Kaniko and pushes it to the corporate GitLab registry (`CI_REGISTRY_IMAGE`).

### Kubernetes Integration

The service runs as a pod in Kubernetes. The Java `document-core` service calls it at:

```
http:```

No authentication is required (internal service-to-service communication).

## API Endpoints

- `POST /api/v1/generate` - Generate PDF from template (requires `template` file + `data` JSON)
- `GET /api/v1/health` - Health check with uptime and Carbone info
- `GET /api/v1/info` - Service version and metadata
- `GET /` - Root endpoint with API documentation

## Troubleshooting

**Slow generation times**: Increase `factories` in `src/config/app.config.js` (line 28). More workers = higher parallelism but more memory usage.

**LibreOffice crashes**: Check Docker container logs. LibreOffice requires specific system libraries listed in Dockerfile (lines 5-19).

**Empty PDF output**: Usually indicates template syntax errors or missing data fields. Check logs for Carbone error messages.

**File size limits**: Maximum 200MB enforced at middleware level (`src/middleware/file-upload.js`). This matches the limit in document-core.