import { computeDiff } from './utils/diff.js';
import { createLLMAdapter } from './llm/factory.js';
import { LLMProvider } from './llm/types.js';

interface Settings {
  url: string;
  cadence: number;
  prompt: string;
  provider: LLMProvider;
  apiKey: string;
  snapshot: string;
  [key: string]: any;
}

// Response interfaces for proper typing
interface PageContentResponse {
  success: boolean;
  content?: string;
  error?: string;
}


const DEFAULT_SETTINGS: Settings = {
  url: 'https://events.ycombinator.com/ai-sus',
  cadence: 5,
  prompt: 'Tell me the important changes in 2 sentences',
  provider: 'no-llm',
  apiKey: '',
  snapshot: ''
};

let currentSettings: Settings | null = null;

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
    // Initialize currentSettings if it's null
    if (!currentSettings) {
      currentSettings = { ...DEFAULT_SETTINGS };
    }
    
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
  if (!currentSettings) return;
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
    const tab = tabs[0];
    if (tab.id) {
      await chrome.tabs.update(tab.id, { active: true });
    }
    if (tab.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }
  } else {
    await chrome.tabs.create({ url: targetUrl });
  }
  
  // Ensure monitoring is active when extension is clicked
  console.log('Extension clicked - setting up alarm for monitoring');
  setupAlarm();
});

chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  console.log('Received message:', request);
  if (request.action === 'testNow') {
    console.log('Processing testNow request');
    testNowWithLLM().then((result) => {
      console.log('Test completed successfully');
      sendResponse(result);
    }).catch((error) => {
      console.error('Test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    });
    return true;
  }
  return false;
});

async function testNowWithLLM() {
  if (!currentSettings) {
    const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
    currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  }

  const results = {
    success: true,
    pageTest: { success: false, message: '' },
    llmTest: { success: false, message: '', provider: currentSettings.provider }
  };

  // Test LLM connectivity first (if not no-llm)
  if (currentSettings.provider !== 'no-llm') {
    try {
      const llmAdapter = createLLMAdapter(currentSettings.provider as LLMProvider, currentSettings.apiKey);
      
      // Test with a simple diff to verify LLM connectivity
      const testDiff = '<p>Test change: New content added</p>';
      const testPrompt = 'Summarize this change briefly';
      
      console.log(`Testing ${currentSettings.provider} LLM connectivity...`);
      const summary = await llmAdapter.summarize(testDiff, testPrompt);
      
      results.llmTest.success = true;
      results.llmTest.message = `${currentSettings.provider} connectivity verified`;
      console.log(`LLM test successful: ${summary}`);
      
    } catch (error) {
      console.error('LLM test failed:', error);
      results.llmTest.success = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.llmTest.message = `${currentSettings.provider} error: ${errorMessage}`;
      results.success = false;
    }
  } else {
    results.llmTest.success = true;
    results.llmTest.message = 'No LLM provider configured';
  }

  // Test page monitoring (basic connectivity test)
  try {
    // Test basic page access without doing full diff check
    const tabs = await chrome.tabs.query({ url: currentSettings.url });
    
    if (tabs.length === 0) {
      throw new Error(`No tab found for ${currentSettings.url}`);
    }
    
    const targetTab = tabs[0];
    if (!targetTab.id) {
      throw new Error('Target tab has no ID');
    }
    
    await chrome.tabs.reload(targetTab.id);
    await waitForTabToLoad(targetTab.id);
    
    const response = await chrome.tabs.sendMessage(targetTab.id, { action: 'getPageContent' }) as PageContentResponse;
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get page content');
    }
    
    results.pageTest.success = true;
    results.pageTest.message = 'Page monitoring test completed';
    
    // Show a test notification
    const url = new URL(currentSettings.url);
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: `🧪 Test completed on ${url.hostname}`,
      message: results.llmTest.success ? 
        `✓ Page monitoring and ${currentSettings.provider} LLM connectivity verified` :
        `✓ Page monitoring verified. LLM: ${results.llmTest.message}`
    });
    
  } catch (error) {
    console.error('Page test failed:', error);
    results.pageTest.success = false;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.pageTest.message = `Page test error: ${errorMessage}`;
    results.success = false;
  }

  return results;
}

// Helper function to wait for tab to finish loading
function waitForTabToLoad(tabId: number, timeout: number = 30000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('Timeout waiting for tab to load'));
    }, timeout);
    
    const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo, _tab: chrome.tabs.Tab) => {
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
      console.log(`No target tab found, stopping monitoring for ${currentSettings.url}`);
      chrome.alarms.clear('pageCheck');
      return;
    }
    
    const targetTab = tabs[0];
    if (!targetTab.id) {
      throw new Error('Target tab has no ID');
    }
    
    console.log('Found target tab:', targetTab.id);
    
    // Refresh the page to get latest content
    console.log('Refreshing page to get latest content...');
    await chrome.tabs.reload(targetTab.id);
    
    // Wait for the page to finish loading
    await waitForTabToLoad(targetTab.id);
    
    // Send message to content script to get page content
    const response = await chrome.tabs.sendMessage(targetTab.id, { action: 'getPageContent' }) as PageContentResponse;
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get page content from content script');
    }
    
    const newContent = response.content || '';
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
        const llmAdapter = createLLMAdapter(currentSettings.provider as LLMProvider, currentSettings.apiKey);
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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '⚠️ AI SUS Watcher Error',
      message: `Failed to check ${currentSettings.url}: ${errorMessage}`
    });
  }
}

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex === 0 && currentSettings) {
    const tabs = await chrome.tabs.query({ url: currentSettings.url });
    
    if (tabs.length > 0) {
      const tab = tabs[0];
      if (tab.id) {
        await chrome.tabs.update(tab.id, { active: true });
      }
      if (tab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
    } else {
      await chrome.tabs.create({ url: currentSettings.url });
    }
  }
  
  chrome.notifications.clear(notificationId);
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (!currentSettings) {
    const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
    currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  }
  
  const tabs = await chrome.tabs.query({ url: currentSettings.url });
  
  if (tabs.length > 0) {
    const tab = tabs[0];
    if (tab.id) {
      await chrome.tabs.update(tab.id, { active: true });
    }
    if (tab.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }
  } else {
    await chrome.tabs.create({ url: currentSettings.url });
  }
  
  chrome.notifications.clear(notificationId);
});

