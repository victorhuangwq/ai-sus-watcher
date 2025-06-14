# AI SUS Watcher

**By Squash**

AI SUS Watcher monitors the YC AI Startup School event page for you! So you don't have to worry about missing any important updates on the page :').  (Works for other pages too!)

It will:
- Automatically check for changes every few minutes
- Summarize changes using AI (OpenAI, Google Gemini, or Chrome's built-in AI), and you can customize the prompt
- Notify you with a browser notification when changes are detected

<img width="1352" alt="Screenshot 2025-06-14 at 11 56 46 AM" src="https://github.com/user-attachments/assets/3ca62b31-156a-46e7-8354-9c8c54768e4f" />


## Quick Start

### Installation

1. Download the latest release from [GitHub Releases](https://github.com/victorhuangwq/ai-sus-watcher/releases)
2. Unzip to a folder
3. Open `chrome://extensions` in Chrome (or any Chromium browser)
4. Enable Developer mode
5. Click Load unpacked and select the unzipped folder
  
The AI SUS Watcher extension should appear in your toolbar! 

### First Use

1. **Click the extension icon** in your Chrome toolbar
2. **Configure your settings**:
   - **Target URL**: Default is YC AI Startup School (`https://events.ycombinator.com/ai-sus`)
   - **Polling Cadence**: How often to check (30 secs -15 minutes)
   - **AI Prompt**: How you want changes summarized
   - **LLM Provider**: Choose from:
     - **No LLM**: Just shows raw text differences
     - **OpenAI**: Uses OpenAI's gpt-4o-mini
     - **Google Gemini**: Uses Google Gemini-2.0-flash
     - **Chrome AI**: Uses Chrome's built-in Gemini Nano (requires Chrome Beta or Dev, some settings and hardware requirements apply) (see below for details)
3. **Add API Key** (if using OpenAI/Gemini):
   - Get your API key from 
     - [OpenAI](https://platform.openai.com/api-keys) 
     - or [Google AI Studio](https://aistudio.google.com/app/apikey) -> lot's of free calls available! 
4. **Click "Save"** to start monitoring
5. **Test it works** with the "Test now" button

## Configuration Options

### LLM Providers

| Provider | Description | Model | Requires API Key |
|----------|-------------|-------|------------------|
| **No LLM** | Shows raw text differences | - | ❌ |
| **OpenAI** | Uses OpenAI API for summaries | gpt-4o-mini | ✅ |
| **Google Gemini** | Uses Google Gemini API | Gemini-2.0-flash | ✅ |
| **Chrome AI** | Uses Chrome's built-in AI (needs Chrome Beta or Dev) | Gemini Nano | ❌ |

#### Chrome AI (Built-in)
1. **Enable in Chrome**: Go to `chrome://flags/#prompt-api-for-gemini-nano`
2. **Download Model**: May need to visit `chrome://components/` and update "Optimization Guide On Device Model"  
3. **No API Key**: Uses Chrome's built-in Gemini Nano model
4. **Hardware Requirements**: Requires compatible device with sufficient resources

### Example Prompts

- `"Tell me the important changes in 2 sentences"`
- `"Summarize any new session announcements"`
- `"What venue or schedule updates happened?"`
- `"Give me bullet points of what changed"`


## Troubleshooting

**No notifications appearing?**

- Try the "Test now" button - it should always show a notification
- Ensure that notifications are not blocked for your browser (that's what happened to me!) (Settings > Notifications on Mac OS X or System > Notifications on Windows)
- Check the service worker console in `chrome://extensions/` for errors

**Extension not loading?**
- Make sure you built it first: `npm run build`
- Check that Developer mode is enabled in `chrome://extensions/`

**Monitoring stops unexpectedly?**
- Extension automatically stops when target tab is closed (this is intentional)  
- Click extension icon to reopen target page and resume monitoring

**LLM not working?**
- **OpenAI/Gemini**: Verify API key is correct and has credit/quota
- **Chrome AI**: Enable `chrome://flags/#prompt-api-for-gemini-nano` and download model
- Try switching to "No LLM" mode to see raw diffs first
- Check service worker console for detailed LLM error messages

## Development & Testing

### Building the Extension

1. `npm install`
1. `npm run build`

### Dev Server

A test server provides a page that cycles through different AI event scenarios on each refresh:

```bash
node dev-server.js
```

Then visit `http://localhost:8080/page` and use this as your target URL for testing.

## Privacy & Security

- **Local Storage**: All settings and snapshots stored in `chrome.storage.local`
- **No Servers**: No data sent to external servers except direct LLM API calls
- **API Keys**: Stored locally and only used for your chosen LLM provider
- **Permissions**: Only requests necessary Chrome permissions (storage, alarms, notifications, tabs)

## License

MIT License - feel free to modify and distribute!

## Contributing

Built by **Squash** - contributions welcome! Please test your changes with the dev server before submitting.

---

**Enjoy staying updated with AI SUS Watcher!**
