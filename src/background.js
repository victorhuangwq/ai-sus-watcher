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
  console.log('Received message:', request);
  if (request.action === 'testNow') {
    console.log('Processing testNow request');
    checkPageChanges(true).then(() => {
      console.log('Test completed successfully');
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('Test failed:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

// Helper function to wait for tab to finish loading
function waitForTabToLoad(tabId, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('Timeout waiting for tab to load'));
    }, timeout);
    
    const listener = (updatedTabId, changeInfo, tab) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        clearTimeout(timeoutId);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    
    chrome.tabs.onUpdated.addListener(listener);
    
    // Also check if tab is already loaded
    chrome.tabs.get(tabId).then((tab) => {
      if (tab.status === 'complete') {
        clearTimeout(timeoutId);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }).catch(() => {
      // Tab might not exist, let the timeout handle it
    });
  });
}

async function checkPageChanges(forceNotification = false) {
  if (!currentSettings) {
    const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
    currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  }

  try {
    // Find the tab with the target URL
    const tabs = await chrome.tabs.query({ url: currentSettings.url });
    
    if (tabs.length === 0) {
      throw new Error(`No tab found for ${currentSettings.url}. Please open the page first.`);
    }
    
    const targetTab = tabs[0];
    console.log('Found target tab:', targetTab.id);
    
    // Refresh the page to get latest content
    console.log('Refreshing page to get latest content...');
    await chrome.tabs.reload(targetTab.id);
    
    // Wait for the page to finish loading
    await waitForTabToLoad(targetTab.id);
    
    // Send message to content script to get page content
    const response = await chrome.tabs.sendMessage(targetTab.id, { action: 'getPageContent' });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get page content from content script');
    }
    
    const newContent = response.content;
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
      console.log('Diff detected, length:', diff.length);
      console.log('Diff content preview:', diff.slice(0, 200) + '...');
      console.log('LLM Provider:', currentSettings.provider);
      console.log('Has API Key:', !!currentSettings.apiKey);
      
      try {
        const llmAdapter = createLLMAdapter(currentSettings.provider, currentSettings.apiKey);
        console.log('LLM Adapter created successfully');
        console.log('Calling LLM with prompt:', currentSettings.prompt);
        
        summary = await llmAdapter.summarize(diff, currentSettings.prompt);
        console.log('LLM summarization successful, result:', summary);
      } catch (error) {
        console.error('LLM summarization failed:', error);
        console.log('Falling back to raw diff slice');
        summary = diff.slice(0, 180) + (diff.length > 180 ? '...' : '');
      }

      const url = new URL(currentSettings.url);
      
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: `📰 Update detected on ${url.hostname}`,
        message: summary.slice(0, 180)
      });
    } else if (forceNotification) {
      const url = new URL(currentSettings.url);
      
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: `🔍 Test completed on ${url.hostname}`,
        message: 'No changes detected at this time.'
      });
    }
  } catch (error) {
    console.error('Page check failed:', error);
    
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '⚠️ AI SUS Watcher Error',
      message: `Failed to check ${currentSettings.url}: ${error.message}`
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

