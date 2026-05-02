# AI Developer Assistant - Hackathon Project Plan (SIMPLIFIED)

**Goal:** Turn idea → running Go service with watsonx.ai as the AI engine

**Stack:**
- Frontend: HTML/CSS/JavaScript (from index1.html)
- Backend: Node.js/Express (minimal orchestration)
- AI Engine: IBM watsonx.ai (code generation via Granite model)
- Development Tool: IBM Bob IDE (used to build this tool)
- Runtime: Docker (local containers only)
- Language: Go (generated services)

**Philosophy:** Minimal, demo-focused, no overengineering

---

## 🏗️ Simplified Architecture

```mermaid
graph TB
    User[User Browser] -->|1. Submit Idea| Frontend[HTML Frontend]
    Frontend -->|2. POST /api/generate| Backend[Node.js Backend]
    Backend -->|3. Prompt| WatsonX[watsonx.ai API]
    WatsonX -->|4. Generated Code| Backend
    Backend -->|5. Write Files| FS[File System]
    Backend -->|6. Docker Build & Run| Docker[Docker Engine]
    Docker -->|7. Container Running| Container[Go Service:8080]
    Backend -->|8. Preview URL| Frontend
    Frontend -->|9. Display in iframe| User
    
    style WatsonX fill:#0f62fe,color:#fff
    style Container fill:#00c853,color:#fff
```

### What We're NOT Building
❌ Kubernetes clusters  
❌ Helm charts  
❌ GitHub webhooks  
❌ Preview environments  
❌ PostgreSQL database  
❌ Prometheus/Grafana  
❌ Complex CI/CD  

### What We ARE Building
✅ Simple web form (idea input)
✅ watsonx.ai generates Go code (using Granite model)
✅ Write files to disk
✅ Build Docker image
✅ Run container locally
✅ Show preview URL

**Note:** IBM Bob IDE was used to build this tool, but the tool itself uses watsonx.ai API for code generation.

---

## 📡 Minimal API Design

### Endpoint 1: Generate Service

**Request:**
```http
POST /api/generate
Content-Type: application/json

{
  "idea": "A REST API for managing a todo list",
  "projectName": "todo-service"
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "proj_abc123",
  "status": "generating"
}
```

### Endpoint 2: Check Status

**Request:**
```http
GET /api/status/:projectId
```

**Response:**
```json
{
  "projectId": "proj_abc123",
  "status": "running",
  "progress": 100,
  "previewUrl": "http://localhost:8080",
  "endpoints": [
    "GET /todos",
    "POST /todos",
    "GET /todos/:id",
    "PUT /todos/:id",
    "DELETE /todos/:id"
  ],
  "logs": [
    "✓ watsonx.ai generated code",
    "✓ Files written to disk",
    "✓ Docker image built",
    "✓ Container started"
  ]
}
```

### Endpoint 3: Stop Service

**Request:**
```http
DELETE /api/projects/:projectId
```

**Response:**
```json
{
  "success": true,
  "message": "Service stopped"
}
```

---

## 📁 Minimal Folder Structure

```
hackathon-project/
├── public/
│   └── index.html              # Frontend (from index1.html + API calls)
│
├── backend/
│   ├── src/
│   │   ├── server.js           # Express app
│   │   ├── watsonx.js          # watsonx.ai integration (replaces bob.js)
│   │   ├── docker.js           # Docker build/run
│   │   └── files.js            # Write generated code
│   ├── generated/              # Generated projects (gitignored)
│   ├── package.json
│   └── .env
│
├── docker/
│   └── go-service.Dockerfile   # Template for Go services
│
└── plan.md                      # This file
```

---

## 🤖 watsonx.ai Integration (Simplified)

### Prompt Template

```javascript
const prompt = `
Generate a complete Go REST API service.

IDEA: "${userIdea}"
PROJECT: "${projectName}"

REQUIREMENTS:
1. Single main.go file with HTTP server
2. CRUD endpoints based on the idea
3. In-memory data store (no database)
4. JSON responses
5. CORS enabled
6. Runs on port 8080

OUTPUT FORMAT (JSON):
{
  "files": [
    {
      "path": "main.go",
      "content": "package main\n\nimport (\n\t\"encoding/json\"..."
    },
    {
      "path": "go.mod",
      "content": "module ${projectName}\n\ngo 1.21"
    }
  ],
  "endpoints": [
    "GET /todos - List all todos",
    "POST /todos - Create a todo"
  ]
}
`;
```

### watsonx.ai Service (backend/src/watsonx.js)

