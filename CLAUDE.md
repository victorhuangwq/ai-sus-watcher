# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension project called "Page Change Notifier" that monitors web pages for content changes and uses LLM summarization to provide intelligent notifications. The extension polls a target URL, detects meaningful text differences, and sends notifications with AI-generated summaries of changes.

## Architecture

The extension follows Chrome Extension Manifest V3 architecture with these key components:

- **background.js (Service Worker)**: Handles `chrome.alarms`, fetches pages, computes diffs, invokes LLM adapters, and shows notifications
- **popup.js/html/css**: Provides configuration UI for URL, polling cadence, prompt text, and LLM provider settings
- **utils/diff.js**: SimHash pre-filtering + semantic HTML diffing using `htmldiff-js`
- **llm/ directory**: Separate adapters for OpenAI, Google Gemini, Chrome Prompt API, and "No LLM" mode

## Key Technical Details

- Uses SimHash algorithm for pre-filtering (ignores changes with Hamming distance ≤ 3)
- Supports polling intervals from 1-15 minutes via `chrome.alarms`
- All data stored locally in `chrome.storage.local` - no server-side storage
- LLM adapters expose `async summarize(diff, prompt)` interface
- Graceful degradation when LLM calls fail (fallback to raw diff)

## Development Commands

Based on the specification, the following commands are expected once implementation begins:

```bash
npm install          # Install dependencies
npm run build        # Build extension (copies src → dist/)
npm run dev          # Start dev server with auto-mutating test page
npm test             # Run Jest tests with jsdom for diff utilities
```

## Development Workflow

1. Load unpacked extension from `dist/` directory in `chrome://extensions`
2. Use local dev server at `http://localhost:8080/page` for testing
3. Extension provides "Test now" button for immediate diff checks during development
4. Mock fetch & adapters in tests to verify notification payloads

## Storage Schema

The extension uses these `chrome.storage.local` keys:
- `url`: Target URL to monitor
- `cadence`: Polling interval in minutes (1-15)
- `prompt`: User-defined LLM prompt for summarization
- `provider`: LLM provider ("no-llm", "openai", "gemini", "chrome")
- `apiKey`: Provider-specific API key (encrypted/masked)
- `snapshot`: Last fetched page content for diffing