# 🚀 Quick Start Guide

Get the AI Developer Assistant running in 5 minutes!

---

## ⚡ Super Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure credentials
cp .env.example .env
# Edit .env with your watsonx.ai credentials

# 3. Start server
npm start

# 4. Open browser
# http://localhost:3000
```

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] **Node.js 18+** installed
  ```bash
  node --version  # Should show v18.x or higher
  ```

- [ ] **Docker** installed and running
  ```bash
  docker --version  # Should show version info
  docker ps        # Should connect without errors
  ```

- [ ] **IBM watsonx.ai credentials**
  - IAM API Key
  - Project ID
  - Get them from: https://cloud.ibm.com/watsonx

---

## 🔧 Step-by-Step Setup

### Step 1: Install Dependencies (1 minute)

```bash
# Navigate to backend directory
cd backend

# Install Node.js packages
npm install

# You should see:
# ✓ added 79 packages
```

### Step 2: Configure Environment (2 minutes)

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor
# Windows: notepad .env
# Mac/Linux: nano .env
```

**Edit the .env file:**
```env
PORT=3000
WATSONX_API_KEY=your_actual_api_key_here
WATSONX_PROJECT_ID=your_actual_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

**How to get credentials:**

1. Go to https://cloud.ibm.com/watsonx
2. Log in with your IBM Cloud account
3. Navigate to your watsonx.ai project
4. Click on "Developer access" or "Manage" → "Access (IAM)"
5. Copy your **IAM API Key**
6. Copy your **Project ID** (found in project settings)

### Step 3: Start the Server (30 seconds)

```bash
# Make sure you're in the backend directory
npm start

# You should see:
# 🚀 AI Developer Assistant Backend running on port 3000
# 📝 API endpoints:
#    POST   http://localhost:3000/api/generate
#    GET    http://localhost:3000/api/status/:projectId
#    DELETE http://localhost:3000/api/projects/:projectId
#    GET    http://localhost:3000/api/health
```

### Step 4: Open in Browser (10 seconds)

Open your browser and go to:
```
http://localhost:3000
```

You should see the AI Developer Assistant interface!

---

## 🎯 First Service Generation

### Try This Example:

1. **Select Domain:** "Book Library"

2. **Describe Service:**
   ```
   A REST API for managing books with CRUD operations.
   Include fields for title, author, ISBN, and publication year.
   ```

3. **Click:** "Generate Service with watsonx.ai"

4. **Watch:** Real-time progress and logs

5. **Preview:** Service loads in iframe when ready

6. **Test:** Try the endpoints directly in the preview

---

## ✅ Verification Checklist

After starting, verify everything works:

- [ ] Backend server started without errors
- [ ] Browser shows the frontend interface
- [ ] Form is visible and interactive
- [ ] No console errors in browser (F12)

**Test the health endpoint:**
```bash
curl http://localhost:3000/api/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
cd backend
npm install
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
# Kill the process using that port

# Or change port in .env
PORT=3001
```

### Issue: "Docker daemon not running"

**Solution:**
- Start Docker Desktop
- Wait for it to fully start
- Try again

### Issue: "watsonx.ai authentication failed"

**Solution:**
- Verify your API key in `.env`
- Check it's not expired
- Ensure no extra spaces in the key
- Try regenerating the key in IBM Cloud

### Issue: "Port 8080 already in use"

**Solution:**
```bash
# Stop any existing containers
docker stop $(docker ps -q --filter "publish=8080")

# Or the system will auto-stop them
```

---

## 🎓 Next Steps

Once everything is running:

1. **Generate Your First Service**
   - Try the book library example above
   - Watch the real-time progress
   - Test the generated endpoints

2. **Explore Different Domains**
   - Todo Management
   - User Management
   - Product Catalog
   - Custom ideas

3. **Test the Preview**
   - Use the embedded iframe
   - Open in new tab
   - Test all endpoints

4. **Stop and Restart**
   - Click "Stop Service"
   - Generate a new service
   - See how fast it is!

---

## 📚 Additional Resources

- **Main README:** `README.md` - Complete project documentation
- **Backend Docs:** `backend/README.md` - Backend API details
- **Frontend Docs:** `public/README.md` - Frontend features
- **Phase 1 Docs:** `PHASE1_COMPLETE.md` - Backend implementation
- **Phase 2 Docs:** `PHASE2_COMPLETE.md` - Frontend implementation

---

## 🆘 Getting Help

If you're stuck:

1. **Check the logs:**
   ```bash
   # Backend logs in terminal
   # Browser logs in DevTools (F12)
   ```

2. **Verify configuration:**
   ```bash
   cat backend/.env  # Check credentials
   docker ps         # Check Docker
   node --version    # Check Node.js
   ```

3. **Restart everything:**
   ```bash
   # Stop server (Ctrl+C)
   # Restart Docker Desktop
   # Start server again
   npm start
   ```

4. **Review documentation:**
   - Read the troubleshooting section in README.md
   - Check backend/README.md for API details

---

## 🎉 Success!

If you see the frontend and can generate a service, you're all set!

**What you've accomplished:**
- ✅ Installed and configured the AI Developer Assistant
- ✅ Connected to IBM watsonx.ai
- ✅ Set up Docker integration
- ✅ Ready to generate Go microservices

**Now you can:**
- Turn ideas into running services in under 2 minutes
- Test services with live preview
- Showcase IBM's AI capabilities
- Build microservices 98% faster

---

## 🚀 Ready to Build!

```bash
# Start the server
cd backend && npm start

# Open browser
# http://localhost:3000

# Generate your first service!
```

**Happy coding! 🎊**