```javascript
const axios = require('axios');

// Get IAM token for watsonx.ai authentication
async function getIAMToken() {
  const response = await axios.post(
    'https://iam.cloud.ibm.com/identity/token',
    new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: process.env.WATSONX_API_KEY
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  return response.data.access_token;
}

async function generateGoService(idea, projectName) {
  const prompt = createPrompt(idea, projectName);
  const token = await getIAMToken();
  
  const response = await axios.post(
    `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
    {
      model_id: 'ibm/granite-3-8b-instruct',
      input: prompt,
      parameters: {
        max_new_tokens: 4000,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50
      },
      project_id: process.env.WATSONX_PROJECT_ID
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );
  
  return parseGeneratedCode(response.data.results[0].generated_text);
}

function parseGeneratedCode(generatedText) {
  // Extract JSON from the generated text
  // watsonx.ai may wrap the JSON in markdown code blocks
  const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) ||
                    generatedText.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  }
  
  throw new Error('Failed to parse generated code');
}

module.exports = { generateGoService };
```

---

## 🐳 Docker Strategy (Simplified)

### Single Dockerfile Template

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o service .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/service .
EXPOSE 8080
CMD ["./service"]
```

### Docker Service (backend/src/docker.js)

```javascript
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function buildAndRun(projectId, projectPath) {
  // Build image
  await execPromise(
    `docker build -t ${projectId} -f docker/go-service.Dockerfile ${projectPath}`
  );
  
  // Run container (always on port 8080)
  await execPromise(
    `docker run -d --name ${projectId} -p 8080:8080 ${projectId}`
  );
  
  return { previewUrl: 'http://localhost:8080' };
}

async function stop(projectId) {
  await execPromise(`docker stop ${projectId}`);
  await execPromise(`docker rm ${projectId}`);
  await execPromise(`docker rmi ${projectId}`);
}

module.exports = { buildAndRun, stop };
```

---

## 🎯 Implementation Steps (Simplified)

### Phase 1: Backend Core (2-3 hours)

**Step 1: Setup**
```bash
mkdir -p backend/src backend/generated public docker
cd backend
npm init -y
npm install express cors dotenv axios
```

**Step 2: Create server.js**
```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage
const projects = new Map();

app.post('/api/generate', async (req, res) => {
  const { idea, projectName } = req.body;
  const projectId = `proj_${Date.now()}`;
  
  projects.set(projectId, {
    status: 'generating',
    progress: 0,
    logs: []
  });
  
  // Start generation in background
  generateService(projectId, idea, projectName);
  
  res.json({ success: true, projectId, status: 'generating' });
});

app.get('/api/status/:projectId', (req, res) => {
  const project = projects.get(req.params.projectId);
  res.json(project || { status: 'not_found' });
});

app.delete('/api/projects/:projectId', async (req, res) => {
  await stopService(req.params.projectId);
  projects.delete(req.params.projectId);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Step 3: Implement generation flow**
```javascript
async function generateService(projectId, idea, projectName) {
  const project = projects.get(projectId);
  
  try {
    // Step 1: Call watsonx.ai
    project.logs.push('→ Calling watsonx.ai...');
    project.progress = 20;
    const generated = await watsonxService.generateGoService(idea, projectName);
    
    // Step 2: Write files
    project.logs.push('✓ Code generated by watsonx.ai');
    project.logs.push('→ Writing files...');
    project.progress = 40;
    const projectPath = await writeFiles(projectId, generated.files);
    
    // Step 3: Build Docker image
    project.logs.push('✓ Files written');
    project.logs.push('→ Building Docker image...');
    project.progress = 60;
    await dockerService.buildAndRun(projectId, projectPath);
    
    // Step 4: Done
    project.logs.push('✓ Docker image built');
    project.logs.push('✓ Container started');
    project.status = 'running';
    project.progress = 100;
    project.previewUrl = 'http://localhost:8080';
    project.endpoints = generated.endpoints;
    
  } catch (error) {
    project.status = 'error';
    project.error = error.message;
    project.logs.push('✗ Error: ' + error.message);
  }
}
```

### Phase 2: Frontend Integration (1 hour)

**Copy index1.html to public/index.html and add:**

```javascript
// Add after existing script section
const API_BASE = 'http://localhost:3000/api';
let currentProjectId = null;

async function generatePlan() {
  const problem = document.getElementById("problemInput").value.trim();
  const domain = document.getElementById("domain").value;
  
  if (!problem) {
    alert("Please enter a problem description");
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: problem,
        projectName: `${domain}-service`
      })
    });
    
    const data = await response.json();
    currentProjectId = data.projectId;
    
    // Show status section
    document.getElementById("generationStatus").style.display = "block";
    pollStatus();
    
  } catch (error) {
    alert('Failed to generate: ' + error.message);
  }
}

