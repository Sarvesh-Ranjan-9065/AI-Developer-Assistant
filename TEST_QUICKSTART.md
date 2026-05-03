# Quick Testing Guide - Phase 3

## 🚀 5-Minute Quick Test

### Prerequisites Check
```bash
# 1. Backend running?
curl http://localhost:3000/api/health
# Expected: {"status":"healthy","timestamp":"..."}

# 2. Docker running?
docker --version
docker ps

# 3. Port 8080 free?
netstat -ano | findstr :8080
# Expected: No output (port is free)
```

### Test Execution

#### Step 1: Open Frontend
1. Open browser: `http://localhost:3000`
2. Verify page loads with no console errors
3. Check all UI elements visible

#### Step 2: Generate Service
1. **Select Domain:** `todo`
2. **Enter Description:** 
   ```
   A REST API for managing a todo list with create, read, update, and delete operations
   ```
3. Click **"Generate Project"**

#### Step 3: Watch Progress
- Progress bar should animate 0% → 100%
- Logs should appear in real-time:
  - "→ Calling IBM watsonx.ai..."
  - "✓ Code generated" or "⚠ Using fallback template"
  - "→ Writing files..."
  - "✓ Files written"
  - "→ Building Docker image..."
  - "✓ Docker image built"
  - "→ Starting container..."
  - "✓ Container started"
  - "🎉 Service is ready!"

#### Step 4: Test Service
1. Preview panel should appear
2. Iframe should load `http://localhost:8080`
3. Test health endpoint:
   ```bash
   curl http://localhost:8080/health
   ```
4. Expected response: `{"status":"healthy"}`

#### Step 5: Stop Service
1. Click **"Stop Service"** button
2. Confirm in dialog
3. Verify cleanup:
   ```bash
   docker ps  # Should show no containers
   ```

---

## ✅ Success Criteria

- [ ] Complete workflow in <2 minutes
- [ ] No errors in browser console
- [ ] Service responds at http://localhost:8080
- [ ] Stop service cleans up completely

---

## 🐛 Common Issues

### Issue: "Port 8080 already in use"
```bash
# Stop existing container
docker ps
docker stop [container_name]
```

### Issue: "watsonx.ai timeout"
- Check `.env` file has valid credentials
- Fallback template should activate automatically
- Service should still generate successfully

### Issue: "Docker build failed"
```bash
# Check Docker is running
docker info

# Check Dockerfile exists
ls docker/go-service.Dockerfile
```

---

## 📊 Test Different Domains

Try these examples:

### Example 1: Book Library
- **Domain:** book
- **Description:** "A REST API for managing a library with books and authors"

### Example 2: User Management
- **Domain:** user
- **Description:** "A REST API for user registration and authentication"

### Example 3: Product Catalog
- **Domain:** product
- **Description:** "A REST API for an e-commerce product catalog"

### Example 4: Custom Service
- **Domain:** custom
- **Description:** "A REST API for tracking fitness workouts and exercises"

---

## 🎯 Ready for Demo?

Before the hackathon demo:

1. **Test the full flow 3 times** - Ensure consistency
2. **Prepare 2 backup examples** - In case of issues
3. **Check watsonx.ai connectivity** - Verify API works
4. **Clear Docker cache** - Fresh start
5. **Practice timing** - Should complete in <2 minutes

---

**Time to test! 🚀**