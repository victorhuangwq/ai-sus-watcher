# 🔔 AI SUS Watcher

**By Squash**

AI SUS Watcher is a Chrome extension that monitors the YC AI Startup School website (and other websites) for content changes and provides intelligent notifications with AI-powered summaries.

## ✨ Features

- 🎯 **Smart Monitoring**: Automatically polls web pages for meaningful content changes
- 🤖 **AI-Powered Summaries**: Uses OpenAI, Google Gemini, or Chrome AI to summarize changes
- 🔔 **Instant Notifications**: Get Chrome notifications when important updates are detected  
- 🎛️ **Flexible Configuration**: Customize polling frequency, target URLs, and AI prompts
- 🚫 **Privacy-First**: All data stays local - no server-side storage
- ⚡ **Lightweight**: Efficient diff detection with SimHash pre-filtering

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
   - **LLM Provider**: Choose your AI service or "No LLM" for raw diffs
3. **Add API Key** (if using OpenAI/Gemini):
   - Get your API key from [OpenAI](https://platform.openai.com/api-keys) or [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Paste it in the API Key field
4. **Click "Save"** to start monitoring
5. **Test it works** with the "Test now" button

## 🎛️ Configuration Options

### LLM Providers

| Provider | Description | Requires API Key |
|----------|-------------|------------------|
| **No LLM** | Shows raw text differences | ❌ |
| **OpenAI** | Uses GPT-3.5-turbo for summaries | ✅ |
| **Google Gemini** | Uses Gemini Pro for summaries | ✅ |
| **Chrome AI** | Uses built-in Chrome AI (experimental) | ❌ |

### Example Prompts

- `"Tell me the important changes in 2 sentences"`
- `"Summarize any new session announcements"`
- `"What venue or schedule updates happened?"`
- `"Give me bullet points of what changed"`

## 🧪 Development & Testing

### Dev Server

A test server provides a page that automatically updates every 2 minutes:

```bash
npm run dev
```

Then visit `http://localhost:8080/page` and use this as your target URL for testing.

### Testing the Extension

1. **Start the dev server**: `npm run dev`
2. **Set target URL** to `http://localhost:8080/page`  
3. **Set polling cadence** to 1-2 minutes for faster testing
4. **Watch for notifications** as the page content changes automatically

### Project Structure

```
├── src/
│   ├── manifest.json          # Chrome extension manifest
│   ├── background.js          # Service worker (polling, diffs, notifications)
│   ├── popup.html/css/js      # Extension popup interface
│   ├── utils/
│   │   └── diff.js           # Text diffing with SimHash pre-filtering
│   ├── llm/
│   │   ├── openai.js         # OpenAI API adapter
│   │   ├── gemini.js         # Google Gemini API adapter  
│   │   ├── chrome.js         # Chrome AI adapter
│   │   ├── noLlm.js          # Raw diff fallback
│   │   └── factory.js        # LLM adapter factory
│   └── icons/                # Extension icons (add your own PNGs)
├── dist/                     # Built extension (generated)
├── dev-server.js             # Test server with auto-updating content
└── build.js                  # Build script
```

## 🔧 How It Works

1. **Polling**: Chrome alarms trigger page fetches at your configured interval
2. **Diff Detection**: SimHash algorithm pre-filters insignificant changes (≤3 bit difference)
3. **Text Extraction**: Semantic HTML diffing extracts meaningful text changes
4. **AI Summarization**: Selected LLM provider summarizes the changes with your prompt
5. **Notifications**: Chrome notifications display the summary with a link to the page

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

### Chrome AI
- Available in Chrome Canary with experimental flags enabled
- No API key required
- May have limited availability

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
- Verify Chrome notifications are enabled for the extension
- Check the console in `chrome://extensions/` for errors
- Try the "Test now" button to trigger a manual check

**LLM not working?**
- Verify your API key is correct and has credit/quota
- Try switching to "No LLM" mode to see raw diffs
- Check browser console for API error messages

**False positives/negatives?**
- Adjust the diff sensitivity by modifying the SimHash threshold in `src/utils/diff.js`
- Refine your AI prompt to focus on specific types of changes

## 🏗️ Building for Production

1. **Add real icons**: Replace placeholder icons in `src/icons/` with actual PNG files
2. **Test thoroughly**: Use the dev server and various websites
3. **Update manifest**: Ensure version numbers and permissions are correct
4. **Build**: `npm run build`
5. **Package**: Zip the `dist/` folder for distribution

## 📄 License

MIT License - feel free to modify and distribute!

## 🤝 Contributing

Built by **Squash** - contributions welcome! Please test your changes with the dev server before submitting.

---

**Enjoy staying updated with AI SUS Watcher! 🚀**