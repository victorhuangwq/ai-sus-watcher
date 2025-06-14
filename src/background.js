import { computeDiff } from './utils/diff.js';
import { createLLMAdapter } from './llm/factory.js';

const DEFAULT_SETTINGS = {
  url: 'https://events.ycombinator.com/ai-sus',
  cadence: 5,
  prompt: 'Tell me the important changes in 2 sentences',
  provider: 'no-llm',
  apiKey: '',
  snapshot: ''
};

let currentSettings = null;

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
  currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  await chrome.storage.local.set(currentSettings);
  
  setupAlarm();
});

chrome.runtime.onStartup.addListener(async () => {
  const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
  currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  setupAlarm();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    let settingsChanged = false;
    for (const key in changes) {
      if (key in DEFAULT_SETTINGS) {
        currentSettings[key] = changes[key].newValue;
        settingsChanged = true;
      }
    }
    if (settingsChanged && changes.cadence) {
      setupAlarm();
    }
  }
});

function setupAlarm() {
  chrome.alarms.clear('pageCheck');
  chrome.alarms.create('pageCheck', {
    delayInMinutes: currentSettings.cadence,
    periodInMinutes: currentSettings.cadence
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pageCheck') {
    checkPageChanges();
  }
});

chrome.action.onClicked.addListener(async () => {
  if (!currentSettings) {
    const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
    currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  }
  
  const targetUrl = currentSettings.url;
  const tabs = await chrome.tabs.query({ url: targetUrl });
  
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: targetUrl });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'testNow') {
    checkPageChanges().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

async function checkPageChanges() {
  if (!currentSettings) {
    const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
    currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  }

  try {
    const response = await fetch(currentSettings.url, {
      method: 'GET',
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const newContent = await response.text();
    const previousSnapshot = currentSettings.snapshot;

    if (!previousSnapshot) {
      await chrome.storage.local.set({ snapshot: newContent });
      currentSettings.snapshot = newContent;
      return;
    }

    const diff = await computeDiff(previousSnapshot, newContent);

    if (diff) {
      await chrome.storage.local.set({ snapshot: newContent });
      currentSettings.snapshot = newContent;

      let summary;
      try {
        const llmAdapter = createLLMAdapter(currentSettings.provider, currentSettings.apiKey);
        summary = await llmAdapter.summarize(diff, currentSettings.prompt);
      } catch (error) {
        console.error('LLM summarization failed:', error);
        summary = diff.slice(0, 180) + (diff.length > 180 ? '...' : '');
      }

      const url = new URL(currentSettings.url);
      
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon.svg',
        title: `📰 Update detected on ${url.hostname}`,
        message: summary.slice(0, 180),
        buttons: [{ title: 'Open page' }],
        requireInteraction: true
      });
    }
  } catch (error) {
    console.error('Page check failed:', error);
    
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon.svg',
      title: '⚠️ AI SUS Watcher Error',
      message: `Failed to check ${currentSettings.url}: ${error.message}`,
      requireInteraction: false
    });
  }
}

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    const tabs = await chrome.tabs.query({ url: currentSettings.url });
    
    if (tabs.length > 0) {
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      await chrome.tabs.create({ url: currentSettings.url });
    }
  }
  
  chrome.notifications.clear(notificationId);
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  const tabs = await chrome.tabs.query({ url: currentSettings.url });
  
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: currentSettings.url });
  }
  
  chrome.notifications.clear(notificationId);
});

