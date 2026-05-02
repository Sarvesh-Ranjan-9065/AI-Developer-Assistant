# AI Developer Assistant - Frontend

Modern, responsive web interface for the AI Developer Assistant powered by IBM watsonx.ai.

## Features

### 🎨 User Interface
- **Clean, Modern Design** - Gradient background with card-based layout
- **IBM Branding** - Showcases IBM watsonx.ai and Bob IDE
- **Responsive** - Works on desktop, tablet, and mobile devices
- **Intuitive Form** - Simple domain selection and idea input

### 📊 Real-Time Feedback
- **Progress Bar** - Visual progress indicator (0-100%)
- **Live Logs** - Real-time streaming of generation steps
- **Color-Coded Messages** - Success (green), errors (red), info (blue)
- **Status Polling** - Automatic updates every 2 seconds

### 🚀 Service Preview
- **Live Preview** - Embedded iframe showing running service
- **Endpoint List** - Display all available API endpoints
- **Quick Actions** - Open in new tab or stop service
- **Preview URL** - Direct link to the running service

### ✨ User Experience
- **Loading States** - Spinner and disabled buttons during generation
- **Error Handling** - Clear error messages with recovery options
- **Confirmation Dialogs** - Prevent accidental service stops
- **Auto-Scroll Logs** - Always shows latest log entries

## File Structure

```
public/
├── index.html          # Complete single-page application
└── README.md          # This file
```

## How It Works

### 1. User Input
```javascript
// User fills form with:
- Domain selection (todo, book, user, etc.)
- Service description (what it should do)
```

### 2. API Integration
```javascript
// POST to backend
fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    idea: userInput,
    projectName: `${domain}-service`
  })
})
```

### 3. Status Polling
```javascript
// Poll every 2 seconds
setInterval(async () => {
  const status = await fetch(`/api/status/${projectId}`);
  updateUI(status);
}, 2000);
```

### 4. Preview Display
```javascript
// When status === 'running'
- Show preview panel
- Load service in iframe
- Display endpoints
- Enable actions
```

## UI Components

### Header Section
- Title and subtitle
- IBM branding badges
- Powered by watsonx.ai indicator

### Input Form
- Domain dropdown (8 predefined + custom)
- Textarea for service description
- Submit button with loading state

### Status Panel
- Progress bar with percentage
- Terminal-style log display
- Color-coded log entries
- Auto-scrolling

### Preview Panel
- Service URL display
- Endpoint list with styling
- Embedded iframe preview
- Action buttons (open/stop)

### Feature Cards
- 4 feature highlights
- Icons and descriptions
- Responsive grid layout

## Styling

### Color Scheme
- **Primary**: #0f62fe (IBM Blue)
- **Success**: #00c853 (Green)
- **Error**: #da1e28 (Red)
- **Background**: Gradient purple
- **Text**: #333 (Dark gray)

### Typography
- **Font**: IBM Plex Sans (fallback to system fonts)
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes
- **Code**: Courier New (monospace)

### Layout
- **Max Width**: 1200px
- **Padding**: 20-30px
- **Border Radius**: 8-12px
- **Shadows**: Subtle elevation

## JavaScript Functions

### Core Functions

**generateService()**
- Validates form input
- Sends API request
- Initializes status polling
- Handles errors

**startStatusPolling()**
- Polls backend every 2 seconds
- Updates progress bar
- Updates log display
- Detects completion/errors

**updateProgress(progress)**
- Updates progress bar width
- Updates percentage text
- Smooth transitions

**updateLogs(logs)**
- Renders log entries
- Color codes by type
- Auto-scrolls to bottom

**showPreview(data)**
- Displays preview panel
- Loads service in iframe
- Shows endpoints
- Re-enables form

**stopService()**
- Confirms with user
- Sends DELETE request
- Cleans up UI
- Resets state

### Utility Functions

**escapeHtml(text)**
- Prevents XSS attacks
- Sanitizes user input
- Safe HTML rendering

**openInNewTab()**
- Opens service in new window
- Uses preview URL

## API Integration

### Endpoints Used

**POST /api/generate**
```javascript
Request: { idea, projectName }
Response: { success, projectId, status }
```

**GET /api/status/:projectId**
```javascript
Response: {
  projectId,
  status,
  progress,
  logs,
  previewUrl,
  endpoints
}
```

**DELETE /api/projects/:projectId**
```javascript
Response: { success, message }
```

## Error Handling

### Network Errors
- Catch fetch errors
- Display user-friendly messages
- Re-enable form for retry

### API Errors
- Parse error responses
- Show error in status panel
- Log to console for debugging

### Validation Errors
- Check required fields
- Alert user before submission
- Prevent empty submissions

## Responsive Design

### Desktop (>768px)
- Full-width layout
- Side-by-side action buttons
- 4-column feature grid

### Mobile (<768px)
- Stacked layout
- Full-width buttons
- 1-column feature grid
- Smaller fonts

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance

- **Single File** - No external dependencies
- **Inline Styles** - No CSS file loading
- **Inline Scripts** - No JS file loading
- **Fast Load** - < 100KB total size

## Accessibility

- Semantic HTML elements
- Proper form labels
- Keyboard navigation
- Focus indicators
- Alt text for icons (emoji)

## Security

- XSS Prevention (escapeHtml)
- CORS enabled on backend
- No sensitive data in frontend
- Confirmation for destructive actions

## Future Enhancements

### Phase 3 Additions
- [ ] Service metrics display
- [ ] Generation time tracking
- [ ] Code quality scores
- [ ] Multiple service management
- [ ] Service history
- [ ] Export generated code
- [ ] Share service links
- [ ] Dark mode toggle

## Testing Checklist

- [ ] Form validation works
- [ ] API calls succeed
- [ ] Progress updates correctly
- [ ] Logs display in real-time
- [ ] Preview loads successfully
- [ ] Endpoints list populates
- [ ] Stop service works
- [ ] Error handling works
- [ ] Responsive on mobile
- [ ] Works in all browsers

## Usage Example

1. **Open** `http://localhost:3000`
2. **Select** domain (e.g., "Book Library")
3. **Describe** service: "A REST API for managing books with CRUD operations"
4. **Click** "Generate Service with watsonx.ai"
5. **Watch** real-time progress and logs
6. **Preview** running service in iframe
7. **Test** endpoints directly
8. **Stop** service when done

## Development

To modify the frontend:

1. Edit `public/index.html`
2. Refresh browser (no build step needed)
3. Changes are immediate

## Notes

- Single-page application (SPA)
- No framework dependencies
- Vanilla JavaScript
- Self-contained HTML file
- Works offline (except API calls)

---

*Built with ❤️ using IBM Bob IDE*