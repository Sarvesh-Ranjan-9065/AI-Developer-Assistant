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

function createPrompt(idea, projectName) {
  return `Generate a complete Go REST API service.

IDEA: "${idea}"
PROJECT: "${projectName}"

REQUIREMENTS:
1. Single main.go file with HTTP server
2. CRUD endpoints based on the idea
3. In-memory data store (no database)
4. JSON responses
5. CORS enabled
6. Runs on port 8080
7. Include a /health endpoint for health checks

OUTPUT FORMAT (JSON):
{
  "files": [
    {
      "path": "main.go",
      "content": "package main\\n\\nimport (\\n\\t\\"encoding/json\\"..."
    },
    {
      "path": "go.mod",
      "content": "module ${projectName}\\n\\ngo 1.21"
    }
  ],
  "endpoints": [
    "GET /health - Health check",
    "GET /items - List all items",
    "POST /items - Create an item"
  ]
}

Generate the complete JSON response with all necessary Go code.`;
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
      },
      timeout: 30000  // 30 second timeout
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
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonStr);
  }
  
  throw new Error('Failed to parse generated code from watsonx.ai response');
}

// Fallback template-based generation if watsonx.ai fails
function generateFromTemplate(idea, projectName) {
  return {
    files: [
      {
        path: 'main.go',
        content: `package main

import (
\t"encoding/json"
\t"log"
\t"net/http"
\t"sync"
)

type Item struct {
\tID   string \`json:"id"\`
\tName string \`json:"name"\`
}

var (
\titems = make(map[string]Item)
\tmu    sync.RWMutex
\tnextID = 1
)

func enableCORS(w http.ResponseWriter) {
\tw.Header().Set("Access-Control-Allow-Origin", "*")
\tw.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
\tw.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
\tenableCORS(w)
\tw.Header().Set("Content-Type", "application/json")
\tjson.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

func main() {
\thttp.HandleFunc("/health", healthHandler)
\t
\tlog.Println("Server starting on :8080")
\tlog.Fatal(http.ListenAndServe(":8080", nil))
}
`
      },
      {
        path: 'go.mod',
        content: `module ${projectName}

go 1.21
`
      }
    ],
    endpoints: [
      'GET /health - Health check'
    ]
  };
}

module.exports = { generateGoService, generateFromTemplate };

// Made with Bob
