# Test Execution Checklist - Phase 3

## 📋 Pre-Test Setup

### Environment Verification
- [ ] Backend server running on port 3000
- [ ] Docker daemon running
- [ ] Port 8080 available
- [ ] Browser ready (Chrome/Edge recommended)
- [ ] DevTools open for debugging

### Quick Verification Commands
```bash
# Backend health
curl http://localhost:3000/api/health

# Docker status
docker ps

# Port check
netstat -ano | findstr :8080
```

---

## 🧪 Test Execution (30 minutes)

### Test 1: Backend Health ✅
**Time:** 1 minute

- [ ] Run: `curl http://localhost:3000/api/health`
- [ ] Verify: `{"status":"healthy",...}`
- [ ] Check: Response time <500ms

**Result:** ⏳ Pending

---

### Test 2: Frontend Load ✅
**Time:** 2 minutes

- [ ] Open: `http://localhost:3000`
- [ ] Check: Page loads in <2 seconds
- [ ] Verify: No console errors (F12)
- [ ] Confirm: All UI elements visible
  - [ ] Header with IBM branding
  - [ ] Domain dropdown
  - [ ] Description textarea
  - [ ] Generate button
  - [ ] Feature cards

**Result:** ⏳ Pending

---

### Test 3: Form Validation ✅
**Time:** 3 minutes

#### Test 3.1: Empty Description
- [ ] Leave description empty
- [ ] Click "Generate Project"
- [ ] Verify: Alert "Please enter a problem description"

#### Test 3.2: No Domain Selected
- [ ] Enter description
- [ ] Leave domain empty
- [ ] Click "Generate Project"
- [ ] Verify: Alert "Please select a domain"

#### Test 3.3: Valid Input
- [ ] Select domain: "todo"
- [ ] Enter: "A simple todo API"
- [ ] Verify: Form submits (no alert)

**Result:** ⏳ Pending

---

### Test 4: Service Generation - Full Workflow ✅
**Time:** 5 minutes

#### Setup
- [ ] Domain: `todo`
- [ ] Description: `A REST API for managing a todo list with CRUD operations`

#### Execution
- [ ] Click "Generate Project"
- [ ] Button shows spinner
- [ ] Status panel appears

#### Progress Tracking
- [ ] Progress: 0-10% - "Calling watsonx.ai..."
- [ ] Progress: 10-30% - "Code generated" or "Using fallback"
- [ ] Progress: 30-50% - "Writing files..."
- [ ] Progress: 50-80% - "Building Docker image..."
- [ ] Progress: 80-100% - "Starting container..."
- [ ] Progress: 100% - "Service is ready!"

#### Completion
- [ ] Status panel hides
- [ ] Preview panel appears
- [ ] Total time: <2 minutes

**Result:** ⏳ Pending  
**Duration:** ___ seconds

---

### Test 5: Real-Time Updates ✅
**Time:** 2 minutes (during Test 4)

- [ ] Progress bar animates smoothly
- [ ] Percentage updates (0% → 100%)
- [ ] Logs appear in real-time
- [ ] Logs auto-scroll to latest
- [ ] Color coding correct:
  - [ ] Green (✓) for success
  - [ ] Red (✗) for errors
  - [ ] Blue (→) for info

**Result:** ⏳ Pending

---

### Test 6: Service Preview ✅
**Time:** 3 minutes

- [ ] Preview URL displays: `http://localhost:8080`
- [ ] Endpoint list shows routes
- [ ] Iframe loads service
- [ ] Test health endpoint:
  ```bash
  curl http://localhost:8080/health
  ```
- [ ] Verify response: `{"status":"healthy"}`

**Result:** ⏳ Pending

---

### Test 7: Open in New Tab ✅
**Time:** 1 minute

- [ ] Click "Open in New Tab" button
- [ ] New tab opens
- [ ] URL: `http://localhost:8080`
- [ ] Service loads correctly
- [ ] Can interact with service

**Result:** ⏳ Pending

---

### Test 8: Stop Service ✅
**Time:** 2 minutes

- [ ] Click "Stop Service" button
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Preview panel hides
- [ ] Form re-enables
- [ ] Verify cleanup:
  ```bash
  docker ps  # No containers
  netstat -ano | findstr :8080  # Port free
  ```