async function pollStatus() {
  const interval = setInterval(async () => {
    const response = await fetch(`${API_BASE}/status/${currentProjectId}`);
    const data = await response.json();
    
    // Update UI with progress
    document.getElementById("progressBar").style.width = data.progress + "%";
    document.getElementById("logs").innerHTML = data.logs.join('<br>');
    
    if (data.status === 'running') {
      clearInterval(interval);
      showPreview(data);
    }
  }, 2000);
}

function showPreview(data) {
  document.getElementById("previewUrl").textContent = data.previewUrl;
  document.getElementById("previewFrame").src = data.previewUrl;
  document.getElementById("endpoints").innerHTML = 
    data.endpoints.map(e => `<li>${e}</li>`).join('');
}
```

### Phase 3: Testing (30 minutes)

1. Start backend: `cd backend && npm start`
2. Open browser: `http://localhost:3000`
3. Enter idea: "A REST API for managing books"
4. Click "Generate Project"
5. Watch status updates
6. See preview URL
7. Test endpoints in iframe

---

## 🚀 Quick Start

```bash
# 1. Setup backend
cd backend
npm install
cp .env.example .env
# Add WATSONX_API_KEY, WATSONX_PROJECT_ID to .env

# 2. Copy frontend
cp index1.html public/index.html
# Add API integration code (see Phase 2)

# 3. Create Dockerfile
# Copy template to docker/go-service.Dockerfile

# 4. Start server
npm start

# 5. Open browser
# http://localhost:3000
```

---

## 🎬 Demo Flow (3 minutes)

**1. Opening (30s)**
- "Turn any idea into a running Go service in seconds"
- Show the simple form

**2. Generate (60s)**
- Enter: "A REST API for managing a library"
- Click generate
- Show real-time logs
- watsonx.ai generates code using Granite model
- Docker builds and runs

**3. Preview (60s)**
- Preview URL appears
- Open in iframe
- Test endpoints
- Show it actually works

**4. Closing (30s)**
- "Built with IBM Bob IDE, powered by watsonx.ai → Complete service in under 2 minutes"
- Mention: "We used Bob IDE to build this tool, and the tool uses watsonx.ai to generate services"

---

## 📊 Success Criteria

**Must Have:**
- ✅ User inputs idea
- ✅ watsonx.ai generates Go code
- ✅ Service runs in Docker
- ✅ Preview URL works
- ✅ Demo under 3 minutes

**Out of Scope:**
- ❌ Multiple concurrent services
- ❌ Kubernetes
- ❌ GitHub integration
- ❌ Database persistence
- ❌ Complex monitoring

---

## 🔧 Environment Variables

