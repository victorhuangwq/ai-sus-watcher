# 🔔 AI SUS Watcher

**By Squash**

AI SUS Watcher monitors the YC AI Startup School event page for you! So you don't have to worry about missing any important updates on the page :').  (Works for other pages too!)

It will:
- Automatically check for changes every few minutes
- Summarize changes using AI (OpenAI, Google Gemini, or Chrome's built-in AI), and you can customize the prompt
- Notify you with a browser notification when changes are detected


## 🚀 Quick Start

### Installation

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Build the extension**:
   ```bash
   npm run build
   ```
4. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked" and select the `dist/` folder
   - The AI SUS Watcher extension should appear in your toolbar!

### First Use

1. **Click the extension icon** in your Chrome toolbar
2. **Configure your settings**:
   - **Target URL**: Default is YC AI Startup School (`https://events.ycombinator.com/ai-sus`)
   - **Polling Cadence**: How often to check (1-15 minutes)
   - **AI Prompt**: How you want changes summarized
   - **LLM Provider**: Choose from:
     - **No LLM**: Just shows raw text differences
     - **OpenAI**: Uses OpenAI's GPT-3.5-turbo
     - **Google Gemini**: Uses Google Gemini-2.0-flash
     - **Chrome AI**: Uses Chrome's built-in Gemini Nano (requires Chrome Beta or Dev, some settings and hardware requirements apply) (see below for details)
3. **Add API Key** (if using OpenAI/Gemini):
   - Get your API key from 
     - [OpenAI](https://platform.openai.com/api-keys) 
     - or [Google AI Studio](https://aistudio.google.com/app/apikey) -> lot's of free calls available! 
4. **Click "Save"** to start monitoring
5. **Test it works** with the "Test now" button

## 🎛️ Configuration Options

### LLM Providers

| Provider | Description | Model | Requires API Key |
|----------|-------------|-------|------------------|
| **No LLM** | Shows raw text differences | - | ❌ |
| **OpenAI** | Uses OpenAI API for summaries | GPT-3.5-turbo | ✅ |
| **Google Gemini** | Uses Google Gemini API | Gemini-2.0-flash | ✅ |
| **Chrome AI** | Uses Chrome's built-in AI (needs Chrome Beta or Dev) | Gemini Nano | ❌ |

### Example Prompts

- `"Tell me the important changes in 2 sentences"`
- `"Summarize any new session announcements"`
- `"What venue or schedule updates happened?"`
- `"Give me bullet points of what changed"`

## 🧪 Development & Testing

### Dev Server

A test server provides a page that cycles through different AI event scenarios on each refresh:

```bash
node dev-server.js
```

Then visit `http://localhost:8080/page` and use this as your target URL for testing.

### Testing the Extension

1. **Start the dev server**: `node dev-server.js`
2. **Set target URL** to `http://localhost:8080/page`  
3. **Set polling cadence** to 1-2 minutes for faster testing
4. **Click "Test now"** or wait for automatic polling to see notifications
5. **Each page refresh** shows different event content (5 different scenarios)

### Project Structure

```
├── src/
│   ├── manifest.json          # Chrome extension manifest (Manifest V3)
│   ├── background.js          # Service worker (polling, tab management, notifications)
│   ├── content.js             # Content script (reads authenticated page content)
│   ├── popup.html/css/js      # Extension popup interface
│   ├── utils/
│   │   └── diff.js           # Text diffing with SimHash pre-filtering
│   ├── llm/
│   │   ├── base.js           # Base LLM adapter class
│   │   ├── openai.js         # OpenAI GPT-3.5-turbo API adapter
│   │   ├── gemini.js         # Google Gemini-2.0-flash API adapter  
│   │   ├── chrome.js         # Chrome AI (Gemini Nano) adapter
│   │   ├── noLlm.js          # Raw diff fallback
│   │   └── factory.js        # LLM adapter factory
│   └── icons/                # Extension icons
├── dist/                     # Built extension (generated)
├── dev-server.js             # Test server with rotating event scenarios
└── build.js                  # Build script with dependency management
```

## 🔧 How It Works

1. **Tab Management**: Extension finds the target tab using your existing browser session
2. **Page Refresh**: Refreshes the page to get the latest server-side content  
3. **Content Extraction**: Content script reads the authenticated page content from the DOM
4. **Diff Detection**: SimHash algorithm pre-filters insignificant changes (≤3 bit difference)
5. **Text Processing**: Converts HTML to text and performs word-level diffing
6. **AI Summarization**: Selected LLM provider summarizes the changes with your custom prompt
7. **Smart Notifications**: Chrome notifications show summaries, including test notifications
8. **Auto-Stop**: Monitoring automatically stops when target tab is closed

## 🛡️ Privacy & Security

- **Local Storage**: All settings and snapshots stored in `chrome.storage.local`
- **No Servers**: No data sent to external servers except direct LLM API calls
- **API Keys**: Stored locally and only used for your chosen LLM provider
- **Permissions**: Only requests necessary Chrome permissions (storage, alarms, notifications, tabs)

## 📋 API Key Setup

### OpenAI
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy and paste into the extension

### Google Gemini  
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into the extension

### Chrome AI (Built-in)
1. **Enable in Chrome**: Go to `chrome://flags/#prompt-api-for-gemini-nano`
2. **Download Model**: May need to visit `chrome://components/` and update "Optimization Guide On Device Model"  
3. **No API Key**: Uses Chrome's built-in Gemini Nano model
4. **Hardware Requirements**: Requires compatible device with sufficient resources

## 🚀 Usage Examples

### Monitor YC AI Startup School (Default)
- **URL**: `https://events.ycombinator.com/ai-sus`
- **Cadence**: 5 minutes  
- **Prompt**: "Tell me about any new sessions or venue updates"

### Monitor University Announcements
- **URL**: Your school's announcements page
- **Cadence**: 15 minutes
- **Prompt**: "Summarize any important announcements for students"

### Monitor Product Updates
- **URL**: Your favorite product's changelog
- **Cadence**: 10 minutes  
- **Prompt**: "What new features or fixes were released?"

## 🐛 Troubleshooting

**Extension not loading?**
- Make sure you built it first: `npm run build`
- Check that Developer mode is enabled in `chrome://extensions/`

**No notifications appearing?**
- Enable Chrome notifications: Go to `chrome://settings/content/notifications`
- Check the service worker console in `chrome://extensions/` for errors
- Try the "Test now" button - it should always show a notification
- Verify the target page is open in a tab
- Ensure that notifications are not blocked for your browser (that's what happene to me!)

**Monitoring stops unexpectedly?**
- Extension automatically stops when target tab is closed (this is intentional)  
- Click extension icon to reopen target page and resume monitoring
- Check service worker logs for "No target tab found, stopping monitoring"

**LLM not working?**
- **OpenAI/Gemini**: Verify API key is correct and has credit/quota
- **Chrome AI**: Enable `chrome://flags/#prompt-api-for-gemini-nano` and download model
- Try switching to "No LLM" mode to see raw diffs first
- Check service worker console for detailed LLM error messages

**Page refresh issues?**
- Extension intentionally refreshes pages to get latest content
- Content script communication may fail temporarily during refresh
- This is normal behavior - monitoring will resume after page loads

## 📄 License

MIT License - feel free to modify and distribute!

## 🤝 Contributing

Built by **Squash** - contributions welcome! Please test your changes with the dev server before submitting.

---

**Enjoy staying updated with AI SUS Watcher! 🚀**