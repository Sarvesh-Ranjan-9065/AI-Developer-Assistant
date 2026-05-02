# AI Developer Assistant - Backend

Backend service for the AI Developer Assistant, powered by IBM watsonx.ai.

## Features

- 🤖 AI-powered code generation using IBM watsonx.ai (Granite model)
- 🐳 Automatic Docker containerization
- 🚀 Real-time service deployment
- 📊 Progress tracking and logging
- ✅ Health checks and monitoring

## Setup

### Prerequisites

- Node.js 18+ installed
- Docker installed and running
- IBM watsonx.ai credentials (API Key and Project ID)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` and add your IBM watsonx.ai credentials:
```env
PORT=3000
WATSONX_API_KEY=your_iam_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### Getting watsonx.ai Credentials

1. Go to [IBM Cloud watsonx.ai dashboard](https://cloud.ibm.com/watsonx)
2. Navigate to your project
3. Go to "Developer access" section
4. Copy your IAM API Key
5. Copy your Project ID

## Running

Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Generate Service
```http
POST /api/generate
Content-Type: application/json

{
  "idea": "A REST API for managing a todo list",
  "projectName": "todo-service"
}
```

### Check Status
```http
GET /api/status/:projectId
```

### Stop Service
```http
DELETE /api/projects/:projectId
```

### Health Check
```http
GET /api/health
```

## Architecture

```
backend/
├── src/
│   ├── server.js      # Express server and API endpoints
│   ├── watsonx.js     # IBM watsonx.ai integration
│   ├── docker.js      # Docker build and run operations
│   └── files.js       # File system operations
├── generated/         # Generated project files (gitignored)
├── package.json
└── .env              # Environment variables (gitignored)
```

## How It Works

1. **User submits idea** → POST /api/generate
2. **watsonx.ai generates code** → Using Granite model
3. **Files written to disk** → In generated/ directory
4. **Docker image built** → Using go-service.Dockerfile
5. **Container started** → Service runs on port 8080
6. **Preview URL returned** → User can test the service

## Error Handling

- If watsonx.ai is unavailable, falls back to template-based generation
- Automatic cleanup on build failures
- Port conflict resolution
- Health check validation before marking service as ready

## Development

Run in development mode:
```bash
npm run dev
```

## Troubleshooting

### Port 8080 already in use
The system will automatically stop any existing container using port 8080.

### Docker build fails
Check Docker logs and ensure Docker daemon is running.

### watsonx.ai timeout
The system will fall back to template-based generation after 30 seconds.

## License

ISC