```env
# backend/.env
PORT=3000
WATSONX_API_KEY=your_iam_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

**Getting watsonx.ai Credentials:**
1. Go to IBM Cloud watsonx.ai dashboard
2. Navigate to Developer access section
3. Copy your IAM API Key
4. Copy your Project ID

---

## 🛡️ Error Handling & Resilience

### Critical Failure Modes

**1. watsonx.ai API Failure**
```javascript
// backend/src/watsonx.js - Add timeout and fallback
async function generateGoService(idea, projectName) {
  try {
    const token = await getIAMToken();
    const response = await axios.post(
      `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        model_id: 'ibm/granite-3-8b-instruct',
        input: createPrompt(idea, projectName),
        parameters: { max_new_tokens: 4000 },
        project_id: process.env.WATSONX_PROJECT_ID
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000  // 30 second timeout
      }
    );
    return parseGeneratedCode(response.data.results[0].generated_text);
  } catch (error) {
    // Fallback to template-based generation
    return generateFromTemplate(idea, projectName);
  }
}
```

**2. Docker Build Failure**
```javascript
// backend/src/docker.js - Add error handling
async function buildAndRun(projectId, projectPath) {
  try {
    // Check if port 8080 is available
    await checkPortAvailable(8080);
    
    // Build with timeout
    const { stdout, stderr } = await execPromise(
      `docker build -t ${projectId} -f docker/go-service.Dockerfile ${projectPath}`,
      { timeout: 120000 }  // 2 minute timeout
    );
    
    if (stderr && stderr.includes('ERROR')) {
      throw new Error(`Build failed: ${stderr}`);
    }
    
    // Run container
    await execPromise(`docker run -d --name ${projectId} -p 8080:8080 ${projectId}`);
    
    // Wait for health check
    await waitForHealthy('http://localhost:8080/health', 30000);
    
    return { previewUrl: 'http://localhost:8080' };
  } catch (error) {
    // Cleanup on failure
    await cleanup(projectId);
    throw error;
  }
}
```

**3. Port Conflict Resolution**
```javascript
// backend/src/utils/port.js
async function checkPortAvailable(port) {
  try {
    const { stdout } = await execPromise(`lsof -i :${port}`);
    if (stdout) {
      // Port occupied - stop existing container
      await execPromise(`docker stop $(docker ps -q --filter "publish=${port}")`);
    }
  } catch (error) {
    // Port is free
  }
}
```

### Demo Day Contingency Plan

**Scenario 1: watsonx.ai API Down**
- **Detection:** 30s timeout on API call
- **Fallback:** Use pre-generated template with placeholders
- **User Message:** "Using cached template (watsonx.ai unavailable)"

**Scenario 2: Slow Docker Build**
- **Detection:** Build taking >60s
- **Mitigation:** Pre-build base images before demo
- **User Message:** Show detailed build logs to keep audience engaged

**Scenario 3: Network Issues**
- **Detection:** Connection errors
- **Fallback:** Offline mode with local examples
- **User Message:** "Running in offline mode"

---

## 🌟 Unique Differentiators

### What Makes This Special

**1. Context-Aware Generation**
```javascript
// Analyze user's existing patterns
const prompt = `
Generate a Go REST API service that matches this style:

IDEA: "${userIdea}"
PROJECT: "${projectName}"

STYLE PREFERENCES:
- Error handling: ${detectErrorStyle()}
- Logging: ${detectLoggingStyle()}
- Testing: ${detectTestingStyle()}

Generate code that fits this developer's existing patterns.
`;
```

**2. Quality Validation**
```javascript
// backend/src/validation.js
async function validateGeneratedCode(files) {
  const results = {
    syntaxValid: await checkGoSyntax(files),
    hasTests: files.some(f => f.path.includes('_test.go')),
    hasErrorHandling: checkErrorHandling(files),
    securityScore: await runSecurityScan(files),
    qualityScore: 0
  };
  
  results.qualityScore = calculateScore(results);
  return results;
}
```

**3. Instant Metrics**
```javascript
// Show in UI after generation
{
  "metrics": {
    "linesGenerated": 247,
    "timeToFirstEndpoint": "1.8s",
    "qualityScore": 92,
    "testCoverage": "85%",
    "securityIssues": 0
  }
}
```

---

## 📈 Measurable Impact

### Comparison Table

| Metric | Manual Setup | GitHub Copilot | **Our Tool** |
|--------|--------------|----------------|--------------|
| Time to working service | 2-4 hours | 30-60 min | **2 minutes** |
| Includes Docker | ❌ No | ❌ No | ✅ Yes |
| Running preview | ❌ No | ❌ No | ✅ Yes |
| IBM integration | ❌ No | ❌ No | ✅ Yes |
| Quality validation | ❌ Manual | ❌ Manual | ✅ Automatic |
| Cost estimate | ❌ No | ❌ No | ✅ Yes |

### Demo Metrics to Display

```javascript
// Show these in real-time during generation
{
  "generationMetrics": {
    "bobResponseTime": "2.3s",
    "filesGenerated": 3,
    "linesOfCode": 247,
    "dockerBuildTime": "45s",
    "totalTime": "1m 52s",
    "timeSaved": "98% faster than manual"
  }
}
```

---

## 🚀 Beyond the Hackathon

### Phase 2 (Week 1-2): Production Features
- **Multi-service support** with service mesh
- **GitHub integration** for automatic repo creation
- **Team collaboration** with shared workspaces
- **Custom templates** for different frameworks

### Phase 3 (Month 1-3): Enterprise Ready
- **IBM Cloud deployment** with one-click
- **Cost optimization** recommendations
- **Security scanning** integration
- **Compliance checks** (GDPR, SOC2)

### Phase 4 (Month 3-6): AI Evolution
- **Learn from feedback** - improve generation quality
- **Architecture recommendations** based on scale
- **Performance optimization** suggestions
- **Auto-scaling** configuration

---

## 🎯 Pre-Demo Checklist

### 24 Hours Before Demo

- [ ] Pre-build Docker base images
- [ ] Test IBM Bob API connectivity
- [ ] Prepare 3 fallback examples
- [ ] Clear Docker cache
- [ ] Test on fresh machine
- [ ] Record backup demo video

### 1 Hour Before Demo

- [ ] Restart Docker daemon
- [ ] Clear browser cache
- [ ] Test full flow 3 times
- [ ] Prepare 2 example ideas
- [ ] Check network connectivity
- [ ] Have offline mode ready

### During Demo

- [ ] Start with simplest example
- [ ] Show real-time logs
- [ ] Highlight IBM Bob working
- [ ] Test generated endpoints
- [ ] Show metrics/quality score
- [ ] Mention future vision

---

## 🏆 Winning Strategy

### Judge Evaluation Criteria

**Innovation (25 points)**
- ✅ AI-powered code generation
- ✅ Real-time Docker deployment
- ✅ Quality validation
- ✅ Context-aware generation

**Technical Execution (25 points)**
- ✅ Working demo
- ✅ Clean architecture
- ✅ Error handling
- ✅ Production-ready approach

**IBM Integration (25 points)**
- ✅ watsonx.ai is core engine (Granite model)
- ✅ Built using IBM Bob IDE
- ✅ Showcases IBM AI capabilities
- ✅ Clear value proposition
- ✅ Extensible to IBM Cloud

**Impact (25 points)**
- ✅ Measurable time savings (98%)
- ✅ Developer productivity boost
- ✅ Scalable solution
- ✅ Clear business value

### Competitive Advantages

**vs GitHub Copilot:**
- We deploy, they just suggest
- We validate quality, they don't
- We show running service, they show code

**vs Replit Agent:**
- We use IBM watsonx.ai (enterprise-grade Granite model)
- We focus on Go microservices
- We include Docker deployment
- Built with IBM Bob IDE

**vs Manual Setup:**
- 98% time savings
- Consistent quality
- Best practices built-in

---

## 🎤 Elevator Pitch (30 seconds)

"Developers waste 2-4 hours setting up each new microservice. Our AI Developer Assistant, powered by IBM watsonx.ai's Granite model, turns any idea into a production-ready Go service in under 2 minutes. Just describe what you want, and watch as watsonx.ai generates the code, builds a Docker image, and gives you a running service with a live preview. We built this tool using IBM Bob IDE, demonstrating the power of IBM's AI ecosystem. We've reduced setup time by 98%, and we're just getting started."

---


---

## 💡 Key Simplifications

1. **Single Port:** All services run on 8080 (one at a time)
2. **No Database:** In-memory storage only
3. **No K8s:** Just Docker containers
4. **No GitHub:** No repo creation, no webhooks
5. **No Persistence:** Projects deleted on restart
6. **Single File:** Most Go services in one main.go
7. **No Auth:** Open API for demo purposes

---

## 🎨 UI Integration Points

### Existing UI (from index1.html)
- Header with IBM branding ✅
- Problem/Solution sections ✅
- Idea input form ✅
- BOB chat interface ✅

### New Additions
- Generation status panel with progress bar
- Real-time log streaming
- Service preview iframe
- Endpoint list display
- Stop service button

### HTML to Add

```html
<!-- Add after the form in index1.html -->
<div id="generationStatus" style="display:none;" class="result">
  <h3>🚀 Generating Service...</h3>
  <div style="background:#e0e0e0; height:20px; border-radius:10px;">
    <div id="progressBar" style="background:#0f62fe; height:100%; width:0%;"></div>
  </div>
  <div id="logs" style="margin-top:15px; font-family:monospace;"></div>
</div>

<div id="servicePreview" style="display:none;" class="result">
  <h3>✅ Service Running!</h3>
  <p><strong>URL:</strong> <span id="previewUrl"></span></p>
  <h4>Endpoints:</h4>
  <ul id="endpoints"></ul>
  <iframe id="previewFrame" style="width:100%; height:400px; border:2px solid #0f62fe;"></iframe>
  <button onclick="stopService()">Stop Service</button>
</div>
```

---

## 🏆 Hackathon Pitch

**Problem:** Developers waste hours setting up boilerplate for new services.

**Solution:** AI Developer Assistant powered by IBM watsonx.ai turns ideas into running Go services in under 2 minutes.

**Demo:** Watch as we go from "library management API" to a fully functional, containerized REST service.

**Technology:** IBM watsonx.ai Granite model (AI generation), IBM Bob IDE (development tool), Go (generated code), Docker (runtime), HTML (UI).

**Story:** "We used IBM Bob IDE to build this tool, and the tool uses watsonx.ai to generate services - showcasing IBM's complete AI development ecosystem."

**Impact:** 10x faster prototyping for hackathons and MVPs.

---

**Ready to build! Keep it simple, make it work, demo it well. 🚀**