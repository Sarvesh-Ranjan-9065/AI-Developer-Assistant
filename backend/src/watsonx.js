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
  return `You are a Go code generator. Generate a complete, syntactically correct Go REST API service.

IDEA: "${idea}"
PROJECT: "${projectName}"

CRITICAL REQUIREMENTS:
1. Generate ONLY valid, compilable Go code
2. Single main.go file with complete HTTP server
3. CRUD endpoints based on the idea
4. In-memory data store using sync.RWMutex
5. JSON responses with proper error handling
6. CORS enabled on all endpoints
7. Runs on port 8080
8. MUST include /health endpoint that returns {"status":"healthy"}
9. All functions must be complete with proper closing braces
10. No syntax errors, no incomplete statements

STRICT OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "files": [
    {
      "path": "main.go",
      "content": "<COMPLETE Go code here - ensure all braces are closed>"
    },
    {
      "path": "go.mod",
      "content": "module ${projectName}\\n\\ngo 1.21"
    }
  ],
  "endpoints": [
    "GET /health - Health check",
    "GET /items - List items",
    "POST /items - Create item"
  ]
}

IMPORTANT:
- Ensure ALL functions have matching opening and closing braces
- Ensure ALL structs are properly closed
- No incomplete statements
- No syntax errors
- Test that the code would compile

Generate the complete JSON response now:`;
}