**Result:** ⏳ Pending

---

### Test 9: Error Handling ✅
**Time:** 5 minutes

#### Test 9.1: watsonx.ai Fallback
- [ ] Disconnect network OR use invalid API key
- [ ] Generate service
- [ ] Verify: "⚠ Using fallback template"
- [ ] Verify: Service still generates successfully

#### Test 9.2: Port Conflict
- [ ] Start first service
- [ ] Try to start second service
- [ ] Verify: Handles conflict gracefully

**Result:** ⏳ Pending

---

### Test 10: Multiple Domains ✅
**Time:** 5 minutes

Test at least 3 different domains:

#### Domain 1: Book
- [ ] Domain: `book`
- [ ] Description: "A REST API for managing a library"
- [ ] Verify: Service generates
- [ ] Check: Appropriate endpoints

#### Domain 2: User
- [ ] Domain: `user`
- [ ] Description: "A REST API for user management"
- [ ] Verify: Service generates
- [ ] Check: Appropriate endpoints

#### Domain 3: Custom
- [ ] Domain: `custom`
- [ ] Description: "A REST API for fitness tracking"
- [ ] Verify: Service generates
- [ ] Check: Appropriate endpoints

**Result:** ⏳ Pending

---

### Test 11: Responsive Design ✅
**Time:** 3 minutes

- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar
- [ ] Test Mobile (375x667):
  - [ ] Layout stacks vertically
  - [ ] Buttons full-width
  - [ ] Text readable
  - [ ] No horizontal scroll
- [ ] Test Tablet (768x1024):
  - [ ] Layout adapts
  - [ ] Feature cards adjust
- [ ] Test Desktop (1920x1080):
  - [ ] Full layout
  - [ ] Optimal spacing

**Result:** ⏳ Pending

---

### Test 12: Performance ✅
**Time:** 2 minutes

Track timing for one complete workflow:

- [ ] Start timer
- [ ] Generate service
- [ ] Note milestones:
  - [ ] Time to first log: ___ seconds
  - [ ] Code generation: ___ seconds
  - [ ] Docker build: ___ seconds
  - [ ] Total time: ___ seconds
- [ ] Verify: Total <120 seconds (2 minutes)

**Result:** ⏳ Pending  
**Total Duration:** ___ seconds

---

## 📊 Test Summary

### Results Overview

| Test | Status | Duration | Notes |
|------|--------|----------|-------|
| 1. Backend Health | ⏳ | - | - |
| 2. Frontend Load | ⏳ | - | - |
| 3. Form Validation | ⏳ | - | - |
| 4. Service Generation | ⏳ | - | - |
| 5. Real-Time Updates | ⏳ | - | - |
| 6. Service Preview | ⏳ | - | - |
| 7. Open in New Tab | ⏳ | - | - |
| 8. Stop Service | ⏳ | - | - |
| 9. Error Handling | ⏳ | - | - |
| 10. Multiple Domains | ⏳ | - | - |
| 11. Responsive Design | ⏳ | - | - |
| 12. Performance | ⏳ | - | - |

**Legend:** ⏳ Pending | ✅ Pass | ❌ Fail | ⚠️ Warning

---

## 🐛 Issues Found

### Critical Issues (Blocks Demo)
_None yet_

### Major Issues (Impacts Functionality)
_None yet_

### Minor Issues (Cosmetic/Edge Cases)
_None yet_

---

## ✅ Sign-Off

### Test Completion
- [ ] All critical tests passed
- [ ] No blocking issues
- [ ] Performance meets targets (<2 min)
- [ ] Ready for demo

### Tester Information
- **Tester:** _______________
- **Date:** _______________
- **Environment:** Windows 11, Docker Desktop, Chrome
- **Backend Version:** Phase 2 Complete
- **Frontend Version:** Phase 2 Complete

### Notes
_Add any additional observations or recommendations_

---

## 🚀 Next Steps

After completing tests:
1. [ ] Document results in `PHASE3_COMPLETE.md`
2. [ ] Fix any critical issues
3. [ ] Update main README
4. [ ] Prepare demo script
5. [ ] Practice presentation
6. [ ] Final rehearsal

---

**Happy Testing! 🧪**