async function generateGoService(idea, projectName) {
  try {
    const prompt = createPrompt(idea, projectName);
    const token = await getIAMToken();
    
    console.log('Calling watsonx.ai to generate Go service...');
    const response = await axios.post(
      `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        model_id: 'ibm/granite-3-8b-instruct',
        input: prompt,
        parameters: {
          max_new_tokens: 4000,
          temperature: 0.5,  // Lower temperature for more consistent output
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
    
    const generatedText = response.data.results[0].generated_text;
    console.log('Received response from watsonx.ai, parsing...');
    
    try {
      const result = parseGeneratedCode(generatedText);
      console.log('Successfully parsed watsonx.ai response');
      return result;
    } catch (parseError) {
      console.warn('Failed to parse watsonx.ai response:', parseError.message);
      console.log('Falling back to template-based generation');
      return generateFromTemplate(idea, projectName);
    }
  } catch (error) {
    console.error('watsonx.ai generation failed:', error.message);
    console.log('Using template-based generation as fallback');
    return generateFromTemplate(idea, projectName);
  }
}

function parseGeneratedCode(generatedText) {
  try {
    // Extract JSON from the generated text
    // watsonx.ai may wrap the JSON in markdown code blocks
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) ||
                      generatedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate the structure
      if (!parsed.files || !Array.isArray(parsed.files)) {
        throw new Error('Invalid response structure: missing files array');
      }
      
      // Find main.go file
      const mainGoFile = parsed.files.find(f => f.path === 'main.go');
      if (!mainGoFile || !mainGoFile.content) {
        throw new Error('Invalid response: missing main.go file');
      }
      
      // Validate Go syntax basics
      const goCode = mainGoFile.content;
      if (!goCode.includes('package main')) {
        throw new Error('Invalid Go code: missing package main');
      }
      if (!goCode.includes('func main()')) {
        throw new Error('Invalid Go code: missing main function');
      }
      
      // Check for common syntax errors
      const openBraces = (goCode.match(/\{/g) || []).length;
      const closeBraces = (goCode.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        throw new Error(`Invalid Go code: mismatched braces (${openBraces} open, ${closeBraces} close)`);
      }
      
      return parsed;
    }
    
    throw new Error('Failed to extract JSON from watsonx.ai response');
  } catch (error) {
    console.error('Parse error:', error.message);
    console.error('Generated text preview:', generatedText.substring(0, 500));
    throw error;
  }
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
\t"fmt"
\t"log"
\t"net/http"
\t"strconv"
\t"sync"
)

type Item struct {
\tID   int    \`json:"id"\`
\tName string \`json:"name"\`
}

var (
\titems = make(map[int]Item)
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

func itemsHandler(w http.ResponseWriter, r *http.Request) {
\tenableCORS(w)
\tw.Header().Set("Content-Type", "application/json")
\t
\tif r.Method == "OPTIONS" {
\t\tw.WriteHeader(http.StatusOK)
\t\treturn
\t}
\t
\tswitch r.Method {
\tcase "GET":
\t\tmu.RLock()
\t\titemList := make([]Item, 0, len(items))
\t\tfor _, item := range items {
\t\t\titemList = append(itemList, item)
\t\t}
\t\tmu.RUnlock()
\t\tjson.NewEncoder(w).Encode(itemList)
\t\t
\tcase "POST":
\t\tvar item Item
\t\tif err := json.NewDecoder(r.Body).Decode(&item); err != nil {
\t\t\thttp.Error(w, err.Error(), http.StatusBadRequest)
\t\t\treturn
\t\t}
\t\t
\t\tmu.Lock()
\t\titem.ID = nextID
\t\tnextID++
\t\titems[item.ID] = item
\t\tmu.Unlock()
\t\t
\t\tw.WriteHeader(http.StatusCreated)
\t\tjson.NewEncoder(w).Encode(item)
\t\t
\tdefault:
\t\thttp.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
\t}
}

func itemHandler(w http.ResponseWriter, r *http.Request) {
\tenableCORS(w)
\tw.Header().Set("Content-Type", "application/json")
\t
\tif r.Method == "OPTIONS" {
\t\tw.WriteHeader(http.StatusOK)
\t\treturn
\t}
\t
\t// Extract ID from URL path
\tidStr := r.URL.Path[len("/items/"):]
\tid, err := strconv.Atoi(idStr)
\tif err != nil {
\t\thttp.Error(w, "Invalid ID", http.StatusBadRequest)
\t\treturn
\t}
\t
\tswitch r.Method {
\tcase "GET":
\t\tmu.RLock()
\t\titem, exists := items[id]
\t\tmu.RUnlock()
\t\t
\t\tif !exists {
\t\t\thttp.Error(w, "Item not found", http.StatusNotFound)
\t\t\treturn
\t\t}
\t\tjson.NewEncoder(w).Encode(item)
\t\t
\tcase "PUT":
\t\tvar item Item
\t\tif err := json.NewDecoder(r.Body).Decode(&item); err != nil {
\t\t\thttp.Error(w, err.Error(), http.StatusBadRequest)
\t\t\treturn
\t\t}
\t\t
\t\tmu.Lock()
\t\tif _, exists := items[id]; !exists {
\t\t\tmu.Unlock()
\t\t\thttp.Error(w, "Item not found", http.StatusNotFound)
\t\t\treturn
\t\t}
\t\titem.ID = id
\t\titems[id] = item
\t\tmu.Unlock()
\t\t
\t\tjson.NewEncoder(w).Encode(item)
\t\t
\tcase "DELETE":
\t\tmu.Lock()
\t\tif _, exists := items[id]; !exists {
\t\t\tmu.Unlock()
\t\t\thttp.Error(w, "Item not found", http.StatusNotFound)
\t\t\treturn
\t\t}
\t\tdelete(items, id)
\t\tmu.Unlock()
\t\t
\t\tw.WriteHeader(http.StatusNoContent)
\t\t
\tdefault:
\t\thttp.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
\t}
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
\tenableCORS(w)
\tw.Header().Set("Content-Type", "application/json")
\t
\tif r.URL.Path != "/" {
\t\thttp.NotFound(w, r)
\t\treturn
\t}
\t
\tinfo := map[string]interface{}{
\t\t"service": "${projectName}",
\t\t"idea": "${idea}",
\t\t"endpoints": []string{
\t\t\t"GET /health - Health check",
\t\t\t"GET / - Service info",
\t\t\t"GET /items - List all items",
\t\t\t"POST /items - Create an item",
\t\t\t"GET /items/:id - Get an item",
\t\t\t"PUT /items/:id - Update an item",
\t\t\t"DELETE /items/:id - Delete an item",
\t\t},
\t}
\tjson.NewEncoder(w).Encode(info)
}

func main() {
\thttp.HandleFunc("/health", healthHandler)
\thttp.HandleFunc("/", rootHandler)
\thttp.HandleFunc("/items", itemsHandler)
\thttp.HandleFunc("/items/", itemHandler)
\t
\tfmt.Println("=================================")
\tfmt.Println("Service: ${projectName}")
\tfmt.Println("Idea: ${idea}")
\tfmt.Println("Server starting on :8080")
\tfmt.Println("=================================")
\tfmt.Println("Available endpoints:")
\tfmt.Println("  GET    /health")
\tfmt.Println("  GET    /")
\tfmt.Println("  GET    /items")
\tfmt.Println("  POST   /items")
\tfmt.Println("  GET    /items/:id")
\tfmt.Println("  PUT    /items/:id")
\tfmt.Println("  DELETE /items/:id")
\tfmt.Println("=================================")
\t
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
      'GET /health - Health check',
      'GET / - Service info',
      'GET /items - List all items',
      'POST /items - Create an item',
      'GET /items/:id - Get an item',
      'PUT /items/:id - Update an item',
      'DELETE /items/:id - Delete an item'
    ]
  };
}

module.exports = { generateGoService, generateFromTemplate };

// Made with Bob
